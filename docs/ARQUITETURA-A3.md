# Arquitetura — Avaliacao 3

Visao da evolucao do projeto ate o Projeto Final Integrador e das camadas atuais.

---

## Evolucao A1 → A2 → A3

```mermaid
flowchart TB
  A1["AV1<br/>rotas + services + controllers<br/>testes de utils<br/>estrutura feature-based"]
  A2["AV2<br/>Zod + middleware<br/>factory tickets/users<br/>seguranca PublicUser<br/>testes service/HTTP<br/>Docker + CI"]
  A3["AV3<br/>suite Vitest estavel no Windows<br/>factory health alinhada<br/>Docker validado<br/>relatorio final"]

  A1 --> A2 --> A3
```

Da AV2 para a AV3 o foco foi consolidar, nao expandir: restaurar a suite de testes no Windows (Git Bash), alinhar o modulo health ao padrao de composicao dos demais features e validar o container em runtime, deixando a defesa das decisoes no relatorio/PR final.

---

## Camadas atuais (pos-AV3)

```mermaid
flowchart TB
  subgraph HTTP["Camada HTTP"]
    Routes["Routes"]
    MW["Middleware<br/>validateBody / validateQuery / requestLogger"]
    RH["routeHandler"]
    EH["apiErrorHandler"]
  end

  subgraph Composition["Composicao"]
    FTM["createTicketsModule()"]
    FUM["createUsersModule()"]
    FHM["createHealthModule()"]
  end

  subgraph Features["Features"]
    Ctrl["Controllers"]
    Svc["Services"]
    Repo["Repositories"]
  end

  subgraph Infra["Infra"]
    JSON["JsonDatabase<br/>data/db.json"]
    Logger["logger.ts"]
    Docker["Dockerfile + compose"]
    CI["GitHub Actions CI"]
  end

  Client((Cliente HTTP)) --> Routes
  Routes --> MW --> RH --> Ctrl
  Ctrl --> Svc --> Repo --> JSON
  Routes --> EH
  FTM --> Ctrl
  FUM --> Ctrl
  FHM --> Ctrl
  MW --> Logger
  Docker -.-> JSON
  CI -.-> Docker
```

Detalhes de fluxo HTTP (ex.: POST /tickets) permanecem em [ARQUITETURA-A2.md](./ARQUITETURA-A2.md).

---

## Evidencia Docker (AV3)

Validacao local em 2026-08-03:

```bash
npm run seed
docker compose up --build -d
curl http://localhost:3000/api/health
```

Resposta observada (HTTP 200):

```json
{
  "status": "ok",
  "service": "oxetech-helpdesk",
  "timestamp": "2026-08-03T19:30:45.660Z",
  "uptime": 14,
  "database": "reachable"
}
```

Smoke adicional: `GET /api/users` sem campo `password`; `GET /api/tickets?status=open` retornou lista filtrada.
