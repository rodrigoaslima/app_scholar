const { httpError } = require('./httpError');

async function ensureCourseExists(db, courseName) {
  const course = await db.get(
    'SELECT id FROM cursos WHERE nome = ? AND ativo = 1',
    courseName
  );

  if (!course) {
    throw httpError(400, 'Curso invalido.', 'INVALID_COURSE');
  }
}

module.exports = { ensureCourseExists };
