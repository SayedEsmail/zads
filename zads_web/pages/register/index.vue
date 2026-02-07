<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePageMeta({
  layout: 'blank',
  public: true,
  unauthenticatedOnly: true,
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
      </VCardItem>

      <VCardText class="pt-2 text-center">
        <h5 class="text-h5 mb-1">
          {{ $t('Register.JoinZads🚀') }}
        </h5>
        <p class="mb-0">
          {{ $t('Register.SelectAccountType') }}
        </p>
      </VCardText>

      <VCardText>
        <VRow>
          <!-- Parent Option -->
          <VCol cols="12" md="6">
            <div
              class="d-flex flex-column align-center justify-center pa-4 border rounded cursor-pointer hover-card"
              @click="navigateTo('/register/parent')"
            >
              <VIcon icon="tabler-user-heart" size="42" color="primary" class="mb-2" />
              <h6 class="text-h6 text-primary">{{ $t('Register.Parent') }}</h6>
              <p class="text-xs mb-0">{{ $t('Register.FindBestTeachers') }}</p>
            </div>
          </VCol>

          <!-- Teacher Option -->
          <VCol cols="12" md="6">
            <div
              class="d-flex flex-column align-center justify-center pa-4 border rounded cursor-pointer hover-card"
              @click="navigateTo('/register/teacher')"
            >
              <VIcon icon="tabler-school" size="42" color="secondary" class="mb-2" />
              <h6 class="text-h6 text-secondary">{{ $t('Register.Teacher') }}</h6>
              <p class="text-xs mb-0">{{ $t('Register.GrowYourCareer') }}</p>
            </div>
          </VCol>

          <!-- Login Link -->
          <VCol
            cols="12"
            class="text-center text-base"
          >
            <span>{{ $t('Register.AlreadyHaveAccount?') }}</span>
            <NuxtLink
              class="text-primary ms-2"
              to="/login"
            >
              {{ $t('Register.SignInInstead') }}
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
