const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Importar rotas
const produtoRoutes = require('./routes/produto');

app.use('/api/produtos', produtoRoutes);

module.exports = app;
