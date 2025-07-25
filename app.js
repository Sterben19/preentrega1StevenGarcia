import express from 'express';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import productRouter from './routes/products.js';
import cartRouter from './routes/carts.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();


const atlasUri = "mongodb+srv://sterben:Sterben12@cluster0.rl4zqfw.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0";

async function connectDB() {
  try {
    await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 5000,  
      socketTimeoutMS: 45000,         
      family: 4                       
    });
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    

    const altUri = "mongodb://sterben:Sterben12@cluster0-shard-00-00.rl4zqfw.mongodb.net:27017,ecommerce?ssl=true&authSource=admin";
    await mongoose.connect(altUri);
    console.log('⚠️ Conectado mediante URL alternativa');
  }
}


app.use(express.json());
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);


const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
});