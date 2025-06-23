const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: process.env.DB_PORT
    }
);

sequelize.authenticate()
    .then(() => console.log('💾 Banco conectado com sucesso'))
    .catch(err => console.error('❌ Erro na conexão do banco:', err));

module.exports = sequelize;
