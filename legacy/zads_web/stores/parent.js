import api from '~/services/api'
import { defineStore } from 'pinia'

export const useParentStore = defineStore('parent', {
    state: () => ({
        profile: null,
        loading: false,
        error: null,
        // Location cascading
        governorates: [],
        cities: [],
        areas: [],
    }),

    getters: {
        isProfileComplete: state => {
            return state.profile?.areaId != null
        },
    },

    actions: {
        async fetchProfile() {
            this.loading = true
            this.error = null

            try {
                const response = await api.get('/parents/me')
                this.profile = response.data
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        async updateProfile({ areaId }) {
            this.loading = true
            this.error = null

            try {
                const response = await api.put('/parents/me', { areaId })
                this.profile = response.data
                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchGovernorates() {
            try {
                const response = await api.get('/locations/governorates')
                this.governorates = response.data || []
            } catch (error) {
                console.error('Failed to fetch governorates:', error)
            }
        },

        async fetchCities(governorateId) {
            if (!governorateId) {
                this.cities = []
                this.areas = []
                return
            }
            try {
                const response = await api.get(`/locations/governorates/${governorateId}/cities`)
                this.cities = response.data || []
                this.areas = []
            } catch (error) {
                console.error('Failed to fetch cities:', error)
            }
        },

        async fetchAreas(cityId) {
            if (!cityId) {
                this.areas = []
                return
            }
            try {
                const response = await api.get(`/locations/cities/${cityId}/areas`)
                this.areas = response.data || []
            } catch (error) {
                console.error('Failed to fetch areas:', error)
            }
        },
    },
})
