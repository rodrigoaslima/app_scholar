# App Scholar Backend

API REST local em Node.js + Express para a Parte 2 do App Scholar.

## Stack

- Node.js
- Express
- SQLite
- JWT com Bearer token

## Setup Local

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

## Ambiente

Arquivo `.env.example`:

```text
PORT=3333
JWT_SECRET=troque_este_segredo_em_producao
DB_FILE=./data/app_scholar.sqlite
```

Para desenvolvimento local, mantenha `DB_FILE` apontando para `./data/app_scholar.sqlite`.

## Usuarios De Teste

Criados por `npm run init-db`:

```text
admin@appscholar.com / 123456
professor@appscholar.com / 123456
aluno@appscholar.com / 123456
```

## CEP

Rota:

```text
GET /api/cep/:cep
```

A API consulta a ViaCEP e retorna o endereco para o app. Se a ViaCEP estiver indisponivel, a API tenta a base local `data/localCep.js` para CEPs de teste:

```text
01001000
01310930
20040002
30140071
70040900
```

## Rotas Publicas

- `GET /api/health`
- `GET /api/cep/:cep`
- `GET /api/cursos`
- `POST /api/auth/register`
- `POST /api/login`

## Rotas Com Token

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
- `POST /api/msg`

### Professor

- `GET /api/professor/cursos`
- `GET /api/professor/disciplinas`
- `GET /api/professor/disciplinas/:disciplinaId/alunos`
- `POST /api/professor/notas`
- `PUT /api/professor/notas`
- `POST /api/msg`

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
- `msg`: avisos criados por administradores e professores, com texto e usuario que escreveu.
