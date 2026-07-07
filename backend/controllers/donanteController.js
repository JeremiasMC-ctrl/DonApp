const Donante = require('../models/Donante');

exports.getAll = async (req, res) => {
  try {
    const donantes = await Donante.findAll({
      order: [['nombre', 'ASC']]
    });
    res.json(donantes);
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, identificacion, email, telefono, tipo } = req.body;
    const donante = await Donante.create({ nombre, identificacion, email, telefono, tipo });
    res.status(201).json(donante);
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, identificacion, email, telefono, tipo } = req.body;
    const donante = await Donante.findByPk(id);
    if (!donante) {
      return res.status(404).json({ ok: false, message: 'Donante no encontrado' });
    }
    await donante.update({ nombre, identificacion, email, telefono, tipo });
    res.json(donante);
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const donante = await Donante.findByPk(id);
    if (!donante) {
      return res.status(404).json({ ok: false, message: 'Donante no encontrado' });
    }
    await donante.destroy();
    res.json({ ok: true, message: 'Donante eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};
