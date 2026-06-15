const bcrypt = require('bcryptjs');

const { getDb } = require('../database/connection');
const { ensureCourseExists } = require('../utils/courses');
const { httpError } = require('../utils/httpError');
const { hydrateProfessorLinks, saveProfessorLinks } = require('../utils/professors');
const {
  createStudentProfile,
  getCourseDisciplineIds,
  hydrateStudentLinks,
  normalizeDisciplineIds,
  saveStudentDisciplineLinks,
  validateStudentDisciplineIds,
} = require('../utils/students');

function toBoolean(value) {
  return Boolean(Number(value));
}

async function listUsers(_req, res, next) {
  try {
    const db = await getDb();
    const users = await db.all(`
      SELECT
        u.id, u.nome, u.email, u.role, u.ativo,
        a.id AS aluno_id, a.matricula, a.curso AS aluno_curso,
        p.id AS professor_id, p.titulacao, p.area, p.tempo_docencia
      FROM usuarios u
      LEFT JOIN alunos a ON a.usuario_id = u.id
      LEFT JOIN professores p ON p.usuario_id = u.id
      ORDER BY u.nome
    `);

    res.json({
      usuarios: users.map((user) => ({ ...user, ativo: toBoolean(user.ativo) })),
    });
  } catch (error) {
    next(error);
  }
}

async function setUserActive(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { ativo } = req.body;

    const user = await db.get('SELECT id, role FROM usuarios WHERE id = ?', id);

    if (!user) {
      throw httpError(404, 'Usuario nao encontrado.', 'USER_NOT_FOUND');
    }

    if (user.role === 'administrador') {
      throw httpError(400, 'Nao bloqueie administradores por esta rotina.', 'ADMIN_BLOCK_DENIED');
    }

    await db.run(
      'UPDATE usuarios SET ativo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ativo ? 1 : 0,
      id
    );

    res.json({ mensagem: ativo ? 'Acesso desbloqueado.' : 'Acesso bloqueado.' });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const user = await db.get('SELECT id, role FROM usuarios WHERE id = ?', id);

    if (!user) {
      throw httpError(404, 'Usuario nao encontrado.', 'USER_NOT_FOUND');
    }

    if (user.role === 'administrador') {
      throw httpError(400, 'Nao remova administradores por esta rotina.', 'ADMIN_DELETE_DENIED');
    }

    await db.run('DELETE FROM usuarios WHERE id = ?', id);
    res.json({ mensagem: 'Usuario removido com sucesso.' });
  } catch (error) {
    next(error);
  }
}

async function createStudent(req, res, next) {
  const db = await getDb();

  try {
    const { nome, email, senha, curso, telefone, cep, endereco, cidade, estado, disciplina_ids } = req.body;
    const requestedDisciplineIds = normalizeDisciplineIds(disciplina_ids);

    if (!nome || !email || !senha || !curso) {
      throw httpError(400, 'Nome, email, senha e curso sao obrigatorios.', 'VALIDATION_ERROR');
    }

    await ensureCourseExists(db, curso);
    const disciplineIds = requestedDisciplineIds.length
      ? requestedDisciplineIds
      : await getCourseDisciplineIds(db, curso);
    await validateStudentDisciplineIds(db, curso, disciplineIds);

    const senhaHash = await bcrypt.hash(senha, 10);
    await db.run('BEGIN');
    const result = await db.run(
      'INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES (?, ?, ?, ?, 1)',
      nome,
      email,
      senhaHash,
      'aluno'
    );
    const alunoId = await createStudentProfile(db, {
      usuarioId: result.lastID,
      curso,
      telefone,
      cep,
      endereco,
      cidade,
      estado,
    });
    await saveStudentDisciplineLinks(db, alunoId, disciplineIds);
    await db.run('COMMIT');

    res.status(201).json({ mensagem: 'Aluno cadastrado com sucesso.' });
  } catch (error) {
    await db.run('ROLLBACK').catch(() => {});
    next(error);
  }
}

async function listStudents(_req, res, next) {
  try {
    const db = await getDb();
    const alunos = await db.all(`
      SELECT a.*, u.nome, u.email, u.ativo
      FROM alunos a
      INNER JOIN usuarios u ON u.id = a.usuario_id
      ORDER BY u.nome
    `);

    const hydratedStudents = await Promise.all(
      alunos.map((aluno) => hydrateStudentLinks(db, aluno))
    );

    res.json({ alunos: hydratedStudents.map((aluno) => ({ ...aluno, ativo: toBoolean(aluno.ativo) })) });
  } catch (error) {
    next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { nome, email, matricula, curso, telefone, cep, endereco, cidade, estado, disciplina_ids } = req.body;
    const requestedDisciplineIds = normalizeDisciplineIds(disciplina_ids);
    const aluno = await db.get('SELECT * FROM alunos WHERE id = ?', id);

    if (!aluno) {
      throw httpError(404, 'Aluno nao encontrado.', 'STUDENT_NOT_FOUND');
    }

    const nextCourse = curso || aluno.curso;
    await ensureCourseExists(db, nextCourse);
    const disciplineIds = requestedDisciplineIds.length
      ? requestedDisciplineIds
      : await getCourseDisciplineIds(db, nextCourse);
    await validateStudentDisciplineIds(db, nextCourse, disciplineIds);

    await db.run('BEGIN');
    await db.run(
      'UPDATE usuarios SET nome = COALESCE(?, nome), email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      nome || null,
      email || null,
      aluno.usuario_id
    );
    await db.run(
      `UPDATE alunos
       SET matricula = COALESCE(?, matricula),
           curso = COALESCE(?, curso),
           telefone = COALESCE(?, telefone),
           cep = COALESCE(?, cep),
           endereco = COALESCE(?, endereco),
           cidade = COALESCE(?, cidade),
           estado = COALESCE(?, estado)
       WHERE id = ?`,
      matricula || null,
      curso || null,
      telefone || null,
      cep || null,
      endereco || null,
      cidade || null,
      estado || null,
      id
    );
    await saveStudentDisciplineLinks(db, id, disciplineIds);
    await db.run('COMMIT');

    res.json({ mensagem: 'Aluno atualizado com sucesso.' });
  } catch (error) {
    const db = await getDb();
    await db.run('ROLLBACK').catch(() => {});
    next(error);
  }
}

async function deleteStudent(req, res, next) {
  try {
    const db = await getDb();
    const aluno = await db.get('SELECT usuario_id FROM alunos WHERE id = ?', req.params.id);

    if (!aluno) {
      throw httpError(404, 'Aluno nao encontrado.', 'STUDENT_NOT_FOUND');
    }

    await db.run('DELETE FROM usuarios WHERE id = ?', aluno.usuario_id);
    res.json({ mensagem: 'Aluno removido com sucesso.' });
  } catch (error) {
    next(error);
  }
}

async function createProfessor(req, res, next) {
  const db = await getDb();

  try {
    const { nome, email, senha, titulacao, curso_ids, disciplina_ids } = req.body;

    if (!nome || !email || !titulacao) {
      throw httpError(400, 'Nome, email e titulação são obrigatórios.', 'VALIDATION_ERROR');
    }

    const senhaHash = await bcrypt.hash(senha || '123456', 10);
    await db.run('BEGIN');
    const result = await db.run(
      'INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES (?, ?, ?, ?, 1)',
      nome,
      email,
      senhaHash,
      'professor'
    );
    const professor = await db.run(
      'INSERT INTO professores (usuario_id, titulacao, area, tempo_docencia) VALUES (?, ?, ?, ?)',
      result.lastID,
      titulacao || '',
      '',
      ''
    );
    await saveProfessorLinks(db, professor.lastID, curso_ids, disciplina_ids);
    await db.run('COMMIT');

    res.status(201).json({ mensagem: 'Professor cadastrado com sucesso.' });
  } catch (error) {
    await db.run('ROLLBACK').catch(() => {});
    next(error);
  }
}

async function listProfessors(_req, res, next) {
  try {
    const db = await getDb();
    const professores = await db.all(`
      SELECT p.*, u.nome, u.email, u.ativo
      FROM professores p
      INNER JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY u.nome
    `);
    const hydratedProfessors = await Promise.all(
      professores.map((professor) => hydrateProfessorLinks(db, professor))
    );

    res.json({
      professores: hydratedProfessors.map((professor) => ({
        ...professor,
        ativo: toBoolean(professor.ativo),
      })),
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfessor(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { nome, email, titulacao, curso_ids, disciplina_ids } = req.body;
    const professor = await db.get('SELECT * FROM professores WHERE id = ?', id);

    if (!professor) {
      throw httpError(404, 'Professor nao encontrado.', 'PROFESSOR_NOT_FOUND');
    }

    if (!nome || !email || !titulacao) {
      throw httpError(400, 'Nome, email e titulação são obrigatórios.', 'VALIDATION_ERROR');
    }

    await db.run('BEGIN');
    await db.run(
      'UPDATE usuarios SET nome = COALESCE(?, nome), email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      nome || null,
      email || null,
      professor.usuario_id
    );
    await db.run(
      `UPDATE professores
       SET titulacao = COALESCE(?, titulacao),
           area = COALESCE(?, area)
       WHERE id = ?`,
      titulacao || null,
      '',
      id
    );
    await saveProfessorLinks(db, id, curso_ids, disciplina_ids);
    await db.run('COMMIT');

    res.json({ mensagem: 'Professor atualizado com sucesso.' });
  } catch (error) {
    const db = await getDb();
    await db.run('ROLLBACK').catch(() => {});
    next(error);
  }
}

async function deleteProfessor(req, res, next) {
  try {
    const db = await getDb();
    const professor = await db.get('SELECT usuario_id FROM professores WHERE id = ?', req.params.id);

    if (!professor) {
      throw httpError(404, 'Professor nao encontrado.', 'PROFESSOR_NOT_FOUND');
    }

    await db.run('DELETE FROM usuarios WHERE id = ?', professor.usuario_id);
    res.json({ mensagem: 'Professor removido com sucesso.' });
  } catch (error) {
    next(error);
  }
}

async function createDiscipline(req, res, next) {
  try {
    const db = await getDb();
    const { nome, carga_horaria } = req.body;

    if (!nome || !carga_horaria) {
      throw httpError(400, 'Nome da disciplina e horas semanais sao obrigatorios.', 'VALIDATION_ERROR');
    }

    await db.run(
      `INSERT INTO disciplinas (nome, carga_horaria, curso, semestre, professor_id)
       VALUES (?, ?, ?, ?, ?)`,
      nome,
      Number(carga_horaria),
      'Nao vinculado',
      'Atual',
      null
    );

    res.status(201).json({ mensagem: 'Disciplina cadastrada com sucesso.' });
  } catch (error) {
    next(error);
  }
}

async function listDisciplines(_req, res, next) {
  try {
    const db = await getDb();
    const disciplinas = await db.all(`
      SELECT
        d.*,
        GROUP_CONCAT(u.nome, ', ') AS professor_nome
      FROM disciplinas d
      LEFT JOIN professor_disciplinas pd ON pd.disciplina_id = d.id
      LEFT JOIN professores p ON p.id = pd.professor_id
      LEFT JOIN usuarios u ON u.id = p.usuario_id
      GROUP BY d.id
      ORDER BY d.nome
    `);

    res.json({ disciplinas });
  } catch (error) {
    next(error);
  }
}

async function updateDiscipline(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { nome, carga_horaria } = req.body;

    const discipline = await db.get('SELECT id FROM disciplinas WHERE id = ?', id);

    if (!discipline) {
      throw httpError(404, 'Disciplina nao encontrada.', 'DISCIPLINE_NOT_FOUND');
    }

    if (!nome || !carga_horaria) {
      throw httpError(400, 'Nome da disciplina e horas semanais sao obrigatorios.', 'VALIDATION_ERROR');
    }

    await db.run(
      `UPDATE disciplinas
       SET nome = ?,
           carga_horaria = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      nome,
      Number(carga_horaria),
      id
    );

    res.json({ mensagem: 'Disciplina atualizada com sucesso.' });
  } catch (error) {
    next(error);
  }
}

async function deleteDiscipline(req, res, next) {
  try {
    const db = await getDb();
    await db.run('DELETE FROM disciplinas WHERE id = ?', req.params.id);
    res.json({ mensagem: 'Disciplina removida com sucesso.' });
  } catch (error) {
    next(error);
  }
}

async function assignProfessor(req, res, next) {
  try {
    const db = await getDb();
    const { disciplinaId } = req.params;
    const { professor_id } = req.body;

    const professor = await db.get('SELECT id FROM professores WHERE id = ?', professor_id);
    const discipline = await db.get('SELECT id FROM disciplinas WHERE id = ?', disciplinaId);

    if (!professor || !discipline) {
      throw httpError(404, 'Professor nao encontrado.', 'PROFESSOR_NOT_FOUND');
    }

    await db.run(
      'INSERT OR IGNORE INTO professor_disciplinas (professor_id, disciplina_id) VALUES (?, ?)',
      professor_id,
      disciplinaId
    );

    res.json({ mensagem: 'Professor vinculado com sucesso.' });
  } catch (error) {
    next(error);
  }
}

async function assignStudent(req, res, next) {
  try {
    const db = await getDb();
    const { disciplinaId } = req.params;
    const { aluno_id } = req.body;

    const aluno = await db.get('SELECT id FROM alunos WHERE id = ?', aluno_id);
    const discipline = await db.get('SELECT id FROM disciplinas WHERE id = ?', disciplinaId);

    if (!aluno || !discipline) {
      throw httpError(404, 'Aluno ou disciplina nao encontrado.', 'LINK_NOT_FOUND');
    }

    await db.run(
      'INSERT OR IGNORE INTO aluno_disciplinas (aluno_id, disciplina_id) VALUES (?, ?)',
      aluno_id,
      disciplinaId
    );

    res.json({ mensagem: 'Aluno vinculado com sucesso.' });
  } catch (error) {
    next(error);
  }
}

async function removeStudentFromDiscipline(req, res, next) {
  try {
    const db = await getDb();
    const { disciplinaId, alunoId } = req.params;

    await db.run(
      'DELETE FROM aluno_disciplinas WHERE aluno_id = ? AND disciplina_id = ?',
      alunoId,
      disciplinaId
    );

    res.json({ mensagem: 'Vinculo removido com sucesso.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  assignProfessor,
  assignStudent,
  createDiscipline,
  createProfessor,
  createStudent,
  deleteDiscipline,
  deleteProfessor,
  deleteStudent,
  deleteUser,
  listDisciplines,
  listProfessors,
  listStudents,
  listUsers,
  removeStudentFromDiscipline,
  setUserActive,
  updateDiscipline,
  updateProfessor,
  updateStudent,
};
