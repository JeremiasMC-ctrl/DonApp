const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Donacion = sequelize.define('donaciones', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  donante: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  institucion: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'En Espera'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'donaciones',
  timestamps: false
});

module.exports = Donacion;
