import express from 'express';
import mongoose from 'mongoose';
import { create } from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';


import viewsRouter from './routes/views.js';
import productsRouter from './routes/products.js'; 
import cartsRouter from './routes/carts.router.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB conectado');

    const Cart = (await import('./models/Cart.js')).default;

    let cart = await Cart.findOne({ isDefault: true });
    if (!cart) {
      cart = await Cart.create({ isDefault: true, products: [] });
      console.log('🛒 Carrito por defecto creado');
    }


    app.set('defaultCartId', cart._id.toString());
    app.locals.cartId = cart._id.toString();
  } catch (err) {
    console.error('❌ Error de MongoDB:', err.message);
    process.exit(1);
  }
};

const hbs = create({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: {
    formatPrice: (price) => {
      if (price == null) return '0.00';
      return (Math.round(price * 100) / 100).toFixed(2);
    },
    gt: (a, b) => a > b,
    eq: (a, b) => a === b,
    neq: (a, b) => a !== b,
    range: (from, to) => {
      const arr = [];
      for (let i = from; i <= to; i++) arr.push(i);
      return arr;
    },
    json: (context) => JSON.stringify(context),
    multiply: (a, b) => a * b,
    calculateSubtotal: (price, qty) => {
      if (!price || !qty) return '0.00';
      return (price * qty).toFixed(2);
    },
    calculateTotal: (products) => {
      if (!products || !products.length) return '0.00';
      let total = 0;
      products.forEach(item => {
        total += (item.product?.price || 0) * item.quantity;
      });
      return total.toFixed(2);
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/', viewsRouter);
app.use('/api/products', productsRouter); 
app.use('/api/carts', cartsRouter);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Error',
    message: 'Algo salió mal. Intenta nuevamente.'
  });
});


const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
  });
};

start().catch(err => {
  console.error('🔥 Error al iniciar:', err);
  process.exit(1);
});
