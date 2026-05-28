import api from '~/services/api'
import { defineStore } from 'pinia'

export const useTutorRequestsStore = defineStore('tutorRequests', {
    state: () => ({
        requests: [],
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
        },
        myRequests: [],
    }),

    actions: {
        async fetchTutorRequests(page = 1) {
            this.loading = true
            this.error = null

            try {
                const params = {
                    page,
                    limit: this.pagination.limit,
                    governorateId: this.filters.governorateId || undefined,
                    cityId: this.filters.cityId || undefined,
                    areaId: this.filters.areaId || undefined,
                }

                const response = await api.get('/tutor-requests', { params })

                this.requests = response.data || []
                this.pagination = {
                    page: response.pagination?.page || page,
                    limit: response.pagination?.limit || 20,
                    total: response.pagination?.total || 0,
                    totalPages: response.pagination?.totalPages || 0,
                }

                return this.requests
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchMyRequests() {
            this.loading = true
            this.error = null

            try {
                const response = await api.get('/tutor-requests/my')
                this.myRequests = response.data || []
                return this.myRequests
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async createRequest(payload) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/tutor-requests', payload)
                this.myRequests.unshift({ ...response.data, contactCount: 0 })
                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async closeRequest(requestId) {
            this.loading = true
            try {
                const response = await api.patch(`/tutor-requests/${requestId}/close`)
                const index = this.myRequests.findIndex(r => r.id === requestId)
                if (index !== -1) {
                    this.myRequests[index] = { ...this.myRequests[index], ...response.data }
                }
                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteRequest(requestId) {
            this.loading = true
            try {
                await api.delete(`/tutor-requests/${requestId}`)
                this.myRequests = this.myRequests.filter(r => r.id !== requestId)
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },
    },
})
