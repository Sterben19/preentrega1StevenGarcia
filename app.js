const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const port = 8080;

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

let products = [];

io.on('connection', socket => {
  console.log('Cliente conectado');

  socket.emit('update-products', products);

  socket.on('add-product', product => {
    products.push(product);
    io.emit('update-products', products);
  });

  socket.on('delete-product', productId => {
    products = products.filter(p => p.id !== productId);
    io.emit('update-products', products);
  });
});

httpServer.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
});
