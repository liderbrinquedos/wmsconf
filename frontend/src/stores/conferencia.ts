import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ItemConferencia {
  codprod: string
  nome: string
  referencia: string
  qtd: number
  qtdemb: number
  leituras: number
}

export function calcularStatus(item: ItemConferencia) {
  const conferido = item.leituras * item.qtdemb
  if (conferido === 0) return 'pendente'
  if (conferido < item.qtd) return 'parcial'
  if (conferido === item.qtd) return 'conferido'
  return 'excesso'
}

export function calcularProgresso(item: ItemConferencia) {
  return Math.min(100, (item.leituras * item.qtdemb / item.qtd) * 100)
}

export const useConferenciaStore = defineStore('conferencia', () => {
  const notaAtual = ref<any>(null)
  const itens = ref<ItemConferencia[]>([])
  const leituras = ref<any[]>([])
  const notaKey = ref('')

  function carregarNota(nota: any, produtos: any[]) {
    notaKey.value = nota.nunota
    notaAtual.value = nota
    itens.value = nota.itens.map((item: any) => {
      const prod = produtos.find((p: any) => p.codprod === item.codprod)
      return {
        codprod: item.codprod,
        nome: prod?.descprod || item.codprod,
        referencia: item.referencia,
        qtd: item.qtd,
        qtdemb: prod?.qtdemb || 1,
        leituras: 0,
      } as ItemConferencia
    })
    leituras.value = []
  }

  function processarLeitura(ean: string, produtos: any[]) {
    const prod = produtos.find((p: any) => p.ean14 === ean || p.ean13 === ean)
    if (!prod) return { error: `Codigo ${ean} nao cadastrado` }

    const item = itens.value.find(i => i.codprod === prod.codprod)
    if (!item) return { error: `${prod.descprod} nao esta nesta nota` }

    const status = calcularStatus(item)
    if (status === 'conferido') return { warning: `${prod.descprod} ja conferido` }

    item.leituras++
    leituras.value.push({
      codprod: prod.codprod,
      ean_lido: ean,
      qtd_emb: prod.qtdemb,
      criada_em: new Date().toISOString(),
    })

    const novoStatus = calcularStatus(item)
    const conf = item.leituras * item.qtdemb
    const itemStatus = calcularStatus(item)

    return {
      ok: true,
      nome: prod.descprod,
      conferido: conf,
      esperado: item.qtd,
      status: itemStatus,
      qtdemb: item.qtdemb,
    }
  }

  function limpar() {
    notaKey.value = ''
    notaAtual.value = null
    itens.value = []
    leituras.value = []
  }

  const todosConferidos = (): boolean => {
    return itens.value.every(i => calcularStatus(i) === 'conferido')
  }

  const temExcesso = (): boolean => {
    return itens.value.some(i => calcularStatus(i) === 'excesso')
  }

  return {
    notaAtual, itens, leituras, notaKey,
    carregarNota, processarLeitura, limpar,
    todosConferidos, temExcesso,
  }
})