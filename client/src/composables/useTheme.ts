import { ref, computed, watchEffect } from 'vue'

export type ThemeOption = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

const theme = ref<ThemeOption>(
  (localStorage.getItem(STORAGE_KEY) as ThemeOption | null) ?? 'system',
)

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(t: ThemeOption) {
  const shouldBeDark = t === 'dark' || (t === 'system' && systemPrefersDark())
  document.documentElement.classList.toggle('dark', shouldBeDark)
}

watchEffect(() => applyTheme(theme.value))

const mq = window.matchMedia('(prefers-color-scheme: dark)')
mq.addEventListener('change', () => {
  if (theme.value === 'system') applyTheme('system')
})

export function useTheme() {
  const isDark = computed<boolean>(() => {
    if (theme.value === 'dark') return true
    if (theme.value === 'light') return false
    return systemPrefersDark()
  })

  function setTheme(t: ThemeOption) {
    theme.value = t
    localStorage.setItem(STORAGE_KEY, t)
  }

  function cycleTheme() {
    const order: ThemeOption[] = ['light', 'dark', 'system']
    const idx = order.indexOf(theme.value)
    const next = order[(idx === -1 ? 0 : idx + 1) % order.length] ?? 'system'
    setTheme(next)
  }

  return { theme, isDark, setTheme, cycleTheme }
}
