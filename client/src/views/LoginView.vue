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
        <!-- Google Auth Button -->
        <button
          @click="handleGoogleLogin"
          type="button"
          class="w-full inline-flex items-center justify-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
        >
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div class="my-6 relative flex items-center">
          <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span class="mx-4 text-xs font-medium text-slate-400 dark:text-slate-500">
            or continue with email
          </span>
          <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        <form @submit.prevent="handleLogin" novalidate class="space-y-5">
          <!-- Email -->
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

          <!-- Password -->
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

          <!-- Remember me -->
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              v-model="form.remember"
              class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-slate-600 dark:text-slate-300">Remember me</span>
          </label>

          <!-- API error -->
          <Transition name="fade">
            <div v-if="apiError" class="flex items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-800/60 px-3.5 py-3">
              <AlertCircle class="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
              <p class="text-xs text-rose-600 dark:text-rose-300">{{ apiError }}</p>
            </div>
          </Transition>

          <!-- Sign in button -->
          <button type="submit" :disabled="auth.loading" class="btn-primary w-full">
            <Loader2 v-if="auth.loading" class="h-4 w-4 animate-spin" />
            {{ auth.loading ? 'Signing in…' : 'Sign in' }}
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
import { CheckSquare, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-vue-next'
import type { AxiosError } from 'axios'

const router = useRouter()
const auth   = useAuthStore()
const toast  = useToast()

const form     = reactive({ email: '', password: '', remember: false })
const touched  = reactive<Record<string, boolean>>({})
const errors   = reactive<Record<string, string>>({})
const apiError = ref('')
const showPass = ref(false)

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

  apiError.value = ''
  try {
    await auth.login(form)
    toast.success('Welcome back!')
    await router.push({ name: 'dashboard' })
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>
    apiError.value = error.response?.data?.message ?? 'Incorrect email or password'
  }
}

function handleGoogleLogin() {
  auth.loginWithGoogle()
}
</script>