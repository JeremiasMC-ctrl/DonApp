const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Role = sequelize.define('roles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  permisos: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]'
  }
}, {
  tableName: 'roles',
  timestamps: false
});

module.exports = Role;
