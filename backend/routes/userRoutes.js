const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', authMiddleware, adminMiddleware, userController.getAll);
router.get('/roles', authMiddleware, userController.getRoles);
router.post('/register', authMiddleware, adminMiddleware, userController.register);
router.post('/assign-role', authMiddleware, adminMiddleware, userController.assignRole);

module.exports = router;
