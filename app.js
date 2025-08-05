const express = require('express');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const path = require('path');
const dotenv = require('dotenv');
const productRouter = require('./routes/products');
const cartRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;


const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MONGO_URI no está definida en .env');
    }

    console.log('🔸 Conectando a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB Atlas conectado');
    

    const Cart = require('./models/Cart');
    let defaultCart = await Cart.findOne({ isDefault: true });
    if (!defaultCart) {
      defaultCart = await Cart.create({ isDefault: true });
      console.log(`🛒 Carrito por defecto creado: ${defaultCart._id}`);
    }
    app.set('defaultCartId', defaultCart._id.toString());

  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};


app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    multiply: (a, b) => a * b,
    formatPrice: (price) => new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price),
    eq: (a, b) => a === b,
    gt: (a, b) => a > b,
    json: (context) => JSON.stringify(context)
  }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewsRouter);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Error',
    message: 'Algo salió mal',
    style: 'error.css'
  });
});


const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('🔹 Entorno:', process.env.NODE_ENV || 'development');
    console.log('🔹 Handlebars configurado');
  });
};


process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n🔶 Servidor cerrado');
  process.exit(0);
});

startServer().catch(err => {
  console.error('🔥 Error al iniciar:', err);
  process.exit(1);
});