import api from '~/services/api'
import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', {
    state: () => ({
        favorites: [],
        loading: false,
        error: null,
    }),

    getters: {
        isFavorite: state => teacherId => {
            return state.favorites.some(fav => fav.teacherId === teacherId)
        },

        favoriteTeachers: state => {
            return state.favorites.map(fav => fav.teacher).filter(Boolean)
        },
    },

    actions: {
        async fetchFavorites() {
            this.loading = true
            this.error = null

            try {
                const response = await api.get('/favorites')
                this.favorites = response.data || []
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        async addFavorite(teacherId) {
            try {
                await api.post('/favorites', { teacherId })
                await this.fetchFavorites()
                return true
            } catch (error) {
                this.error = error.message
                return false
            }
        },

        async removeFavorite(teacherId) {
            try {
                await api.delete(`/favorites/${teacherId}`)
                this.favorites = this.favorites.filter(f => f.teacherId !== teacherId)
                return true
            } catch (error) {
                this.error = error.message
                return false
            }
        },

        async toggleFavorite(teacherId) {
            if (this.isFavorite(teacherId)) {
                return await this.removeFavorite(teacherId)
            } else {
                return await this.addFavorite(teacherId)
            }
        },
    },
})
