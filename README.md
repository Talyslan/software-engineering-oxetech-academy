# Oxetech Helpdesk API

API REST em Node.js/TypeScript para chamados de suporte academico. Projeto de refatoracao incremental do curso 811 (AV1 → AV2 → AV3).

## Quick start

```bash
npm install
npm run seed
npm run dev
```

API em `http://localhost:3000/api`.

Copie `.env.example` para `.env` se quiser sobrescrever `PORT` ou `DATA_FILE` (padroes: `3000` e `data/db.json`).

## Requisitos

- Node.js **20+** no desenvolvimento local (Docker e CI usam **Node 24**)
- npm
- Docker (opcional), para rodar via container

## Scripts

| Script                  | Descricao                                      |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | API em modo desenvolvimento (`tsx watch`)      |
| `npm run seed`          | Recria `data/db.json`                          |
| `npm run build`         | Compila TypeScript para `dist/`                |
| `npm start`             | Sobe a API de producao (`node dist/server.js`) |
| `npm test`              | Suite Vitest (37 testes)                       |
| `npm run test:watch`    | Vitest em modo watch                           |
| `npm run test:coverage` | Testes com cobertura (threshold 70%)           |
| `npm run lint`          | ESLint                                         |
| `npm run typecheck`     | `tsc --noEmit`                                 |

`npm start` exige `npm run build` antes.

No Windows com **Git Bash**, `npm test` passa por `scripts/run-vitest.mjs` para normalizar o casing do drive (`c:` vs `C:`); sem isso o Vitest pode falhar ao coletar os testes.

## Testes

```bash
npm test
npm run test:coverage
```

A suite inclui:

- unitarios de utils e services (`tests/features/`)
- integracao HTTP com supertest (`tests/integration/`)

## Docker

O compose monta `./data` em `/app/data`. Gere os dados locais antes:

```bash
npm run seed
docker compose up --build
```

API em `http://localhost:3000/api`. Imagem base: `node:24-alpine` (multi-stage).

Build manual:

```bash
docker build -t oxetech-helpdesk .
docker run -p 3000:3000 -v "$(pwd)/data:/app/data" oxetech-helpdesk
```

## CI

![CI](https://github.com/Talyslan/software-engineering-oxetech-academy/actions/workflows/ci.yml/badge.svg)

Workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml): **lint**, **typecheck**, **test** e **build** (Node 24) em push/PR envolvendo `main` (e tambem a branch `avaliacao-2`).

## Estrutura

```
src/
├── app.ts              # createApp() — Express configurado
├── server.ts           # entry point (listen)
├── composition/        # createTicketsModule, createUsersModule, createHealthModule
├── config/             # env (Zod) e caminho do banco
├── domain/             # contratos Controller / Service / Repository
├── features/           # health, tickets, users
├── http/               # ApiError, middleware, validacao Zod
├── routes/             # agregador de rotas + fallbacks
├── types/              # tipagens Express
└── utils/              # JSON database, logger, helpers
tests/
├── features/           # unitarios
└── integration/        # HTTP (supertest)
scripts/
└── run-vitest.mjs      # cwd nativo no Windows (Git Bash)
docs/                   # diagnosticos, arquitetura, relatorio final
```

Persistencia: arquivo JSON em `data/db.json` (criado pelo seed; `data/` fica fora do git).

## Endpoints

### Health

```http
GET /api/health
```

```json
{
  "status": "ok",
  "service": "oxetech-helpdesk",
  "timestamp": "2026-08-03T19:30:45.660Z",
  "uptime": 14,
  "database": "reachable"
}
```

`database` e `reachable` ou `missing` conforme exista o arquivo configurado em `DATA_FILE`.

### Usuarios

```http
GET /api/users
```

Resposta **sem** campo `password`.

### Chamados

```http
GET /api/tickets
GET /api/tickets?status=open
GET /api/tickets?category=infra
GET /api/tickets?search=login
GET /api/tickets/summary
GET /api/tickets/ticket_001
```

```http
POST /api/tickets
Content-Type: application/json

{
  "title": "Nao consigo enviar atividade",
  "description": "O sistema apresenta erro ao anexar o arquivo da atividade.",
  "category": "sistemas",
  "requesterId": "user_ana"
}
```

```http
PATCH /api/tickets/ticket_001/status
Content-Type: application/json

{
  "status": "in_progress",
  "authorId": "user_carla",
  "comment": "Chamado em atendimento."
}
```

```http
POST /api/tickets/ticket_001/comments
Content-Type: application/json

{
  "authorId": "user_carla",
  "message": "Solicitei mais informacoes ao usuario."
}
```

## Documentacao da jornada

Consulte tambem [docs/CHECKPOINTS.md](docs/CHECKPOINTS.md).

### Avaliacao 1

- [Diagnostico](docs/DIAGNOSTICO-ATIVIDADE-1.md)
- [Validacao manual](docs/VALIDACAO-MANUAL-A1.md)

### Avaliacao 2

- [Diagnostico](docs/DIAGNOSTICO-AVALIACAO-2.md)
- [Evolucao](docs/EVOLUCAO-A2.md)
- [Arquitetura](docs/ARQUITETURA-A2.md)
- [Validacao manual](docs/VALIDACAO-MANUAL-A2.md)
- [Texto do PR](docs/PULL-REQUEST-AVALIACAO-2.md)

### Avaliacao 3 (Projeto Final)

- [Relatorio final](docs/RELATORIO-FINAL-A3.md)
- [Arquitetura / evolucao A1→A3](docs/ARQUITETURA-A3.md)
- [Texto do PR](docs/PULL-REQUEST-AVALIACAO-3.md)

## Como avaliar (AV3)

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
npm run seed && docker compose up --build
curl http://localhost:3000/api/health
curl http://localhost:3000/api/users
```

Contexto completo: [docs/RELATORIO-FINAL-A3.md](docs/RELATORIO-FINAL-A3.md).
