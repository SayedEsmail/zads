import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// import GoogleProvider from 'next-auth/providers/google'
// const runtimeConfig = useRuntimeConfig()
export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  providers: [
    // GoogleProvider.default({
    //   clientId: runtimeConfig.public.AUTH_PROVIDER_GOOGLE_CLIENT_ID,
    //   clientSecret: runtimeConfig.AUTH_PROVIDER_GOOGLE_CLIENT_SECRET,
    // }),
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials) {
        try {
          const apiBaseUrl = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

          // Use NUXT_PUBLIC_API_BASE_URL which should point to the backend API (e.g. http://localhost:3000/api)
          const response = await $fetch(`${apiBaseUrl}/auth/login`, {
            method: 'POST',
            body: credentials,
          })

          if (response.success && response.data) {
            const { user, token } = response.data

            // Return user object with token to be saved in session
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              userType: user.userType,
              accessToken: token,
              // Map other fields as needed
            }
          }
          return null
        } catch (error) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Invalid phone or password',
          })
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.phone = user.phone
        token.userType = user.userType
        token.accessToken = user.accessToken
        token.name = user.name
      }
      return token
    },

    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id
        session.user.phone = token.phone
        session.user.userType = token.userType
        session.user.accessToken = token.accessToken
        session.user.name = token.name
      }
      return session
    },
  },
})
