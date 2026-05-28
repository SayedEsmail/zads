// 👉 Redirects for Zads Web
const redirects = [
  // Redirect root to login or dashboard based on auth status
  {
    path: '/',
    name: 'index',
    meta: {
      middleware: to => {
        const { status, data: sessionData } = useAuth()

        const isLoggedIn = status.value === 'authenticated'
        const userRole = sessionData.value?.user?.role

        if (isLoggedIn) {
          // Redirect based on role
          if (userRole === 'parent')
            return { name: 'parent' }
          if (userRole === 'teacher')
            return { name: 'teacher' }

          // Default dashboard
          return { name: 'second-page' }
        }

        // Not logged in, go to login
        return { name: 'login', query: to.query }
      },
    },
    component: h('div'),
  },
]

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default {
  routes: scannedRoutes => [
    ...redirects,
    ...scannedRoutes,
  ],
  scrollBehaviorType: 'smooth',
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }

    return { top: 0 }
  },
}