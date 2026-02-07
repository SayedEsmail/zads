import { defu } from 'defu'

export const useApi = (url, options = {}) => {
  const { data: sessionData } = useAuth()
  const config = useRuntimeConfig()

  const defaults = {
    baseURL: config.public.apiBaseUrl,
    key: url,
    headers: sessionData.value?.accessToken
      ? { Authorization: `Bearer ${sessionData.value.accessToken}` }
      : {},
    onResponseError(_ctx) {
      // Handle 401 errors
      if (_ctx.response.status === 401) {
        // navigateTo('/login')
      }
    },
  }

  const params = defu(options, defaults)

  return useFetch(url, params)
}