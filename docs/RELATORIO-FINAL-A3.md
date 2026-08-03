# Relatorio final — Avaliacao 3 (Projeto Final Integrador)

Defesa escrita da evolucao do fork Oxetech Helpdesk API ao longo do curso 811.
Nao havera defesa oral: este documento e o texto do Pull Request final concentram as justificativas.

---

## 1. Estado inicial da codebase

O projeto base era uma API Express/TypeScript de helpdesk academico com persistencia em arquivo JSON (`data/db.json`). O codigo inicial misturava responsabilidades em poucos arquivos, com validacao manual, pouca tipagem consistente e sem testes, Docker ou CI.

A jornada do curso partiu desse estado legado e evoluiu no **mesmo fork**, em checkpoints (AV1 → AV2 → AV3).

---

## 2. Principais problemas encontrados

| Problema                                                     | Impacto                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| Organizacao fraca (rotas + regras + persistencia misturadas) | Dificil entender e evoluir com seguranca                |
| Validacao apenas com `if` nos services                       | Entrada invalida chegava longe demais no fluxo          |
| `GET /users` e enriquecimento de tickets expunham `password` | Falha basica de seguranca                               |
| Testes inexistentes ou so em utils                           | Regressao dificil de detectar                           |
| Sem Docker / CI                                              | Avaliacao e reproducao dependiam so do ambiente local   |
| Typecheck/build quebrados em algum momento da A1/A2          | Entrega incompleta se nao corrigido                     |
| Apos merge da AV2 no Windows/Git Bash, Vitest falhava 100%   | Pipeline local inutilizavel (`runner.config` undefined) |

---

## 3. Melhorias implementadas

### Avaliacao 1

- Estrutura **feature-based** (controller → service → repository)
- `ApiError` e tratamento centralizado de erros
- Testes unitarios de utils (~22)
- Diagnostico e validacao manual documentados

### Avaliacao 2

- Validacao **Zod** + middleware HTTP
- Factory de composicao (`createTicketsModule`, `createUsersModule`)
- Seguranca: `PublicUser` / `toPublicUser` (API sem senha)
- Testes de `TicketsService`, integracao HTTP (supertest) e health — total **37**
- Docker (`Dockerfile` + `compose`) e GitHub Actions CI
- Logger, health enriquecido, docs de evolucao/arquitetura

### Avaliacao 3 (este checkpoint)

Foco em **consolidar**, nao em features novas:

1. **Estabilizar testes no Windows** — wrapper `scripts/run-vitest.mjs` + `root` nativo no Vitest (casing `c:` vs `C:` no Git Bash)
2. **Polish** — `createHealthModule()` alinhando health ao padrao dos demais modulos + `routeHandler`
3. **Docker validado em runtime** — `docker compose up --build` com `/api/health` HTTP 200
4. **Documentacao final** — diagrama A1→A3, este relatorio e texto do PR

Historico preservado: commits e docs das AV1/AV2 permanecem no repositorio; a AV2 ja estava mergeada em `main` antes desta branch.

---

## 4. Conceitos do curso aplicados

| Conceito                            | Onde aparece                                                                |
| ----------------------------------- | --------------------------------------------------------------------------- |
| Separacao de responsabilidades      | HTTP (`http/`) vs negocio (`features/*/service`) vs infra (JSON repository) |
| Design patterns introdutorios       | Middleware de validacao, Factory de modulos, Repository                     |
| Validacao de entrada                | Schemas Zod nos DTOs                                                        |
| Testes automatizados                | Unitarios (utils/service) + integracao HTTP                                 |
| Seguranca basica                    | DTO publico sem senha                                                       |
| Containers                          | Dockerfile multi-stage + compose                                            |
| CI                                  | lint, typecheck, test, build no GitHub Actions                              |
| Evolucao incremental + PRs escritos | Checkpoints A1/A2/A3 com justificativa                                      |

---

## 5. Decisoes tecnicas

1. **Manter JSON file** — adequado ao escopo introdutorio; trocar DB agora seria over-engineering.
2. **Validacao na borda HTTP (Zod)** — formato/tipo no middleware; regras de negocio no service.
3. **Factory em `composition/`** — instanciação explicita sem framework de DI.
4. **Nao reescrever na AV3** — a AV2 ja cobriu o grosso; AV3 estabiliza, alinha e documenta.
5. **Fix de Vitest via cwd/path nativo** — corrige o sintoma real (module graph duplicado no Windows) sem baixar cobertura nem trocar runner.
6. **Health via factory** — consistencia com tickets/users, facilita testes futuros.
7. **Docker com volume `./data`** — dados locais persistentes; seed local antes do compose.
8. **Defesa so por escrito** — relatorio + PR como artefatos oficiais da AV3.

---

## 6. Evidencias de funcionamento

### Comandos locais (branch `avaliacao-3`)

```bash
npm run lint        # OK
npm run typecheck   # OK
npm test            # 37 testes OK
npm run build       # OK
```

### Docker (2026-08-03)

```bash
npm run seed
docker compose up --build -d
curl http://localhost:3000/api/health
```

Resposta (HTTP 200):

```json
{
  "status": "ok",
  "service": "oxetech-helpdesk",
  "timestamp": "2026-08-03T19:30:45.660Z",
  "uptime": 14,
  "database": "reachable"
}
```

Smoke: `GET /api/users` sem `password`; `GET /api/tickets?status=open` com lista filtrada.

### Diagramas

- Evolucao e camadas: [docs/ARQUITETURA-A3.md](./ARQUITETURA-A3.md)
- Detalhe AV2: [docs/ARQUITETURA-A2.md](./ARQUITETURA-A2.md)
- Comparacao A1→A2: [docs/EVOLUCAO-A2.md](./EVOLUCAO-A2.md)

---

## 7. Limitacoes conhecidas

- Persistencia sincrona em arquivo JSON (sem concorrencia real, sem migrations)
- Sem autenticacao/autorizacao (qualquer cliente chama a API)
- CORS permissivo em desenvolvimento
- Cobertura focada em partes importantes (nao 100% do `src/`)
- Banco “de producao” ainda e o mesmo `db.json` montado via volume

---

## 8. Como colocaria no ar (nivel atual)

Proporcional a complexidade atual (API Node + JSON):

1. **VPS simples** — instalar Docker, clonar o repo, `npm run seed` (ou seed no build), `docker compose up -d`, expor a porta 3000 atras de um reverse proxy (Nginx/Caddy) com HTTPS.
2. **Persistencia** — manter volume apontando para o arquivo JSON (ex.: `./data:/app/data`). Backup = copiar `db.json`.
3. **Alternativa PaaS** (Render/Railway/Fly) — rodar a imagem ou `node dist/server.js` com Node 20+; montar disco persistente para `DATA_FILE`. Sem disco persistente, os dados se perdem a cada redeploy.
4. **CI** — o workflow atual ja valida lint/test/build; o deploy pode ser manual apos CI verde.

Nao ha necessidade de microsservicos, fila ou banco gerenciado para o nivel do curso.

---

## 9. Proximos passos possiveis

- Autenticacao (JWT ou sessao) e autorizacao por `role`
- Banco relacional (PostgreSQL) + migrations
- Rate limiting e CORS restrito
- Mais testes de integracao nos fluxos de comentario/status
- Observabilidade minima (request id, metricas basicas)

Nenhum desses itens foi implementado na AV3 de proposito: o escopo foi consolidar o que ja existia.
