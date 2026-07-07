const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config();

exports.login = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    // Validación de la HU001 (Obligatorio)
    if (!usuario) {
      return res.status(400).json({ error: 'El campo usuario es obligatorio.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'El campo contraseña es obligatorio.' });
    }

    // Buscar usuario en base de datos incluyendo el rol
    const user = await User.findOne({
      where: { usuario },
      include: [{ model: Role, as: 'rol' }]
    });

    // Verificar si el usuario existe y su contraseña (encriptada con BCRYPT) es correcta
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales incorrectas. Inténtalo de nuevo.' });
    }

    // Parsear los permisos del rol
    let permisos = [];
    if (user.rol && user.rol.permisos) {
      try {
        permisos = JSON.parse(user.rol.permisos);
      } catch (e) {
        console.error('Error al parsear permisos en login:', e);
      }
    }

    // Generar token JWT
    const payload = {
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      nombre_completo: `${user.nombres} ${user.apellidos}`,
      usuario: user.usuario,
      email: user.email,
      rol: user.rol ? user.rol.nombre : null,
      rol_id: user.rol_id,
      permisos
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'donapp_secret_key_2026_xyz', {
      expiresIn: '24h'
    });

    return res.json({
      token,
      user: payload
    });
  } catch (error) {
    console.error('Error en authController.login:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'rol' }]
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    let permisos = [];
    if (user.rol && user.rol.permisos) {
      try {
        permisos = JSON.parse(user.rol.permisos);
      } catch (e) {
        console.error('Error al parsear permisos en me:', e);
      }
    }

    return res.json({
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      nombre_completo: `${user.nombres} ${user.apellidos}`,
      usuario: user.usuario,
      email: user.email,
      rol: user.rol ? user.rol.nombre : null,
      rol_id: user.rol_id,
      permisos
    });
  } catch (error) {
    console.error('Error en authController.me:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
