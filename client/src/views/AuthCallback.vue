<template>
  <div class="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center px-4">
    <div class="text-center">
      <Loader2 class="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
      <h2 class="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">
        Logging you in…
      </h2>
      <p class="mt-1 text-sm text-slate-400 dark:text-slate-500">
        Please wait while we complete your sign in.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : null
  const error = typeof route.query.error === 'string' ? route.query.error : null

  if (error || !token) {
    if (error) console.error('OAuth login error:', error)
    authStore.clearSession()
    await router.replace({ name: 'login' })
    return
  }

  authStore.setToken(token)
  const user = await authStore.loadUser()

  if (user) {
    await router.replace({ name: 'dashboard' })
  } else {
    authStore.clearSession()
    await router.replace({ name: 'login' })
  }
})
</script>

