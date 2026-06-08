const { Router } = require('express');

const {
  assignProfessor,
  assignStudent,
  createDiscipline,
  createProfessor,
  createStudent,
  deleteDiscipline,
  deleteProfessor,
  deleteStudent,
  deleteUser,
  listDisciplines,
  listProfessors,
  listStudents,
  listUsers,
  removeStudentFromDiscipline,
  setUserActive,
  updateDiscipline,
  updateProfessor,
  updateStudent,
} = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = Router();
const adminOnly = [authMiddleware, requireRole('administrador')];

router.get('/usuarios', adminOnly, listUsers);
router.patch('/usuarios/:id/acesso', adminOnly, setUserActive);
router.delete('/usuarios/:id', adminOnly, deleteUser);

router.get('/alunos', adminOnly, listStudents);
router.post('/alunos', adminOnly, createStudent);
router.put('/alunos/:id', adminOnly, updateStudent);
router.delete('/alunos/:id', adminOnly, deleteStudent);

router.get('/professores', adminOnly, listProfessors);
router.post('/professores', adminOnly, createProfessor);
router.put('/professores/:id', adminOnly, updateProfessor);
router.delete('/professores/:id', adminOnly, deleteProfessor);

router.get('/disciplinas', authMiddleware, listDisciplines);
router.post('/disciplinas', adminOnly, createDiscipline);
router.put('/disciplinas/:id', adminOnly, updateDiscipline);
router.delete('/disciplinas/:id', adminOnly, deleteDiscipline);
router.put('/disciplinas/:disciplinaId/professor', adminOnly, assignProfessor);
router.post('/disciplinas/:disciplinaId/alunos', adminOnly, assignStudent);
router.delete('/disciplinas/:disciplinaId/alunos/:alunoId', adminOnly, removeStudentFromDiscipline);

module.exports = router;
