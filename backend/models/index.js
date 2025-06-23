const sequelize = require('../config/database');

const Produto = require('./Produto');
const Categoria = require('./Categoria');
const Fornecedor = require('./Fornecedor');
const Usuario = require('./Usuario');
const EntradaEstoque = require('./EntradaEstoque');
const SaidaEstoque = require('./SaidaEstoque');

// Relacionamentos
Produto.belongsTo(Categoria);
Categoria.hasMany(Produto);

Produto.belongsTo(Fornecedor);
Fornecedor.hasMany(Produto);

EntradaEstoque.belongsTo(Produto);
Produto.hasMany(EntradaEstoque);

SaidaEstoque.belongsTo(Produto);
Produto.hasMany(SaidaEstoque);

module.exports = {
    sequelize,
    Produto,
    Categoria,
    Fornecedor,
    Usuario,
    EntradaEstoque,
    SaidaEstoque
};
