# ADR-003: Settings Modal Admin-Only

> **Data:** 2026-05-18
> **Status:** accepted
> **Autor:** opencode

## Contexto

Apos o redesign do frontend (ADR-001), a HomeView tinha modais de import inline que apareciam para todos os usuarios. Era necessario:

- Restringir imports e exports ao admin
- Adicionar gerenciamento de usuarios (criar/deletar)
- Adicionar exportacao de relatorio em .xlsx
- Centralizar funcionalidades admin em um unico lugar

## Decisao

Criar `SettingsModal.vue` — componente modal acessivel apenas para usuarios com `role === 'admin'`.

### Funcionalidades do Settings Modal

| Seccao | Funcionalidade |
|---|---|
| Importar Produtos | Dropzone .xlsx → POST /api/produtos/import |
| Importar Notas | Dropzone .xlsx → POST /api/notas/import |
| Exportar Relatorio | Botao → GET /api/reports/export-xlsx → download |
| Usuarios | Lista + criar (username, password, role) + deletar |

### Backend

Novos endpoints protegidos por middleware `adminOnly`:

| Endpoint | Metodo | Funcao |
|---|---|---|
| `/api/auth/users` | GET | Lista usuarios |
| `/api/auth/users` | POST | Cria usuario |
| `/api/auth/users/:id` | DELETE | Deleta usuario |
| `/api/reports/export-xlsx` | GET | Exporta .xlsx |

### Frontend

- Icone ⚙ no header-actions visivel apenas para admin
- `SettingsModal` usa padrao mwms `.modal > .modal-sheet`
- HomeView limpa — sem modais de import inline

## Alternativas Consideradas

| Alternativa | Pros | Contras |
|---|---|---|
| Modais inline na Home | Simples | Polui UI, visivel para todos |
| Pagina /settings dedicada | Separacao clara | Mais complexo, requer rota |
| Modal no header (escolhido) | Centralizado, limpo | Espaco limitado no modal |

## Consequencias

**Positivas:**
- UI da Home limpa e focada na conferencia
- Controle de acesso claro (visual + backend)
- Gerenciamento de usuarios integrado
- Exportacao de relatorios acessivel

**Negativas:**
- Operadores nao podem importar dados (intencional)
- Modal pode ficar longo com muitas seccoes

## Links Relacionados

- [[decisions/001-frontend-mwms-pattern]]
- [[patterns/frontend-standards]]
- [[integrations/api-catalog]]
