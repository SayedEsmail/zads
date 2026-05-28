<script setup>
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import authV2ForgotPasswordIllustrationDark from '@images/pages/auth-v2-forgot-password-illustration-dark.png'
import authV2ForgotPasswordIllustrationLight from '@images/pages/auth-v2-forgot-password-illustration-light.png'

definePageMeta({
    layout: 'blank',
    public: true,
})

const email = ref('')
const authThemeImg = useGenerateImageVariant(authV2ForgotPasswordIllustrationLight, authV2ForgotPasswordIllustrationDark)
const { t } = useI18n()
</script>

<template>
    <div class="auth-page-wrapper d-flex align-center justify-center pa-4">
        <VCard
            class="auth-card-premium overflow-hidden elevation-24"
            max-width="1050"
            width="100%"
        >
            <VRow no-gutters>
                <!-- Form Section -->
                <VCol
                    cols="12"
                    md="6"
                    class="auth-form-section pa-8 pa-sm-12 d-flex flex-column"
                >
                    <!-- Logo -->
                    <div class="mb-10">
                        <NuxtLink to="/">
                            <VNodeRenderer :nodes="themeConfig.app.logo" />
                        </NuxtLink>
                    </div>

                    <div class="flex-grow-1">
                        <h4 class="text-h4 font-weight-bold mb-2">
                            {{ $t('ForgotPassword.ForgotPassword?🔒') }}
                        </h4>
                        <p class="text-body-1 text-secondary mb-8">
                            {{ $t('ForgotPassword.ForgotPasswordDesc') }}
                        </p>

                        <VForm @submit.prevent="() => {}">
                            <VRow>
                                <!-- Email -->
                                <VCol cols="12">
                                    <label class="text-subtitle-2 font-weight-bold mb-1 d-block text-high-emphasis">
                                        {{ $t('ForgotPassword.Email') }}
                                    </label>
                                    <AppTextField
                                        v-model="email"
                                        autofocus
                                        placeholder="johndoe@email.com"
                                        type="email"
                                        variant="outlined"
                                        class="auth-input"
                                    />
                                </VCol>

                                <VCol cols="12" class="pt-6">
                                    <VBtn
                                        block
                                        type="submit"
                                        size="large"
                                        color="primary"
                                        class="rounded-xl font-weight-bold"
                                        height="52"
                                    >
                                        {{ $t('ForgotPassword.SendResetLink') }}
                                    </VBtn>
                                </VCol>

                                <VCol cols="12" class="text-center pt-8">
                                    <NuxtLink
                                        class="d-flex align-center justify-center text-primary font-weight-bold"
                                        :to="{ name: 'login' }"
                                    >
                                        <VIcon
                                            icon="tabler-chevron-left"
                                            size="20"
                                            class="me-1 flip-in-rtl"
                                        />
                                        <span>{{ $t('Auth.BackToLogin') }}</span>
                                    </NuxtLink>
                                </VCol>
                            </VRow>
                        </VForm>
                    </div>
                </VCol>

                <!-- Illustration Section -->
                <VCol
                    cols="12"
                    md="6"
                    class="d-none d-md-flex align-center justify-center bg-light-primary position-relative pa-0"
                >
                    <VImg
                        :src="authThemeImg"
                        width="100%"
                        height="100%"
                        cover
                        class="illustration-hover"
                    />
                    
                    <!-- Decorative Elements -->
                    <div class="decorative-circle-1"></div>
                    <div class="decorative-circle-2"></div>
                </VCol>
            </VRow>
        </VCard>
    </div>
</template>

<style lang="scss">
.auth-page-wrapper {
    min-height: 100vh;
    background: #fff !important;
    
    .auth-card-premium {
        border-radius: 24px !important;
        background: rgb(var(--v-theme-surface));
    }

    .auth-form-section {
        background: rgb(var(--v-theme-surface));
    }

    .bg-light-primary {
        background-color: rgba(var(--v-theme-primary), 0.03);
    }

    .auth-input {
        .v-field {
            border-radius: 12px !important;
            background-color: rgb(var(--v-theme-surface));
            
            &.v-field--focused {
                background-color: rgb(var(--v-theme-surface));
            }
        }
    }

    .decorative-circle-1 {
        position: absolute;
        top: -50px;
        right: -50px;
        width: 200px;
        height: 200px;
        background: rgba(var(--v-theme-primary), 0.05);
        border-radius: 50%;
    }

    .decorative-circle-2 {
        position: absolute;
        bottom: 20px;
        left: -30px;
        width: 120px;
        height: 120px;
        background: rgba(var(--v-theme-secondary), 0.05);
        border-radius: 50%;
    }

    .illustration-hover {
        transition: transform 0.4s ease-out;
        &:hover {
            transform: translateY(-8px) scale(1.02);
        }
    }

    .max-w-400 {
        max-width: 400px;
    }

    .flip-in-rtl {
        [dir="rtl"] & {
            transform: scaleX(-1);
        }
    }
}
</style>
