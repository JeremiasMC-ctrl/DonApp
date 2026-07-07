const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

router.use(authMiddleware);

// Permite leer el inventario a quien tenga permiso de 'inventario' o 'entregas' (necesario para registrar entregas de ayuda)
const canReadInventario = (req, res, next) => {
  const userPermissions = req.user.permisos || [];
  if (!userPermissions.includes('inventario') && !userPermissions.includes('entregas')) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere el permiso de inventario o entregas.' });
  }
  next();
};

router.get('/', canReadInventario, inventarioController.getAll);
router.put('/:id', permissionMiddleware('inventario'), inventarioController.update);

module.exports = router;
