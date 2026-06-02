<template>
  <div class="min-h-screen bg-bg">
    <header v-if="isLoggedIn" class="border-b border-surface-light">
      <div class="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        <div class="brand">
          <h1 class="text-xl font-bold">LiderConf</h1>
          <span class="text-xs text-accent font-black tracking-widest">OPERATIONS</span>
        </div>
        
        <div class="flex items-center gap-3">
          <button v-if="isAdmin" @click="router.push('/settings')" class="p-2 text-text-muted hover:text-text transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
          </button>
          <button @click="handleLogout" class="px-3 py-1.5 bg-accent/10 border border-accent text-accent rounded text-xs font-black uppercase tracking-wider hover:bg-accent hover:text-white transition-all">
            Sair
          </button>
        </div>
      </div>
    </header>

    <main class="px-4 py-6 max-w-lg mx-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const auth = useAuthStore()
const isLoggedIn = computed(() => !!auth.token)
const isAdmin = computed(() => auth.user?.role === 'admin')

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
