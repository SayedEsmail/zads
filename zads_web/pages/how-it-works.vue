<script setup>
import Footer from '@/views/front-pages/front-page-footer.vue'
import TheNavbar from '@/views/front-pages/front-page-navbar.vue'
import { useConfigStore } from '@core/stores/config'

const store = useConfigStore()

store.skin = 'default'
definePageMeta({
  layout: 'blank',
  public: true,
})
</script>

<template>
  <div class="landing-page-wrapper">
    <TheNavbar />

    <div class="d-flex flex-column align-center justify-center min-h-screen py-16" style="min-height: 80vh;">
      <div class="text-center pb-16 pt-16 mt-16">
        <h1 class="text-h2 font-weight-bold mb-4">
          {{ $t('HowItWorks.Title') || 'How It Works' }}
        </h1>
        <p class="text-body-1 mx-auto" style="max-width: 600px; color: rgba(var(--v-theme-on-surface), 0.6)">
          {{ $t('HowItWorks.Description') || 'This section is under construction. It will contain information on how the platform operates for Parents and Teachers.' }}
        </p>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style lang="scss">
@media (max-width: 960px) and (min-width: 600px) {
  .landing-page-wrapper {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
