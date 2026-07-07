const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Todo este enrutador requiere autenticación y rol de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', userController.getAll);
router.get('/roles', userController.getRoles);
router.put('/roles/:id/permissions', userController.updateRolePermissions);
router.post('/register', userController.register);
router.post('/assign-role', userController.assignRole);

module.exports = router;
