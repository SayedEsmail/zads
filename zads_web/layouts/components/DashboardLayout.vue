<script setup>
import navItems from '@/navigation/vertical'
import { themeConfig } from '@themeConfig'
import { useAuthStore } from '~/stores/auth'

// Components
import Footer from '@/layouts/components/Footer.vue'
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
    if (item.heading) {
      if (userType === 'teacher') return item.heading.includes('Teacher')
      if (userType === 'parent') return item.heading.includes('Parent')
      return false
    }
    
    if (userType === 'teacher') return item.to.name.startsWith('teacher')
    if (userType === 'parent') return item.to.name.startsWith('parent')
    
    return false
  })
})

const isRightSidebarOpen = ref(true)

// Responsive strategy: Close right sidebar on mobile by default
const { width } = useWindowSize()
watchEffect(() => {
  if (width.value < 1280) {
    isRightSidebarOpen.value = false
  } else {
    isRightSidebarOpen.value = true
  }
})
</script>

<template>
  <VerticalNavLayout :nav-items="filteredNavItems">
    <!-- 👉 Left Navbar header & mobile toggle -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center gap-x-2 w-100">
        <VBtn
          icon
          variant="text"
          color="default"
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="tabler-menu-2" />
        </VBtn>

        <!-- Dynamic Portal Title -->
        <div class="text-h6 font-weight-bold d-none d-sm-block text-primary">
          {{ authStore.user?.userType === 'teacher' ? $t('Teacher Portal') : $t('Parent Portal') }}
        </div>

        <VSpacer />

        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
        />
        
        <!-- Toggle button for the Right Sidebar on mobile -->
        <VBtn
          icon
          variant="tonal"
          color="primary"
          class="d-xl-none ms-2"
          @click="isRightSidebarOpen = !isRightSidebarOpen"
        >
          <VIcon icon="tabler-layout-sidebar-right" />
        </VBtn>
      </div>
    </template>

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

    <!-- 👉 Main Content Area & Right Sidebar -->
    <div class="d-flex h-100 w-100 dashboard-layout-container">
      
      <!-- Center Main Content -->
      <div class="flex-grow-1 dashboard-main-content">
        <slot />
      </div>

      <!-- Secondary Sidebar (Profile & Settings Hub) -->
      <VNavigationDrawer
        v-model="isRightSidebarOpen"
        location="left"
        width="340"
        :permanent="width >= 1280"
        :temporary="width < 1280"
        class="dashboard-secondary-sidebar border-e"
        elevation="0"
      >
        <div class="pa-6">
           <slot name="right-sidebar">
             <!-- Default Fallback Profile -->
             <UserProfile />
           </slot>
        </div>
      </VNavigationDrawer>

    </div>

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

  </VerticalNavLayout>
</template>

<style lang="scss">
.dashboard-layout-container {
  /* Ensure the content area pushes the footer down but allows the sidebar to stretch */
  min-height: calc(100vh - var(--v-layout-header-height) - var(--v-layout-footer-height));
}

.dashboard-main-content {
  padding: 1.5rem;
  
  @media (max-width: 600px) {
    padding: 1rem;
  }
}

.dashboard-secondary-sidebar {
  background-color: rgb(var(--v-theme-surface)) !important;
  
  /* Remove harsh borders in favor of the soft theme */
  border-right-color: rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}
</style>
