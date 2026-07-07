const express = require('express');
const router = express.Router();
const donanteController = require('../controllers/donanteController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

router.use(authMiddleware);

router.get('/', permissionMiddleware('donantes_consultar'), donanteController.getAll);
router.post('/', permissionMiddleware('donantes_gestionar'), donanteController.create);
router.put('/:id', permissionMiddleware('donantes_gestionar'), donanteController.update);
router.delete('/:id', permissionMiddleware('donantes_gestionar'), donanteController.delete);

module.exports = router;
