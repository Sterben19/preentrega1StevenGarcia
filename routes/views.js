import express from 'express';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

const router = express.Router();

const buildPaginationLinks = (req, result) => {
  const { limit, sort, query, category } = req.query;
  const basePath = '/products';

  const makeLink = (page) =>
    `${basePath}?limit=${limit || 6}&page=${page}&sort=${sort || ''}&query=${query || ''}&category=${category || ''}`;

  return {
    prevLink: result.hasPrevPage ? makeLink(result.prevPage) : null,
    nextLink: result.hasNextPage ? makeLink(result.nextPage) : null
  };
};

router.get('/', async (req, res) => {
  try {
    const result = await Product.paginate(
      { status: true },
      {
        limit: 4,
        page: req.query.page || 1,
        sort: { createdAt: -1 },
        lean: true
      }
    );

    const safeProducts = result.docs.map(p => ({
      ...p,
      thumbnails: p.thumbnails?.length ? p.thumbnails : ['/img/default-product.png']
    }));

    res.render('home', {
      title: 'Inicio',
      products: safeProducts,
      pagination: {
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? `/?page=${result.prevPage}` : null,
        nextLink: result.hasNextPage ? `/?page=${result.nextPage}` : null
      },
      cartId: req.app.get('defaultCartId') || req.app.locals.cartId,
      style: 'home.css'
    });
  } catch (error) {
    console.error('Error loading home:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error al cargar productos destacados'
    });
  }
});

router.get('/products', async (req, res) => {
  try {
    const { limit = 6, page = 1, sort, query, category } = req.query;

    const options = {
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
      lean: true,
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined
    };

    const filter = { status: true };
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    if (category) {
      filter.category = category;
    }

    const result = await Product.paginate(filter, options);
    const categories = await Product.distinct('category');
    const links = buildPaginationLinks(req, result);

    res.render('products', {
      title: 'Productos',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: links.prevLink,
      nextLink: links.nextLink,
      limit,
      sort,
      query,
      currentCategory: category || '',
      currentQuery: query || '',
      currentSort: sort || '',
      categories,
      cartId: req.app.get('defaultCartId') || req.app.locals.cartId, 
      style: 'products.css'
    });

  } catch (error) {
    console.error('Error en /products:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error al cargar productos'
    });
  }
});

router.get('/products/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).render('error', {
        title: 'No encontrado',
        message: 'El producto solicitado no existe',
        style: 'error.css'
      });
    }

    res.render('productDetail', {
      title: product.title,
      product,
      cartId: req.app.get('defaultCartId') || req.app.locals.cartId,
      style: 'detail.css'
    });
  } catch (error) {
    console.error('Error en /products/:pid:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error al cargar el producto',
      style: 'error.css'
    });
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate('products.product')
      .lean();

    if (!cart) {
      return res.status(404).render('error', {
        title: 'Error',
        message: 'Carrito no encontrado',
        style: 'error.css'
      });
    }

    const enhancedCart = {
      ...cart,
      total: cart.products.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
      products: cart.products.map(item => ({
        ...item,
        subtotal: (item.product?.price || 0) * item.quantity
      }))
    };

    res.render('cart', {
      title: 'Tu Carrito',
      cart: enhancedCart,
      style: 'cart.css'
    });
  } catch (error) {
    console.error('Error en /carts/:cid:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error al cargar el carrito',
      style: 'error.css'
    });
  }
});

export default router;
