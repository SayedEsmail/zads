<script setup>
import { useAuthStore } from '@/stores/auth'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePage({
    meta: {
        layout: 'blank',
        public: true,
    },
})

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
    phone: '',
    password: '',
    remember: false,
})

const isPasswordVisible = ref(false)
const loading = ref(false)
const error = ref('')

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const handleLogin = async () => {
    loading.value = true
    error.value = ''

    try {
        await authStore.login(form.value.phone, form.value.password)
        router.push('/')
    } catch (err) {
        error.value = err.message || 'فشل تسجيل الدخول'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <a href="javascript:void(0)">
        <div class="auth-logo d-flex align-center gap-x-3">
            <VNodeRenderer :nodes="themeConfig.app.logo" />
            <h1 class="auth-title">
                {{ themeConfig.app.title }}
            </h1>
        </div>
    </a>

    <VRow
        no-gutters
        class="auth-wrapper bg-surface"
    >
        <VCol
            md="8"
            class="d-none d-md-flex"
        >
            <div class="position-relative bg-background w-100 me-0">
                <div
                    class="d-flex align-center justify-center w-100 h-100"
                    style="padding-inline: 6.25rem;"
                >
                    <VImg
                        max-width="613"
                        :src="authThemeImg"
                        class="auth-illustration mt-16 mb-2"
                    />
                </div>

                <img
                    class="auth-footer-mask flip-in-rtl"
                    :src="authThemeMask"
                    alt="auth-footer-mask"
                    height="280"
                    width="100"
                >
            </div>
        </VCol>

        <VCol
            cols="12"
            md="4"
            class="auth-card-v2 d-flex align-center justify-center"
        >
            <VCard
                flat
                :max-width="500"
                class="mt-12 mt-sm-0 pa-6"
            >
                <VCardText>
                    <h4 class="text-h4 mb-1">
                        مرحباً بك في <span class="text-capitalize">{{ themeConfig.app.title }}</span>! 👋🏻
                    </h4>
                    <p class="mb-0">
                        سجل دخولك للوصول إلى لوحة التحكم
                    </p>
                </VCardText>

                <VCardText>
                    <VAlert
                        v-if="error"
                        type="error"
                        variant="tonal"
                        class="mb-4"
                    >
                        {{ error }}
                    </VAlert>

                    <VForm @submit.prevent="handleLogin">
                        <VRow>
                            <!-- phone -->
                            <VCol cols="12">
                                <AppTextField
                                    v-model="form.phone"
                                    autofocus
                                    label="رقم الهاتف"
                                    type="tel"
                                    placeholder="01xxxxxxxxx"
                                    dir="ltr"
                                />
                            </VCol>

                            <!-- password -->
                            <VCol cols="12">
                                <AppTextField
                                    v-model="form.password"
                                    label="كلمة المرور"
                                    placeholder="············"
                                    :type="isPasswordVisible ? 'text' : 'password'"
                                    autocomplete="password"
                                    :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                                />

                                <div class="d-flex align-center flex-wrap justify-space-between my-6">
                                    <VCheckbox
                                        v-model="form.remember"
                                        label="تذكرني"
                                    />
                                </div>

                                <VBtn
                                    block
                                    type="submit"
                                    :loading="loading"
                                >
                                    تسجيل الدخول
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VForm>
                </VCardText>
            </VCard>
        </VCol>
    </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
