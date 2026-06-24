const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');

// Obtener todos los colaboradores
exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'nombres', 'apellidos', 'usuario', 'email', 'rol_id'],
      include: [{ model: Role, as: 'rol', attributes: ['id', 'nombre', 'descripcion'] }],
      order: [['id', 'ASC']]
    });
    return res.json(users);
  } catch (error) {
    console.error('Error en userController.getAll:', error);
    return res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
};

// Obtener todos los roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['id', 'ASC']]
    });
    return res.json(roles);
  } catch (error) {
    console.error('Error en userController.getRoles:', error);
    return res.status(500).json({ error: 'Error al obtener roles.' });
  }
};

// Registrar nuevo usuario (HU003)
exports.register = async (req, res) => {
  try {
    const { nombres, apellidos, usuario, password, email, rol_id } = req.body;

    // Restricción 3: Todos los campos obligatorios deben completarse
    if (!nombres || !apellidos || !usuario || !password || !email || !rol_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Restricción 2: El correo electrónico debe tener formato válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido.' });
    }

    // Restricción 1: El nombre de usuario debe ser único
    const userExists = await User.findOne({ where: { usuario } });
    if (userExists) {
      return res.status(400).json({ error: 'El usuario ya existe.' });
    }

    // Validar unicidad del correo electrónico
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // Validar que el rol exista
    const roleExists = await Role.findByPk(rol_id);
    if (!roleExists) {
      return res.status(400).json({ error: 'El rol seleccionado no es válido.' });
    }

    // Cifrar la contraseña usando BCRYPT con costo 12 (Opción A / Restricción HU001)
    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Crear usuario
    const newUser = await User.create({
      nombres,
      apellidos,
      usuario,
      password: hashedPassword,
      email,
      rol_id
    });

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      user: {
        id: newUser.id,
        nombres: newUser.nombres,
        apellidos: newUser.apellidos,
        usuario: newUser.usuario,
        email: newUser.email,
        rol_id: newUser.rol_id
      }
    });
  } catch (error) {
    console.error('Error en userController.register:', error);
    return res.status(500).json({ error: 'Error al registrar al usuario.' });
  }
};

// Asignar rol a usuario (HU004)
exports.assignRole = async (req, res) => {
  try {
    const { usuario_id, rol_id } = req.body;

    if (!usuario_id || !rol_id) {
      return res.status(400).json({ error: 'Datos de asignación incompletos.' });
    }

    // Validar que el rol exista
    const roleExists = await Role.findByPk(rol_id);
    if (!roleExists) {
      return res.status(400).json({ error: 'El rol seleccionado no es válido.' });
    }

    // Validar que el usuario exista
    const user = await User.findByPk(usuario_id);
    if (!user) {
      return res.status(404).json({ error: 'El usuario no existe.' });
    }

    // Actualizar rol
    user.rol_id = rol_id;
    await user.save();

    return res.json({
      mensaje: 'Rol asignado correctamente.',
      user: {
        id: user.id,
        usuario: user.usuario,
        rol_id: user.rol_id
      }
    });
  } catch (error) {
    console.error('Error en userController.assignRole:', error);
    return res.status(500).json({ error: 'Error al asignar el rol.' });
  }
};
