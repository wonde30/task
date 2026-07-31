<template>
  <div class="max-w-2xl mx-auto space-y-4">
    <div class="card p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-400 text-white font-bold text-lg shadow-sm">
              {{ initials }}
            </div>
            <span class="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
          </div>
          <div>
            <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ auth.user?.name }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ auth.user?.email }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
              <CalendarDays class="h-3 w-3" />
              Joined {{ joinedDate }}
            </p>
          </div>
        </div>

        <button @click="showSignOutModal = true" class="btn-danger btn-sm">
          <LogOut class="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="card-header">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60">
            <User class="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Identity</h2>
            <p class="text-xs text-slate-400 dark:text-slate-500">Name & email address</p>
          </div>
        </div>
        <div v-show="profileSaved" class="badge-success">
          <CheckCircle2 class="h-3 w-3" />
          Saved
        </div>
      </div>

      <div class="card-body space-y-4">
        <div>
          <label class="label" for="pf-name">Full name <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
          <div class="relative">
            <input
              id="pf-name"
              v-model="profile.name"
              @blur="touchProfile('name')"
              @input="profileTouched.name && validateProfileName()"
              class="input pr-9"
              :class="{
                'input-error': profileErrors.name,
                'input-success': profileTouched.name && !profileErrors.name && profile.name.trim()
              }"
              placeholder="Your full name"
              autocomplete="name"
              maxlength="100"
              :aria-invalid="!!profileErrors.name"
              :aria-describedby="profileErrors.name ? 'pf-name-err' : undefined"
            />
            <CheckCircle2 v-if="profileTouched.name && !profileErrors.name && profile.name.trim()" class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
          </div>
          <p v-if="profileErrors.name" id="pf-name-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
            <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {{ profileErrors.name }}
          </p>
        </div>

        <div>
          <label class="label" for="pf-email">Email address <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
          <div class="relative">
            <input
              id="pf-email"
              v-model="profile.email"
              type="email"
              @blur="touchProfile('email')"
              @input="profileTouched.email && validateProfileEmail()"
              class="input pr-9"
              :class="{
                'input-error': profileErrors.email,
                'input-success': profileTouched.email && !profileErrors.email && profile.email.trim()
              }"
              placeholder="you@example.com"
              autocomplete="email"
              :aria-invalid="!!profileErrors.email"
              :aria-describedby="profileErrors.email ? 'pf-email-err' : undefined"
            />
            <CheckCircle2 v-if="profileTouched.email && !profileErrors.email && profile.email.trim()" class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
          </div>
          <p v-if="profileErrors.email" id="pf-email-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
            <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {{ profileErrors.email }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-6 py-4 bg-slate-50/60 dark:bg-slate-800/60">
        <span class="text-xs text-slate-400 dark:text-slate-500">Changes apply immediately</span>
        <button @click="updateProfile" :disabled="saving || !!Object.keys(profileErrors).length" class="btn-primary btn-sm">
          <Loader2 v-if="saving" class="h-3.5 w-3.5 animate-spin" />
          <Save v-else class="h-3.5 w-3.5" />
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="card-header">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60">
            <Lock class="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Change password</h2>
            <p class="text-xs text-slate-400 dark:text-slate-500">Update your login credentials</p>
          </div>
        </div>
      </div>

      <div class="card-body space-y-4">
        <div>
          <label class="label" for="pw-current">Current password <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
          <div class="relative">
            <input
              id="pw-current"
              v-model="password.current_password"
              :type="showCurrent ? 'text' : 'password'"
              @blur="touchPass('current_password')"
              @input="passTouched.current_password && validatePassField('current_password')"
              class="input pr-10"
              :class="{ 'input-error': passErrors.current_password }"
              placeholder="••••••••"
              autocomplete="current-password"
              :aria-invalid="!!passErrors.current_password"
              :aria-describedby="passErrors.current_password ? 'pw-curr-err' : undefined"
            />
            <button type="button" @click="showCurrent = !showCurrent" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <Eye v-if="!showCurrent" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </button>
          </div>
          <p v-if="passErrors.current_password" id="pw-curr-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
            <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {{ passErrors.current_password }}
          </p>
        </div>

        <div>
          <label class="label" for="pw-new">New password <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
          <div class="relative">
            <input
              id="pw-new"
              v-model="password.password"
              :type="showNew ? 'text' : 'password'"
              @blur="touchPass('password')"
              @input="passTouched.password && validatePassField('password'); passTouched.password_confirmation && validatePassField('password_confirmation')"
              class="input pr-10"
              :class="{
                'input-error': passErrors.password,
                'input-success': passTouched.password && !passErrors.password && password.password
              }"
              placeholder="••••••••"
              autocomplete="new-password"
              :aria-invalid="!!passErrors.password"
              :aria-describedby="passErrors.password ? 'pw-new-err' : 'pw-strength'"
            />
            <button type="button" @click="showNew = !showNew" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <Eye v-if="!showNew" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </button>
          </div>
          <p v-if="passErrors.password" id="pw-new-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
            <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {{ passErrors.password }}
          </p>
        </div>

        <div>
          <label class="label" for="pw-confirm">Confirm password <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
          <div class="relative">
            <input
              id="pw-confirm"
              v-model="password.password_confirmation"
              :type="showConfirm ? 'text' : 'password'"
              @blur="touchPass('password_confirmation')"
              @input="passTouched.password_confirmation && validatePassField('password_confirmation')"
              class="input pr-10"
              :class="{
                'input-error': passErrors.password_confirmation,
                'input-success': passTouched.password_confirmation && !passErrors.password_confirmation && password.password_confirmation
              }"
              placeholder="••••••••"
              autocomplete="new-password"
              :aria-invalid="!!passErrors.password_confirmation"
              :aria-describedby="passErrors.password_confirmation ? 'pw-conf-err' : undefined"
            />
            <button type="button" @click="showConfirm = !showConfirm" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <Eye v-if="!showConfirm" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </button>
          </div>
          <p v-if="passErrors.password_confirmation" id="pw-conf-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
            <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {{ passErrors.password_confirmation }}
          </p>
        </div>

        <div v-if="password.password" class="flex items-center gap-3" id="pw-strength">
          <div class="flex gap-1 flex-1">
            <div
              v-for="i in 4"
              :key="i"
              class="h-1 rounded-full flex-1 transition-colors"
              :class="i <= passwordStrength.score ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'"
            />
          </div>
          <span class="text-xs font-medium" :style="{ color: passwordStrength.hex }">
            {{ passwordStrength.label }}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-6 py-4 bg-slate-50/60 dark:bg-slate-800/60">
        <span class="text-xs text-slate-400 dark:text-slate-500">You'll be signed out after updating</span>
        <button @click="changePassword" :disabled="savingPass || !!Object.keys(passErrors).length" class="btn-primary btn-sm">
          <Loader2 v-if="savingPass" class="h-3.5 w-3.5 animate-spin" />
          <KeyRound v-else class="h-3.5 w-3.5" />
          {{ savingPass ? 'Updating…' : 'Update password' }}
        </button>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showSignOutModal" class="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 flex items-center justify-center z-modal" @click.self="showSignOutModal = false">
        <div class="card max-w-sm w-full mx-4 p-6">
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60">
              <LogOut class="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Sign out?</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                You will be signed out of your account. You'll need to log in again to access your tasks.
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button @click="showSignOutModal = false" class="btn-secondary">
              Stay signed in
            </button>
            <button @click="performLogout" class="btn-danger">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { getInitials, formatDate } from '../utils/format'
import {
  Loader2, LogOut, AlertCircle, Eye, EyeOff,
  User, Lock, KeyRound, Save, CheckCircle2,
  CalendarDays,
} from '@lucide/vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const showSignOutModal = ref(false)

const saving = ref(false)
const savingPass = ref(false)
const profileSaved = ref(false)
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const profile = reactive({ name: auth.user?.name ?? '', email: auth.user?.email ?? '' })
const password = reactive({ current_password: '', password: '', password_confirmation: '' })

const profileTouched = reactive<Record<string, boolean>>({})
const profileErrors = reactive<Record<string, string>>({})

function touchProfile(field: string) {
  profileTouched[field] = true
  if (field === 'name') validateProfileName()
  if (field === 'email') validateProfileEmail()
}

function validateProfileName(): boolean {
  const v = profile.name.trim()
  if (!v) profileErrors.name = 'Name is required'
  else if (v.length < 2) profileErrors.name = 'At least 2 characters'
  else if (v.length > 100) profileErrors.name = 'Max 100 characters'
  else delete profileErrors.name
  return !profileErrors.name
}

function validateProfileEmail(): boolean {
  const v = profile.email.trim()
  if (!v) profileErrors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) profileErrors.email = 'Invalid email address'
  else delete profileErrors.email
  return !profileErrors.email
}

const passTouched = reactive<Record<string, boolean>>({})
const passErrors = reactive<Record<string, string>>({})

function touchPass(field: string) {
  passTouched[field] = true
  validatePassField(field)
}

function validatePassField(field: string): boolean {
  switch (field) {
    case 'current_password':
      if (!password.current_password) passErrors.current_password = 'Required'
      else delete passErrors.current_password
      break
    case 'password':
      if (!password.password) passErrors.password = 'Required'
      else if (password.password.length < 8) passErrors.password = 'Min. 8 characters'
      else if (password.password === password.current_password && password.current_password)
        passErrors.password = 'Must differ from current'
      else delete passErrors.password
      break
    case 'password_confirmation':
      if (!password.password_confirmation) passErrors.password_confirmation = 'Required'
      else if (password.password_confirmation !== password.password)
        passErrors.password_confirmation = "Doesn't match"
      else delete passErrors.password_confirmation
      break
  }
  return !passErrors[field]
}

const passwordStrength = computed(() => {
  const p = password.password
  if (!p) return { score: 0, label: '', hex: '' }
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s = Math.min(s + 1, 4)
  const levels = [
    { label: 'Too weak', hex: '#f87171' },
    { label: 'Weak', hex: '#fb923c' },
    { label: 'Fair', hex: '#fbbf24' },
    { label: 'Strong', hex: '#34d399' },
    { label: 'Very strong', hex: '#10b981' },
  ]
  return { score: Math.min(s, 4) + 1, ...levels[Math.min(s, 4)] }
})

const initials = computed(() => getInitials(auth.user?.name ?? 'U'))

const joinedDate = computed(() => formatDate(auth.user?.created_at))

async function updateProfile() {
  profileTouched.name = true
  profileTouched.email = true
  if (!validateProfileName() || !validateProfileEmail()) return
  saving.value = true
  try {
    await auth.updateProfile(profile)
    profileSaved.value = true
    setTimeout(() => { profileSaved.value = false }, 2500)
    toast.success('Profile updated')
  } catch (err: any) {
    const e = err?.response?.data?.errors
    if (e?.email) profileErrors.email = e.email[0]
    else toast.error(err?.response?.data?.message ?? 'Failed to update profile')
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  const fields = ['current_password', 'password', 'password_confirmation'] as const
  fields.forEach(f => {
    passTouched[f] = true
    validatePassField(f)
  })
  if (Object.keys(passErrors).length) return
  savingPass.value = true
  try {
    await auth.changePassword(password)
    toast.success('Password updated — please sign in again')
    password.current_password = ''
    password.password = ''
    password.password_confirmation = ''
    Object.keys(passTouched).forEach(k => { passTouched[k] = false })
    Object.keys(passErrors).forEach(k => { delete passErrors[k] })
  } catch (err: any) {
    const e = err?.response?.data?.errors
    if (e?.current_password) passErrors.current_password = 'Incorrect password'
    else toast.error(err?.response?.data?.message ?? 'Failed to update password')
  } finally {
    savingPass.value = false
  }
}

function performLogout() {
  auth.logout()
  toast.success('Signed out')
  showSignOutModal.value = false
  router.push({ name: 'login' })
}
</script>