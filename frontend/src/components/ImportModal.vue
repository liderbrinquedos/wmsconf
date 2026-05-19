<template>
  <div class="modal active" @click.self="$emit('close')">
    <div class="modal-sheet">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="modal-x" @click="$emit('close')">✕</button>
      </div>

      <div class="import-zone" @click="triggerFile" @dragover.prevent @drop.prevent="handleDrop">
        <span class="import-zone-icon">↑</span>
        <span>{{ selectedFile ? selectedFile.name : 'Selecionar arquivo' }}</span>
      </div>

      <input ref="fileInput" type="file" accept=".xlsx" class="hidden" @change="handleFileSelect" />

      <div class="modal-actions" v-if="selectedFile">
        <button class="btn btn-danger" @click="$emit('close')">Cancelar</button>
        <button class="btn btn-primary" @click="handleImport" :disabled="uploading">
          {{ uploading ? 'Importando...' : 'Importar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ title: string }>()
const emit = defineEmits<{ close: [], import: [file: File] }>()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const uploading = ref(false)

function triggerFile() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    selectedFile.value = target.files[0]
  }
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file && file.name.endsWith('.xlsx')) {
    selectedFile.value = file
  }
}

async function handleImport() {
  if (!selectedFile.value) return
  uploading.value = true
  try {
    emit('import', selectedFile.value)
  } finally {
    uploading.value = false
  }
}
</script>
