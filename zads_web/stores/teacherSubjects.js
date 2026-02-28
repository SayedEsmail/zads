import api from '~/services/api'
import { defineStore } from 'pinia'

export const useTeacherSubjectsStore = defineStore('teacherSubjects', {
    state: () => ({
        subjects: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchMySubjects() {
            this.loading = true
            this.error = null

            try {
                const response = await api.get('/teachers/me/subjects')
                this.subjects = response.data || []
                return this.subjects
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async addSubject(subjectData) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/teachers/me/subjects', subjectData)
                await this.fetchMySubjects()
                return response.data
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateSubject(teacherSubjectId, updateData) {
            this.loading = true
            this.error = null

            try {
                const response = await api.put(`/teachers/me/subjects/${teacherSubjectId}`, updateData)
                await this.fetchMySubjects()
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
