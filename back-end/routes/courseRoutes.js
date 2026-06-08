const { Router } = require('express');

const {
  createCourse,
  deleteCourse,
  listCourses,
  updateCourse,
} = require('../controllers/courseController');
const { authMiddleware, requireRole } = require('../middlewares/auth');

const router = Router();
const adminOnly = [authMiddleware, requireRole('administrador')];

router.get('/cursos', listCourses);
router.post('/cursos', adminOnly, createCourse);
router.put('/cursos/:id', adminOnly, updateCourse);
router.delete('/cursos/:id', adminOnly, deleteCourse);

module.exports = router;
