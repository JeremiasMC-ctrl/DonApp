const { Op } = require('sequelize');
const Donacion = require('../models/Donacion');
const Beneficiario = require('../models/Beneficiario');
const ProductoDonado = require('../models/ProductoDonado');

// Helper to determine expiration warning category
const obtenerAlertaVencimiento = (fechaVenc) => {
  if (!fechaVenc) return 'safe';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expirationDate = new Date(fechaVenc);
  expirationDate.setHours(0, 0, 0, 0);
  
  const diffTime = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0 || diffDays <= 15) {
    return 'danger';
  } else if (diffDays <= 45) {
    return 'warning';
  }
  return 'safe';
};

exports.getStats = async (req, res) => {
  try {
    // 1. Contador de Donaciones y Beneficiarios (Fundaciones)
    const donacionesCount = await Donacion.count();
    const beneficiariosCount = await Beneficiario.count();
    
    // 2. Alertas de Expiración
    const stockProducts = await ProductoDonado.findAll({
      where: {
        cantidad_disponible: {
          [Op.gt]: 0
        }
      }
    });

    let vencidos = 0;
    let proximosVencer = 0;
    const itemsCriticos = [];

    stockProducts.forEach(p => {
      const alertType = obtenerAlertaVencimiento(p.fecha_vencimiento);
      if (alertType === 'danger') {
        vencidos++;
        itemsCriticos.push({
          id: p.id,
          nombre: p.nombre,
          fecha_vencimiento: p.fecha_vencimiento,
          cantidad_disponible: p.cantidad_disponible,
          lote: p.lote,
          alerta: 'Vencido / Alerta Crítica'
        });
      } else if (alertType === 'warning') {
        proximosVencer++;
      }
    });

    // 3. Total de productos en inventario (Unidades en Stock)
    let totalStockUnidades = 0;
    stockProducts.forEach(p => {
      totalStockUnidades += (p.cantidad_disponible ?? 0);
    });

    res.json({
      donacionesCount,
      beneficiariosCount,
      totalStockUnidades,
      vencidosCount: vencidos,
      proximosVencerCount: proximosVencer,
      itemsCriticos: itemsCriticos.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

