const sequelize = require('../config/sequelize');
const Donacion = require('../models/Donacion');
const ProductoDonado = require('../models/ProductoDonado');
const User = require('../models/User');

// Obtener todas las donaciones
exports.getAll = async (req, res) => {
  try {
    const donaciones = await Donacion.findAll({
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombres', 'apellidos', 'usuario']
        },
        {
          model: ProductoDonado,
          as: 'productos'
        }
      ],
      order: [['id', 'DESC']]
    });
    return res.json(donaciones);
  } catch (error) {
    console.error('Error en donacionController.getAll:', error);
    return res.status(500).json({ error: 'Error al obtener las donaciones.' });
  }
};

// Obtener detalle de una donación
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const donacion = await Donacion.findByPk(id, {
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombres', 'apellidos', 'usuario']
        },
        {
          model: ProductoDonado,
          as: 'productos'
        }
      ]
    });

    if (!donacion) {
      return res.status(404).json({ error: 'Donación no encontrada.' });
    }

    return res.json(donacion);
  } catch (error) {
    console.error('Error en donacionController.getById:', error);
    return res.status(500).json({ error: 'Error al obtener el detalle de la donación.' });
  }
};

// Registrar donación y productos asociados (HU005)
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { donante, institucion, fecha, estado, observaciones, productos } = req.body;

    if (!donante || !institucion) {
      return res.status(400).json({ error: 'Los campos donante e institución son obligatorios.' });
    }

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Debes registrar al menos un producto en la donación.' });
    }

    // Validar productos individuales
    for (const prod of productos) {
      if (!prod.nombre || !prod.categoria || !prod.cantidad) {
        return res.status(400).json({ error: 'Todos los productos deben tener nombre, categoría y cantidad.' });
      }
    }

    // Crear la cabecera de la donación
    const nuevaDonacion = await Donacion.create({
      donante,
      institucion,
      fecha: fecha || new Date(),
      estado: estado || 'En Espera',
      observaciones: observaciones || '',
      usuario_id: req.user.id
    }, { transaction: t });

    // Preparar y crear productos
    const productosData = productos.map(p => ({
      nombre: p.nombre,
      categoria: p.categoria,
      cantidad: parseInt(p.cantidad),
      unidad: p.unidad || 'unidades',
      donacion_id: nuevaDonacion.id
    }));

    await ProductoDonado.bulkCreate(productosData, { transaction: t });

    // Confirmar transacción
    await t.commit();

    // Devolver la donación creada con sus productos
    const donacionCompleta = await Donacion.findByPk(nuevaDonacion.id, {
      include: [{ model: ProductoDonado, as: 'productos' }]
    });

    return res.status(201).json({
      mensaje: 'Donación registrada correctamente.',
      donacion: donacionCompleta
    });
  } catch (error) {
    await t.rollback();
    console.error('Error en donacionController.create:', error);
    return res.status(500).json({ error: 'Error al registrar la donación.' });
  }
};

// Modificar donación y productos (HU006)
exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { donante, institucion, fecha, estado, observaciones, productos } = req.body;

    if (!donante || !institucion) {
      return res.status(400).json({ error: 'Los campos donante e institución son obligatorios.' });
    }

    const donacion = await Donacion.findByPk(id);
    if (!donacion) {
      return res.status(404).json({ error: 'La donación no existe.' });
    }

    // Actualizar campos de la donación
    donacion.donante = donante;
    donacion.institucion = institucion;
    if (fecha) donacion.fecha = fecha;
    if (estado) donacion.estado = estado;
    donacion.observaciones = observaciones || '';
    
    await donacion.save({ transaction: t });

    // Si se enviaron productos, actualizar la lista
    if (productos && Array.isArray(productos)) {
      if (productos.length === 0) {
        return res.status(400).json({ error: 'La donación debe tener al menos un producto.' });
      }

      // Validar productos individuales
      for (const prod of productos) {
        if (!prod.nombre || !prod.categoria || !prod.cantidad) {
          return res.status(400).json({ error: 'Todos los productos deben tener nombre, categoría y cantidad.' });
        }
      }

      // Eliminar productos viejos asociados a esta donación
      await ProductoDonado.destroy({
        where: { donacion_id: id },
        transaction: t
      });

      // Crear los nuevos productos
      const productosData = productos.map(p => ({
        nombre: p.nombre,
        categoria: p.categoria,
        cantidad: parseInt(p.cantidad),
        unidad: p.unidad || 'unidades',
        donacion_id: id
      }));

      await ProductoDonado.bulkCreate(productosData, { transaction: t });
    }

    await t.commit();

    const donacionCompleta = await Donacion.findByPk(id, {
      include: [{ model: ProductoDonado, as: 'productos' }]
    });

    return res.json({
      mensaje: 'Donación actualizada correctamente.',
      donacion: donacionCompleta
    });
  } catch (error) {
    await t.rollback();
    console.error('Error en donacionController.update:', error);
    return res.status(500).json({ error: 'Error al actualizar la donación.' });
  }
};

// Obtener listado global de todos los productos donados
exports.getProductos = async (req, res) => {
  try {
    const productos = await ProductoDonado.findAll({
      include: [
        {
          model: Donacion,
          as: 'donacion',
          attributes: ['donante', 'institucion', 'fecha', 'estado']
        }
      ],
      order: [['id', 'DESC']]
    });
    return res.json(productos);
  } catch (error) {
    console.error('Error en donacionController.getProductos:', error);
    return res.status(500).json({ error: 'Error al obtener productos donados.' });
  }
};
