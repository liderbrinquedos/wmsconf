# API Catalog — Conferencia NF-e

## Autenticacao

### POST `/api/auth/login`
Login de usuario. Acesso publico.

**Body:**
```json
{ "username": "admin", "password": "admin123" }
```

**Resposta 200:**
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "username": "admin", "role": "admin" }
}
```

**Resposta 401:** `{ "error": "Usuario ou senha invalidos" }`

---

### GET `/api/auth/users`
Lista todos usuarios. **Admin only.**

**Header:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
{
  "data": [
    { "id": 1, "username": "admin", "role": "admin", "created_at": "..." }
  ]
}
```

**Resposta 403:** `{ "error": "Acesso restrito a administradores" }`

---

### POST `/api/auth/users`
Cria novo usuario. **Admin only.**

**Body:**
```json
{ "username": "operador1", "password": "1234", "role": "operador" }
```

**Resposta 200:** `{ "ok": true }`

**Resposta 409:** `{ "error": "Usuario ja existe" }`

---

### DELETE `/api/auth/users/:id`
Deleta usuario. **Admin only.** Nao permite deletar a si mesmo.

**Resposta 200:** `{ "ok": true }`

**Resposta 400:** `{ "error": "Nao e possivel deletar a si mesmo" }`

---

## Produtos

### GET `/api/produtos`
Lista produtos com paginacao.

**Query params:** `search` (opcional), `page` (default 1), `limit` (default 50, max 200; use `0` para desabilitar paginação e retornar todos os registros)

**Resposta 200:**
```json
{
  "data": [{ "id": 1, "codprod": "001", "descprod": "...", "qtdemb": 12, "ean13": "...", "ean14": "..." }],
  "total": 10,
  "page": 1,
  "limit": 50
}
```

---

### POST `/api/produtos/import`
Importa catalogo de produtos via .xlsx. **Admin only.**

**Body:** `multipart/form-data` com campo `file` (.xlsx)

**Colunas esperadas:** `codprod`, `referencia`, `descprod`, `qtdemb`, `ean13`, `ean14`

**Resposta 200:** `{ "imported": 10, "errors": [] }`

---

## Notas Fiscais

### GET `/api/notas`
Lista notas com paginacao e filtros.

**Query params:** `search`, `status`, `page`, `limit`

**Resposta 200:**
```json
{
  "data": [{ "id": 1, "nunota": 10001, "numnota": "NF-5001", "razaosocial": "...", "status": "pendente", "itens": [...] }],
  "total": 3,
  "page": 1,
  "limit": 50
}
```

---

### GET `/api/notas/:nunota`
Detalhes de uma nota especifica.

**Resposta 200:** `{ "data": { "id": 1, "nunota": 10001, "itens": [...] } }`

**Resposta 404:** `{ "error": "Nota nao encontrada" }`

---

### POST `/api/notas/import`
Importa notas fiscais via .xlsx. **Admin only.**

**Body:** `multipart/form-data` com campo `file` (.xlsx)

**Colunas esperadas:** `nunota`, `numnota`, `codparc`, `razaosocial`, `codprod`, `referencia`, `qtd`

> **Nota:** Itens da mesma nota com o mesmo `codprod` são automaticamente deduplicados — a quantidade (`qtd`) é somada em vez de criar linhas duplicadas.

**Resposta 200:** `{ "imported": 3, "errors": [] }`

---

## Conferencias

### GET `/api/conferencias`
Lista conferencias com leituras.

**Query params:** `page`, `limit`, `user_id`

**Resposta 200:**
```json
{
  "data": [{ "id": 1, "nota_id": 1, "usuario_id": 1, "status": "pendente", "leituras": [...] }],
  "total": 5,
  "page": 1,
  "limit": 50
}
```

---

## Locks

### POST `/api/locks/check`
Verifica se uma nota esta bloqueada.

**Body:** `{ "nunota": 10001 }`

**Resposta 200 (disponivel):** `{ "locked": false }`

**Resposta 200 (bloqueada):** `{ "locked": true, "usuario_id": 1, "username": "admin", "iniciado_em": "..." }`

---

### POST `/api/locks/acquire`
Adquire lock de uma nota.

**Body:** `{ "nunota": 10001 }`

**Resposta 200:** `{ "ok": true }`

**Resposta 404:** `{ "error": "Nota nao encontrada" }`

**Resposta 400:** `{ "error": "Nota ja conferida" }`

**Resposta 409:** `{ "error": "Nota em conferencia por outro operador" }`

---

### POST `/api/locks/release`
Libera lock de uma nota.

**Body:** `{ "nunota": 10001 }`

**Resposta 200:** `{ "ok": true }`

**Resposta 403:** `{ "error": "Lock pertence a outro operador" }`

---

## Sync

### POST `/api/sync`
Sincroniza leituras de uma conferencia.

**Body:**
```json
{
  "nunota": 10001,
  "leituras": [
    { "codprod": "001", "ean_lido": "7891234567890", "qtd_emb": 12 }
  ],
  "finalizada": true
}
```

**Resposta 200:** `{ "ok": true, "conferencia_id": 1 }`

**Resposta 400:** `{ "error": "Nota ja conferida" }`

**Resposta 404:** `{ "error": "Nota nao encontrada" }`

---

### GET `/api/sync/pendentes`
Lista notas pendentes (max 50).

**Resposta 200:** `{ "data": [{ "nunota": 10001, "numnota": "NF-5001", "razaosocial": "...", "status": "pendente" }] }`

---

## Relatorios

### GET `/api/reports/conferencias`
Lista conferencias com filtros.

**Query params:** `search`, `page`, `limit`

**Resposta 200:**
```json
{
  "data": [{ "id": 1, "status": "conferida", "numnota": "NF-5001", "cliente": "...", "operador": "admin", "total_leituras": 10 }],
  "total": 5,
  "page": 1,
  "limit": 50
}
```

---

### GET `/api/reports/export`
Exporta conferencias como JSON.

**Resposta 200:** `{ "data": [{ "conferencia_id": 1, "status": "...", "nunota": 10001, ... }] }`

---

### GET `/api/reports/export-xlsx`
Exporta conferencias como arquivo .xlsx (download).

**Resposta:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Arquivo:** `conferencias.xlsx`

---

## Health

### GET `/api/health`
Verifica status do backend.

**Resposta 200:** `{ "status": "ok", "time": "2026-05-18T..." }`
