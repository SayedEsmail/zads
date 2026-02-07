import api from '@/services/api'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        loading: false,
        error: null,
    }),

    getters: {
        isAuthenticated: state => !!state.token,
        userType: state => state.user?.userType,
    },

    actions: {
        // Initialize from localStorage (call on app mount)
        init() {
            if (import.meta.client) {
                const storedUser = localStorage.getItem('user')
                const storedToken = localStorage.getItem('token')
                if (storedToken) {
                    this.token = storedToken
                    this.user = storedUser ? JSON.parse(storedUser) : null
                }
            }
        },

        async login(phone, password) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/auth/login', { phone, password })

                this.user = response.data.user
                this.token = response.data.token

                // Persist to localStorage
                if (import.meta.client) {
                    localStorage.setItem('user', JSON.stringify(this.user))
                    localStorage.setItem('token', this.token)
                }

                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async registerParent(name, phone, password) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/auth/register/parent', { name, phone, password })

                this.user = response.data.user
                this.token = response.data.token

                // Persist to localStorage
                if (import.meta.client) {
                    localStorage.setItem('user', JSON.stringify(this.user))
                    localStorage.setItem('token', this.token)
                }

                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async registerTeacher(name, phone, password) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/auth/register/teacher', { name, phone, password })

                this.user = response.data.user
                this.token = response.data.token

                // Persist to localStorage
                if (import.meta.client) {
                    localStorage.setItem('user', JSON.stringify(this.user))
                    localStorage.setItem('token', this.token)
                }

                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        logout() {
            this.user = null
            this.token = null
            if (import.meta.client) {
                localStorage.removeItem('user')
                localStorage.removeItem('token')
            }
        },
    },
})
