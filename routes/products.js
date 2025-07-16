const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager();

router.get('/', async (req, res) => {
    const products = await productManager.getAll();
    res.json(products);
});

router.get('/:pid', async (req, res) => {
    const product = await productManager.getById(req.params.pid);
    if (product) res.json(product);
    else res.status(404).json({ error: 'Producto no encontrado' });
});

router.post('/', async (req, res) => {
    const productData = req.body;
    const requiredFields = ['title', 'description', 'code', 'price', 'status', 'stock', 'category'];
    if (!requiredFields.every(field => productData[field] !== undefined)) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const newProduct = await productManager.addProduct(productData);
    const io = req.app.get('io');
    io.emit('new-product', newProduct);
    res.status(201).json(newProduct);
});

router.put('/:pid', async (req, res) => {
    const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
    if (updatedProduct) res.json(updatedProduct);
    else res.status(404).json({ error: 'Producto no encontrado' });
});

router.delete('/:pid', async (req, res) => {
    const deleted = await productManager.deleteProduct(req.params.pid);
    if (deleted) {
        const io = req.app.get('io');
        io.emit('delete-product', req.params.pid);
        res.json(deleted);
    } else res.status(404).json({ error: 'Producto no encontrado' });
});

module.exports = router;