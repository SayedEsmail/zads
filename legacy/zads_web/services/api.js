import axios from 'axios'

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor - add auth token
api.interceptors.request.use(
    config => {
        try {
            const token = useCookie('token').value
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        } catch (e) {
            // usage outside nuxt context
        }
        return config
    },
    error => {
        return Promise.reject(error)
    },
)

// Response interceptor - handle errors
api.interceptors.response.use(
    response => response.data,
    error => {
        const { response } = error

        // Handle 401 - Unauthorized
        if (response?.status === 401) {
            // Let the app handle redirect via auth store/middleware
            if (import.meta.client) {
                // Optional: Emit event or use store to logout
                const tokenCookie = useCookie('token')
                const userCookie = useCookie('user')
                tokenCookie.value = null
                userCookie.value = null
                window.location.href = '/login'
            }
        }

        // Extract error message
        const message = response?.data?.message || (response?.data?.errors ? Object.values(response.data.errors).flat().join(', ') : error.message) || 'An error occurred'

        return Promise.reject(new Error(message))
    },
)

export default api
