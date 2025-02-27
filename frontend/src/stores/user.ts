import { defineStore } from 'pinia'
import { login, getUserInfo } from '@/api/auth'
import type { LoginData } from '@/api/auth'

interface UserState {
  token: string
  userInfo: any
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: null
  }),
  
  actions: {
    async login(loginData: LoginData) {
      try {
        const res = await login(loginData)
        const token = res.access_token
        localStorage.setItem('token', token)
        this.token = token
        await this.getUserInfo()
        return true
      } catch (error) {
        return false
      }
    },
    
    async getUserInfo() {
      try {
        const res = await getUserInfo()
        this.userInfo = res
        return true
      } catch (error) {
        return false
      }
    },
    
    logout() {
      localStorage.removeItem('token')
      this.token = ''
      this.userInfo = null
    }
  }
}) 