# .wiki - LLM Knowledge Base

> **Projeto:** Conferencia NF-e
> **Ultima atualizacao:** 2026-05-29
> **Proximo ADR:** ADR-005

Este diretorio e o segundo cerebro do projeto. Subagentes e opencode devem consultar este indice antes de tomar decisoes.

---

## Mapa de Conhecimento

### Architecture
- `[[architecture/system-overview]]` — Arquitetura do sistema, containers, fluxo de dados

### Decisions (ADRs)
- [[decisions/001-frontend-mwms-pattern]] — Frontend padrao mwms (Clean Tech / Precision Minimalism)
- [[decisions/002-db-helpers-pattern]] — Refatorar db/index.ts com helpers query/run
- [[decisions/003-settings-admin-only]] — Settings modal admin-only com import/export/usuarios
- [[decisions/004-auth-middleware-router]] — AuthMiddleware obrigatorio em cada router, bug fix

### Patterns
- `[[patterns/frontend-standards]]` — Padrao de componentes CSS baseado no mwms
- `[[patterns/ripgrep-workflow]]` — Workflow de buscas com ripgrep

### Projects
- `[[projects/conferencia]]` — Contexto completo do projeto

### Integrations
- `[[integrations/api-catalog]]` — Catalogo completo de endpoints da API

### Snippets
- `[[snippets/utils]]` — Snippets reutilizaveis (fetch, modal, toast, stats, theme)

---

## Como Usar com opencode

1. **Antes de codar** -> Leia este INDEX e `[[projects/conferencia]]` para contexto
2. **Ao tomar decisoes** -> Consulte ADRs existentes em `decisions/`
3. **Para seguir padroes** -> Consulte `patterns/` e `snippets/`
4. **Ao integrar servicos** -> Consulte `integrations/api-catalog`
5. **Para buscar codigo** -> Use ripgrep (`rg`) - ver `[[patterns/ripgrep-workflow]]`

## Como Adicionar Entradas

1. Copie um template de `.wiki/templates/`
2. Preencha com as informacoes
3. Adicione um link neste INDEX
4. Referencie de outras paginas relacionadas com `[[links]]`

## Templates Disponiveis

- `[[templates/decision-template]]` - Para ADRs
- `[[templates/pattern-template]]` - Para padroes
- `[[templates/architecture-template]]` - Para documentacao arquitetural
