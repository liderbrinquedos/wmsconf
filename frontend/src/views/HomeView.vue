<template>
  <div>
    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="card p-4">
        <div class="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Total</div>
        <div class="text-2xl font-black text-text">{{ stats.total }}</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Pendente</div>
        <div class="text-2xl font-black text-accent">{{ stats.pendentes }}</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Ok</div>
        <div class="text-2xl font-black text-success">{{ stats.conferidas }}</div>
      </div>
    </div>

    <!-- Toolbar Minimalista -->
    <div class="flex gap-2 mb-6">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar NF ou cliente..."
          class="flex-1 bg-surface border border-surface-light p-4 rounded text-text font-bold"
          @input="buscar"
        />
        <button
          class="w-14 bg-surface border border-surface-light rounded flex items-center justify-center text-text-muted hover:border-accent hover:text-accent transition-all"
          @click="showFilter = true"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
    </div>

    <!-- Filter Overlay -->
    <div v-if="showFilter" class="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50" @click="showFilter = false"></div>
    <div class="fixed top-0 right-0 h-full w-[280px] bg-surface z-50 p-6 transform transition-transform duration-300" :class="showFilter ? 'translate-x-0' : 'translate-x-full'">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-black text-text">Filtros</h3>
            <button @click="showFilter = false" class="text-text-muted">✕</button>
        </div>
        
        <div class="mb-6">
            <label class="block text-xs text-text-muted font-bold uppercase tracking-widest mb-2">Status</label>
            <select v-model="filterStatus" class="w-full bg-bg border border-surface-light p-3 rounded text-text font-bold">
              <option value="pendente">Pendente</option>
              <option value="conferida">Concluída</option>
            </select>
        </div>

        <button class="btn" @click="applyFilter">Aplicar</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8 text-text-muted">Carregando...</div>

    <!-- Empty -->
    <div v-else-if="notas.length === 0" class="card text-center py-10">
      <div class="text-text">Nenhuma nota encontrada</div>
    </div>

    <!-- Notes List -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="nota in notas"
        :key="nota.nunota"
        @click="selecionarNota(nota.nunota)"
        class="card flex justify-between items-center cursor-pointer border-l-4 hover:border-accent transition-all"
        :class="nota.status === 'conferida' ? 'border-l-success' : 'border-l-accent'"
      >
        <div class="flex-1">
          <div class="text-xs text-text-muted font-bold mb-1">NF {{ nota.numnota }}</div>
          <div class="text-lg font-bold text-text">{{ nota.razaosocial }}</div>
        </div>
        <div class="text-right">
          <span class="px-2 py-1 rounded text-[0.6rem] font-black uppercase" :class="nota.status === 'conferida' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'">
             {{ statusLabel(nota.status) }}
          </span>
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
const filterStatus = ref('pendente')
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

function statusLabel(status: string) {
  const map: any = {
    pendente: 'Pendente',
    conferida: 'Concluída',
  }
  return map[status] || status
}

function applyFilter() {
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
    alert(e.message || 'Nota em conferência por outro operador')
  }
}

onMounted(buscar)
</script>