<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePageMeta({
  layout: 'blank',
  auth: {
    unauthenticatedOnly: true,
  },
})
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-4 pt-7"
      max-width="448"
    >
      <VCardItem class="justify-center">
        <template #prepend>
          <div class="d-flex">
            <VNodeRenderer :nodes="themeConfig.app.logo" />
          </div>
        </template>

        <VCardTitle class="font-weight-bold text-2xl text-capitalize">
          {{ themeConfig.app.title }}
        </VCardTitle>
      </VCardItem>

      <VCardText class="pt-2 text-center">
        <h5 class="text-h5 mb-1">
          Join Zads Community 🚀
        </h5>
        <p class="mb-0">
          Select your account type to get started
        </p>
      </VCardText>

      <VCardText>
        <VRow>
          <!-- Parent Option -->
          <VCol cols="12" md="6">
            <VCard
              variant="outlined"
              class="text-center pa-4 cursor-pointer hover-card"
              @click="navigateTo('/register/parent')"
            >
              <VIcon icon="tabler-user-heart" size="42" color="primary" class="mb-2" />
              <h6 class="text-h6 text-primary">Parent</h6>
              <p class="text-xs mb-0">Find best teachers</p>
            </VCard>
          </VCol>

          <!-- Teacher Option -->
          <VCol cols="12" md="6">
            <VCard
              variant="outlined"
              class="text-center pa-4 cursor-pointer hover-card"
              @click="navigateTo('/register/teacher')"
            >
              <VIcon icon="tabler-school" size="42" color="secondary" class="mb-2" />
              <h6 class="text-h6 text-secondary">Teacher</h6>
              <p class="text-xs mb-0">Grow your career</p>
            </VCard>
          </VCol>

          <!-- Login Link -->
          <VCol
            cols="12"
            class="text-center text-base mt-4"
          >
            <span>Already have an account?</span>
            <NuxtLink
              class="text-primary ms-2"
              to="/login"
            >
              Sign in instead
            </NuxtLink>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";

.hover-card {
  transition: all 0.3s ease;
  &:hover {
    border-color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.05);
    transform: translateY(-2px);
  }
}
</style>
