<template>
  <div class="modal active" @click.self="$emit('close')">
    <div class="modal-sheet">
      <div class="modal-header">
        <h3>Configuracoes</h3>
        <button class="modal-x" @click="$emit('close')">✕</button>
      </div>

      <!-- Importar Produtos -->
      <section class="settings-section">
        <h4>Importar Produtos</h4>
        <p class="settings-desc">Arquivo .xlsx com colunas: codprod, referencia, descprod, qtdemb, ean13, ean14</p>
        <div class="import-zone" @click="triggerProd" @dragover.prevent @drop.prevent="dropProd">
          <span class="import-zone-icon">↑</span>
          <span>{{ prodFile ? prodFile.name : 'Selecionar arquivo' }}</span>
        </div>
        <input ref="prodInput" type="file" accept=".xlsx" class="hidden" @change="onProdChange" />
        <button v-if="prodFile" class="btn btn-primary" @click="importProdutos" :disabled="prodUploading">
          {{ prodUploading ? 'Importando...' : 'Importar Produtos' }}
        </button>
      </section>

      <!-- Importar Notas -->
      <section class="settings-section">
        <h4>Importar Notas Fiscais</h4>
         <p class="settings-desc">Arquivo .xlsx com colunas: nunota, numnota, codparc, razaosocial, codprod, referencia, qtd</p>
        <div class="import-zone" @click="triggerNota" @dragover.prevent @drop.prevent="dropNota">
          <span class="import-zone-icon">↑</span>
          <span>{{ notaFile ? notaFile.name : 'Selecionar arquivo' }}</span>
        </div>
        <input ref="notaInput" type="file" accept=".xlsx" class="hidden" @change="onNotaChange" />
        <button v-if="notaFile" class="btn btn-primary" @click="importNotas" :disabled="notaUploading">
          {{ notaUploading ? 'Importando...' : 'Importar Notas' }}
        </button>
      </section>

      <!-- Exportar Relatorio -->
      <section class="settings-section">
        <h4>Exportar Relatorio</h4>
        <p class="settings-desc">Baixar planilha com todas as conferencias realizadas</p>
        <button class="btn btn-success" @click="exportRelatorio" :disabled="exporting">
          {{ exporting ? 'Gerando...' : '↓ Exportar XLSX' }}
        </button>
      </section>

      <!-- Usuarios -->
      <section class="settings-section">
        <h4>Usuarios</h4>
        <p class="settings-desc">Gerenciar usuarios do sistema</p>

        <div v-if="usersLoading" class="text-sm" :style="{ color: 'var(--text-secondary)' }">Carregando...</div>

        <div v-else class="space-y-2">
          <div v-for="u in users" :key="u.id" class="flex items-center justify-between py-2 px-3 rounded-[var(--radius-sm)]" :style="{ background: 'var(--surface-secondary)' }">
            <div class="flex items-center gap-2">
              <span class="text-sm" :style="{ color: 'var(--text)' }">{{ u.username }}</span>
              <span class="badge" :class="u.role === 'admin' ? 'badge-ok' : 'badge-pendente'">{{ u.role }}</span>
            </div>
            <button v-if="u.id !== currentUserId" @click="deleteUser(u.id)" class="text-xs px-2 py-1 rounded" :style="{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }">
              Remover
            </button>
          </div>
        </div>

        <div class="mt-4 p-3 rounded-[var(--radius-sm)]" :style="{ background: 'var(--surface-secondary)' }">
          <h5 class="text-sm font-medium mb-2" :style="{ color: 'var(--text)' }">Novo Usuario</h5>
          <div class="space-y-2">
            <input v-model="newUsername" type="text" placeholder="Usuario" class="w-full px-3 py-2 rounded text-sm outline-none" :style="{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }" />
            <input v-model="newPassword" type="password" placeholder="Senha" class="w-full px-3 py-2 rounded text-sm outline-none" :style="{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }" />
            <select v-model="newRole" class="w-full px-3 py-2 rounded text-sm outline-none" :style="{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }">
              <option value="operador">Operador</option>
              <option value="admin">Admin</option>
            </select>
            <button class="btn btn-primary w-full text-sm py-2" @click="createUser" :disabled="creatingUser">
              {{ creatingUser ? 'Criando...' : 'Criar Usuario' }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits<{ close: [] }>()

const auth = useAuthStore()
const currentUserId = auth.user?.id

// Import Produtos
const prodInput = ref<HTMLInputElement>()
const prodFile = ref<File | null>(null)
const prodUploading = ref(false)

function triggerProd() { prodInput.value?.click() }
function onProdChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) prodFile.value = target.files[0]
}
function dropProd(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file && file.name.endsWith('.xlsx')) prodFile.value = file
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
function dropNota(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file && file.name.endsWith('.xlsx')) notaFile.value = file
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
    alert(e.message || 'Erro ao criar usuario')
  } finally {
    creatingUser.value = false
  }
}

async function deleteUser(id: number) {
  if (!confirm('Remover este usuario?')) return
  try {
    await api.auth.users.delete(id)
    await loadUsers()
  } catch (e: any) {
    alert(e.message || 'Erro ao remover usuario')
  }
}

onMounted(loadUsers)
</script>
