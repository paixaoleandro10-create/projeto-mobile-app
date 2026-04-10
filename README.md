# Data Web Foundation

Fundacao de projeto web orientado a dados com foco em robustez, legibilidade e evolucao continua.

Stack implementada:
- Frontend principal: Next.js (TypeScript)
- Backend/API: FastAPI
- Banco: SQLite (local) e PostgreSQL/Supabase (ambiente real)
- Nuvem para banco/autenticacao: Supabase (via variaveis de ambiente)
- CI: GitHub Actions
- Testes backend: pytest
- Testes frontend/e2e: Playwright

## Arquitetura em camadas

1. Frontend (`apps/frontend`)
   Interface Next.js e consumo de API, sem concentrar regra de negocio.
2. Backend (`apps/backend`)
   API REST com validacao de entrada, servicos e documentacao automatica em `/docs`.
   Tambem hospeda o frontend alternativo local sem Node em rotas separadas: `/web` (desktop) e `/mobile/*` (celular), mantendo `/mobile-web` como compatibilidade.
3. Banco (`SQLite` local ou `PostgreSQL/Supabase` no ambiente real)
   Tabela `analytic_records` com `id`, timestamps e campos de relatorio.
4. Integracoes externas
   Servico isolado para consumo/simulacao de API externa.
5. Testes
   `pytest` para API e `Playwright` para fluxo de interface.
6. CI
   Workflow com jobs separados para backend e frontend.

## MVP tecnico entregue

### Frontend
- Frontend principal em desenvolvimento local (Next.js): `/analytics` e `/mobile`.
- `/web` no FastAPI (visao unica desktop com resumo consolidado).
- `/mobile`, `/mobile/subjects`, `/mobile/schedule`, `/mobile/report` no FastAPI (experiencia celular em 4 telas).
- `/mobile-web` no FastAPI (alias de compatibilidade para a experiencia celular).
- `/` no backend FastAPI responde JSON da API (nao e link visual do app).

### Backend
- `GET /api/v1/health`
- `GET /api/v1/health/ready`
- `GET /api/v1/analytics/records`
- `POST /api/v1/analytics/records`
- `GET /api/v1/analytics/summary?period=day|month|year`
- `GET /api/v1/analytics/external-summary?simulate=true`
- `GET /api/v1/mobile/dashboard`
- `GET /api/v1/mobile/subjects`
- `GET /api/v1/mobile/schedule`
- `GET /api/v1/mobile/report`
- `POST /api/v1/mobile/telemetry`
- `POST /api/v1/ingestion/iot-webhook` reservado para evolucao futura.

Camada mobile com persistencia real:
- `students`
- `subjects`
- `mobile_events`
- `report_grades`

Essas tabelas sao criadas automaticamente no startup e recebem seed inicial idempotente.

## Modelo inicial de dados

Tabela principal: `analytic_records`
- `id` (UUID)
- `event_time` (TIMESTAMPTZ)
- `category` (VARCHAR)
- `metric_value` (DOUBLE PRECISION)
- `source` (VARCHAR)
- `status` (VARCHAR)
- `notes` (TEXT)
- `created_at` e `updated_at` (TIMESTAMPTZ)

SQL inicial em `infra/sql/`.

## Como rodar localmente

### 1) Configurar ambiente

1. Copie `.env.example` para `.env`.
2. Para desenvolvimento local, mantenha:
   `DATABASE_URL="sqlite:///./dev.db"`

### 2) Subir backend (FastAPI) com SQLite

```bash
cd apps/backend
python -m venv .venv
# Linux/macOS: source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Documentacao da API:
- http://127.0.0.1:8000/docs

Observacao:
- No startup, o backend aplica `create_all` e executa seed inicial do modulo mobile.
- Isso garante dados reais para `/api/v1/mobile/*` sem setup manual extra.

### 3) Testar frontend alternativo sem Node/NPM

Abra no navegador:
- http://127.0.0.1:8000/web
- http://127.0.0.1:8000/mobile
- http://127.0.0.1:8000/mobile/subjects
- http://127.0.0.1:8000/mobile/schedule
- http://127.0.0.1:8000/mobile/report
- http://127.0.0.1:8000/mobile-web (compatibilidade)

Esse modo usa os endpoints reais:
- `/api/v1/mobile/dashboard`
- `/api/v1/mobile/subjects`
- `/api/v1/mobile/schedule`
- `/api/v1/mobile/report`

Para testar fallback de forma controlada:
- http://127.0.0.1:8000/mobile?forceFallback=1
- http://127.0.0.1:8000/mobile-web?forceFallback=1

### 4) Subir frontend principal (Next.js)

```bash
cd apps/frontend
npm install
npm run dev
```

Frontend principal:
- http://127.0.0.1:3000

### 5) Usar PostgreSQL quando necessario (ambiente real ou homologacao)

1. Suba um PostgreSQL local ou use Supabase.
2. Troque `DATABASE_URL` no `.env` para a string PostgreSQL, por exemplo:
   `DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/analytics_db"`
3. Reinicie o backend.

## Como validar funcionamento

### Frontend
- Publico (Render/Railway): usar `/web` e `/mobile` como links visuais oficiais.
- A raiz `/` deve responder JSON da API (nao interface visual).
- Com Node local (Next.js): `/analytics` e `/mobile` continuam disponiveis em `localhost:3000`.
- Navegar nas 4 telas mobile por rota: `/mobile`, `/mobile/subjects`, `/mobile/schedule`, `/mobile/report`.
- Verificar o badge no topo:
  - `Fonte: API real` quando os contratos estao validos.
  - `Fonte: fallback local` quando a API falha ou quando `forceFallback=1`.
- Em caso de falha real, a UI exibe alerta visivel com causa (rede/timeout/contrato invalido).

### Backend/API
- `GET /api/v1/health` deve retornar `status=ok` (ou `degraded` se banco indisponivel).
- `GET /api/v1/health/ready` deve retornar `status=ready` quando o banco estiver pronto.
- Validar os endpoints `/api/v1/mobile/*`.
- Validar fonte persistida:
  - `GET /api/v1/mobile/dashboard`
  - `GET /api/v1/mobile/subjects`
  - `GET /api/v1/mobile/schedule`
  - `GET /api/v1/mobile/report`
- Opcional: testar telemetria de fallback/contrato
  - `POST /api/v1/mobile/telemetry`

### Repetir teste inicial de forma limpa

1. Pare o backend atual (se estiver rodando).
2. Garanta no `.env`:
   `DATABASE_URL="sqlite:///./dev.db"`
3. Remova o banco local antigo (opcional):
   `rm apps/backend/dev.db` (Linux/macOS) ou `Remove-Item apps/backend/dev.db` (PowerShell)
4. Suba o backend novamente.
5. Valide no navegador:
   - `http://127.0.0.1:8000/docs`
   - `http://127.0.0.1:8000/api/v1/mobile/dashboard`
   - `http://127.0.0.1:8000/web`
  - `http://127.0.0.1:8000/mobile`
  - `http://127.0.0.1:8000/mobile/subjects`
  - `http://127.0.0.1:8000/mobile/schedule`
  - `http://127.0.0.1:8000/mobile/report`

### Testes

Backend:
```bash
cd apps/backend
pytest
```

Frontend/e2e:
```bash
cd apps/frontend
npx playwright install --with-deps chromium
npm run test:e2e
```

### CI
- Pipeline em `.github/workflows/ci.yml` roda instalacao, lint e testes.

## Deploy em nuvem

### Banco no Supabase

1. Crie um projeto no Supabase.
2. Copie a connection string de banco.
3. Configure `DATABASE_URL` no backend.
4. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`.

### Frontend na Vercel

1. Importe o repositorio na Vercel.
2. Configure build para `apps/frontend`.
3. Defina variaveis de ambiente de API.

### Backend em servico cloud compativel

Exemplo (Render):
1. Diretoria raiz do servico: `apps/backend`
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Variaveis: `DATABASE_URL` e secrets relacionados.

## Controle de versao

- `.gitignore` configurado para Python/Node/envs.
- Convencao sugerida de branches:
  - `main`
  - `develop`
  - `feature/<tema>`
  - `fix/<tema>`
  - `chore/<tema>`

## Evolucao futura (IoT)

IoT permanece fora do escopo inicial. O endpoint `/api/v1/ingestion/iot-webhook` fica preparado para evolucao futura sem acoplar a fundacao atual.

## Papel do frontend alternativo (web + mobile)

`/web` entrega a visao unica desktop.
`/mobile`, `/mobile/subjects`, `/mobile/schedule` e `/mobile/report` entregam a experiencia celular em 4 telas.
`/mobile-web` permanece como alias de compatibilidade para a experiencia celular.

Limitacoes em relacao ao frontend principal (`apps/frontend`):
- Nao substitui o Next.js em producao.
- Nao inclui pipeline completo de componentes/roteamento do frontend principal.
- Pode usar fallback local para manter navegacao durante indisponibilidade da API.
- Deve permanecer focado em validacao de integracao com endpoints, nao em evolucao visual paralela.

Com a consolidacao da camada de dados no backend, fallback deve ser contingencia e nao comportamento comum.


## Publicacao publica (FastAPI sem Node)

O frontend alternativo (`/web` e `/mobile`) e servido pelo proprio FastAPI.
Para demonstracao publica nao e necessario subir o Next.js.

### Variaveis obrigatorias

- `DATABASE_URL` (obrigatoria em ambiente cloud)
- `APP_ENV=production` (recomendado)
- `AUTO_CREATE_TABLES=true` (para demo simples com seed automatica)

Observacao sobre banco:
- O backend aceita `postgres://...` e `postgresql://...` e normaliza para o driver SQLAlchemy (`postgresql+psycopg://...`).

### Deploy no Render (recomendado para demo rapida)

1. Crie um **Web Service** apontando para este repositorio.
2. Configure o diretorio raiz do servico para `apps/backend`.
3. Build command:
   `pip install -r requirements.txt`
4. Start command:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Variaveis de ambiente minimas:
   - `DATABASE_URL=<sua string postgres>`
   - `APP_ENV=production`
   - `AUTO_CREATE_TABLES=true`
6. Publique e abra:
   - `/docs`
   - `/web`
   - `/mobile`

### Deploy no Railway

1. Crie um novo projeto e conecte o repositorio.
2. Defina `apps/backend` como raiz do servico.
3. Configure os comandos:
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Configure `DATABASE_URL` e variaveis de ambiente de producao.
5. Publique e valide as mesmas rotas (`/docs`, `/web`, `/mobile`).

## Mobile como app instalavel (PWA)

A experiencia mobile foi preparada como PWA mantendo a arquitetura atual e sem app nativo.

### Arquivos principais do PWA

- `apps/backend/app/web/static/mobile-web/manifest.webmanifest`
- `apps/backend/app/web/static/mobile-web/sw.js`
- `apps/backend/app/web/static/mobile-web/icons/icon.svg`
- `apps/backend/app/web/static/mobile-web/index.html` (manifest + metadados mobile)
- `apps/backend/app/web/routes.py` (rota `/mobile/sw.js`)

### Como testar instalacao no celular

1. Publique o backend em HTTPS (Render/Railway).
2. No celular, abra `https://SEU_DOMINIO/mobile`.
3. Aguarde o carregamento completo da tela.
4. Instale:
   - Android/Chrome: menu do navegador > **Instalar app** (ou botao "Instalar app" no topo, quando disponivel).
   - iPhone/Safari: **Compartilhar** > **Adicionar a Tela de Inicio**.
5. Abra o app instalado e confirme que inicia em `/mobile` (modo standalone).

### Rotas finais para demo

- Web: `/web`
- Mobile PWA: `/mobile`, `/mobile/subjects`, `/mobile/schedule`, `/mobile/report`
- Alias legado: `/mobile-web`
- API Docs: `/docs`
- Raiz da API: `/` (retorna JSON)
- API: `/api/v1/mobile/*`

### Links publicos oficiais (Render)

- https://projeto-mobile-app-1.onrender.com/web
- https://projeto-mobile-app-1.onrender.com/mobile
- https://projeto-mobile-app-1.onrender.com/docs
- https://projeto-mobile-app-1.onrender.com/ (resposta JSON da API)

