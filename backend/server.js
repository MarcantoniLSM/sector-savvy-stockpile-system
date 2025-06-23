const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3333;

sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
});
