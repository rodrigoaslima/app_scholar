const { getDb } = require('../database/connection');
const { httpError } = require('../utils/httpError');

async function validateDisciplineIds(db, disciplineIds) {
  if (!disciplineIds.length) {
    throw httpError(400, 'Selecione ao menos uma disciplina.', 'VALIDATION_ERROR');
  }

  const placeholders = disciplineIds.map(() => '?').join(', ');
  const existingDisciplines = await db.all(
    `SELECT id FROM disciplinas WHERE id IN (${placeholders})`,
    ...disciplineIds
  );

  if (existingDisciplines.length !== disciplineIds.length) {
    throw httpError(400, 'Uma ou mais disciplinas nao existem.', 'INVALID_DISCIPLINE');
  }
}

function normalizeDisciplineIds(disciplineIds) {
  return Array.isArray(disciplineIds)
    ? [...new Set(disciplineIds.map(Number).filter(Boolean))]
    : [];
}

async function listCourses(_req, res, next) {
  try {
    const db = await getDb();
    const rows = await db.all(`
      SELECT
        c.id,
        c.nome,
        d.id AS disciplina_id,
        d.nome AS disciplina_nome,
        d.carga_horaria AS disciplina_carga_horaria
      FROM cursos c
      LEFT JOIN curso_disciplinas cd ON cd.curso_id = c.id
      LEFT JOIN disciplinas d ON d.id = cd.disciplina_id
      WHERE c.ativo = 1
      ORDER BY c.nome, d.nome
    `);

    const coursesById = new Map();

    rows.forEach((row) => {
      if (!coursesById.has(row.id)) {
        coursesById.set(row.id, {
          id: row.id,
          nome: row.nome,
          disciplinas: [],
        });
      }

      if (row.disciplina_id) {
        coursesById.get(row.id).disciplinas.push({
          id: row.disciplina_id,
          nome: row.disciplina_nome,
          carga_horaria: row.disciplina_carga_horaria,
        });
      }
    });

    res.json({ cursos: Array.from(coursesById.values()) });
  } catch (error) {
    next(error);
  }
}

async function createCourse(req, res, next) {
  const db = await getDb();

  try {
    const { nome, disciplina_ids } = req.body;
    const disciplineIds = normalizeDisciplineIds(disciplina_ids);

    if (!nome || !nome.trim()) {
      throw httpError(400, 'Nome do curso e obrigatorio.', 'VALIDATION_ERROR');
    }

    await validateDisciplineIds(db, disciplineIds);

    await db.run('BEGIN');
    const result = await db.run(
      'INSERT INTO cursos (nome, ativo) VALUES (?, 1)',
      nome.trim()
    );

    await Promise.all(
      disciplineIds.map((disciplineId) =>
        db.run(
          'INSERT INTO curso_disciplinas (curso_id, disciplina_id) VALUES (?, ?)',
          result.lastID,
          disciplineId
        )
      )
    );

    await db.run('COMMIT');

    res.status(201).json({ mensagem: 'Curso cadastrado com sucesso.' });
  } catch (error) {
    await db.run('ROLLBACK').catch(() => {});

    if (error && error.code === 'SQLITE_CONSTRAINT') {
      next(httpError(409, 'Curso ja cadastrado.', 'COURSE_EXISTS'));
      return;
    }

    next(error);
  }
}

async function updateCourse(req, res, next) {
  const db = await getDb();

  try {
    const { id } = req.params;
    const { nome, disciplina_ids } = req.body;
    const disciplineIds = normalizeDisciplineIds(disciplina_ids);

    const course = await db.get('SELECT id FROM cursos WHERE id = ? AND ativo = 1', id);

    if (!course) {
      throw httpError(404, 'Curso nao encontrado.', 'COURSE_NOT_FOUND');
    }

    if (!nome || !nome.trim()) {
      throw httpError(400, 'Nome do curso e obrigatorio.', 'VALIDATION_ERROR');
    }

    await validateDisciplineIds(db, disciplineIds);

    await db.run('BEGIN');
    await db.run('UPDATE cursos SET nome = ? WHERE id = ?', nome.trim(), id);
    await db.run('DELETE FROM curso_disciplinas WHERE curso_id = ?', id);

    await Promise.all(
      disciplineIds.map((disciplineId) =>
        db.run(
          'INSERT INTO curso_disciplinas (curso_id, disciplina_id) VALUES (?, ?)',
          id,
          disciplineId
        )
      )
    );

    await db.run('COMMIT');

    res.json({ mensagem: 'Curso atualizado com sucesso.' });
  } catch (error) {
    await db.run('ROLLBACK').catch(() => {});

    if (error && error.code === 'SQLITE_CONSTRAINT') {
      next(httpError(409, 'Curso ja cadastrado.', 'COURSE_EXISTS'));
      return;
    }

    next(error);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const course = await db.get('SELECT id FROM cursos WHERE id = ? AND ativo = 1', id);

    if (!course) {
      throw httpError(404, 'Curso nao encontrado.', 'COURSE_NOT_FOUND');
    }

    await db.run('DELETE FROM cursos WHERE id = ?', id);
    res.json({ mensagem: 'Curso removido com sucesso.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { createCourse, deleteCourse, listCourses, updateCourse };
