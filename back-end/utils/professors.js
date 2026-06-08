const { httpError } = require('./httpError');

function normalizeIds(ids) {
  return Array.isArray(ids) ? [...new Set(ids.map(Number).filter(Boolean))] : [];
}

async function validateProfessorLinks(db, courseIds, disciplineIds) {
  if (!courseIds.length) {
    throw httpError(400, 'Selecione ao menos um curso.', 'VALIDATION_ERROR');
  }

  if (!disciplineIds.length) {
    throw httpError(400, 'Selecione ao menos uma disciplina.', 'VALIDATION_ERROR');
  }

  const coursePlaceholders = courseIds.map(() => '?').join(', ');
  const courses = await db.all(
    `SELECT id FROM cursos WHERE id IN (${coursePlaceholders}) AND ativo = 1`,
    ...courseIds
  );

  if (courses.length !== courseIds.length) {
    throw httpError(400, 'Um ou mais cursos nao existem.', 'INVALID_COURSE');
  }

  const linkedDisciplines = await db.all(
    `SELECT DISTINCT d.id, d.carga_horaria
     FROM curso_disciplinas cd
     INNER JOIN disciplinas d ON d.id = cd.disciplina_id
     WHERE cd.curso_id IN (${coursePlaceholders})`,
    ...courseIds
  );
  const allowedDisciplineIds = new Set(linkedDisciplines.map((discipline) => discipline.id));
  const selectedDisciplines = linkedDisciplines.filter((discipline) =>
    disciplineIds.includes(discipline.id)
  );

  if (
    selectedDisciplines.length !== disciplineIds.length ||
    disciplineIds.some((disciplineId) => !allowedDisciplineIds.has(disciplineId))
  ) {
    throw httpError(
      400,
      'Selecione apenas disciplinas vinculadas aos cursos escolhidos.',
      'INVALID_PROFESSOR_DISCIPLINE'
    );
  }

  const weeklyHours = selectedDisciplines.reduce(
    (total, discipline) => total + Number(discipline.carga_horaria || 0),
    0
  );

  if (weeklyHours > 40) {
    throw httpError(
      400,
      'A carga horaria semanal nao pode passar de 40 horas.',
      'WEEKLY_HOURS_LIMIT'
    );
  }
}

async function replaceProfessorLinks(db, professorId, courseIds, disciplineIds) {
  await db.run('DELETE FROM professor_cursos WHERE professor_id = ?', professorId);
  await db.run('DELETE FROM professor_disciplinas WHERE professor_id = ?', professorId);

  await Promise.all(
    courseIds.map((courseId) =>
      db.run(
        'INSERT INTO professor_cursos (professor_id, curso_id) VALUES (?, ?)',
        professorId,
        courseId
      )
    )
  );

  await Promise.all(
    disciplineIds.map((disciplineId) =>
      db.run(
        'INSERT INTO professor_disciplinas (professor_id, disciplina_id) VALUES (?, ?)',
        professorId,
        disciplineId
      )
    )
  );
}

async function saveProfessorLinks(db, professorId, rawCourseIds, rawDisciplineIds) {
  const courseIds = normalizeIds(rawCourseIds);
  const disciplineIds = normalizeIds(rawDisciplineIds);

  await validateProfessorLinks(db, courseIds, disciplineIds);
  await replaceProfessorLinks(db, professorId, courseIds, disciplineIds);
}

async function hydrateProfessorLinks(db, professor) {
  const [cursos, disciplinas] = await Promise.all([
    db.all(
      `SELECT c.id, c.nome
       FROM professor_cursos pc
       INNER JOIN cursos c ON c.id = pc.curso_id
       WHERE pc.professor_id = ?
       ORDER BY c.nome`,
      professor.id
    ),
    db.all(
      `SELECT d.id, d.nome, d.carga_horaria
       FROM professor_disciplinas pd
       INNER JOIN disciplinas d ON d.id = pd.disciplina_id
       WHERE pd.professor_id = ?
       ORDER BY d.nome`,
      professor.id
    ),
  ]);

  return {
    ...professor,
    cursos,
    disciplinas,
    curso_ids: cursos.map((course) => course.id),
    disciplina_ids: disciplinas.map((discipline) => discipline.id),
  };
}

module.exports = {
  hydrateProfessorLinks,
  normalizeIds,
  saveProfessorLinks,
  validateProfessorLinks,
};
