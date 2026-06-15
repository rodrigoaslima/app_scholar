const { Router } = require('express');

const {
  countMyMessages,
  createMessage,
  listAdminMessages,
  listMyMessages,
  listStudentMessages,
} = require('../controllers/messageController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = Router();

router.get('/msg/admin', listAdminMessages);
router.get('/msg/aluno', authMiddleware, requireRole('aluno'), listStudentMessages);
router.get('/msg/count', authMiddleware, requireRole('administrador', 'professor'), countMyMessages);
router.get('/msg', authMiddleware, requireRole('administrador', 'professor'), listMyMessages);
router.post('/msg', authMiddleware, requireRole('administrador', 'professor'), createMessage);

module.exports = router;
