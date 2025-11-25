import { defineStore } from 'pinia'
import { login as loginApi, getUserInfo } from '../api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    permissions: []
  }),

  actions: {
    async login(credentials) {
      try {
        const response = await loginApi(credentials)
        if (response.success) {
          this.token = response.data.token
          localStorage.setItem('token', this.token)
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: '登录失败' }
      }
    },

    async fetchUserInfo() {
      try {
        const response = await getUserInfo()
        if (response.success) {
          this.userInfo = response.data
          return true
        }
        return false
      } catch (error) {
        return false
      }
    },

    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
    }
  }
})