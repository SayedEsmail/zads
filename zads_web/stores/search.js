import api from '~/services/api'
import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
    state: () => ({
        teachers: [],
        loading: false,
        error: null,
        pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
        },
        filters: {
            governorateId: null,
            cityId: null,
            areaId: null,
            subjectId: null,
            stageId: null,
            lessonType: null,
            minPrice: null,
            maxPrice: null,
        },
        subjects: [],
        stages: [],
        governorates: [],
        cities: [],
        areas: [],
        isFilterDrawerOpen: false,
    }),

    getters: {
        hasFilters: state => {
            return Object.values(state.filters).some(v => v !== null)
        },
    },

    actions: {
        async searchTeachers(page = 1) {
            this.loading = true
            this.error = null

            try {
                const params = {
                    page,
                    limit: this.pagination.limit,
                }

                Object.entries(this.filters).forEach(([key, value]) => {
                    if (value !== null && value !== '') {
                        params[key] = value
                    }
                })

                const response = await api.get('/teachers/search', { params })

                this.teachers = response.data?.teachers || []
                this.pagination = {
                    page: response.data?.page || page,
                    limit: response.data?.limit || 20,
                    total: response.data?.total || 0,
                    totalPages: response.data?.totalPages || 0,
                }
            } catch (error) {
                this.error = error.message
                this.teachers = []
            } finally {
                this.loading = false
            }
        },

        async fetchSubjects() {
            try {
                const response = await api.get('/subjects')
                this.subjects = response.data || []
            } catch (error) {
                console.error('Failed to fetch subjects:', error)
            }
        },

        async fetchStages() {
            try {
                const response = await api.get('/stages')
                this.stages = response.data || []
            } catch (error) {
                console.error('Failed to fetch stages:', error)
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
                const response = await api.get(`/locations/cities/${governorateId}`)
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
                const response = await api.get(`/locations/areas/${cityId}`)
                this.areas = response.data || []
            } catch (error) {
                console.error('Failed to fetch areas:', error)
            }
        },

        setFilter(key, value) {
            this.filters[key] = value

            if (key === 'governorateId') {
                this.filters.cityId = null
                this.filters.areaId = null
                this.fetchCities(value)
            }
            if (key === 'cityId') {
                this.filters.areaId = null
                this.fetchAreas(value)
            }
        },

        clearFilters() {
            this.filters = {
                governorateId: null,
                cityId: null,
                areaId: null,
                subjectId: null,
                stageId: null,
                lessonType: null,
                minPrice: null,
                maxPrice: null,
            }
            this.cities = []
            this.areas = []
        },

        async initReferenceData() {
            await Promise.all([
                this.fetchSubjects(),
                this.fetchStages(),
                this.fetchGovernorates(),
            ])
        },

        toggleFilterDrawer() {
            this.isFilterDrawerOpen = !this.isFilterDrawerOpen
        },
    },
})
