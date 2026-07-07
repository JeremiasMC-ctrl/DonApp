const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Beneficiario = sequelize.define('beneficiarios', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  identificacion: {
    type: DataTypes.STRING(50),
    unique: true
  },
  email: {
    type: DataTypes.STRING(150)
  },
  telefono: {
    type: DataTypes.STRING(50)
  },
  direccion: {
    type: DataTypes.TEXT
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = Beneficiario;
