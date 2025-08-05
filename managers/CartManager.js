import Cart from '../models/Cart.js';

class CartManager {
  async createCart() {
    try {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      return newCart;
    } catch (error) {
      throw error;
    }
  }

  async getCartById(id) {
    try {
      return await Cart.findById(id).populate('products.product');
    } catch (error) {
      throw error;
    }
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) throw new Error('Cart not found');

      const existingProduct = cart.products.find(
        item => item.product.toString() === productId
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      await cart.save();
      return this.getCartById(cartId);
    } catch (error) {
      throw error;
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) throw new Error('Cart not found');

      cart.products = cart.products.filter(
        item => item.product.toString() !== productId
      );

      await cart.save();
      return this.getCartById(cartId);
    } catch (error) {
      throw error;
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      if (quantity <= 0) {
        return this.removeProductFromCart(cartId, productId);
      }

      const cart = await Cart.findById(cartId);
      if (!cart) throw new Error('Cart not found');

      const productIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (productIndex === -1) throw new Error('Product not found in cart');

      cart.products[productIndex].quantity = quantity;
      await cart.save();
      return this.getCartById(cartId);
    } catch (error) {
      throw error;
    }
  }

  async clearCart(cartId) {
    try {
      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { products: [] },
        { new: true }
      ).populate('products.product');
      
      if (!cart) throw new Error('Cart not found');
      return cart;
    } catch (error) {
      throw error;
    }
  }
}

export default CartManager;