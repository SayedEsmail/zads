import api from '~/services/api'
import { defineStore } from 'pinia'

export const useChildrenStore = defineStore('children', {
    state: () => ({
        children: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchChildren() {
            this.loading = true
            this.error = null

            try {
                const response = await api.get('/parents/me/children')
                this.children = response.data || []
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        async addChild({ name, stageId, subjectIds }) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/parents/me/children', {
                    name,
                    stageId,
                    subjectIds: subjectIds || [],
                })
                await this.fetchChildren()
                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateChild({ childId, name, stageId, subjectIds }) {
            this.loading = true
            this.error = null

            try {
                const data = {}
                if (name !== undefined) data.name = name
                if (stageId !== undefined) data.stageId = stageId
                if (subjectIds !== undefined) data.subjectIds = subjectIds

                const response = await api.put(`/parents/me/children/${childId}`, data)
                await this.fetchChildren()
                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteChild(childId) {
            this.loading = true
            this.error = null

            try {
                await api.delete(`/parents/me/children/${childId}`)
                this.children = this.children.filter(c => c.id !== childId)
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },
    },
})
