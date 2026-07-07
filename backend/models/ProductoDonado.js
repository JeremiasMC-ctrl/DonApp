const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ProductoDonado = sequelize.define('productos_donados', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  unidad: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  donacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  lote: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  cantidad_disponible: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'productos_donados',
  timestamps: false
});

module.exports = ProductoDonado;
