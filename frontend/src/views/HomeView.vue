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

    <!-- Search -->
    <div class="search-section">
      <div class="search-wrapper">
        <span class="search-icon">⌕</span>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar NF ou cliente..."
          autocomplete="off"
          @input="buscar"
        />
      </div>
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

async function buscar() {
  loading.value = true
  try {
    const res = await api.notas.list(search.value)
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
