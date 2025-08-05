import Product from '../models/Product.js';

class ProductManager {
  async getProducts(filter = {}, options = {}) {
    try {
      return await Product.paginate(filter, options);
    } catch (error) {
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const product = await Product.findById(id);
      if (!product) throw new Error('Product not found');
      return product;
    } catch (error) {
      throw error;
    }
  }

  async addProduct(productData) {
    try {
      const newProduct = new Product(productData);
      await newProduct.save();
      return newProduct;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(id, updateData) {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      if (!updatedProduct) throw new Error('Product not found');
      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct) throw new Error('Product not found');
      return deletedProduct;
    } catch (error) {
      throw error;
    }
  }
}

export default ProductManager;