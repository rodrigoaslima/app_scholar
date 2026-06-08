# App Scholar Backend

API REST em Node.js + Express para a Parte 2 do App Scholar.

## Stack

- Node.js
- Express
- SQLite
- JWT com Bearer token

## Setup

```bash
cd back-end
npm install
cp .env.example .env
npm run init-db
npm start
```

A API roda por padrao em:

```text
http://localhost:3333/api
```

## Deploy no Render Free

O deploy esta configurado no arquivo `../render.yaml`.

Configuracao usada:

```text
rootDir: back-end
buildCommand: npm install
startCommand: npm start
healthCheckPath: /api/health
```

O script `npm start` executa `npm run init-db` antes de iniciar o servidor. Isso garante que, no Render Free, o SQLite seja recriado com dados de teste quando o filesystem temporario for apagado.

Observacao: sem persistent disk, o arquivo `data/app_scholar.sqlite` nao e um banco permanente em producao. Ele serve bem para demonstracao.

## Usuarios de teste

Criados por `npm run init-db`:

```text
admin@appscholar.com / 123456
professor@appscholar.com / 123456
aluno@appscholar.com / 123456
```

## Rotas publicas

- `GET /api/health`
- `GET /api/cep/:cep`
- `GET /api/cursos`
- `POST /api/auth/register`
- `POST /api/login`

## Rotas com token

Enviar:

```text
Authorization: Bearer <token>
```

### Administrador

- `GET /api/usuarios`
- `PATCH /api/usuarios/:id/acesso`
- `DELETE /api/usuarios/:id`
- `GET /api/alunos`
- `POST /api/alunos`
- `PUT /api/alunos/:id`
- `DELETE /api/alunos/:id`
- `GET /api/professores`
- `POST /api/professores`
- `PUT /api/professores/:id`
- `DELETE /api/professores/:id`
- `POST /api/cursos`
- `PUT /api/cursos/:id`
- `DELETE /api/cursos/:id`
- `GET /api/disciplinas`
- `POST /api/disciplinas`
- `PUT /api/disciplinas/:id`
- `DELETE /api/disciplinas/:id`
- `PUT /api/disciplinas/:disciplinaId/professor`
- `POST /api/disciplinas/:disciplinaId/alunos`

### Professor

- `GET /api/professor/cursos`
- `GET /api/professor/disciplinas`
- `GET /api/professor/disciplinas/:disciplinaId/alunos`
- `POST /api/professor/notas`
- `PUT /api/professor/notas`

### Aluno

- `GET /api/aluno/materias`
- `GET /api/aluno/notas`
- `GET /api/boletim/:matricula`

## Modelagem

O banco usa uma tabela central `usuarios` para autenticar e controlar `role`, com tabelas de perfil para `alunos`, `professores` e `administradores`.

Os principais vinculos academicos ficam em:

- `curso_disciplinas`: uma disciplina pode estar em varios cursos, e cada curso tem uma disciplina apenas uma vez.
- `professor_cursos`: cursos em que o professor pode dar aula.
- `professor_disciplinas`: disciplinas vinculadas ao professor.
- `aluno_disciplinas`: disciplinas vinculadas ao aluno.
- `notas`: notas e situacao do aluno por disciplina.
