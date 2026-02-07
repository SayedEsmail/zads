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
        if (import.meta.client) {
            const token = localStorage.getItem('token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
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
            if (import.meta.client) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/login'
            }
        }

        // Extract error message
        const message = response?.data?.message || error.message || 'An error occurred'

        return Promise.reject(new Error(message))
    },
)

export default api
