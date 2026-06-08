const jwt = require('jsonwebtoken');

const { getDb } = require('../database/connection');
const { httpError } = require('../utils/httpError');

function getTokenFromHeader(header) {
  if (!header) {
    return null;
  }

  const [type, token] = header.split(' ');
  return type === 'Bearer' && token ? token : null;
}

async function authMiddleware(req, _res, next) {
  try {
    const token = getTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw httpError(401, 'Token ausente.', 'TOKEN_MISSING');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const db = await getDb();
    const user = await db.get(
      'SELECT id, nome, email, role, ativo FROM usuarios WHERE id = ?',
      payload.userId
    );

    if (!user) {
      throw httpError(401, 'Usuario nao encontrado.', 'USER_NOT_FOUND');
    }

    if (!user.ativo) {
      throw httpError(403, 'Acesso bloqueado, procurar a administracao', 'ACCESS_BLOCKED');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.status ? error : httpError(401, 'Token invalido.', 'TOKEN_INVALID'));
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(httpError(403, 'Permissao negada.', 'FORBIDDEN'));
      return;
    }

    next();
  };
}

module.exports = { authMiddleware, requireRole };
