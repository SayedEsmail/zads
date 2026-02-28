<script setup>
import loginIllustration from '@images/login.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePageMeta({
    layout: 'blank',
    public: true,
})
</script>

<template>
    <div class="auth-page-wrapper d-flex align-center justify-center pa-4">
        <VCard
            class="auth-card-premium overflow-hidden elevation-24"
            max-width="1050"
            width="100%"
        >
            <VRow no-gutters>
                <!-- Selection Section -->
                <VCol
                    cols="12"
                    md="6"
                    class="auth-form-section pa-8 pa-sm-12 d-flex flex-column"
                >
                    <!-- Logo -->
                    <div class="mb-12">
                        <NuxtLink to="/">
                            <VNodeRenderer :nodes="themeConfig.app.logo" />
                        </NuxtLink>
                    </div>

                    <div class="flex-grow-1">
                        <h4 class="text-h4 font-weight-bold mb-2">
                            {{ $t('Register.JoinZads🚀') }}
                        </h4>
                        <p class="text-body-1 text-secondary mb-10">
                            {{ $t('Register.SelectAccountType') }}
                        </p>

                        <div class="d-flex flex-column gap-y-6">
                            <!-- Parent Card -->
                            <VCard
                                flat
                                class="role-selection-card pa-6 border rounded-xl cursor-pointer"
                                @click="navigateTo('/register/parent')"
                            >
                                <div class="d-flex align-center gap-x-4">
                                    <div class="icon-avatar bg-primary-lighten-5 pa-3 rounded-xl">
                                        <VIcon icon="tabler-user-heart" size="32" color="primary" />
                                    </div>
                                    <div class="flex-grow-1">
                                        <h6 class="text-h6 font-weight-bold mb-1">{{ $t('Register.Parent') }}</h6>
                                        <p class="text-body-2 text-secondary mb-0">{{ $t('Register.FindBestTeachers') }}</p>
                                    </div>
                                    <VIcon icon="tabler-chevron-right" size="24" class="text-secondary opacity-30 rtl-mirror" />
                                </div>
                            </VCard>

                            <!-- Teacher Card -->
                            <VCard
                                flat
                                class="role-selection-card pa-6 border rounded-xl cursor-pointer"
                                @click="navigateTo('/register/teacher')"
                            >
                                <div class="d-flex align-center gap-x-4">
                                    <div class="icon-avatar bg-secondary-lighten-5 pa-3 rounded-xl">
                                        <VIcon icon="tabler-school" size="32" color="secondary" />
                                    </div>
                                    <div class="flex-grow-1">
                                        <h6 class="text-h6 font-weight-bold mb-1">{{ $t('Register.Teacher') }}</h6>
                                        <p class="text-body-2 text-secondary mb-0">{{ $t('Register.GrowYourCareer') }}</p>
                                    </div>
                                    <VIcon icon="tabler-chevron-right" size="24" class="text-secondary opacity-30 rtl-mirror" />
                                </div>
                            </VCard>
                        </div>

                        <div class="text-center mt-12">
                            <span class="text-secondary">{{ $t('Register.AlreadyHaveAccount?') }}</span>
                            <NuxtLink
                                class="text-primary font-weight-bold ms-2"
                                to="/login"
                            >
                                {{ $t('Register.SignInInstead') }}
                            </NuxtLink>
                        </div>
                    </div>
                </VCol>

                <!-- Illustration Section -->
                <VCol
                    cols="12"
                    md="6"
                    class="d-none d-md-flex align-center justify-center bg-light-primary position-relative pa-0"
                >
                    <VImg
                        :src="loginIllustration"
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

    .role-selection-card {
        transition: all 0.3s ease;
        border: 1.5px solid rgba(var(--v-border-color), 0.08) !important;
        
        &:hover {
            border-color: rgba(var(--v-theme-primary), 0.5) !important;
            background-color: rgba(var(--v-theme-primary), 0.02) !important;
            transform: translateY(-4px);
            box-shadow: 0 12px 20px -10px rgba(var(--v-theme-primary), 0.15);
            
            .icon-avatar {
                transform: scale(1.1) rotate(-5deg);
            }
        }

        .icon-avatar {
            transition: transform 0.3s ease;
        }
    }

    .bg-primary-lighten-5 {
        background-color: rgba(var(--v-theme-primary), 0.05) !important;
    }

    .bg-secondary-lighten-5 {
        background-color: rgba(var(--v-theme-secondary), 0.05) !important;
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

    .rtl-mirror {
        [dir="rtl"] & {
            transform: scaleX(-1);
        }
    }
}
</style>
