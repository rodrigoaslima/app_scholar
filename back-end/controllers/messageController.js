const { getDb } = require('../database/connection');
const { httpError } = require('../utils/httpError');

const MESSAGE_MAX_LENGTH = 255;

function getAuthorChip(user) {
  if (user.role === 'administrador') {
    return 'Secretaria';
  }

  const names = String(user.nome || '').trim().split(/\s+/).filter(Boolean);

  if (/^prof\.?$/i.test(names[0]) || /^professor(a)?$/i.test(names[0])) {
    names.shift();
  }

  const displayName = names.length > 1 ? `${names[0]} ${names[names.length - 1]}` : names[0] || 'Professor';

  return `Professor ${displayName}`;
}

function toNotice(message) {
  return {
    id: message.id,
    texto: message.texto,
    usuario_id: message.usuario_id,
    created_at: message.created_at,
    chip: getAuthorChip(message),
  };
}

async function createMessage(req, res, next) {
  try {
    const db = await getDb();
    const texto = String(req.body.texto || '').trim();

    if (!texto) {
      throw httpError(400, 'Mensagem e obrigatoria.', 'VALIDATION_ERROR');
    }

    if (texto.length > MESSAGE_MAX_LENGTH) {
      throw httpError(400, 'Mensagem deve ter no maximo 255 caracteres.', 'VALIDATION_ERROR');
    }

    const result = await db.run(
      'INSERT INTO msg (texto, usuario_id) VALUES (?, ?)',
      texto,
      req.user.id
    );

    res.status(201).json({
      mensagem: 'Aviso salvo com sucesso.',
      msg: {
        id: result.lastID,
        texto,
        usuario_id: req.user.id,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function countMyMessages(req, res, next) {
  try {
    const db = await getDb();
    const result = await db.get(
      'SELECT COUNT(*) AS total FROM msg WHERE usuario_id = ?',
      req.user.id
    );

    res.json({ total: result.total });
  } catch (error) {
    next(error);
  }
}

async function listMyMessages(req, res, next) {
  try {
    const db = await getDb();
    const msgs = await db.all(
      `SELECT m.id, m.texto, m.usuario_id, m.created_at, u.nome, u.role
       FROM msg m
       INNER JOIN usuarios u ON u.id = m.usuario_id
       WHERE m.usuario_id = ?
       ORDER BY m.created_at DESC, m.id DESC`,
      req.user.id
    );

    res.json({ msgs: msgs.map(toNotice) });
  } catch (error) {
    next(error);
  }
}

async function listAdminMessages(_req, res, next) {
  try {
    const db = await getDb();
    const avisos = await db.all(
      `SELECT m.id, m.texto, m.usuario_id, m.created_at, u.nome, u.role
       FROM msg m
       INNER JOIN usuarios u ON u.id = m.usuario_id
       WHERE u.role = 'administrador'
       ORDER BY m.created_at DESC, m.id DESC`
    );

    res.json({ avisos: avisos.map(toNotice) });
  } catch (error) {
    next(error);
  }
}

async function listStudentMessages(req, res, next) {
  try {
    const db = await getDb();
    const avisos = await db.all(
      `SELECT m.id, m.texto, m.usuario_id, m.created_at, u.nome, u.role
       FROM msg m
       INNER JOIN usuarios u ON u.id = m.usuario_id
       WHERE u.role = 'administrador'
          OR EXISTS (
            SELECT 1
            FROM alunos a
            INNER JOIN cursos c ON c.nome = a.curso AND c.ativo = 1
            INNER JOIN curso_disciplinas cd ON cd.curso_id = c.id
            INNER JOIN professor_disciplinas pd ON pd.disciplina_id = cd.disciplina_id
            INNER JOIN professores p ON p.id = pd.professor_id
            WHERE a.usuario_id = ?
              AND p.usuario_id = m.usuario_id
          )
       ORDER BY m.created_at DESC, m.id DESC`,
      req.user.id
    );

    res.json({ avisos: avisos.map(toNotice) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  countMyMessages,
  createMessage,
  listAdminMessages,
  listMyMessages,
  listStudentMessages,
};
