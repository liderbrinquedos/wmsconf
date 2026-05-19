<template>
  <div class="login-screen">
    <div class="login-box">
      <h2 class="login-title">Conferencia</h2>
      <p class="login-subtitle">Conferencia de notas fiscais</p>

      <form @submit.prevent="login" class="space-y-4 text-left">
        <div class="form-group">
          <label>Usuario</label>
          <input
            v-model="username"
            type="text"
            placeholder="admin"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="text-xs text-center py-2 rounded-[var(--radius-sm)]" :style="{ background: 'var(--danger)', color: 'white' }">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary w-full">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  if (!username.value || !password.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await api.auth.login(username.value, password.value)
    auth.setAuth(res.token, res.user)
    router.push('/home')
  } catch (e: any) {
    error.value = e.message || 'Erro ao fazer login'
  } finally {
    loading.value = false
  }
}
</script>
