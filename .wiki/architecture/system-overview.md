# System Overview — Conferencia NF-e

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    Docker Compose                    │
│                                                      │
│  ┌──────────────────┐    ┌────────────────────────┐  │
│  │   Nginx (:80)    │    │     Node.js (:3001)    │  │
│  │                  │    │                        │  │
│  │  Vue 3 SPA       │───▶│  Express API           │  │
│  │  (static files)  │ /api│                        │  │
│  │                  │    │  ┌──────────────────┐  │  │
│  └──────────────────┘    │  │  sql.js (SQLite) │  │  │
│                          │  │  in-memory + file│  │  │
│                          │  └──────────────────┘  │  │
│                          │                        │  │
│                          │  Volume: conferencia-  │  │
│                          │  data:/app/data        │  │
│                          └────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Componentes

### Frontend (Vue 3 SPA)
- **Framework:** Vue 3 Composition API + TypeScript
- **Build:** Vite
- **Estado:** Pinia (auth, conferencia stores)
- **Roteamento:** Vue Router (login, home, conferencia/:nunota)
- **Estilo:** Tailwind CSS + variaveis CSS (padrao mwms)
- **Servido por:** Nginx (static files)
- **Proxy:** `/api/*` → backend:3001

### Backend (Express API)
- **Framework:** Express + TypeScript (ES modules)
- **Runtime:** Node 18 Alpine
- **Banco:** SQLite via sql.js (WASM, in-memory, persistido em arquivo)
- **Auth:** JWT (24h) + bcrypt para senhas
- **Upload:** express-fileupload (max 20MB)
- **Import:** xlsx (SheetJS) para parsing de .xlsx

### Banco de Dados (SQLite)

```
usuarios ──┬── notas ──┬── itens_nota
           │           │
           │           └── conferencias ──┬── leituras
           │                              │
           └── locks ─────────────────────┘
```

| Tabela | Colunas principais |
|---|---|
| `usuarios` | id, username, password, role |
| `produtos` | id, codprod, referencia, descprod, qtdemb, ean13, ean14 |
| `notas` | id, nunota, numnota, codparc, razaosocial, status |
| `itens_nota` | id, nota_id, codprod, referencia, qtd |
| `conferencias` | id, nota_id, usuario_id, status, iniciada_em, finalizada_em |
| `leituras` | id, conferencia_id, codprod, ean_lido, qtd_emb |
| `locks` | nota_id, usuario_id, iniciado_em |

## Fluxo de Dados

### 1. Importacao de Produtos
```
Admin → Settings → Upload .xlsx → POST /api/produtos/import
    → Backend parseia xlsx → INSERT/UPDATE produtos → save() → persiste em arquivo
```

### 2. Importacao de Notas
```
Admin → Settings → Upload .xlsx → POST /api/notas/import
    → Backend agrupa por nunota → INSERT notas + itens_nota → save()
```

### 3. Conferencia
```
Operador → Home → Clica nota → POST /api/locks/acquire
    → Se disponivel: lock criado → redirect /conferencia/:nunota
    → GET /api/notas/:nunota + GET /api/produtos → carrega itens
    → Leitura EAN → match com produtos → atualiza store local
    → Finalizar → POST /api/sync { leituras[], finalizada: true }
        → INSERT conferencias + leituras → UPDATE notas status='conferida'
        → DELETE locks → save()
```

### 4. Exportacao
```
Admin → Settings → Exportar XLSX → GET /api/reports/export-xlsx
    → Query conferencias + notas + usuarios → gera .xlsx → download
```

## Persistencia

sql.js opera em memoria. Cada `save()` exporta o banco como buffer e escreve no arquivo `data/conferencia.db`. No `initDb()`, se o arquivo existe, carrega o buffer para memoria.

**PRAGMAs:** `journal_mode=WAL`, `foreign_keys=ON`

## Seguranca

- **Auth:** JWT com segredo via env `JWT_SECRET`
- **Middleware:** `authMiddleware` em todas as rotas exceto `/api/auth/login`
- **Admin:** `adminOnly` middleware em rotas de usuarios
- **CORS:** Habilitado para todas origens (desenvolvimento)

## Containerizacao

| Service | Build | Ports | Volumes |
|---|---|---|---|
| frontend | `./frontend` | 8023:80 | — |
| backend | `./backend` | 3001:3001 | conferencia-data:/app/data |
