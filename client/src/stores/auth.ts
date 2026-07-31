import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const login = async (credentials: { email: string; password: string }) => {
    const { data } = await api.post('/login', credentials)
    user.value = data.data.user
    localStorage.setItem('token', data.data.token)
    return data.data
  }

  const register = async (userData: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => {
    const { data } = await api.post('/register', userData)
    user.value = data.data.user
    localStorage.setItem('token', data.data.token)
    return data.data
  }

  const fetchUser = async () => {
    const { data } = await api.get('/user')
    user.value = data.data
  }

  const updateProfile = async (profileData: { name: string; email: string }) => {
    const { data } = await api.put('/profile', profileData)
    if (user.value) {
      user.value = { ...user.value, ...data.data }
    } else {
      user.value = data.data
    }
    return data.data
  }

  const changePassword = async (passwordData: {
    current_password: string
    password: string
    password_confirmation: string
  }) => {
    const { data } = await api.put('/password', passwordData)
    if (data.data?.token) localStorage.setItem('token', data.data.token)
    return data.data
  }

  const logout = () => {
    api.post('/logout').catch(() => {})
    user.value = null
    localStorage.removeItem('token')
  }

  return { user, login, register, fetchUser, updateProfile, changePassword, logout }
})
