const { getDb } = require('../database/connection');
const { calculateAverage, getSituation } = require('../utils/grades');
const { httpError } = require('../utils/httpError');

async function getProfessorProfile(userId) {
  const db = await getDb();
  return db.get('SELECT * FROM professores WHERE usuario_id = ?', userId);
}

async function ensureProfessorOwnsDiscipline(userId, disciplinaId) {
  const db = await getDb();
  const professor = await getProfessorProfile(userId);

  if (!professor) {
    throw httpError(404, 'Professor nao encontrado.', 'PROFESSOR_NOT_FOUND');
  }

  const discipline = await db.get(
    `SELECT d.id
     FROM professor_disciplinas pd
     INNER JOIN disciplinas d ON d.id = pd.disciplina_id
     WHERE d.id = ? AND pd.professor_id = ?`,
    disciplinaId,
    professor.id
  );

  if (!discipline) {
    throw httpError(403, 'Disciplina nao vinculada ao professor.', 'DISCIPLINE_FORBIDDEN');
  }

  return professor;
}

async function listMyDisciplines(req, res, next) {
  try {
    const db = await getDb();
    const professor = await getProfessorProfile(req.user.id);

    if (!professor) {
      res.json({ disciplinas: [] });
      return;
    }

    const disciplinas = await db.all(
      `SELECT d.*
       FROM professor_disciplinas pd
       INNER JOIN disciplinas d ON d.id = pd.disciplina_id
       WHERE pd.professor_id = ?
       ORDER BY d.nome`,
      professor.id
    );

    res.json({ disciplinas });
  } catch (error) {
    next(error);
  }
}

async function listMyCourses(req, res, next) {
  try {
    const db = await getDb();
    const professor = await getProfessorProfile(req.user.id);

    if (!professor) {
      res.json({ cursos: [] });
      return;
    }

    const cursos = await db.all(
      `SELECT c.id, c.nome
       FROM professor_cursos pc
       INNER JOIN cursos c ON c.id = pc.curso_id
       WHERE pc.professor_id = ?
       ORDER BY c.nome`,
      professor.id
    );

    res.json({ cursos });
  } catch (error) {
    next(error);
  }
}

async function listDisciplineStudents(req, res, next) {
  try {
    const db = await getDb();
    const { disciplinaId } = req.params;
    await ensureProfessorOwnsDiscipline(req.user.id, disciplinaId);

    const alunos = await db.all(
      `SELECT a.id, a.matricula, a.curso, u.nome, u.email, n.nota1, n.nota2, n.media, n.situacao
       FROM aluno_disciplinas ad
       INNER JOIN alunos a ON a.id = ad.aluno_id
       INNER JOIN usuarios u ON u.id = a.usuario_id
       LEFT JOIN notas n ON n.aluno_id = a.id AND n.disciplina_id = ad.disciplina_id
       WHERE ad.disciplina_id = ?
       ORDER BY u.nome`,
      disciplinaId
    );

    res.json({ alunos });
  } catch (error) {
    next(error);
  }
}

async function upsertGrade(req, res, next) {
  try {
    const db = await getDb();
    const { aluno_id, disciplina_id, nota1, nota2 } = req.body;

    if (!aluno_id || !disciplina_id || nota1 === undefined || nota2 === undefined) {
      throw httpError(400, 'Aluno, disciplina, nota1 e nota2 sao obrigatorios.', 'VALIDATION_ERROR');
    }

    await ensureProfessorOwnsDiscipline(req.user.id, disciplina_id);

    const link = await db.get(
      'SELECT id FROM aluno_disciplinas WHERE aluno_id = ? AND disciplina_id = ?',
      aluno_id,
      disciplina_id
    );

    if (!link) {
      throw httpError(400, 'Aluno nao esta vinculado a disciplina.', 'STUDENT_NOT_LINKED');
    }

    const media = calculateAverage(nota1, nota2);
    const situacao = getSituation(media);

    await db.run(
      `INSERT INTO notas (aluno_id, disciplina_id, nota1, nota2, media, situacao)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(aluno_id, disciplina_id)
       DO UPDATE SET
         nota1 = excluded.nota1,
         nota2 = excluded.nota2,
         media = excluded.media,
         situacao = excluded.situacao,
         updated_at = CURRENT_TIMESTAMP`,
      aluno_id,
      disciplina_id,
      Number(nota1),
      Number(nota2),
      media,
      situacao
    );

    res.json({ mensagem: 'Notas salvas com sucesso.', nota: { nota1, nota2, media, situacao } });
  } catch (error) {
    next(error);
  }
}

module.exports = { listDisciplineStudents, listMyCourses, listMyDisciplines, upsertGrade };
