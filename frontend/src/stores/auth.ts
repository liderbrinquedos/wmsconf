import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<any>(null)
  const refreshNotasCounter = ref(0)

  function setAuth(t: string, u: any) {
    token.value = t
    user.value = u
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function getHeaders() {
    return { Authorization: `Bearer ${token.value}` }
  }

  function triggerRefreshNotas() {
    refreshNotasCounter.value++
  }

  return { token, user, refreshNotasCounter, setAuth, logout, getHeaders, triggerRefreshNotas }
})