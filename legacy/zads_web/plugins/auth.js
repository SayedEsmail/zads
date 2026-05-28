import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
    const authStore = useAuthStore()

    // Initialize auth state from cookies
    authStore.init()
})
