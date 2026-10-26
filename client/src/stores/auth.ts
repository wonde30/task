import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/utils/api'

export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface AuthPayload {
  user: User
  token: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface ProfileInput {
  name: string
  email: string
}

export interface PasswordInput {
  current_password: string
  password: string
  password_confirmation: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  const authenticated = computed(() => Boolean(user.value))

  function setUser(value: User | null) {
    user.value = value
  }

  function setToken(token: string) {
    if (!token || token === 'undefined' || token === 'null') {
      clearSession()
      return
    }
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  function clearSession() {
    user.value = null
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  function loginWithGoogle() {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/auth/google`
  }

  async function login(payload: LoginInput): Promise<AuthPayload> {
    loading.value = true
    try {
      const { data } = await api.post<{ success?: boolean; data?: AuthPayload; user?: User; token?: string }>('/login', payload)
      const authData = (data.data && data.data.token ? data.data : data) as AuthPayload
      setToken(authData.token)
      setUser(authData.user)
      return authData
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterInput): Promise<AuthPayload> {
    loading.value = true
    try {
      const { data } = await api.post<{ success?: boolean; data?: AuthPayload; user?: User; token?: string }>('/register', payload)
      const authData = (data.data && data.data.token ? data.data : data) as AuthPayload
      setToken(authData.token)
      setUser(authData.user)
      return authData
    } finally {
      loading.value = false
    }
  }

  async function loadUser(): Promise<User | null> {
    const token = localStorage.getItem('token')
    if (!token || token === 'undefined' || token === 'null') {
      clearSession()
      return null
    }

    try {
      const { data } = await api.get<{ success?: boolean; data?: User }>('/user')
      const responseData = data as unknown as { data?: User; id?: number; email?: string }
      const fetchedUser = (responseData.data && responseData.data.id ? responseData.data : responseData) as User

      if (!fetchedUser || !fetchedUser.id) {
        clearSession()
        return null
      }

      setUser(fetchedUser)
      return fetchedUser
    } catch {
      clearSession()
      return null
    }
  }

  async function updateProfile(payload: ProfileInput): Promise<User> {
    const { data } = await api.put<{ success?: boolean; data?: User }>('/profile', payload)
    const responseData = data as unknown as { data?: User; id?: number }
    const updatedUser = (responseData.data && responseData.data.id ? responseData.data : responseData) as User
    setUser(updatedUser)
    return updatedUser
  }

  async function changePassword(payload: PasswordInput): Promise<unknown> {
    const { data } = await api.put<{ success?: boolean; data?: { token: string } }>('/password', payload)
    const responseData = data as unknown as { data?: { token: string }; token?: string }
    const res = responseData.data && responseData.data.token ? responseData.data : responseData
    if (res.token) {
      setToken(res.token)
    }
    return data
  }

  async function logout(): Promise<void> {
    try {
      await api.post('/logout')
    } finally {
      clearSession()
    }
  }

  return {
    user,
    loading,
    authenticated,

    setUser,
    setToken,
    clearSession,

    loginWithGoogle,
    login,
    register,
    loadUser,
    updateProfile,
    changePassword,
    logout,
  }
})