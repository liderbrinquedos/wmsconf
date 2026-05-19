# Frontend Standards — Clean Tech / Precision Minimalism

> Baseado no ADR-002 do projeto mwms

## Tema

### CSS Variables (Light)

```css
:root {
  --bg: #f5f5f7;
  --surface: #ffffff;
  --surface-secondary: #f2f2f5;
  --border: #e0e0e4;
  --text: #1d1d1f;
  --text-secondary: #86868b;
  --accent: #0071e3;
  --accent-hover: #0077ed;
  --success: #34c759;
  --danger: #ff3b30;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --radius: 10px;
  --radius-sm: 8px;
}
```

### CSS Variables (Dark)

```css
[data-theme="dark"] {
  --bg: #1d1d1f;
  --surface: #2d2d2f;
  --surface-secondary: #3a3a3c;
  --border: #48484a;
  --text: #f5f5f7;
  --text-secondary: #98989d;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
}
```

### Toggle Theme

```js
// Toggle
const dark = document.documentElement.getAttribute('data-theme') === 'dark';
if (dark) document.documentElement.removeAttribute('data-theme');
else document.documentElement.setAttribute('data-theme', 'dark');
localStorage.setItem('conferencia_theme', dark ? 'light' : 'dark');

// Init
const saved = localStorage.getItem('conferencia_theme');
if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
```

## Componentes

### Header

```html
<header class="app-header">
  <div class="header-inner">
    <div class="logo"><h1>Conferencia</h1></div>
    <div class="header-actions">
      <button class="icon-btn" id="themeToggleBtn">○</button>
      <button class="icon-btn" id="logoutBtn">→</button>
    </div>
  </div>
</header>
```

### Search

```html
<div class="search-section">
  <div class="search-wrapper">
    <span class="search-icon">⌕</span>
    <input type="text" placeholder="Buscar NF ou cliente...">
  </div>
</div>
```

### Stats Bar

```html
<div class="stats-bar">
  <div class="stat-card-mobile"><div>Total</div><div>42</div></div>
  <div class="stat-card-mobile"><div>Pendentes</div><div>18</div></div>
  <div class="stat-card-mobile"><div>Conferidas</div><div>24</div></div>
</div>
```

### Hierarchy Card (lista de notas)

```html
<div class="hierarchy-card">
  <span class="card-title">NF-e 12345</span>
  <span class="card-badge">12 itens</span>
</div>
```

### Product Detail Card (item de nota)

```html
<div class="product-detail-card">
  <div class="product-row">
    <span>Produto ABC</span>
    <span style="background:var(--success);padding:4px 12px;border-radius:20px;font-size:0.8rem;">120 un</span>
  </div>
  <div style="font-size:0.75rem;color:var(--text-secondary);">REF-001 | Descricao do produto</div>
</div>
```

### Modal Sheet

```html
<div class="modal" id="myModal">
  <div class="modal-sheet">
    <div class="modal-header">
      <h3>Titulo</h3>
      <button class="icon-btn modal-x">✕</button>
    </div>
    <!-- conteudo -->
    <div class="modal-actions">
      <button class="btn btn-danger">Cancelar</button>
      <button class="btn btn-primary">Confirmar</button>
    </div>
  </div>
</div>
```

### Toast

```html
<div class="toast">Mensagem aqui</div>
```

### Login Screen

```html
<div class="login-screen">
  <div class="login-box">
    <h2 class="login-title">Conferencia</h2>
    <p class="login-subtitle">Conferencia de notas fiscais</p>
    <!-- form -->
  </div>
</div>
```

### Import Zone

```html
<div class="import-zone">
  <span class="import-zone-icon">↑</span>
  <span>Selecionar arquivo</span>
</div>
```

## Fonts

- Display: `Sora` (Google Fonts) — titulos, stats, badges
- Body: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif` — texto, inputs
