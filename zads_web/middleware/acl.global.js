import { canNavigate } from '@layouts/plugins/casl'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(to => {
  /*
         * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
         * Examples of public routes are, 404, under maintenance, etc.
         */
  if (to.meta.public)
    return

  const authStore = useAuthStore()
  const isLoggedIn = authStore.isAuthenticated

  console.log('ACL Middleware:', { to: to.fullPath, isLoggedIn, canNavigate: canNavigate(to) })

  /*
          If user is logged in and is trying to access login like page, redirect to home
          else allow visiting the page
          (WARN: Don't allow executing further by return statement because next code will check for permissions)
         */
  if (to.meta.unauthenticatedOnly) {
    if (isLoggedIn) {
      if (authStore.userType?.toUpperCase() === 'TEACHER') return navigateTo('/teacher')
      if (authStore.userType?.toUpperCase() === 'PARENT') return navigateTo('/parent')
      return navigateTo('/')
    } else {
      return undefined
    }
  }
  if (!canNavigate(to) && to.matched.length) {
    /* eslint-disable indent */
    return navigateTo(isLoggedIn
      ? { name: 'not-authorized' }
      : {
        name: 'login',
        query: {
          ...to.query,
          to: to.fullPath !== '/' ? to.path : undefined,
        },
      })
    /* eslint-enable indent */
  }
})