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
                const userAbilityRules = useCookie('userAbilityRules', { maxAge: 60 * 60 * 24 * 7 })

                this.user = response.data.user
                this.token = response.data.token

                console.log('user', this.user);

                tokenCookie.value = this.token
                userCookie.value = this.user

                // Define abilities based on userType
                const rules = []
                if (this.user.userType === 'ADMIN') {
                    rules.push({ action: 'manage', subject: 'all' })
                } else if (this.user.userType === 'PARENT') {
                    rules.push({ action: 'read', subject: 'Parent' })
                    rules.push({ action: 'manage', subject: 'Children' })
                    rules.push({ action: 'manage', subject: 'Requests' })
                } else if (this.user.userType === 'TEACHER') {
                    rules.push({ action: 'read', subject: 'Teacher' })
                    rules.push({ action: 'manage', subject: 'Subjects' })
                    rules.push({ action: 'manage', subject: 'IncomingRequests' })
                } else {
                    rules.push({ action: 'read', subject: 'Auth' })
                }
                userAbilityRules.value = rules

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
                const userAbilityRules = useCookie('userAbilityRules', { maxAge: 60 * 60 * 24 * 7 })

                this.user = response.data.user
                this.token = response.data.token

                tokenCookie.value = this.token
                userCookie.value = this.user

                // Define abilities for PARENT
                const rules = [
                    { action: 'read', subject: 'Parent' },
                    { action: 'manage', subject: 'Children' },
                    { action: 'manage', subject: 'Requests' }
                ]
                userAbilityRules.value = rules

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
                const userAbilityRules = useCookie('userAbilityRules', { maxAge: 60 * 60 * 24 * 7 })

                this.user = response.data.user
                this.token = response.data.token

                tokenCookie.value = this.token
                userCookie.value = this.user

                // Define abilities for TEACHER
                const rules = [
                    { action: 'read', subject: 'Teacher' },
                    { action: 'manage', subject: 'Subjects' },
                    { action: 'manage', subject: 'IncomingRequests' }
                ]
                userAbilityRules.value = rules

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
            const userAbilityRules = useCookie('userAbilityRules')

            tokenCookie.value = null
            userCookie.value = null
            userAbilityRules.value = null
        },
    },
})
