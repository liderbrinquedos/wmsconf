# Snippets — Funcoes e Padroes Reutilizaveis

## Fetch com Auth

```ts
const BASE = '/api'

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers: any = { ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Erro ${res.status}`)
  }
  return res.json()
}

async function requestBlob(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers: any = { ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Erro ${res.status}`)
  }
  return res.blob()
}
```

## Download de Arquivo

```ts
const blob = await api.reports.exportXlsx()
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'conferencias.xlsx'
a.click()
URL.revokeObjectURL(url)
```

## Padrao Modal Sheet (mwms)

```html
<div class="modal active" @click.self="$emit('close')">
  <div class="modal-sheet">
    <div class="modal-header">
      <h3>Titulo</h3>
      <button class="modal-x" @click="$emit('close')">✕</button>
    </div>
    <!-- conteudo -->
    <div class="modal-actions">
      <button class="btn btn-danger">Cancelar</button>
      <button class="btn btn-primary">Confirmar</button>
    </div>
  </div>
</div>
```

## Padrao Toast

```ts
function showFeedback(text: string, type: 'ok' | 'warning' | 'error') {
  const colors: any = {
    ok: 'var(--success)',
    warning: '#f59e0b',
    error: 'var(--danger)',
  }
  clearTimeout(feedbackTimer)
  feedback.value = { show: true, text, color: colors[type] }
  feedbackTimer = setTimeout(() => { feedback.value.show = false }, 2500)
}
```

```html
<div class="toast" :class="{ visible: feedback.show }" :style="{ background: feedback.color }">
  {{ feedback.text }}
</div>
```

## Padrao Stats Bar

```html
<div class="stats-bar">
  <div class="stat-card-mobile">
    <div>Label</div>
    <div>{{ valor }}</div>
  </div>
  <div class="stat-card-mobile">
    <div>Label 2</div>
    <div>{{ valor2 }}</div>
  </div>
</div>
```

## Padrao Import Zone

```html
<div class="import-zone" @click="triggerFile" @dragover.prevent @drop.prevent="handleDrop">
  <span class="import-zone-icon">↑</span>
  <span>{{ file ? file.name : 'Selecionar arquivo' }}</span>
</div>
<input ref="fileInput" type="file" accept=".xlsx" class="hidden" @change="handleFileSelect" />
```

## Padrao Hierarchy Card

```html
<div class="hierarchy-card" @click="handleClick">
  <span class="card-title">Titulo</span>
  <span class="card-badge">Badge</span>
</div>
```

## Padrao Product Detail Card

```html
<div class="product-detail-card" :style="{ borderLeftColor: statusColor }">
  <div class="product-row">
    <span>Nome do produto</span>
    <span :class="badgeClass">Status</span>
  </div>
  <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">
    Detalhes adicionais
  </div>
</div>
```

## Theme Toggle

```ts
const isDark = ref(localStorage.getItem('conferencia_theme') === 'dark')

if (isDark.value) {
  document.documentElement.setAttribute('data-theme', 'dark')
}

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('conferencia_theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('conferencia_theme', 'light')
  }
}
```

## Admin Only Check

```ts
import { useAuthStore } from './stores/auth'
const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')
```

```html
<button v-if="isAdmin" @click="openSettings">⚙</button>
```
