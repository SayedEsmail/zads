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

    <VContainer class="d-flex flex-column align-center justify-center min-h-screen py-16" style="min-height: 80vh;">
      <VCard class="premium-about-card text-center pa-10 rounded-xl elevation-4" max-width="800">
        <VIcon icon="tabler-info-circle" size="64" color="primary" class="mb-6" />
        <h1 class="text-h2 font-weight-bold mb-6 text-primary">
          {{ $t('Navbar.About') || 'About Zads' }}
        </h1>
        <p class="text-h6 leading-relaxed mb-8" style="color: rgba(var(--v-theme-on-surface), 0.7)">
          {{ $t('About.Description') || 'Zads is the world\'s leading ed-tech platform connecting passionate teachers with students. We believe in high-quality education accessible to everyone, everywhere.' }}
        </p>
        <VBtn
          color="secondary"
          size="large"
          variant="elevated"
          class="rounded-pill px-10 shadow-secondary"
          :to="{ name: 'register-parent' }"
        >
          {{ $t('Auth.Parent') || 'As Parent' }}
        </VBtn>
      </VCard>
    </VContainer>

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
