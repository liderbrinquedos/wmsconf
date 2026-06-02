<template>
  <div class="p-4 max-w-lg mx-auto">
    <div class="flex items-center gap-4 mb-6">
      <button @click="router.back()" class="p-2 bg-surface border border-surface-light rounded">←</button>
      <h2 class="text-xl font-black text-text font-display uppercase tracking-tight">Configurações</h2>
    </div>

    <!-- Importar Produtos -->
    <section class="card mb-6">
      <h4 class="font-bold text-text mb-2">Importar Produtos</h4>
      <p class="text-xs text-text-muted mb-4">Arquivo .xlsx com colunas: codprod, referencia, descprod, qtdemb, ean13, ean14</p>
      <div class="border-2 border-dashed border-surface-light p-4 rounded text-center cursor-pointer mb-4" @click="triggerProd">
        <span class="text-accent text-xl">↑</span>
        <div class="text-sm text-text-muted mt-2">{{ prodFile ? prodFile.name : 'Selecionar arquivo' }}</div>
      </div>
      <input ref="prodInput" type="file" accept=".xlsx" class="hidden" @change="onProdChange" />
      <button v-if="prodFile" class="btn" @click="importProdutos" :disabled="prodUploading">
        {{ prodUploading ? 'Importando...' : 'Importar Produtos' }}
      </button>
    </section>

    <!-- Importar Notas -->
    <section class="card mb-6">
      <h4 class="font-bold text-text mb-2">Importar Notas Fiscais</h4>
        <p class="text-xs text-text-muted mb-4">Arquivo .xlsx com colunas: nunota, numnota, codparc, razaosocial, codprod, referencia, qtd</p>
      <div class="border-2 border-dashed border-surface-light p-4 rounded text-center cursor-pointer mb-4" @click="triggerNota">
        <span class="text-accent text-xl">↑</span>
        <div class="text-sm text-text-muted mt-2">{{ notaFile ? notaFile.name : 'Selecionar arquivo' }}</div>
      </div>
      <input ref="notaInput" type="file" accept=".xlsx" class="hidden" @change="onNotaChange" />
      <button v-if="notaFile" class="btn" @click="importNotas" :disabled="notaUploading">
        {{ notaUploading ? 'Importando...' : 'Importar Notas' }}
      </button>
    </section>

    <!-- Exportar Relatorio -->
    <section class="card mb-6">
      <h4 class="font-bold text-text mb-2">Exportar Relatório</h4>
      <p class="text-xs text-text-muted mb-4">Baixar planilha com todas as conferências realizadas</p>
      <button class="btn bg-success" @click="exportRelatorio" :disabled="exporting">
        {{ exporting ? 'Gerando...' : '↓ Exportar XLSX' }}
      </button>
    </section>

    <!-- Usuarios -->
    <section class="card mb-6">
      <h4 class="font-bold text-text mb-2">Usuários</h4>
      <div v-if="usersLoading" class="text-sm text-text-muted">Carregando...</div>

      <div v-else class="space-y-2 mb-4">
        <div v-for="u in users" :key="u.id" class="flex items-center justify-between p-3 rounded bg-bg border border-surface-light">
          <div class="flex items-center gap-2">
            <span class="text-sm text-text">{{ u.username }}</span>
            <span class="px-2 py-0.5 rounded text-[0.6rem] font-black uppercase" :class="u.role === 'admin' ? 'bg-success/10 text-success' : 'bg-surface-light text-text-muted'">{{ u.role }}</span>
          </div>
          <button v-if="u.id !== currentUserId" @click="deleteUser(u.id)" class="text-xs text-danger">Remover</button>
        </div>
      </div>

      <div class="p-3 rounded bg-bg border border-surface-light">
        <h5 class="text-sm font-bold text-text mb-2">Novo Usuário</h5>
        <div class="space-y-2">
          <input v-model="newUsername" type="text" placeholder="Usuário" class="w-full bg-surface border border-surface-light p-2 rounded text-sm text-text" />
          <input v-model="newPassword" type="password" placeholder="Senha" class="w-full bg-surface border border-surface-light p-2 rounded text-sm text-text" />
          <select v-model="newRole" class="w-full bg-surface border border-surface-light p-2 rounded text-sm text-text">
            <option value="operador">Operador</option>
            <option value="admin">Admin</option>
          </select>
          <button class="btn text-sm py-2" @click="createUser" :disabled="creatingUser">
            {{ creatingUser ? 'Criando...' : 'Criar Usuário' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const currentUserId = auth.user?.id

// ... (rest of logic moved from SettingsModal.vue)
// Import Produtos
const prodInput = ref<HTMLInputElement>()
const prodFile = ref<File | null>(null)
const prodUploading = ref(false)

function triggerProd() { prodInput.value?.click() }
function onProdChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) prodFile.value = target.files[0]
}
async function importProdutos() {
   if (!prodFile.value) return
   prodUploading.value = true
   try {
     await api.produtos.import(prodFile.value)
     prodFile.value = null
     auth.triggerRefreshNotas()
     alert('Produtos importados com sucesso!')
   } catch (e: any) {
     alert(e.message || 'Erro ao importar')
   } finally {
     prodUploading.value = false
   }
 }

// Import Notas
const notaInput = ref<HTMLInputElement>()
const notaFile = ref<File | null>(null)
const notaUploading = ref(false)

function triggerNota() { notaInput.value?.click() }
function onNotaChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) notaFile.value = target.files[0]
}
async function importNotas() {
   if (!notaFile.value) return
   notaUploading.value = true
   try {
     await api.notas.import(notaFile.value)
     notaFile.value = null
     auth.triggerRefreshNotas()
     alert('Notas importadas com sucesso!')
   } catch (e: any) {
     alert(e.message || 'Erro ao importar')
   } finally {
     notaUploading.value = false
   }
 }

// Export
const exporting = ref(false)
async function exportRelatorio() {
  exporting.value = true
  try {
    const blob = await api.reports.exportXlsx()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'conferencias.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  } catch (e: any) {
    alert(e.message || 'Erro ao exportar')
  } finally {
    exporting.value = false
  }
}

// Users
const users = ref<any[]>([])
const usersLoading = ref(true)
const newUsername = ref('')
const newPassword = ref('')
const newRole = ref('operador')
const creatingUser = ref(false)

async function loadUsers() {
  try {
    const res = await api.auth.users.list()
    users.value = res.data
  } catch (e) {
    users.value = []
  } finally {
    usersLoading.value = false
  }
}

async function createUser() {
  if (!newUsername.value || !newPassword.value) return
  creatingUser.value = true
  try {
    await api.auth.users.create({
      username: newUsername.value,
      password: newPassword.value,
      role: newRole.value,
    })
    newUsername.value = ''
    newPassword.value = ''
    newRole.value = 'operador'
    await loadUsers()
  } catch (e: any) {
    alert(e.message || 'Erro ao criar usuário')
  } finally {
    creatingUser.value = false
  }
}

async function deleteUser(id: number) {
  if (!confirm('Remover este usuário?')) return
  try {
    await api.auth.users.delete(id)
    await loadUsers()
  } catch (e: any) {
    alert(e.message || 'Erro ao remover usuário')
  }
}

onMounted(loadUsers)
</script>