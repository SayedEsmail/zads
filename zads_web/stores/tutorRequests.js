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
    }),

    actions: {
        async fetchTutorRequests(page = 1) {
            this.loading = true
            this.error = null

            try {
                const response = await api.get('/tutor-requests', {
                    params: {
                        page,
                        limit: this.pagination.limit,
                    },
                })

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
    },
})
