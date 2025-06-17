const fs = require('fs');

class ProductManager {
  constructor() {
    this.path = './data/products.json';
    this.products = [];
    this.loadProducts();
  }

  loadProducts() {
    if (fs.existsSync(this.path)) {
      const data = fs.readFileSync(this.path, 'utf-8');
      this.products = JSON.parse(data);
    } else {
      this.products = [];
      this.saveProducts();
    }
  }

  saveProducts() {
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
  }

  getAll() {
    return this.products;
  }

  getById(id) {
    return this.products.find(p => p.id == id);
  }

  addProduct(productData) {
    const newId = this.products.length ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
    const newProduct = { id: newId, ...productData };
    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }

  updateProduct(id, data) {
    const index = this.products.findIndex(p => p.id == id);
    if (index !== -1) {
      const { id: _, ...fieldsToUpdate } = data;
      this.products[index] = { ...this.products[index], ...fieldsToUpdate };
      this.saveProducts();
      return this.products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id == id);
    if (index !== -1) {
      const deleted = this.products.splice(index, 1);
      this.saveProducts();
      return deleted;
    }
    return null;
  }
}

module.exports = ProductManager;
