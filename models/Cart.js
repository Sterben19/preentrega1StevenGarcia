import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      }
    }
  ],
  isDefault: {
    type: Boolean,
    default: false
  }
});

cartSchema.virtual("total").get(function () {
  return this.products.reduce((acc, item) => {
    if (item.product && item.product.price) {
      return acc + item.product.price * item.quantity;
    }
    return acc;
  }, 0);
});

cartSchema.set("toObject", { virtuals: true });
cartSchema.set("toJSON", { virtuals: true });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
