# ADR-004: AuthMiddleware Obrigatorio em Cada Router

> **Data:** 2026-05-19
> **Status:** accepted
> **Autor:** opencode

## Contexto

O router `auth.ts` nao aplicava `router.use(authMiddleware)` antes das rotas `/users`. Os outros routers (`notas.ts`, `produtos.ts`, `locks.ts`, `sync.ts`, `reports.ts`, `conferencias.ts`) aplicavam corretamente. O middleware `adminOnly` dependia de `req.user` populado pelo `authMiddleware`, mas sem ele `req.user` era `undefined`, resultando em `403 - Acesso restrito a administradores` para todos os usuarios, inclusive admin.

## Decisao

Adicionar `router.use(authMiddleware)` em `auth.ts` apos a rota `POST /login` e antes das rotas `/users`, seguindo o padrao ja estabelecido nos demais routers.

```ts
// auth.ts
router.post('/login', ...);  // publico, nao precisa de token

router.use(authMiddleware);  // <-- adicionado

router.get('/users', adminOnly, ...);
router.post('/users', adminOnly, ...);
router.delete('/users/:id', adminOnly, ...);
```

## Alternativas Consideradas

| Alternativa | Pros | Contras |
|---|---|---|
| Aplicar authMiddleware global em `index.ts` | Nao precisa lembrar em cada router | Login exigiria excecao explicita |
| Aplicar authMiddleware em cada rota individual | Explicito | Repetitivo, facil de esquecer |
| **router.use apos login (escolhido)** | Consistente com outros routers, login fica fora | Precisa saber que a ordem importa |

## Consequencias

- Criacao de usuarios volta a funcionar para admin
- Rotas GET/POST/DELETE /users agora exigem token JWT (como esperado)
- Login continua funcionando sem token
- Padrao documentado no AGENTS.md para evitar reincidencia

## Links Relacionados

- [[decisions/003-settings-admin-only]] — Settings admin-only que depende de adminOnly
- `backend/src/routes/auth.ts` — Router corrigido
- `AGENTS.md` — Documentado em "Auth - atencao ao padrao"
