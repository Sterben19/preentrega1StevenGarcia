const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');
const cartManager = new CartManager();

// POST / - Crear carrito
router.post('/', (req, res) => {
  const newCart = cartManager.createCart();
  res.status(201).json(newCart);
});

// GET /:cid - Obtener productos de un carrito
router.get('/:cid', (req, res) => {
  const products = cartManager.getProducts(req.params.cid);
  if (products) res.json(products);
  else res.status(404).json({ error: 'Carrito no encontrado' });
});

// POST /:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
  const updatedCart = cartManager.addProductToCart(req.params.cid, req.params.pid);
  if (updatedCart) res.json(updatedCart);
  else res.status(404).json({ error: 'Carrito no encontrado' });
});

module.exports = router;
