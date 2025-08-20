import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

const buildPaginationLinks = (req, hasPrev, hasNext, page) => {
  const { limit = 10, sort, query } = req.query;
  const baseUrl = `${req.protocol}://${req.get('host')}/products`;
  const params = new URLSearchParams();
  
  if (limit) params.append('limit', limit);
  if (sort) params.append('sort', sort);
  if (query) params.append('query', query);

  return {
    prevLink: hasPrev ? `${baseUrl}?${params.toString()}&page=${page - 1}` : null,
    nextLink: hasNext ? `${baseUrl}?${params.toString()}&page=${page + 1}` : null
  };
};

router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      lean: true,
      sort: sort ? { price: sort === 'desc' ? -1 : 1 } : undefined
    };

    const filter = { status: true };
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    const result = await Product.paginate(filter, options);
    const links = buildPaginationLinks(req, result.hasPrevPage, result.hasNextPage, result.page);

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      ...links
    });

  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

export default router;