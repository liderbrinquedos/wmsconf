# ADR-001: Frontend Padrao mwms — Clean Tech / Precision Minimalism

> **Data:** 2026-05-18
> **Status:** accepted
> **Autor:** opencode

## Contexto

O frontend original do conferencia usava:
- Tema custom com accent amber (#e08a00) e fundo quente (#f4f3f0)
- Fonts Space Grotesk + JetBrains Mono
- Dark mode via classe `.dark` no documentElement
- Componentes sem padrao visual consistente com outros projetos

Existia o projeto mwms com um padrao visual ja validado (ADR-002 do mwms: Clean Tech / Precision Minimalism), com inspiracao em Apple, Linear e Stripe. Precisavamos de consistencia visual entre os projetos da organizacao.

## Decisao

Adotar o padrao visual do mwms (Clean Tech / Precision Minimalism) para o frontend do conferencia.

### Principios

1. **Tipografia como identidade** — Sora para titulos, system-ui/SF Pro para corpo
2. **Paleta neutra com acento azul** — #f5f5f7 bg, #1d1d1f text, #0071e3 accent
3. **Zero enfeite** — sem gradientes, sem emojis decorativos, sem sombras exageradas
4. **Hierarquia por espaco e peso** — nao por bordas coloridas
5. **Cantos suaves e consistentes** — 10px cards, 8px elementos, 14px modals

### Paleta Light

```css
--bg: #f5f5f7
--surface: #ffffff
--surface-secondary: #f2f2f5
--border: #e0e0e4
--text: #1d1d1f
--text-secondary: #86868b
--accent: #0071e3
--success: #34c759
--danger: #ff3b30
```

### Paleta Dark

```css
[data-theme="dark"] {
  --bg: #1d1d1f
  --surface: #2d2d2f
  --surface-secondary: #3a3a3c
  --border: #48484a
  --text: #f5f5f7
  --text-secondary: #98989d
}
```

### Mecanismo de Dark Mode

Toggle via `data-theme="dark"` no `<html>` (mesmo padrao mwms), persistido em `localStorage`.

## Alternativas Consideradas

| Alternativa | Pros | Contras |
|---|---|---|
| Manter tema amber custom | Identidade propria | Inconsistencia com mwms |
| GitHub Dark Blue | Popular, bonito | Diferente do padrao da org |
| Adotar padrao mwms | Consistencia, ja validado | Perde identidade propria |

## Consequencias

- Frontend consistente com mwms
- Dark mode funcional via `data-theme`
- Tailwind mantido mas usando variaveis CSS do mwms
- Vue 3 + TypeScript mantido (sem migrar para vanilla JS)

## Links Relacionados

- [[patterns/frontend-standards]]
- [mwms ADR-002](../../mwms/.wiki/decisions/002-frontend-redesign.md)
