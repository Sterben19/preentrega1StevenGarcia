import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      lean: true
    };

    if (sort) options.sort = { price: sort === 'asc' ? 1 : -1 };

    const filter = query ? { 
      $or: [
        { category: query },
        { status: query === 'available' }
      ]
    } : {};

    const result = await Product.paginate(filter, options);

    res.render('products', {
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
      nextLink: result.hasNextPage ? `/?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
      query,
      sort
    });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render('realTimeProducts', { products });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

export default router;