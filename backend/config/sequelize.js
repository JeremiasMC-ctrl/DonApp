const { Sequelize } = require('sequelize');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL en las variables de entorno (.env)');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: false, // Las tablas no tienen updatedAt, created_at se maneja por defecto
    freezeTableName: true
  }
});

module.exports = sequelize;
