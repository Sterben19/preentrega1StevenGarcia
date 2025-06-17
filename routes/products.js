const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager();

router.get('/', (req, res) => {
  res.json(productManager.getAll());
});


router.get('/:pid', (req, res) => {
  const product = productManager.getById(req.params.pid);
  if (product) res.json(product);
  else res.status(404).json({ error: 'Producto no encontrado' });
});


router.post('/', (req, res) => {
  const productData = req.body;
  const requiredFields = ['title', 'description', 'code', 'price', 'status', 'stock', 'category', 'thumbnails'];
  if (!requiredFields.every(field => productData.hasOwnProperty(field))) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const newProduct = productManager.addProduct(productData);
  res.status(201).json(newProduct);
});


router.put('/:pid', (req, res) => {
  const updatedProduct = productManager.updateProduct(req.params.pid, req.body);
  if (updatedProduct) res.json(updatedProduct);
  else res.status(404).json({ error: 'Producto no encontrado' });
});


router.delete('/:pid', (req, res) => {
  const deleted = productManager.deleteProduct(req.params.pid);
  if (deleted) res.json(deleted);
  else res.status(404).json({ error: 'Producto no encontrado' });
});

module.exports = router;
