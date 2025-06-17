const fs = require('fs');

class CartManager {
    constructor() {
        this.path = './data/carts.json';
        this.carts = [];
        this.loadCarts();
    }

    loadCarts() {
        if (fs.existsSync(this.path)) {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.carts = JSON.parse(data);
        } else {
            this.carts = [];
            this.saveCarts();
        }
    }

    saveCarts() {
        fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2));
    }

    createCart() {
        const newId = this.carts.length ? Math.max(...this.carts.map(c => c.id)) + 1 : 1;
        const newCart = { id: newId, products: [] };
        this.carts.push(newCart);
        this.saveCarts();
        return newCart;
    }

    getById(id) {
        return this.carts.find(c => c.id == id);
    }

    getProducts(id) {
        const cart = this.getById(id);
        return cart ? cart.products : null;
    }

    addProductToCart(cartId, productId) {
        const cart = this.getById(cartId);
        if (!cart) return null;

        const productInCart = cart.products.find(p => p.product === productId);
        if (productInCart) {
            productInCart.quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }
        this.saveCarts();
        return cart;
    }
}

module.exports = CartManager;
