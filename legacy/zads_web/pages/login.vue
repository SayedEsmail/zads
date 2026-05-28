<script setup>
import loginIllustration from '@images/illustrations/login.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import {
    phoneValidator,
    requiredValidator,
} from '@validators'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { signIn } = useAuth()
const { t } = useI18n()

definePageMeta({
    layout: 'blank',
    public: true,
})

const form = ref({
    phone: '01222222222',
    password: 'parent123',
})

const isPasswordVisible = ref(false)
const rememberMe = ref(false)
const refVForm = ref()
const loading = ref(false)
const error = ref('')

const login = async () => {
    loading.value = true
    error.value = ''

    try {
        await authStore.login(form.value.phone, form.value.password)

        // Sync with nuxt-auth
        const authResponse = await signIn('credentials', {
            phone: form.value.phone,
            password: form.value.password,
            redirect: false,
            callbackUrl: '/',
        })
        
        if (authResponse?.error) {
           throw new Error(authResponse.error)
        }

        // Navigate based on user type
        const userType = authStore.userType
        if (userType?.toUpperCase() === 'TEACHER') {
            return navigateTo('/teacher')
        } else if (userType?.toUpperCase() === 'PARENT') {
            return navigateTo('/parent')
        } else {
            return navigateTo('/')
        }
    } catch (err) {
        error.value = err.message || t('Auth.InvalidCredentials')
    } finally {
        loading.value = false
    }
}

const onSubmit = () => {
    refVForm.value?.validate().then(({ valid: isValid }) => {
        if (isValid)
            login()
    })
}
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
                    <div class="mb-12">
                        <NuxtLink to="/">
                            <VNodeRenderer :nodes="themeConfig.app.logo" />
                        </NuxtLink>
                    </div>

                    <div class="flex-grow-1">
                        <h4 class="text-h4 font-weight-bold mb-2">
                            {{ $t('Welcome') }}! 👋🏻
                        </h4>
                        <p class="text-body-1 text-secondary mb-8">
                            {{ $t('Auth.LoginAccount') }}
                        </p>

                        <VAlert
                            v-if="error"
                            color="error"
                            variant="tonal"
                            class="mb-6 rounded-xl"
                        >
                            {{ error }}
                        </VAlert>


                        <VForm ref="refVForm" @submit.prevent="onSubmit">
                            <VRow>
                                <VCol cols="12">
                                    <label class="text-subtitle-2 font-weight-bold mb-1 d-block text-high-emphasis">
                                        {{ $t('Auth.PhoneNumber') }}
                                    </label>
                                    <AppTextField
                                        v-model="form.phone"
                                        placeholder="01xxxxxxxxx"
                                        type="tel"
                                        autofocus
                                        variant="outlined"
                                        :rules="[requiredValidator, phoneValidator]"
                                        class="auth-input"
                                    />
                                </VCol>

                                <VCol cols="12">
                                    <div class="d-flex align-center justify-space-between mb-1">
                                        <label class="text-subtitle-2 font-weight-bold text-high-emphasis">
                                            {{ $t('Auth.Password') }}
                                        </label>
                                        <NuxtLink
                                            class="text-primary font-weight-bold text-caption"
                                            :to="{ name: 'forgot-password' }"
                                        >
                                            {{ $t('Auth.ForgotPassword?') }}
                                        </NuxtLink>
                                    </div>
                                    <AppTextField
                                        v-model="form.password"
                                        placeholder="············"
                                        :rules="[requiredValidator]"
                                        :type="isPasswordVisible ? 'text' : 'password'"
                                        autocomplete="current-password"
                                        variant="outlined"
                                        :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                                        @click:append-inner="isPasswordVisible = !isPasswordVisible"
                                        class="auth-input"
                                    />

                                    <div class="mt-4">
                                        <VCheckbox
                                            v-model="rememberMe"
                                            :label="$t('Auth.RememberMe')"
                                            density="compact"
                                            class="ms-n3"
                                        />
                                    </div>

                                    <VBtn
                                        block
                                        type="submit"
                                        size="large"
                                        :loading="loading"
                                        color="primary"
                                        class="rounded-xl mt-6 font-weight-bold"
                                        height="52"
                                    >
                                        {{ $t('Auth.Login') }}
                                    </VBtn>
                                </VCol>

                                <VCol cols="12" class="text-center pt-6">
                                    <span class="text-secondary">{{ $t('Auth.NewOnPlatform?') }}</span>
                                    <NuxtLink
                                        class="text-primary font-weight-bold ms-1"
                                        :to="{ name: 'register' }"
                                    >
                                        {{ $t('Auth.CreateAccount') }}
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

    .auth-input {
        .v-field {
            border-radius: 12px !important;
            background-color: rgb(var(--v-theme-surface));
            
            &.v-field--focused {
                background-color: rgb(var(--v-theme-surface));
            }
        }
    }

    .bg-primary-lighten-5 {
        background-color: rgba(var(--v-theme-primary), 0.05) !important;
    }

    .border-dashed {
        border: 1px dashed rgba(var(--v-theme-primary), 0.3) !important;
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
}

</style>
