import api from '~/services/api'
import { defineStore } from 'pinia'

export const useTeacherStore = defineStore('teacher', {
    state: () => ({
        profile: null,
        stats: null,
        loading: false,
        error: null,
    }),

    actions: {
        async fetchProfile() {
            this.loading = true
            this.error = null

            try {
                const response = await api.get('/teachers/me')
                this.profile = response.data?.teacher || null
                return this.profile
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateProfile(profileData) {
            this.loading = true
            this.error = null

            try {
                const response = await api.put('/teachers/me', profileData)
                this.profile = response.data || null
                return this.profile
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchStats() {
            this.loading = true
            this.error = null

            try {
                const response = await api.get('/teachers/me/stats')
                this.stats = response.data || null
                return this.stats
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },
    },
})
