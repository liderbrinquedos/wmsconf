<template>
  <div>
    <!-- Stats -->
    <div class="stats-bar">
      <div class="stat-card-mobile">
        <div>Total</div>
        <div>{{ stats.total }}</div>
      </div>
      <div class="stat-card-mobile">
        <div>Pendentes</div>
        <div>{{ stats.pendentes }}</div>
      </div>
      <div class="stat-card-mobile">
        <div>Conferidas</div>
        <div>{{ stats.conferidas }}</div>
      </div>
    </div>

    <!-- Search + Filter -->
    <div class="search-section relative">
      <div class="search-wrapper relative">
        <span class="search-icon">⌕</span>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar NF ou cliente..."
          autocomplete="off"
          @input="buscar"
        />
        <button
          class="filter-btn"
          :class="{ active: !!filterStatus }"
          @click.stop="toggleFilter"
          title="Filtrar por status"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span v-if="filterStatus" class="filter-dot"></span>
        </button>
      </div>

      <!-- Backdrop -->
      <div v-if="showFilter" class="filter-backdrop" @click="showFilter = false"></div>

      <!-- Filter panel -->
      <transition name="slide-down">
        <div v-if="showFilter" class="filter-panel" @click.stop>
          <div class="filter-row">
            <label>Status</label>
            <select v-model="filterStatus" class="filter-select">
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="conferida">Conferida</option>
            </select>
          </div>
          <div class="filter-actions">
            <button class="btn btn-primary text-xs px-3 py-1" @click="applyFilter">Aplicar</button>
            <button class="btn text-xs px-3 py-1" :style="{ background: 'var(--border)', color: 'var(--text)' }" @click="clearFilter">Limpar</button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8" :style="{ color: 'var(--text-secondary)' }">Carregando...</div>

    <!-- Empty -->
    <div v-else-if="notas.length === 0" class="text-center py-10">
      <div class="text-[1rem] font-medium mb-1" :style="{ color: 'var(--text-secondary)' }">Nenhuma nota encontrada</div>
      <div class="text-[0.85rem]" :style="{ color: 'var(--text-secondary)' }">Importe uma nota fiscal para comecar</div>
    </div>

    <!-- Notes List -->
    <div v-else class="flex flex-col gap-2 px-4">
      <div
        v-for="nota in notas"
        :key="nota.nunota"
        @click="selecionarNota(nota.nunota)"
        class="hierarchy-card"
      >
        <div>
          <span class="card-title" :style="{ fontFamily: '\'Sora\', sans-serif' }">NF-e {{ nota.numnota }}</span>
          <div class="text-[0.75rem] mt-0.5" :style="{ color: 'var(--text-secondary)' }">{{ nota.razaosocial }}</div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span :class="statusBadge(nota.status)">{{ statusLabel(nota.status) }}</span>
          <span class="card-badge">{{ nota.itens?.length || 0 }} itens</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const search = ref('')
const filterStatus = ref('') // 'pendente', 'conferida', or ''
const showFilter = ref(false)
const notas = ref<any[]>([])
const loading = ref(true)

const stats = computed(() => ({
  total: notas.value.length,
  pendentes: notas.value.filter(n => n.status === 'pendente').length,
  conferidas: notas.value.filter(n => n.status === 'conferida').length,
}))

watch(() => auth.refreshNotasCounter, () => {
  buscar()
})

function statusBadge(status: string) {
  const map: any = {
    pendente: 'badge pendente',
    conferida: 'badge ok',
    excesso: 'badge excesso',
  }
  return map[status] || 'badge pendente'
}

function statusLabel(status: string) {
  const map: any = {
    pendente: 'Pendente',
    conferida: 'Conferida',
    excesso: 'Excesso',
  }
  return map[status] || status
}

function toggleFilter() {
  showFilter.value = !showFilter.value
}

function applyFilter() {
  showFilter.value = false
  buscar()
}

function clearFilter() {
  filterStatus.value = ''
  showFilter.value = false
  buscar()
}

async function buscar() {
  loading.value = true
  try {
    const res = await api.notas.list(search.value, filterStatus.value)
    notas.value = res.data
  } catch (e) {
    notas.value = []
  } finally {
    loading.value = false
  }
}

async function selecionarNota(nunota: number) {
  try {
    await api.locks.acquire(nunota)
    router.push(`/conferencia/${nunota}`)
  } catch (e: any) {
    alert(e.message || 'Nota em conferencia por outro operador')
  }
}

onMounted(buscar)
</script>

<style scoped>
.filter-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.6;
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.filter-btn:hover {
  opacity: 1;
}
.filter-btn.active .filter-dot {
  opacity: 1;
}
.filter-dot {
  position: absolute;
  right: -4px;
  top: -2px;
  width: 6px;
  height: 6px;
  background: var(--danger, #ef4444);
  border-radius: 50%;
  opacity: 0.8;
}
.filter-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
}
.filter-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 12px;
  background: var(--surface-secondary, #f3f4f6);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 101;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.filter-row label {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}
.filter-select {
  flex: 1;
  padding: 6px 12px;
  border-radius: var(--radius-sm, 4px);
  border: 1px solid var(--border, #e5e7eb);
  background: var(--bg, #fff);
  color: var(--text, #000);
  font-size: 0.875rem;
}
.filter-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Slide-down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease-out;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
