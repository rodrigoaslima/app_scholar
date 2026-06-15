const { httpError } = require('./httpError');

async function createStudentProfile(db, { usuarioId, curso, telefone, cep, endereco, cidade, estado }) {
  const result = await db.run(
    `INSERT INTO alunos
      (usuario_id, matricula, curso, telefone, cep, endereco, cidade, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    usuarioId,
    `pendente-${usuarioId}`,
    curso,
    telefone || '',
    cep || '',
    endereco || '',
    cidade || '',
    estado || ''
  );

  await db.run('UPDATE alunos SET matricula = ? WHERE id = ?', String(result.lastID), result.lastID);

  return result.lastID;
}

function normalizeDisciplineIds(disciplineIds) {
  return Array.isArray(disciplineIds)
    ? [...new Set(disciplineIds.map(Number).filter(Boolean))]
    : [];
}

async function getCourseDisciplineIds(db, courseName) {
  const disciplines = await db.all(
    `SELECT d.id
     FROM disciplinas d
     INNER JOIN curso_disciplinas cd ON cd.disciplina_id = d.id
     INNER JOIN cursos c ON c.id = cd.curso_id
     WHERE c.nome = ? AND c.ativo = 1
     ORDER BY d.nome`,
    courseName
  );

  return disciplines.map((discipline) => discipline.id);
}

async function validateStudentDisciplineIds(db, courseName, disciplineIds) {
  if (!disciplineIds.length) {
    throw httpError(400, 'Selecione ao menos uma disciplina para o aluno.', 'VALIDATION_ERROR');
  }

  const placeholders = disciplineIds.map(() => '?').join(', ');
  const disciplines = await db.all(
    `SELECT d.id
     FROM disciplinas d
     INNER JOIN curso_disciplinas cd ON cd.disciplina_id = d.id
     INNER JOIN cursos c ON c.id = cd.curso_id
     WHERE c.nome = ? AND c.ativo = 1 AND d.id IN (${placeholders})`,
    courseName,
    ...disciplineIds
  );

  if (disciplines.length !== disciplineIds.length) {
    throw httpError(400, 'Uma ou mais disciplinas nao pertencem ao curso selecionado.', 'INVALID_DISCIPLINE');
  }
}

async function saveStudentDisciplineLinks(db, alunoId, disciplineIds) {
  await db.run('DELETE FROM aluno_disciplinas WHERE aluno_id = ?', alunoId);

  await Promise.all(
    disciplineIds.map((disciplineId) =>
      db.run(
        'INSERT INTO aluno_disciplinas (aluno_id, disciplina_id) VALUES (?, ?)',
        alunoId,
        disciplineId
      )
    )
  );
}

async function hydrateStudentLinks(db, student) {
  const disciplinas = await db.all(
    `SELECT d.id, d.nome, d.carga_horaria
     FROM aluno_disciplinas ad
     INNER JOIN disciplinas d ON d.id = ad.disciplina_id
     WHERE ad.aluno_id = ?
     ORDER BY d.nome`,
    student.id
  );

  return {
    ...student,
    disciplinas,
    disciplina_ids: disciplinas.map((discipline) => discipline.id),
  };
}

module.exports = {
  createStudentProfile,
  getCourseDisciplineIds,
  hydrateStudentLinks,
  normalizeDisciplineIds,
  saveStudentDisciplineLinks,
  validateStudentDisciplineIds,
};
