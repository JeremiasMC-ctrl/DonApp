const express = require('express');
const router = express.Router();
const beneficiarioController = require('../controllers/beneficiarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

// Todas las rutas de este módulo requieren el permiso 'beneficiarios'
router.use(authMiddleware);
router.use(permissionMiddleware('beneficiarios'));

router.get('/', beneficiarioController.getAll);
router.post('/', beneficiarioController.create);
router.put('/:id', beneficiarioController.update);
router.delete('/:id', beneficiarioController.delete);

module.exports = router;
