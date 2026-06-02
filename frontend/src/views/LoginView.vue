<template>
  <div class="login-screen">
    <div class="login-box card">
      <h2 class="text-2xl text-accent mb-8 font-display">LiderConf</h2>

      <form @submit.prevent="login">
        <div class="form-group mb-5 text-left">
          <label class="block text-xs text-text-muted font-bold uppercase tracking-widest mb-2">Usuário</label>
          <input
            v-model="username"
            type="text"
            placeholder="Seu usuário"
            autocomplete="username"
            class="w-full bg-bg border border-surface-light p-4 rounded text-text font-bold"
          />
        </div>

        <div class="form-group mb-5 text-left">
          <label class="block text-xs text-text-muted font-bold uppercase tracking-widest mb-2">Senha</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full bg-bg border border-surface-light p-4 rounded text-text font-bold"
          />
        </div>

        <div v-if="error" class="p-3 mb-4 rounded bg-danger/10 text-danger text-sm text-center font-bold">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" class="btn">
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

<style scoped>
.login-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.login-box {
  width: 100%;
  max-width: 350px;
  text-align: center;
}
</style>