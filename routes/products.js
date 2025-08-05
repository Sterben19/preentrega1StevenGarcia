import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();


const validateQueryParams = (req, res, next) => {
  const { limit, page, sort, query } = req.query;
  
  if (limit && isNaN(limit)) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'El parámetro limit debe ser un número' 
    });
  }
  
  if (page && isNaN(page)) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'El parámetro page debe ser un número' 
    });
  }
  
  if (sort && !['asc', 'desc'].includes(sort)) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'El parámetro sort debe ser "asc" o "desc"' 
    });
  }
  
  next();
};


router.get('/', validateQueryParams, async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      lean: true,
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined
    };

    const filter = {};
    if (query) {
      if (query.startsWith('category:')) {
        filter.category = query.split(':')[1];
      } else if (query === 'available') {
        filter.stock = { $gt: 0 };
      } else if (query === 'unavailable') {
        filter.stock = { $eq: 0 };
      } else {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { code: { $regex: query, $options: 'i' } }
        ];
      }
    }

    const result = await Product.paginate(filter, options);


    const buildLink = (page) => {
      const params = new URLSearchParams();
      params.append('limit', limit);
      params.append('page', page);
      if (sort) params.append('sort', sort);
      if (query) params.append('query', query);
      return `${req.protocol}://${req.get('host')}${req.baseUrl}?${params.toString()}`;
    };

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null,
      totalDocs: result.totalDocs
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});


router.get('/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Producto no encontrado' 
      });
    }
    
    res.json({ 
      status: 'success', 
      payload: product 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

export default router;