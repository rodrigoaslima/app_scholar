const { getDb } = require('../database/connection');

async function findUserByEmail(email) {
  const db = await getDb();
  return db.get('SELECT * FROM usuarios WHERE lower(email) = lower(?)', email);
}

async function findUserById(id) {
  const db = await getDb();
  return db.get('SELECT id, nome, email, role, ativo FROM usuarios WHERE id = ?', id);
}

async function getProfileByUser(user) {
  const db = await getDb();

  if (user.role === 'aluno') {
    const profile = await db.get('SELECT * FROM alunos WHERE usuario_id = ?', user.id);
    return { ...user, aluno: profile || null };
  }

  if (user.role === 'professor') {
    const profile = await db.get('SELECT * FROM professores WHERE usuario_id = ?', user.id);
    return { ...user, professor: profile || null };
  }

  const profile = await db.get('SELECT * FROM administradores WHERE usuario_id = ?', user.id);
  return { ...user, administrador: profile || null };
}

module.exports = { findUserByEmail, findUserById, getProfileByUser };
