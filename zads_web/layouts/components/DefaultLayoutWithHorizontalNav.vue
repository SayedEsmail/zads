<script setup>
import navItems from '@/navigation/horizontal'
import { themeConfig } from '@themeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'
import { HorizontalNavLayout } from '@layouts'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
</script>

<template>
  <HorizontalNavLayout :nav-items="[]">
    <!-- 👉 navbar -->
    <template #navbar>
      <NuxtLink
        to="/"
        class="app-logo d-flex align-center gap-x-3"
      >
        <VNodeRenderer :nodes="themeConfig.app.logo" />
      </NuxtLink>

      <VSpacer />

      <div class="d-flex align-center gap-x-2">
        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
        />
        <UserProfile />
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
  </HorizontalNavLayout>
</template>
