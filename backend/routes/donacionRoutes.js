const express = require('express');
const router = express.Router();
const donacionController = require('../controllers/donacionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware para verificar si el usuario tiene rol de escritura (Administrador u Operador)
const canWrite = (req, res, next) => {
  const rol = req.user.rol.toLowerCase();
  if (rol !== 'administrador' && rol !== 'operador') {
    return res.status(403).json({ error: 'Acceso denegado. Los supervisores solo tienen acceso de lectura.' });
  }
  next();
};

// Rutas de Donaciones
router.get('/donaciones', authMiddleware, donacionController.getAll);
router.get('/donaciones/:id', authMiddleware, donacionController.getById);
router.post('/donaciones', authMiddleware, canWrite, donacionController.create);
router.put('/donaciones/:id', authMiddleware, canWrite, donacionController.update);

// Rutas de Productos
router.get('/productos', authMiddleware, donacionController.getProductos);

module.exports = router;
