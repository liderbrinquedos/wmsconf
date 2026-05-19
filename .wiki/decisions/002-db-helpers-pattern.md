# ADR-002: Refatorar db/index.ts com Helpers query/run

> **Data:** 2026-05-18
> **Status:** accepted
> **Autor:** opencode

## Contexto

O arquivo `db/index.ts` original exportava `getDb()` que retornava a instancia raw do sql.js. As rotas usavam `getDb().exec()` e `db.run()` diretamente, o que gerava:

- Acoplamento direto ao sql.js em todas as rotas
- Codigo repetitivo de parsing de resultados (`exec` retorna `QueryExecResult[]`)
- N+1 queries em `conferencias.ts` e `notas.ts` (loop com query por item)
- Inconsistencia no tratamento de resultados

## Decisao

Refatorar `db/index.ts` para expor helpers de alto nivel:

| Funcao | Uso |
|---|---|
| `query(sql, params)` | SELECT — retorna `{ columns, values }` |
| `queryOne(sql, params)` | SELECT single row — retorna `any[] | null` |
| `run(sql, params)` | INSERT/UPDATE/DELETE — retorna `void` |
| `lastInsertRowId()` | Retorna id do ultimo INSERT |
| `save()` | Persiste banco em arquivo |

Remover `getDb()` do exports publico.

## Alternativas Consideradas

| Alternativa | Pros | Contras |
|---|---|---|
| Manter getDb() | Flexibilidade total | Acoplamento, codigo repetitivo |
| Usar ORM (Prisma) | Type safety | Overkill para SQLite in-memory |
| Helpers query/run | Simples, consistente | Menos flexivel para casos edge |

## Consequencias

**Positivas:**
- Todas as rotas usam mesma interface
- Facilita testes e mock do banco
- Reduz boilerplate de parsing
- N+1 corrigido com queries `IN (...)`

**Negativas:**
- Casos que precisam do raw `db` (ex: `db.export()`) precisam de funcoes especificas
- `save()` precisa ser chamado manualmente apos writes

## Implementacao

Arquivos refatorados:
- `conferencias.ts` — `getDb().exec()` → `query()`, `queryOne()`
- `sync.ts` — `getDb().exec()` → `query()`, `run()`, `lastInsertRowId()`
- `reports.ts` — `getDb().exec()` → `query()`, `queryOne()`
- `seed.ts` — `getDb().exec()` → `query()`, `run()`
- `notas.ts` — N+1 corrigido com `IN (...)`
- `conferencias.ts` — N+1 corrigido com `IN (...)`

## Links Relacionados

- [[patterns/frontend-standards]]
- [[architecture/system-overview]]
