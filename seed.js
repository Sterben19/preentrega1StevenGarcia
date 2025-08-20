import mongoose from 'mongoose';
import Product from './models/Product.js';

mongoose.connect('tu_uri_mongodb');

const sampleProducts = [
  {
    title: "Teclado Mecánico RGB",
    description: "Switches azules, retroiluminación",
    price: 25000,
    code: "TEC01",
    stock: 15,
    category: "Electrónicos",
    status: true
  },
  {
    title: "Mouse Inalámbrico",
    description: "1600DPI, ergonómico",
    price: 12000,
    code: "MOU01",
    stock: 20,
    category: "Electrónicos",
    status: true
  }
];

Product.insertMany(sampleProducts)
  .then(() => {
    console.log("Productos creados!");
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Error:", err);
    mongoose.disconnect();
  });