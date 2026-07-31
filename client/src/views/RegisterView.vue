<template>
  <div class="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-sm">

      <div class="mb-8 text-center">
        <div class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 shadow-xs mb-4">
          <CheckSquare class="h-5 w-5 text-white" :stroke-width="2.5" />
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Create an account</h1>
        <p class="mt-1.5 text-sm text-slate-400 dark:text-slate-500">Free forever. No credit card needed.</p>
      </div>

      <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 shadow-sm">
        <form @submit.prevent="handleRegister" novalidate class="space-y-5">

          <div>
            <label for="name" class="label">Full name <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              @blur="touch('name')"
              @input="touched.name && validate('name')"
              class="input"
              :class="fieldClass('name')"
              placeholder="Your name"
              autocomplete="name"
              maxlength="100"
              :aria-invalid="!!errors.name"
              :aria-describedby="errors.name ? 'reg-name-err' : undefined"
            />
            <p v-if="errors.name" id="reg-name-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
              <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {{ errors.name }}
            </p>
          </div>

          <div>
            <label for="email" class="label">Email <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              @blur="touch('email')"
              @input="touched.email && validate('email')"
              class="input"
              :class="fieldClass('email')"
              placeholder="you@example.com"
              autocomplete="email"
              :aria-invalid="!!errors.email"
              :aria-describedby="errors.email ? 'reg-email-err' : undefined"
            />
            <p v-if="errors.email" id="reg-email-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
              <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {{ errors.email }}
            </p>
          </div>

          <div>
            <label for="password" class="label">Password <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                @blur="touch('password')"
                @input="touched.password && validate('password'); touched.password_confirmation && validate('password_confirmation')"
                class="input pr-11"
                :class="fieldClass('password')"
                placeholder="Min. 8 characters"
                autocomplete="new-password"
                :aria-invalid="!!errors.password"
                :aria-describedby="errors.password ? 'reg-pass-err' : undefined"
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
            <div v-if="form.password" class="mt-2 space-y-1">
              <div class="flex gap-1">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-1 flex-1 rounded-full transition-colors duration-200"
                  :class="i <= strength.score ? strength.barColor : 'bg-slate-100 dark:bg-slate-800'"
                />
              </div>
              <p class="text-2xs font-medium" :class="strength.textColor">{{ strength.label }}</p>
            </div>
            <p v-if="errors.password" id="reg-pass-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
              <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {{ errors.password }}
            </p>
          </div>

          <div>
            <label for="password_confirmation" class="label">Confirm password <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
            <div class="relative">
              <input
                id="password_confirmation"
                v-model="form.password_confirmation"
                :type="showConfirm ? 'text' : 'password'"
                @blur="touch('password_confirmation')"
                @input="touched.password_confirmation && validate('password_confirmation')"
                class="input pr-11"
                :class="fieldClass('password_confirmation')"
                placeholder="Repeat password"
                autocomplete="new-password"
                :aria-invalid="!!errors.password_confirmation"
                :aria-describedby="errors.password_confirmation ? 'reg-conf-err' : undefined"
              />
              <button
                type="button"
                @click="showConfirm = !showConfirm"
                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                :aria-label="showConfirm ? 'Hide password' : 'Show password'"
              >
                <Eye v-if="!showConfirm" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
            <p v-if="errors.password_confirmation" id="reg-conf-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
              <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {{ errors.password_confirmation }}
            </p>
          </div>

          <div>
            <label class="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                id="terms"
                type="checkbox"
                v-model="form.terms"
                @change="touched.terms = true"
                class="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                :class="errors.terms ? 'border-rose-400' : ''"
              />
              <span class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                I agree to the
                <a href="#" class="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Terms</a>
                and
                <a href="#" class="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Privacy Policy</a>
              </span>
            </label>
            <p v-if="errors.terms" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
              <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {{ errors.terms }}
            </p>
          </div>

          <Transition name="fade">
            <div
              v-if="apiError"
              class="flex items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-800/60 px-3.5 py-3"
            >
              <AlertCircle class="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
              <p class="text-xs text-rose-600 dark:text-rose-300">{{ apiError }}</p>
            </div>
          </Transition>

          <button type="submit" :disabled="loading" class="btn-primary w-full">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            {{ loading ? 'Creating account…' : 'Get started' }}
          </button>

        </form>
      </div>

      <p class="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?
        <router-link to="/login" class="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { CheckSquare, Eye, EyeOff, Loader2, AlertCircle } from '@lucide/vue'

const router = useRouter()
const auth   = useAuthStore()
const toast  = useToast()

const form     = reactive({ name: '', email: '', password: '', password_confirmation: '', terms: false })
const touched  = reactive<Record<string, boolean>>({})
const errors   = reactive<Record<string, string>>({})
const apiError = ref('')
const showPass    = ref(false)
const showConfirm = ref(false)
const loading     = ref(false)

function touch(field: string) {
  touched[field] = true
  validate(field)
}

function validate(field: string): boolean {
  switch (field) {
    case 'name': {
      const value = form.name.trim()
      if (!value)                errors.name = 'Name is required'
      else if (value.length < 2) errors.name = 'Name must be at least 2 characters'
      else if (value.length > 100) errors.name = 'Name cannot exceed 100 characters'
      else                       delete errors.name
      break
    }
    case 'email': {
      const value = form.email.trim()
      if (!value)                                          errors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Enter a valid email address'
      else                                                 delete errors.email
      break
    }
    case 'password':
      if (!form.password)                errors.password = 'Password is required'
      else if (form.password.length < 8) errors.password = 'Must be at least 8 characters'
      else                               delete errors.password
      break
    case 'password_confirmation':
      if (!form.password_confirmation)                             errors.password_confirmation = 'Please confirm your password'
      else if (form.password_confirmation !== form.password)       errors.password_confirmation = "Passwords don't match"
      else                                                         delete errors.password_confirmation
      break
    case 'terms':
      if (!form.terms) errors.terms = 'You must accept the terms to continue'
      else             delete errors.terms
      break
  }
  return !errors[field]
}

function validateAll(): boolean {
  const fields = ['name', 'email', 'password', 'password_confirmation', 'terms']
  fields.forEach(f => { touched[f] = true; validate(f) })
  return Object.keys(errors).length === 0
}

function fieldClass(field: string): string {
  if (errors[field]) return 'input-error'
  if (touched[field] && !errors[field] && (form as Record<string, unknown>)[field]) {
    return 'border-emerald-400 focus:border-emerald-400 focus:ring-emerald-500/10'
  }
  return ''
}

const strength = computed(() => {
  const p = form.password
  if (!p) return { score: 0, label: '', barColor: '', textColor: '' }

  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score++

  const levels = [
    { label: 'Too weak',    barColor: 'bg-rose-400',    textColor: 'text-rose-500'    },
    { label: 'Weak',        barColor: 'bg-amber-400',   textColor: 'text-amber-500'   },
    { label: 'Fair',        barColor: 'bg-yellow-400',  textColor: 'text-yellow-600'  },
    { label: 'Strong',      barColor: 'bg-emerald-400', textColor: 'text-emerald-600' },
    { label: 'Very strong', barColor: 'bg-emerald-500', textColor: 'text-emerald-700' },
  ]
  const s = Math.min(score, 4)
  return { score: s + 1, ...levels[s] }
})

async function handleRegister() {
  if (!validateAll()) return

  loading.value  = true
  apiError.value = ''
  try {
    await auth.register(form)
    toast.success('Account created — welcome!')
    router.push({ name: 'dashboard' })
  } catch (e: any) {
    const serverErrors = e?.response?.data?.errors
    if (serverErrors) {
      Object.entries(serverErrors as Record<string, string[]>).forEach(([key, msgs]) => {
        errors[key] = msgs[0] ?? ''
        touched[key] = true
      })
    } else {
      apiError.value = e?.response?.data?.message ?? 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>
