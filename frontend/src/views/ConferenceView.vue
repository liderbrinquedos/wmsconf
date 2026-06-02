<template>
  <div class="space-y-4 pb-32" v-if="nota">
    <!-- Nota Header -->
    <div class="card bg-surface border-none p-6">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Nota Fiscal</p>
          <p class="text-2xl font-black text-text font-display">{{ nota.numnota }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Cliente</p>
          <p class="text-sm font-bold text-text truncate max-w-[150px]">{{ nota.razaosocial }}</p>
        </div>
      </div>
    </div>

    <!-- Barcode Input -->
    <div class="px-4">
      <div class="form-group">
        <label class="text-xs text-text-muted font-bold uppercase tracking-widest mb-2 block">Leitura de Código</label>
        <input
          ref="barcodeInput"
          v-model="codigo"
          type="text"
          inputmode="numeric"
          placeholder="EAN / Cód. Barras"
          class="w-full bg-surface border border-surface-light p-4 rounded text-text text-xl font-black tracking-widest text-center"
          @keydown.enter="processar"
          autofocus
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3 px-4">
      <div class="card p-3 text-center">
        <div class="text-[0.6rem] text-text-muted font-bold uppercase mb-1">Total</div>
        <div class="text-lg font-black text-text">{{ itens.length }}</div>
      </div>
      <div class="card p-3 text-center">
        <div class="text-[0.6rem] text-text-muted font-bold uppercase mb-1">Ok</div>
        <div class="text-lg font-black text-success">{{ stats.ok }}</div>
      </div>
      <div class="card p-3 text-center">
        <div class="text-[0.6rem] text-text-muted font-bold uppercase mb-1">Pendente</div>
        <div class="text-lg font-black text-accent">{{ stats.falta }}</div>
      </div>
    </div>

    <!-- Items List -->
    <div class="flex flex-col gap-3 px-4">
      <div
        v-for="item in itens"
        :key="item.codprod"
        class="card border-l-4"
        :class="progressBorder(item)"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <div class="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest mb-1">Cód. {{ item.codprod }}</div>
            <div class="font-bold text-text">{{ item.nome }}</div>
            <div v-if="item.referencia" class="text-xs font-bold text-accent mt-1 uppercase">{{ item.referencia }}</div>
          </div>
          <span class="px-2 py-1 rounded text-[0.6rem] font-black uppercase tracking-widest" :class="itemBadgeClass(item)">{{ itemBadgeText(item) }}</span>
        </div>

        <div class="space-y-2">
             <div class="flex justify-between text-[0.6rem] font-bold text-text-muted uppercase tracking-widest">
               <span>Conferido</span>
               <span>{{ Math.round(progresso(item)) }}%</span>
             </div>
             <div class="h-2 rounded-full overflow-hidden bg-bg">
               <div
                 class="h-full rounded-full transition-all duration-300"
                 :style="{ width: progresso(item) + '%', background: progressColor(item) }"
               ></div>
             </div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="fixed bottom-0 left-0 right-0 p-2 bg-bg border-t border-surface-light">
      <div class="max-w-lg mx-auto flex gap-1">
        <button @click="router.push('/home')" class="w-12 h-10 flex items-center justify-center text-text-muted hover:text-text transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button
          @click="finalizar"
          class="flex-1 h-10 font-black uppercase tracking-widest text-[0.7rem] transition-colors"
          :class="podeFinalizar ? 'text-success hover:text-white' : 'text-text-muted opacity-50'"
          :disabled="!podeFinalizar"
        >
          {{ podeFinalizar ? 'Finalizar' : 'Pendente' }}
        </button>
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

function itemBadgeClass(item: any) {
  const s = calcularStatus(item)
  const map: any = {
    conferido: 'bg-success/10 text-success',
    pendente: 'bg-surface-light text-text-muted',
    parcial: 'bg-accent/10 text-accent',
    excesso: 'bg-danger/10 text-danger',
  }
  return map[s]
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
  return 'var(--accent)'
}

function progressBorder(item: any) {
  const s = calcularStatus(item)
  if (s === 'conferido') return 'border-l-success'
  if (s === 'excesso') return 'border-l-danger'
  if (s === 'parcial') return 'border-l-accent'
  return 'border-l-surface-light'
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
    if (result.status === 'conferido') {
      showFeedback(`${result.nome} CONFERIDO!`, 'ok')
    } else {
      showFeedback(`${result.nome}: Conferido parcial`, 'ok')
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
     const prodRes = await api.produtos.list('', 1, 0)
     produtos.value = prodRes.data
     store.carregarNota(notaRes.data, prodRes.data)
   } catch (e: any) {
     showFeedback(e.message, 'error')
   }
 }

onMounted(carregar)
</script>