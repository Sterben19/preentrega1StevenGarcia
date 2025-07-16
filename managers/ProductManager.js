const fs = require('fs').promises;
const path = require('path');

class ProductManager {
    constructor() {
        this.path = path.join(__dirname, '../data/products.json');
        this.products = [];
        this.loadProducts();
    }

    async loadProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            this.products = JSON.parse(data);
        } catch (error) {
            this.products = [];
            await this.saveProducts();
        }
    }

    async saveProducts() {
        await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
    }

    async getAll() {
        await this.loadProducts();
        return this.products;
    }

    async getById(id) {
        await this.loadProducts();
        return this.products.find(p => p.id == id);
    }

    async addProduct(productData) {
        await this.loadProducts();
        const newId = this.products.length ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
        const newProduct = { id: newId, ...productData };
        this.products.push(newProduct);
        await this.saveProducts();
        return newProduct;
    }

    async updateProduct(id, data) {
        await this.loadProducts();
        const index = this.products.findIndex(p => p.id == id);
        if (index !== -1) {
            const { id: _, ...fieldsToUpdate } = data;
            this.products[index] = { ...this.products[index], ...fieldsToUpdate };
            await this.saveProducts();
            return this.products[index];
        }
        return null;
    }

    async deleteProduct(id) {
        await this.loadProducts();
        const index = this.products.findIndex(p => p.id == id);
        if (index !== -1) {
            const deleted = this.products.splice(index, 1);
            await this.saveProducts();
            return deleted;
        }
        return null;
    }
}

module.exports = ProductManager;