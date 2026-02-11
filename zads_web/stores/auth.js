import api from '~/services/api'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: useCookie('user').value || null,
        token: useCookie('token').value || null,
        loading: false,
        error: null,
    }),

    getters: {
        isAuthenticated: state => !!state.token,
        userType: state => state.user?.userType,
    },

    actions: {
        // Init logic not strictly needed with useCookie as it auto-initializes state
        init() {
            const tokenCookie = useCookie('token')
            const userCookie = useCookie('user')

            if (tokenCookie.value) {
                this.token = tokenCookie.value
                this.user = userCookie.value
                // Set default header for API

            }
        },

        async login(phone, password) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/auth/login', { phone, password })

                const tokenCookie = useCookie('token', { maxAge: 60 * 60 * 24 * 7 }) // 1 week
                const userCookie = useCookie('user', { maxAge: 60 * 60 * 24 * 7 })

                this.user = response.data.user
                this.token = response.data.token

                console.log('user', this.user);

                tokenCookie.value = this.token
                userCookie.value = this.user



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

                const tokenCookie = useCookie('token', { maxAge: 60 * 60 * 24 * 7 })
                const userCookie = useCookie('user', { maxAge: 60 * 60 * 24 * 7 })

                this.user = response.data.user
                this.token = response.data.token

                tokenCookie.value = this.token
                userCookie.value = this.user



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

                const tokenCookie = useCookie('token', { maxAge: 60 * 60 * 24 * 7 })
                const userCookie = useCookie('user', { maxAge: 60 * 60 * 24 * 7 })

                this.user = response.data.user
                this.token = response.data.token

                tokenCookie.value = this.token
                userCookie.value = this.user



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

            const tokenCookie = useCookie('token')
            const userCookie = useCookie('user')

            tokenCookie.value = null
            userCookie.value = null


        },
    },
})
