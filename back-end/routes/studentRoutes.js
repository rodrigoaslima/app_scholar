const { Router } = require('express');

const { getReportByRegistration, listMyGrades, listMySubjects } = require('../controllers/studentController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = Router();

router.get('/aluno/materias', authMiddleware, requireRole('aluno'), listMySubjects);
router.get('/aluno/notas', authMiddleware, requireRole('aluno'), listMyGrades);
router.get('/boletim/:matricula', authMiddleware, requireRole('aluno', 'administrador'), getReportByRegistration);

module.exports = router;
