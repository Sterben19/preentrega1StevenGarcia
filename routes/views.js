const express = require('express');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

const router = express.Router();


const buildPaginationLinks = (req, result) => {
  const { limit, page, sort, query } = req.query;
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
  
  return {
    prevLink: result.hasPrevPage ? 
      `${baseUrl}?${new URLSearchParams({ limit, page: result.prevPage, sort, query }).toString()}` : null,
    nextLink: result.hasNextPage ? 
      `${baseUrl}?${new URLSearchParams({ limit, page: result.nextPage, sort, query }).toString()}` : null
  };
};


router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    res.render('home', {
      title: 'Inicio',
      products,
      cartId: req.app.get('defaultCartId'),
      style: 'home.css'
    });
  } catch (error) {
    console.error('Error en ruta /:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error al cargar la página de inicio',
      style: 'error.css'
    });
  }
});


router.get('/products', async (req, res) => {
  try {
    const { limit = 6, page = 1, sort, query } = req.query;
    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
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

    const result = await Product.paginate(filter, options);
    const { prevLink, nextLink } = buildPaginationLinks(req, result);

    res.render('products', {
      title: 'Productos',
      products: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink,
      cartId: req.app.get('defaultCartId'),
      style: 'products.css'
    });
  } catch (error) {
    console.error('Error en /products:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error al cargar los productos',
      style: 'error.css'
    });
  }
});


router.get('/products/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).render('error', {
        title: 'No encontrado',
        message: 'Producto no existe',
        style: 'error.css'
      });
    }

    res.render('productDetail', {
      title: product.title,
      product,
      cartId: req.app.get('defaultCartId'),
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
      total: cart.products.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
      products: cart.products.map(item => ({
        ...item,
        subtotal: item.product.price * item.quantity
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

module.exports = router;