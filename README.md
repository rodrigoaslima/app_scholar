# App Scholar

App Scholar e uma aplicacao academica com app mobile em React Native/Expo e API em Node.js/Express. O sistema separa os perfis de administrador, professor e aluno para gerenciar cursos, disciplinas, professores, alunos, vinculos academicos e boletins.

## Aplicativo Online

O back-end ja esta publicado no Render:

```text
https://app-scholar-api.onrender.com/api
```

Teste rapido da API:

```text
https://app-scholar-api.onrender.com/api/health
```

A APK Android pode ser instalada pelo build do Expo/EAS:

```text
https://expo.dev/accounts/roaslima/projects/app-scholar/builds/ef5181c5-7fb7-40f0-9e92-7cc71fac702a
```

Abra esse link em um dispositivo Android ou escaneie o QR Code da pagina do build para instalar o aplicativo. Essa APK ja esta configurada para usar o back-end online do Render.

Usuarios de teste:

```text
admin@appscholar.com / 123456
professor@appscholar.com / 123456
aluno@appscholar.com / 123456
```

## Estrutura do Repositorio

```text
App_scholar/
  mobile/     Aplicativo React Native com Expo
  back-end/   API REST Node.js + Express + SQLite
```

## Requisitos

- Node.js 20.19.4 ou superior
- npm
- Expo Go no celular, caso queira testar em dispositivo fisico

Com `nvm`:

```bash
nvm use 20.19.4
```

## Instalar Dependencias

Instale as dependencias do back-end:

```bash
cd back-end
npm install
```

Instale as dependencias do mobile:

```bash
cd ../mobile
npm install --legacy-peer-deps
```

## Configurar o Back-End

Crie o arquivo de ambiente:

```bash
cd back-end
cp .env.example .env
```

Inicialize o banco SQLite com dados de teste:

```bash
npm run init-db
```

Usuarios criados pelo seed:

```text
admin@appscholar.com / 123456
professor@appscholar.com / 123456
aluno@appscholar.com / 123456
```

## Rodar o Back-End

```bash
cd back-end
npm start
```

A API roda por padrao em:

```text
http://localhost:3333/api
```

## Rodar o Mobile

Em outro terminal:

```bash
cd mobile
npm start
```

Para abrir no navegador:

```bash
npm run web
```

Se estiver usando celular fisico, mantenha computador e celular na mesma rede. O app tenta descobrir o IP do host pelo Expo. Se precisar forcar a URL da API:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP:3333/api npm start
```

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

## CEP

O mobile consulta CEP pela API local:

```text
GET /api/cep/:cep
```

O back-end consulta a ViaCEP e devolve os dados para o app.

## Banco de Dados

O banco padrao e SQLite e fica em:

```text
back-end/data/app_scholar.sqlite
```

Esse arquivo nao deve ser versionado.

## Deploy do Back-End no Render Free

O repositorio ja possui um `render.yaml` para criar o servico `app-scholar-api` no Render.

No Render:

1. Crie um novo **Blueprint**.
2. Conecte este repositorio do GitHub.
3. Confirme a criacao do servico.
4. Aguarde o deploy terminar.

O Render vai usar:

```text
rootDir: back-end
buildCommand: npm install
startCommand: npm start
```

No plano gratuito, o SQLite fica no filesystem temporario do servico. Se o servico reiniciar, redeployar ou trocar de instancia, os dados podem sumir. O `npm start` roda o seed antes de iniciar a API, entao o banco volta com usuarios e dados de teste quando for recriado.

Depois do deploy, use a URL publica do Render no mobile:

```bash
cd mobile
EXPO_PUBLIC_API_URL=https://SUA-URL-DO-RENDER/api npm start
```

## Scripts Uteis

Back-end:

```bash
cd back-end
npm run init-db
npm start
npm run dev
```

Mobile:

```bash
cd mobile
npm start
npm run web
npm run typecheck
```
