<template>
  <div class="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">

      <div class="mb-8 text-center">
        <div class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 shadow-xs mb-4">
          <CheckSquare class="h-5 w-5 text-white" :stroke-width="2.5" />
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h1>
        <p class="mt-1.5 text-sm text-slate-400 dark:text-slate-500">Sign in to your TaskFlow account</p>
      </div>

      <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 shadow-sm">
        <form @submit.prevent="handleLogin" novalidate class="space-y-5">

          <div>
            <label for="email" class="label">Email <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              @blur="touch('email')"
              @input="touched.email && validateEmail()"
              class="input"
              :class="errors.email
                ? 'input-error'
                : (touched.email && !errors.email && form.email
                    ? 'input-success'
                    : '')"
              placeholder="you@example.com"
              autocomplete="email"
              :aria-invalid="!!errors.email"
              :aria-describedby="errors.email ? 'email-err' : undefined"
            />
            <p v-if="errors.email" id="email-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
              <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {{ errors.email }}
            </p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="password" class="label mb-0">Password <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
              <a href="#" class="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                Forgot password?
              </a>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                @blur="touch('password')"
                @input="touched.password && validatePassword()"
                class="input pr-11"
                :class="errors.password ? 'input-error' : ''"
                placeholder="••••••••"
                autocomplete="current-password"
                :aria-invalid="!!errors.password"
                :aria-describedby="errors.password ? 'pass-err' : undefined"
              />
              <button
                type="button"
                @click="showPass = !showPass"
                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                :aria-label="showPass ? 'Hide password' : 'Show password'"
              >
                <Eye v-if="!showPass" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
            <p v-if="errors.password" id="pass-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
              <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {{ errors.password }}
            </p>
          </div>

          <label class="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              v-model="form.remember"
              class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-slate-600 dark:text-slate-300">Remember me</span>
          </label>

          <Transition name="fade">
            <div v-if="apiError" class="flex items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-800/60 px-3.5 py-3">
              <AlertCircle class="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
              <p class="text-xs text-rose-600 dark:text-rose-300">{{ apiError }}</p>
            </div>
          </Transition>

          <button type="submit" :disabled="loading" class="btn-primary w-full">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>

        </form>
      </div>

      <p class="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?
        <router-link to="/register" class="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
          Sign up free
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { CheckSquare, Eye, EyeOff, Loader2, AlertCircle } from '@lucide/vue'

const router = useRouter()
const auth   = useAuthStore()
const toast  = useToast()

const form     = reactive({ email: '', password: '', remember: false })
const touched  = reactive<Record<string, boolean>>({})
const errors   = reactive<Record<string, string>>({})
const apiError = ref('')
const showPass = ref(false)
const loading  = ref(false)

function touch(field: string) {
  touched[field] = true
  if (field === 'email')    validateEmail()
  if (field === 'password') validatePassword()
}

function validateEmail(): boolean {
  if (!form.email.trim())                                      errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address'
  else                                                         delete errors.email
  return !errors.email
}

function validatePassword(): boolean {
  if (!form.password)                errors.password = 'Password is required'
  else if (form.password.length < 8) errors.password = 'Must be at least 8 characters'
  else                               delete errors.password
  return !errors.password
}

async function handleLogin() {
  touched.email    = true
  touched.password = true
  if (!validateEmail() || !validatePassword()) return

  loading.value  = true
  apiError.value = ''
  try {
    await auth.login(form)
    toast.success('Welcome back!')
    router.push({ name: 'dashboard' })
  } catch (e: any) {
    apiError.value = e.response?.data?.message ?? 'Incorrect email or password'
  } finally {
    loading.value = false
  }
}
</script>
