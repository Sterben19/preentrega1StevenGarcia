const fs = require('fs').promises;
const path = require('path');

class CartManager {
    constructor() {
        this.path = path.join(__dirname, '../data/carts.json');
        this.carts = [];
        this.loadCarts();
    }

    async loadCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(data);
        } catch (error) {
            this.carts = [];
            await this.saveCarts();
        }
    }

    async saveCarts() {
        await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
    }

    async createCart() {
        await this.loadCarts();
        const newId = this.carts.length ? Math.max(...this.carts.map(c => c.id)) + 1 : 1;
        const newCart = { id: newId, products: [] };
        this.carts.push(newCart);
        await this.saveCarts();
        return newCart;
    }

    async getById(id) {
        await this.loadCarts();
        return this.carts.find(c => c.id == id);
    }

    async addProductToCart(cartId, productId) {
        await this.loadCarts();
        const cart = await this.getById(cartId);
        if (!cart) return null;

        const productInCart = cart.products.find(p => p.product === productId);
        if (productInCart) {
            productInCart.quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }
        await this.saveCarts();
        return cart;
    }
}

module.exports = CartManager;