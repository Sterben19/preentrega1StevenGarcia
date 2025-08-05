import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = Router();


const sendResponse = (res, status, data, message = '') => {
  const response = { status };
  if (data) response.payload = data;
  if (message) response.message = message;
  res.status(status === 'success' ? 200 : 400).json(response);
};


router.post('/', async (req, res) => {
  try {
    const newCart = await Cart.create({ products: [] });
    sendResponse(res, 'success', newCart, 'Carrito creado exitosamente');
  } catch (error) {
    sendResponse(res, 'error', null, error.message);
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate('products.product')
      .lean();

    if (!cart) {
      return sendResponse(res, 'error', null, 'Carrito no encontrado');
    }


    const enhancedCart = {
      ...cart,
      total: cart.products.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
      products: cart.products.map(item => ({
        ...item,
        subtotal: item.product.price * item.quantity
      }))
    };

    sendResponse(res, 'success', enhancedCart);
  } catch (error) {
    sendResponse(res, 'error', null, error.message);
  }
});


router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;

    if (isNaN(quantity)) {
      return sendResponse(res, 'error', null, 'La cantidad debe ser un número');
    }

    const [cart, product] = await Promise.all([
      Cart.findById(cid),
      Product.findById(pid)
    ]);

    if (!cart || !product) {
      return sendResponse(res, 'error', null, 'Carrito o producto no encontrado');
    }

    if (product.stock < quantity) {
      return sendResponse(res, 'error', null, `Stock insuficiente. Disponible: ${product.stock}`);
    }

    const existingProductIndex = cart.products.findIndex(
      item => item.product.toString() === pid
    );

    if (existingProductIndex >= 0) {
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    await cart.save();
    

    product.stock -= quantity;
    await product.save();

    const updatedCart = await Cart.findById(cid).populate('products.product');
    sendResponse(res, 'success', updatedCart, 'Producto agregado al carrito');
  } catch (error) {
    sendResponse(res, 'error', null, error.message);
  }
});


router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return sendResponse(res, 'error', null, 'Formato de productos inválido');
    }

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products },
      { new: true }
    ).populate('products.product');

    if (!cart) {
      return sendResponse(res, 'error', null, 'Carrito no encontrado');
    }

    sendResponse(res, 'success', cart, 'Carrito actualizado');
  } catch (error) {
    sendResponse(res, 'error', null, error.message);
  }
});


router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
      return sendResponse(res, 'error', null, 'La cantidad debe ser un entero mayor a 0');
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return sendResponse(res, 'error', null, 'Carrito no encontrado');
    }

    const productIndex = cart.products.findIndex(
      item => item.product.toString() === pid
    );

    if (productIndex === -1) {
      return sendResponse(res, 'error', null, 'Producto no encontrado en el carrito');
    }


    const product = await Product.findById(pid);
    const currentQuantity = cart.products[productIndex].quantity;
    const stockDifference = quantity - currentQuantity;

    if (product.stock < stockDifference) {
      return sendResponse(res, 'error', null, `Stock insuficiente. Disponible: ${product.stock}`);
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();
    

    product.stock -= stockDifference;
    await product.save();

    const updatedCart = await Cart.findById(cid).populate('products.product');
    sendResponse(res, 'success', updatedCart, 'Cantidad actualizada');
  } catch (error) {
    sendResponse(res, 'error', null, error.message);
  }
});


router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    
    if (!cart) {
      return sendResponse(res, 'error', null, 'Carrito no encontrado');
    }

    const productIndex = cart.products.findIndex(
      item => item.product.toString() === pid
    );

    if (productIndex === -1) {
      return sendResponse(res, 'error', null, 'Producto no encontrado en el carrito');
    }


    const product = await Product.findById(pid);
    product.stock += cart.products[productIndex].quantity;
    await product.save();

    cart.products.splice(productIndex, 1);
    await cart.save();
    
    sendResponse(res, 'success', cart, 'Producto eliminado del carrito');
  } catch (error) {
    sendResponse(res, 'error', null, error.message);
  }
});

router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);
    
    if (!cart) {
      return sendResponse(res, 'error', null, 'Carrito no encontrado');
    }


    await Promise.all(
      cart.products.map(async item => {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      })
    );

    cart.products = [];
    await cart.save();
    
    sendResponse(res, 'success', cart, 'Carrito vaciado');
  } catch (error) {
    sendResponse(res, 'error', null, error.message);
  }
});

export default router;