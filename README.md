# App Scholar

App Scholar e uma aplicacao academica com app mobile em React Native/Expo e API local em Node.js/Express. O sistema separa os perfis de administrador, professor e aluno para gerenciar cursos, disciplinas, professores, alunos, vinculos academicos e boletins.

Este projeto esta preparado para rodar localmente. Nao ha configuracao de deploy, Render, EAS ou API publica propria no repositorio. A unica integracao externa mantida e a consulta de CEP pela API publica ViaCEP.

## Estrutura

```text
app_scholar/
  back-end/   API REST Node.js + Express + SQLite
  mobile/     Aplicativo React Native com Expo
```

## Requisitos

- Node.js 20.19.4 ou superior
- npm
- Expo Go no celular, caso queira testar em dispositivo fisico

Com `nvm`:

```bash
nvm use 20.19.4
```

## Preparar Tudo

Na raiz do projeto:

```bash
npm run setup:local
```

Esse comando instala as dependencias do back-end, instala as dependencias do mobile e inicializa o SQLite local.

Usuarios criados pelo seed:

```text
admin@appscholar.com / 123456
professor@appscholar.com / 123456
aluno@appscholar.com / 123456
```

## Rodar Local

Terminal 1, na raiz:

```bash
npm run api
```

A API roda por padrao em:

```text
http://localhost:3333/api
```

Terminal 2, na raiz:

```bash
npm run mobile
```

Se estiver usando celular fisico, mantenha computador e celular na mesma rede. O app tenta descobrir o IP do host pelo Expo. Se precisar forcar a URL da API local:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP:3333/api npm run mobile
```

Para Android/emulador:

```bash
npm run mobile:android
```

## Scripts Uteis

```bash
npm run setup:local
npm run api
npm run api:dev
npm run mobile
npm run mobile:android
npm run check
```

## Banco De Dados

O banco padrao e SQLite e fica em:

```text
back-end/data/app_scholar.sqlite
```

Esse arquivo nao deve ser versionado.

Para recriar ou completar os dados de teste:

```bash
npm --prefix back-end run init-db
```

## CEP

O mobile consulta CEP pela API local:

```text
GET /api/cep/:cep
```

A API local consulta a ViaCEP e devolve o endereco para o mobile. Se a ViaCEP estiver indisponivel, o back-end tenta uma pequena base local em `back-end/data/localCep.js` para CEPs de teste:

```text
01001000
01310930
20040002
30140071
70040900
```

Para CEPs fora dessa lista, se a consulta externa estiver indisponivel, preencha endereco, cidade e estado manualmente no formulario.

## Funcionalidades

### Administrador

- Cadastra e edita cursos.
- Vincula disciplinas aos cursos.
- Cadastra e edita disciplinas com horas semanais.
- Cadastra e edita professores.
- Vincula professores a um ou mais cursos.
- Vincula professores a disciplinas permitidas pelos cursos escolhidos.
- Limita a carga semanal do professor a 40 horas.
- Cadastra e edita alunos.
- Bloqueia, desbloqueia e remove alunos/professores.
- Consulta boletim por curso e aluno.

### Professor

- Visualiza as disciplinas vinculadas ao seu cadastro.
- Lista alunos de uma disciplina vinculada.
- Lanca e altera notas.
- Nao remove notas.

### Aluno

- Visualiza suas materias.
- Visualiza notas e situacao no boletim.
- Usa RA gerado a partir do ID do banco.
