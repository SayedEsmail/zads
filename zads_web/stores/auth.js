export const useAuthStore = defineStore('auth', () => {
    const { signIn, signOut, data: sessionData, status } = useAuth()

    const user = computed(() => sessionData.value?.user || null)
    const isAuthenticated = computed(() => status.value === 'authenticated')
    const token = computed(() => sessionData.value?.accessToken || null)

    async function login(credentials) {
        try {
            const result = await signIn('credentials', {
                ...credentials,
                redirect: false,
            })

            if (result?.error) {
                throw new Error(result.error)
            }

            return result
        } catch (error) {
            throw error
        }
    }

    async function logout() {
        await signOut({ callbackUrl: '/login' })
    }

    return {
        user,
        isAuthenticated,
        token,
        login,
        logout,
    }
})
