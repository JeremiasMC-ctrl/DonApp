const express = require('express');
const router = express.Router();
const donacionController = require('../controllers/donacionController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

router.use(authMiddleware);

// Rutas de Donaciones
router.get('/donaciones', permissionMiddleware('donaciones'), donacionController.getAll);
router.get('/donaciones/:id', permissionMiddleware('donaciones'), donacionController.getById);
router.post('/donaciones', permissionMiddleware('donaciones'), donacionController.create);
router.put('/donaciones/:id', permissionMiddleware('donaciones'), donacionController.update);

// Rutas de Productos
router.get('/productos', permissionMiddleware('donaciones'), donacionController.getProductos);

module.exports = router;
