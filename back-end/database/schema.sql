PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('aluno', 'professor', 'administrador')),
  ativo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cursos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  ativo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO cursos (id, nome) VALUES
  (1, 'Desenvolvimento de Software Multiplataforma'),
  (2, 'Analise e Desenvolvimento de Sistemas'),
  (3, 'Ciencia da Computacao'),
  (4, 'Engenharia de Software'),
  (5, 'Sistemas de Informacao');

CREATE TABLE IF NOT EXISTS alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL UNIQUE,
  matricula TEXT NOT NULL UNIQUE,
  curso TEXT NOT NULL,
  telefone TEXT,
  cep TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS professores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL UNIQUE,
  titulacao TEXT,
  area TEXT,
  tempo_docencia TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS professor_cursos (
  professor_id INTEGER NOT NULL,
  curso_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (professor_id, curso_id),
  FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS professor_disciplinas (
  professor_id INTEGER NOT NULL,
  disciplina_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (professor_id, disciplina_id),
  FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE,
  FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS administradores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL UNIQUE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS disciplinas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  carga_horaria INTEGER NOT NULL,
  curso TEXT NOT NULL,
  semestre TEXT NOT NULL,
  professor_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS curso_disciplinas (
  curso_id INTEGER NOT NULL,
  disciplina_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (curso_id, disciplina_id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aluno_disciplinas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER NOT NULL,
  disciplina_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (aluno_id, disciplina_id),
  FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
  FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER NOT NULL,
  disciplina_id INTEGER NOT NULL,
  nota1 REAL NOT NULL,
  nota2 REAL NOT NULL,
  media REAL NOT NULL,
  situacao TEXT NOT NULL CHECK (situacao IN ('Aprovado', 'Recuperacao', 'Reprovado')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (aluno_id, disciplina_id),
  FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
  FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_alunos_matricula ON alunos(matricula);
CREATE INDEX IF NOT EXISTS idx_professor_cursos_professor ON professor_cursos(professor_id);
CREATE INDEX IF NOT EXISTS idx_professor_cursos_curso ON professor_cursos(curso_id);
CREATE INDEX IF NOT EXISTS idx_professor_disciplinas_professor ON professor_disciplinas(professor_id);
CREATE INDEX IF NOT EXISTS idx_professor_disciplinas_disciplina ON professor_disciplinas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_disciplinas_professor ON disciplinas(professor_id);
CREATE INDEX IF NOT EXISTS idx_curso_disciplinas_curso ON curso_disciplinas(curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_disciplinas_disciplina ON curso_disciplinas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_aluno_disciplinas_aluno ON aluno_disciplinas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_aluno_disciplinas_disciplina ON aluno_disciplinas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_notas_aluno ON notas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_notas_disciplina ON notas(disciplina_id);

INSERT OR IGNORE INTO professor_disciplinas (professor_id, disciplina_id)
SELECT professor_id, id
FROM disciplinas
WHERE professor_id IS NOT NULL;

INSERT OR IGNORE INTO professor_cursos (professor_id, curso_id)
SELECT DISTINCT pd.professor_id, cd.curso_id
FROM professor_disciplinas pd
INNER JOIN curso_disciplinas cd ON cd.disciplina_id = pd.disciplina_id;
