const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Importa rotas
const produtoRoutes = require('./routes/produto');
const usuarioRoutes = require('./routes/usuario');

app.use('/api/produtos', produtoRoutes);
app.use('/api/usuarios', usuarioRoutes);

app.get('/', (req, res) => {
    res.send('🚀 API do Sistema de Estoque de Zoonoses funcionando!');
});

module.exports = app;
