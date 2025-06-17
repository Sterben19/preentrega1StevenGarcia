const express = require('express');
const app = express();
const port = 8080;


app.use(express.json()); 

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(port, () => {
  console.log(`Servidor ejecutandose en puerto ${port}`);
});
