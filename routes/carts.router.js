import { Router } from "express";
import Cart from "../models/Cart.js";

const router = Router();


router.post("/", async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json({ status: "success", payload: newCart });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product").lean();
    if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});



async function addProductHandler(req, res) {
  try {
    const { cid, pid } = req.params;
    let { quantity = 1 } = req.body;
    quantity = Number(quantity) || 1;
    if (!Number.isInteger(quantity) || quantity < 1) quantity = 1;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

    const productExists = cart.products.find(item => item.product.toString() === pid);
    if (productExists) {
      productExists.quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    await cart.save();
    await cart.populate("products.product");

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
}

router.post("/:cid/products/:pid", addProductHandler);
router.post("/:cid/product/:pid", addProductHandler); 

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ status: "error", error: "Cantidad inválida" });
    }

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

    const productInCart = cart.products.find(item => item.product.toString() === pid);
    if (!productInCart) return res.status(404).json({ status: "error", error: "Producto no está en el carrito" });

    productInCart.quantity = qty;
    await cart.save();
    await cart.populate("products.product");

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

    cart.products = cart.products.filter(item => item.product.toString() !== pid);
    await cart.save();
    await cart.populate("products.product");

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();
    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

export default router;
