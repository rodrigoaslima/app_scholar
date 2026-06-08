require('dotenv').config();

const bcrypt = require('bcryptjs');

const { getDb, runSchema } = require('./connection');
const { calculateAverage, getSituation } = require('../utils/grades');

async function createUser(db, { nome, email, senha, role }) {
  const existing = await db.get('SELECT id FROM usuarios WHERE email = ?', email);

  if (existing) {
    return existing.id;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const result = await db.run(
    'INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES (?, ?, ?, ?, 1)',
    nome,
    email,
    senhaHash,
    role
  );
  return result.lastID;
}

async function seed() {
  await runSchema();
  const db = await getDb();

  const adminUserId = await createUser(db, {
    nome: 'Administrador App Scholar',
    email: 'admin@appscholar.com',
    senha: '123456',
    role: 'administrador',
  });
  await db.run('INSERT OR IGNORE INTO administradores (usuario_id) VALUES (?)', adminUserId);

  const professorUserId = await createUser(db, {
    nome: 'Andre Olimpio',
    email: 'professor@appscholar.com',
    senha: '123456',
    role: 'professor',
  });
  await db.run(
    `INSERT OR IGNORE INTO professores (usuario_id, titulacao, area, tempo_docencia)
     VALUES (?, ?, ?, ?)`,
    professorUserId,
    'Mestre',
    'Mobile',
    '8 anos'
  );
  const professor = await db.get('SELECT id FROM professores WHERE usuario_id = ?', professorUserId);

  const alunoUserId = await createUser(db, {
    nome: 'Maria Souza',
    email: 'aluno@appscholar.com',
    senha: '123456',
    role: 'aluno',
  });
  await db.run(
    `INSERT OR IGNORE INTO alunos
      (usuario_id, matricula, curso, telefone, cep, endereco, cidade, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    alunoUserId,
    '20260001',
    'Desenvolvimento de Software Multiplataforma',
    '(11) 99999-9999',
    '01001000',
    'Praca da Se',
    'Sao Paulo',
    'SP'
  );
  const aluno = await db.get('SELECT id FROM alunos WHERE usuario_id = ?', alunoUserId);
  await db.run('UPDATE alunos SET matricula = ? WHERE id = ?', String(aluno.id), aluno.id);

  await db.run(
    `INSERT OR IGNORE INTO disciplinas (id, nome, carga_horaria, curso, semestre, professor_id)
     VALUES (1, ?, ?, ?, ?, ?)`,
    'Programacao Mobile',
    80,
    'Desenvolvimento de Software Multiplataforma',
    '2026.1',
    professor.id
  );
  await db.run(
    'INSERT OR IGNORE INTO aluno_disciplinas (aluno_id, disciplina_id) VALUES (?, ?)',
    aluno.id,
    1
  );

  const media = calculateAverage(8, 7);
  await db.run(
    `INSERT OR IGNORE INTO notas (aluno_id, disciplina_id, nota1, nota2, media, situacao)
     VALUES (?, ?, ?, ?, ?, ?)`,
    aluno.id,
    1,
    8,
    7,
    media,
    getSituation(media)
  );

  console.log('Banco SQLite inicializado com usuarios de teste:');
  console.log('admin@appscholar.com / 123456');
  console.log('professor@appscholar.com / 123456');
  console.log('aluno@appscholar.com / 123456');
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
