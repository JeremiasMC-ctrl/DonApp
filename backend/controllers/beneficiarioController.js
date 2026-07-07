const Beneficiario = require('../models/Beneficiario');

exports.getAll = async (req, res) => {
  try {
    const beneficiarios = await Beneficiario.findAll({
      order: [['nombre', 'ASC']]
    });
    res.json(beneficiarios);
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, identificacion, email, telefono, direccion } = req.body;
    
    const beneficiario = await Beneficiario.create({
      nombre,
      identificacion,
      email,
      telefono,
      direccion
    });

    res.status(201).json(beneficiario);
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, identificacion, email, telefono, direccion } = req.body;
    
    const beneficiario = await Beneficiario.findByPk(id);
    if (!beneficiario) {
      return res.status(404).json({ ok: false, message: 'Fundación no encontrada' });
    }

    await beneficiario.update({
      nombre,
      identificacion,
      email,
      telefono,
      direccion
    });

    res.json(beneficiario);
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const beneficiario = await Beneficiario.findByPk(id);
    if (!beneficiario) {
      return res.status(404).json({ ok: false, message: 'Fundación no encontrada' });
    }
    await beneficiario.destroy();
    res.json({ ok: true, message: 'Fundación eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

