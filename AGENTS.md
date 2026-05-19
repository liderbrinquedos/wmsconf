# Conferencia NF-e

## Comandos
```bash
docker compose up -d --build   # rebuild + start
docker compose down            # stop
docker compose logs backend    # ver logs
cd backend && npm run dev      # dev local (tsx watch)
cd frontend && npm run dev     # dev local (vite, porta 5173)
cd backend && npm run seed     # criar usuario admin
```

## Credenciais
- Admin: `admin` / `admin123`

## Auth - ponto critico (ADR-004)
- `authMiddleware` decodifica JWT e poe `req.user`. Cada router DEVE aplicar explicitamente:
  ```ts
  const router = Router()
  router.use(authMiddleware)
  ```
- `auth.ts` aplica `authMiddleware` APOS a rota `POST /login` (login nao precisa de token)
- `adminOnly` checa `req.user.role !== 'admin'`

## DB helpers (`db/index.ts`)
| Funcao | Uso |
|--------|-----|
| `query(sql, params)` | SELECT → `{columns, values}` |
| `queryOne(sql, params)` | SELECT single row |
| `run(sql, params)` | INSERT/UPDATE/DELETE |
| `save()` | **Obrigatorio apos writes** |
| `lastInsertRowId()` | ID do ultimo INSERT |

## Test data
- `test-data/produtos-test.xlsx` (10 produtos)
- `test-data/notas-test.xlsx` (3 notas, 10 itens)

## Rotas
- `/login` (public), `/home`, `/conferencia/:nunota`
- Frontend: porta 80 (Docker) / 5173 (dev)
- Backend: porta 3001
