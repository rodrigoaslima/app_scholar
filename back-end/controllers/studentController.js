const { getDb } = require('../database/connection');
const { httpError } = require('../utils/httpError');

async function getStudentByUserId(userId) {
  const db = await getDb();
  return db.get('SELECT * FROM alunos WHERE usuario_id = ?', userId);
}

async function listMySubjects(req, res, next) {
  try {
    const db = await getDb();
    const aluno = await getStudentByUserId(req.user.id);

    if (!aluno) {
      res.json({ disciplinas: [] });
      return;
    }

    const disciplinas = await db.all(
      `SELECT d.*, GROUP_CONCAT(u.nome, ', ') AS professor_nome
       FROM aluno_disciplinas ad
       INNER JOIN disciplinas d ON d.id = ad.disciplina_id
       LEFT JOIN professor_disciplinas pd ON pd.disciplina_id = d.id
       LEFT JOIN professores p ON p.id = pd.professor_id
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       WHERE ad.aluno_id = ?
       GROUP BY d.id
       ORDER BY d.nome`,
      aluno.id
    );

    res.json({ disciplinas });
  } catch (error) {
    next(error);
  }
}

async function listMyGrades(req, res, next) {
  try {
    const db = await getDb();
    const aluno = await getStudentByUserId(req.user.id);

    if (!aluno) {
      res.json({ aluno: req.user.nome, disciplinas: [] });
      return;
    }

    const disciplinas = await db.all(
      `SELECT d.nome AS disciplina, n.nota1, n.nota2, n.media, n.situacao
       FROM aluno_disciplinas ad
       INNER JOIN disciplinas d ON d.id = ad.disciplina_id
       LEFT JOIN notas n ON n.aluno_id = ad.aluno_id AND n.disciplina_id = ad.disciplina_id
       WHERE ad.aluno_id = ?
       ORDER BY d.nome`,
      aluno.id
    );

    res.json({ aluno: req.user.nome, disciplinas });
  } catch (error) {
    next(error);
  }
}

async function getReportByRegistration(req, res, next) {
  try {
    const db = await getDb();
    const { matricula } = req.params;

    const aluno = await db.get(
      `SELECT a.*, u.nome, u.id AS usuario_id
       FROM alunos a
       INNER JOIN usuarios u ON u.id = a.usuario_id
       WHERE a.matricula = ?`,
      matricula
    );

    if (!aluno) {
      throw httpError(404, 'Aluno nao encontrado.', 'STUDENT_NOT_FOUND');
    }

    if (req.user.role === 'aluno' && req.user.id !== aluno.usuario_id) {
      throw httpError(403, 'Aluno so pode consultar o proprio boletim.', 'FORBIDDEN');
    }

    const disciplinas = await db.all(
      `SELECT d.nome AS disciplina, n.nota1, n.nota2, n.media, n.situacao
       FROM aluno_disciplinas ad
       INNER JOIN disciplinas d ON d.id = ad.disciplina_id
       LEFT JOIN notas n ON n.aluno_id = ad.aluno_id AND n.disciplina_id = ad.disciplina_id
       WHERE ad.aluno_id = ?
       ORDER BY d.nome`,
      aluno.id
    );

    res.json({ aluno: aluno.nome, disciplinas });
  } catch (error) {
    next(error);
  }
}

module.exports = { getReportByRegistration, listMyGrades, listMySubjects };
