import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();


const seedProducts = [
  { 
    title: "Teclado Mecánico RGB", 
    price: 25000, 
    category: "Electrónica", 
    stock: 15,
    description: "Teclado gaming con switches azules",
    code: "TEC001"
  },
  { 
    title: "Mouse Inalámbrico", 
    price: 12000, 
    category: "Electrónica", 
    stock: 30,
    description: "Mouse ergonómico 1600DPI",
    code: "MOU001"
  },
  { 
    title: "Monitor 24 pulgadas", 
    price: 80000, 
    category: "Electrónica", 
    stock: 8,
    description: "Monitor Full HD 144Hz",
    code: "MON001"
  }
];

async function seedDB() {
  try {

    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://sterben:Sterben12@cluster0.rl4zqfw.mongodb.net/ecommerce");
    console.log("✅ Conectado a MongoDB Atlas");


    await Product.deleteMany();
    console.log("🧹 Colección 'products' limpiada");


    await Product.insertMany(seedProducts);
    console.log(`🌱 ${seedProducts.length} productos insertados`);

  } catch (err) {
    console.error("❌ Error al cargar datos:", err.message);
  } finally {

    await mongoose.disconnect();
    process.exit();
  }
}

seedDB();