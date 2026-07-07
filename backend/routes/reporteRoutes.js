const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

// Todas las rutas de este módulo requieren el permiso 'reportes'
router.use(authMiddleware);
router.use(permissionMiddleware('reportes'));

router.get('/dashboard', reporteController.getStats);

module.exports = router;
