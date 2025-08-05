import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      validate: {
        validator: async function(productId) {
          const product = await mongoose.model('Product').findById(productId);
          return !!product;
        },
        message: 'El producto no existe'
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La cantidad mínima es 1'],
      validate: {
        validator: Number.isInteger,
        message: 'La cantidad debe ser un número entero'
      }
    }
  }]
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true }
});

cartSchema.virtual('total').get(function() {
  return this.products.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);
});


cartSchema.pre(/^find/, function(next) {
  this.populate('products.product');
  next();
});

export default mongoose.model('Cart', cartSchema);