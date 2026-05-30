<template>
  <div class="space-y-4" v-if="nota">
    <!-- Nota Header -->
    <div class="product-detail-card" :style="{ borderLeftColor: 'var(--accent)', background: 'var(--accent)', color: 'white' }">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-xs opacity-80 font-mono">NF-e {{ nota.numnota }}</p>
          <p class="text-lg font-semibold -mt-0.5" style="font-family: 'Sora', sans-serif">{{ nota.razaosocial }}</p>
        </div>
        <button
          v-if="podeFinalizar"
          @click="finalizar"
          class="px-3 py-1.5 rounded-[var(--radius-sm)] bg-white/20 text-white text-xs font-semibold hover:bg-white/30 transition-colors"
        >
          Finalizar
        </button>
      </div>
    </div>

    <!-- Barcode Input -->
    <div class="form-group">
      <label>Codigo de barras</label>
      <div class="flex items-center gap-2">
        <input
          ref="barcodeInput"
          v-model="codigo"
          type="text"
          inputmode="numeric"
          placeholder="Leia o EAN14"
          class="flex-1 text-center text-lg tracking-widest font-mono"
          @keydown.enter="processar"
          autofocus
        />
        <button
          @click="processar"
          class="btn btn-primary"
          style="flex: 0; min-width: 48px; padding: 12px;"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Feedback Toast -->
    <div class="toast" :class="{ visible: feedback.show }" :style="{ background: feedback.color }">
      {{ feedback.text }}
    </div>

    <!-- Stats -->
    <div class="stats-bar">
      <div class="stat-card-mobile">
        <div>Total</div>
        <div>{{ itens.length }}</div>
      </div>
      <div class="stat-card-mobile">
        <div>OK</div>
        <div :style="{ color: 'var(--success)' }">{{ stats.ok }}</div>
      </div>
      <div class="stat-card-mobile">
        <div>Falta</div>
        <div :style="{ color: 'var(--danger)' }">{{ stats.falta }}</div>
      </div>
      <div class="stat-card-mobile">
        <div>Excesso</div>
        <div :style="{ color: 'var(--danger)' }">{{ stats.excesso }}</div>
      </div>
    </div>

    <!-- Items List -->
    <div class="flex flex-col gap-2 px-4">
      <div
        v-for="item in itens"
        :key="item.codprod"
        class="product-detail-card"
        :style="{ borderLeftColor: progressColor(item) }"
      >
         <div class="product-row">
           <span style="font-family: 'Sora', sans-serif">{{ item.referencia ? item.referencia + ' - ' : '' }}{{ item.nome }}</span>
           <span :class="itemBadge(item)">{{ itemBadgeText(item) }}</span>
         </div>

        <div class="flex items-center gap-3 mb-1">
          <span class="text-xs font-mono tabular-nums" :style="{ color: 'var(--text-secondary)' }">
            {{ item.leituras * item.qtdemb }}/{{ item.qtd }} un
          </span>
          <div class="flex-1 h-1.5 rounded-full overflow-hidden" :style="{ background: 'var(--surface-secondary)' }">
            <div
              class="h-full rounded-full transition-all duration-300"
              :style="{ width: progresso(item) + '%', background: progressColor(item) }"
            ></div>
          </div>
        </div>

        <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">
          {{ item.leituras }}/{{ Math.ceil(item.qtd / item.qtdemb) }} caixas
          <template v-if="item.qtdemb > 1">({{ item.qtdemb }} un/cx)</template>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useConferenciaStore, calcularStatus, calcularProgresso } from '../stores/conferencia'

const props = defineProps<{ nunota: string }>()
const router = useRouter()
const store = useConferenciaStore()

const nota = ref<any>(null)
const codigo = ref('')
const feedback = ref({ show: false, text: '', color: 'var(--text)' })
const produtos = ref<any[]>([])
const barcodeInput = ref<HTMLInputElement>()

let feedbackTimer: any = null

function showFeedback(text: string, type: 'ok' | 'warning' | 'error') {
  const colors: any = {
    ok: 'var(--success)',
    warning: '#f59e0b',
    error: 'var(--danger)',
  }
  clearTimeout(feedbackTimer)
  feedback.value = { show: true, text, color: colors[type] || 'var(--text)' }
  feedbackTimer = setTimeout(() => {
    feedback.value.show = false
  }, 2500)
}

const itens = computed(() => store.itens)

const stats = computed(() => {
  const list = store.itens
  return {
    ok: list.filter(i => calcularStatus(i) === 'conferido').length,
    falta: list.filter(i => calcularStatus(i) === 'pendente' || calcularStatus(i) === 'parcial').length,
    excesso: list.filter(i => calcularStatus(i) === 'excesso').length,
  }
})

const podeFinalizar = computed(() => store.todosConferidos() && !store.temExcesso())

function itemBadge(item: any) {
  const s = calcularStatus(item)
  return `badge badge-${s}`
}

function itemBadgeText(item: any) {
  const map: any = {
    pendente: 'Pendente',
    parcial: 'Parcial',
    conferido: 'Conferido',
    excesso: 'Excesso',
  }
  return map[calcularStatus(item)]
}

function progresso(item: any) {
  return calcularProgresso(item)
}

function progressColor(item: any) {
  const s = calcularStatus(item)
  if (s === 'conferido') return 'var(--success)'
  if (s === 'excesso') return 'var(--danger)'
  if (s === 'parcial') return '#f59e0b'
  return 'var(--border)'
}

async function processar() {
  const ean = codigo.value.trim()
  if (!ean || !ean.length) return

  const result = store.processarLeitura(ean, produtos.value)
  codigo.value = ''

  if (result.error) {
    showFeedback(result.error, 'error')
  } else if (result.warning) {
    showFeedback(result.warning, 'warning')
  } else if (result) {
    const falta = result.esperado - result.conferido
    const cxFalta = Math.ceil(falta / result.qtdemb)
    if (result.status === 'conferido') {
      showFeedback(`${result.nome} CONFERIDO! ${result.conferido}/${result.esperado} un`, 'ok')
    } else {
      showFeedback(`${result.nome}: ${result.conferido}/${result.esperado} un (falta ${cxFalta} cx)`, 'ok')
    }
  }

  await nextTick()
  barcodeInput.value?.focus()
}

async function finalizar() {
  if (!store.todosConferidos()) {
    showFeedback('Ainda existem itens pendentes!', 'warning')
    return
  }

  if (store.temExcesso()) {
    showFeedback('Existem itens com excesso!', 'error')
    return
  }

  try {
    await api.sync.send({
      nunota: parseInt(props.nunota),
      leituras: store.leituras,
      finalizada: true,
    })
    await api.locks.release(parseInt(props.nunota))
    showFeedback('Nota conferida com sucesso!', 'ok')
    setTimeout(() => router.push('/home'), 1500)
  } catch (e: any) {
    showFeedback(e.message, 'error')
  }
}

async function carregar() {
   try {
     const notaRes = await api.notas.get(parseInt(props.nunota))
     nota.value = notaRes.data
     // Carregar TODOS os produtos (limit=0) para garantir que EANs estejam disponíveis
     const prodRes = await api.produtos.list('', 1, 0)
     produtos.value = prodRes.data
     store.carregarNota(notaRes.data, prodRes.data)
   } catch (e: any) {
     showFeedback(e.message, 'error')
   }
 }

onMounted(carregar)

onUnmounted(() => {
  clearTimeout(feedbackTimer)
})
</script>
