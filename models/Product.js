import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede exceder los 100 caracteres'],
    minlength: [3, 'El título debe tener al menos 3 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  code: {
    type: String,
    required: [true, 'El código es requerido'],
    unique: [true, 'El código debe ser único'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'El código solo puede contener letras mayúsculas, números y guiones']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo'],
    get: (value) => Math.round(value * 100) / 100 // Redondear a 2 decimales
  },
  status: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    validate: {
      validator: Number.isInteger,
      message: 'El stock debe ser un número entero'
    }
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: {
      values: ['Computadores', 'Videojuegos', 'Accesorios', 'Consolas'],
      message: 'Categoría no válida'
    },
    index: true
  },
  thumbnails: {
    type: [String],
    default: [],
    validate: {
      validator: (array) => array.length <= 5,
      message: 'No se pueden subir más de 5 imágenes'
    }
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { getters: true },
  toObject: { getters: true }
});


productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

productSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', productSchema);