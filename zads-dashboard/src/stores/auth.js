import api from '@/services/api'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
    }),

    getters: {
        isAuthenticated: state => !!state.token,
        isAdmin: state => state.user?.userType === 'admin',
    },

    actions: {
        async login(phone, password) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/auth/login', { phone, password })

                // Check if user is admin
                if (response.data.user.userType !== 'admin') {
                    throw new Error('غير مصرح لك بالدخول')
                }

                this.user = response.data.user
                this.token = response.data.token

                // Persist to localStorage
                localStorage.setItem('user', JSON.stringify(this.user))
                localStorage.setItem('token', this.token)

                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async getProfile() {
            try {
                const response = await api.get('/auth/profile')

                this.user = response.data.user
                localStorage.setItem('user', JSON.stringify(this.user))

                return response.data
            } catch (error) {
                this.logout()
                throw error
            }
        },

        logout() {
            this.user = null
            this.token = null
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        },
    },
})
