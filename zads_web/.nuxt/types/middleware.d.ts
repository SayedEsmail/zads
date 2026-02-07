import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "sidebase-auth"
declare module "../../node_modules/.pnpm/nuxt@3.14.1592_eslint@8.57.1_rollup@4.57.1_sass@1.76.0_stylelint@16.8.0_typescript@5.9.3_vite@5.4.11/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}
declare module 'nitropack' {
  interface NitroRouteConfig {
    appMiddleware?: MiddlewareKey | MiddlewareKey[] | Record<MiddlewareKey, boolean>
  }
}