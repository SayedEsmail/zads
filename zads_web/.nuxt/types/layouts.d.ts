import type { ComputedRef, MaybeRef } from 'vue'
export type LayoutKey = "blank" | "components-dashboard-layout" | "components-default-layout-with-horizontal-nav" | "components-default-layout-with-vertical-nav" | "components-footer" | "components-nav-bar-notifications" | "components-nav-search-bar" | "components-navbar-shortcuts" | "components-navbar-theme-switcher" | "components-user-profile" | "default" | "public"
declare module "../../node_modules/.pnpm/nuxt@3.14.1592_eslint@8.57.1_rollup@4.57.1_sass@1.76.0_stylelint@16.8.0_typescript@5.9.3_vite@5.4.11/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}