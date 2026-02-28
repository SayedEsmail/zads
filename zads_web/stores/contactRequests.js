import api from '~/services/api'
import { defineStore } from 'pinia'

export const useContactRequestsStore = defineStore('contactRequests', {
    state: () => ({
        requests: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchMyRequests() {
            this.loading = true
            this.error = null

            try {
                const response = await api.get('/contact-requests/my')
                this.requests = response.data || []
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        async createRequest({ teacherId, childId, message }) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/contact-requests', {
                    teacherId,
                    childId,
                    message,
                })
                await this.fetchMyRequests()
                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // --- Teacher Specific Actions ---

        async fetchIncomingRequests() {
            this.loading = true
            this.error = null

            try {
                const response = await api.get('/contact-requests/incoming')
                this.requests = response.data || []
                return this.requests
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateRequestStatus(requestId, status) {
            this.loading = true
            this.error = null

            try {
                const response = await api.patch(`/contact-requests/${requestId}/status`, { status })
                await this.fetchIncomingRequests() // Refresh the list
                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },
    },
})
