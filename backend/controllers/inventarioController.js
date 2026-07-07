const ProductoDonado = require('../models/ProductoDonado');
const Donacion = require('../models/Donacion');

// Helper to determine expiration warning category
const obtenerAlertaVencimiento = (fechaVenc) => {
  if (!fechaVenc) return { status: 'safe', label: 'Sin Vencimiento' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expirationDate = new Date(fechaVenc);
  expirationDate.setHours(0, 0, 0, 0);
  
  const diffTime = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { status: 'danger', label: 'Vencido' };
  } else if (diffDays <= 15) {
    return { status: 'danger', label: 'Alerta Crítica (<15 días)' };
  } else if (diffDays <= 45) {
    return { status: 'warning', label: 'Próximo a Vencer (<45 días)' };
  }
  return { status: 'safe', label: 'Buen Estado' };
};

exports.getAll = async (req, res) => {
  try {
    const productos = await ProductoDonado.findAll({
      include: [
        {
          model: Donacion,
          as: 'donacion',
          attributes: ['id', 'donante', 'institucion', 'fecha', 'estado']
        }
      ],
      order: [['id', 'DESC']]
    });

    const inventario = productos.map(p => {
      const pJSON = p.toJSON();
      const alerta = obtenerAlertaVencimiento(p.fecha_vencimiento);
      return {
        ...pJSON,
        alerta_vencimiento: alerta.label,
        alerta_estado: alerta.status
      };
    });

    res.json(inventario);
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad_disponible, lote, fecha_vencimiento } = req.body;
    
    const producto = await ProductoDonado.findByPk(id);
    if (!producto) {
      return res.status(404).json({ ok: false, message: 'Producto no encontrado en inventario' });
    }

    await producto.update({
      cantidad_disponible: cantidad_disponible !== undefined ? parseInt(cantidad_disponible) : producto.cantidad_disponible,
      lote: lote !== undefined ? lote : producto.lote,
      fecha_vencimiento: fecha_vencimiento !== undefined ? fecha_vencimiento : producto.fecha_vencimiento
    });

    res.json(producto);
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};
