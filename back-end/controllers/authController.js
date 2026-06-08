const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getDb } = require('../database/connection');
const { findUserByEmail, findUserById, getProfileByUser } = require('../models/usersModel');
const { ensureCourseExists } = require('../utils/courses');
const { httpError } = require('../utils/httpError');
const { saveProfessorLinks } = require('../utils/professors');
const { createStudentProfile } = require('../utils/students');

const VALID_ROLES = ['aluno', 'professor', 'administrador'];

function sanitizeUser(user) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    ativo: Boolean(user.ativo),
  };
}

function signToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      nome: user.nome,
    },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '8h' }
  );
}

async function register(req, res, next) {
  const db = await getDb();

  try {
    const {
      nome,
      email,
      senha,
      role,
      curso,
      telefone,
      cep,
      endereco,
      cidade,
      estado,
      titulacao,
      curso_ids,
      disciplina_ids,
    } = req.body;

    if (!nome || !email || !senha || !role) {
      throw httpError(400, 'Nome, email, senha e role sao obrigatorios.', 'VALIDATION_ERROR');
    }

    if (!VALID_ROLES.includes(role)) {
      throw httpError(400, 'Role invalida.', 'INVALID_ROLE');
    }

    if (await findUserByEmail(email)) {
      throw httpError(409, 'Email ja cadastrado.', 'EMAIL_EXISTS');
    }

    if (role === 'aluno' && !curso) {
      throw httpError(400, 'Curso e obrigatorio para aluno.', 'VALIDATION_ERROR');
    }

    if (role === 'aluno') {
      await ensureCourseExists(db, curso);
    }

    if (role === 'professor' && !titulacao) {
      throw httpError(400, 'Titulação é obrigatória para professor.', 'VALIDATION_ERROR');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await db.run('BEGIN');
    const result = await db.run(
      'INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES (?, ?, ?, ?, 1)',
      nome,
      email,
      senhaHash,
      role
    );

    const usuarioId = result.lastID;

    if (role === 'aluno') {
      await createStudentProfile(db, {
        usuarioId,
        curso,
        telefone,
        cep,
        endereco,
        cidade,
        estado,
      });
    }

    if (role === 'professor') {
      const professor = await db.run(
        `INSERT INTO professores
          (usuario_id, titulacao, area, tempo_docencia)
         VALUES (?, ?, ?, ?)`,
        usuarioId,
        titulacao || '',
        '',
        ''
      );
      await saveProfessorLinks(db, professor.lastID, curso_ids, disciplina_ids);
    }

    if (role === 'administrador') {
      await db.run('INSERT INTO administradores (usuario_id) VALUES (?)', usuarioId);
    }

    await db.run('COMMIT');

    const user = await findUserById(usuarioId);
    res.status(201).json({
      mensagem: 'Usuario cadastrado com sucesso.',
      token: signToken(user),
      usuario: sanitizeUser(user),
    });
  } catch (error) {
    await db.run('ROLLBACK').catch(() => {});
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, credential, senha, password } = req.body;
    const loginEmail = email || credential;
    const loginPassword = senha || password;

    if (!loginEmail || !loginPassword) {
      throw httpError(400, 'Email e senha sao obrigatorios.', 'VALIDATION_ERROR');
    }

    const user = await findUserByEmail(loginEmail);

    if (!user) {
      throw httpError(401, 'Credenciais invalidas.', 'INVALID_CREDENTIALS');
    }

    if (!user.ativo) {
      throw httpError(403, 'Acesso bloqueado, procurar a administracao', 'ACCESS_BLOCKED');
    }

    const passwordMatches = await bcrypt.compare(loginPassword, user.senha_hash);

    if (!passwordMatches) {
      throw httpError(401, 'Credenciais invalidas.', 'INVALID_CREDENTIALS');
    }

    res.json({
      token: signToken(user),
      usuario: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const profile = await getProfileByUser(req.user);
    res.json({ usuario: profile });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me };
