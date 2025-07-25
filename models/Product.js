import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Juguetes']
  },
  thumbnails: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.every(url => typeof url === 'string');
      },
      message: 'Las imágenes deben ser URLs válidas'
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

productSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', productSchema);