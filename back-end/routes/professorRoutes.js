const { Router } = require('express');

const {
  listDisciplineStudents,
  listMyDisciplines,
  upsertGrade,
} = require('../controllers/professorController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = Router();
const professorOnly = [authMiddleware, requireRole('professor')];

router.get('/professor/disciplinas', professorOnly, listMyDisciplines);
router.get('/professor/disciplinas/:disciplinaId/alunos', professorOnly, listDisciplineStudents);
router.post('/professor/notas', professorOnly, upsertGrade);
router.put('/professor/notas', professorOnly, upsertGrade);

module.exports = router;
