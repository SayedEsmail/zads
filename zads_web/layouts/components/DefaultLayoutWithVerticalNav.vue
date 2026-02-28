<script setup>
import navItems from '@/navigation/vertical'
import { themeConfig } from '@themeConfig'
import { useAuthStore } from '~/stores/auth'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'

const authStore = useAuthStore()

const filteredNavItems = computed(() => {
  const userType = authStore.user?.userType
  if (!userType) return []
  
  return navItems.filter(item => {
    // If it's a heading, we handle it specially or just use a simple check
    if (item.heading) {
      if (userType === 'teacher') return item.heading.includes('Teacher')
      if (userType === 'parent') return item.heading.includes('Parent')
      return false
    }
    
    // For regular items, use the route name prefix
    if (userType === 'teacher') return item.to.name.startsWith('teacher')
    if (userType === 'parent') return item.to.name.startsWith('parent')
    
    return false
  })
})
</script>

<template>
  <VerticalNavLayout :nav-items="filteredNavItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center gap-x-2">
        <VBtn
          icon
          variant="text"
          color="default"
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="tabler-menu-2" />
        </VBtn>

        <VSpacer />

        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
        />
        <UserProfile />
      </div>
    </template>

    <!-- 👉 Navigation Header (Logo) -->
    <template #vertical-nav-header="{ toggleIsVerticalNavCollapsed }">
      <NuxtLink
        :to="authStore.user?.userType === 'teacher' ? '/teacher' : '/parent'"
        class="app-logo d-flex align-center gap-x-3"
      >
        <VNodeRenderer :nodes="themeConfig.app.logo" />
      </NuxtLink>

      <div
        class="vertical-nav-action cursor-pointer d-none d-lg-block"
        @click="toggleIsVerticalNavCollapsed"
      >
        <VIcon
          size="22"
          :icon="themeConfig.verticalNav.isVerticalNavCollapsed ? 'tabler-circle' : 'tabler-circle-dot'"
        />
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>
