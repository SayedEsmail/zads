<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import {
    phoneValidator,
    requiredValidator,
} from '@validators'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
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

        // Navigate based on user type
        const userType = authStore.userType
        console.log('Login successful. userType:', userType);

        if (userType === 'teacher') {
            console.log('Redirecting to /teacher');
            return navigateTo('/teacher')
        } else if (userType === 'parent') {
            console.log('Redirecting to /parent');
            return navigateTo('/parent')
        } else {
            console.log('Redirecting to /');
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
                    {{ t('Welcome') }} <span class="text-capitalize"> {{ themeConfig.app.title }} </span>! 👋🏻
                </h5>
                <p class="mb-0">
                    {{ $t('Auth.LoginAccount') }}
                </p>
            </VCardText>

            <VCardText>
                <VAlert
                    v-if="error"
                    color="error"
                    variant="tonal"
                    class="mb-6"
                >
                    {{ error }}
                </VAlert>

                <VAlert
                    color="primary"
                    variant="tonal"
                    class="mb-6"
                >
                    <p class="text-sm mb-2">
                        {{ $t('Register.Parent') }} {{ $t('Auth.PhoneNumber') }}: <strong>01222222222</strong> / {{ $t('Auth.Password') }}: <strong>parent123</strong>
                    </p>
                    <p class="text-sm mb-0">
                        {{ $t('Register.Teacher') }} {{ $t('Auth.PhoneNumber') }}: <strong>01111111111</strong> / {{ $t('Auth.Password') }}: <strong>teacher123</strong>
                    </p>
                </VAlert>

                <VForm
                    ref="refVForm"
                    @submit.prevent="onSubmit"
                >
                    <VRow>
                        <!-- phone -->
                        <VCol cols="12">
                            <AppTextField
                                v-model="form.phone"
                                :label="$t('Auth.PhoneNumber')"
                                :placeholder="$t('Auth.PhoneNumber')"
                                type="tel"
                                autofocus
                                :rules="[requiredValidator, phoneValidator]"
                            />
                        </VCol>

                        <!-- password -->
                        <VCol cols="12">
                            <AppTextField
                                v-model="form.password"
                                :label="$t('Auth.Password')"
                                placeholder="············"
                                :rules="[requiredValidator]"
                                :type="isPasswordVisible ? 'text' : 'password'"
                                autocomplete="password"
                                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                            />

                            <div class="d-flex align-center flex-wrap justify-space-between my-6">
                                <VCheckbox
                                    :id="useId()"
                                    v-model="rememberMe"
                                    :label="$t('Auth.RememberMe')"
                                />
                                <NuxtLink
                                    class="text-primary ms-2 mb-1"
                                    :to="{ name: 'forgot-password' }"
                                >
                                    {{ $t('Auth.ForgotPassword?') }}
                                </NuxtLink>
                            </div>

                            <VBtn
                                block
                                type="submit"
                                :loading="loading"
                            >
                                {{ $t('Auth.Login') }}
                            </VBtn>
                        </VCol>

                        <!-- create account -->
                        <VCol
                            cols="12"
                            class="text-center"
                        >
                            <span>{{ $t('Auth.NewOnPlatform?') }}</span>
                            <NuxtLink
                                class="text-primary ms-1"
                                :to="{ name: 'register' }"
                            >
                                {{ $t('Auth.CreateAccount') }}
                            </NuxtLink>
                        </VCol>

                        <VCol
                            cols="12"
                            class="d-flex align-center"
                        >
                            <VDivider />
                            <span class="mx-4">{{ $t('Auth.Or') }}</span>
                            <VDivider />
                        </VCol>

                        <!-- auth providers -->
                        <VCol
                            cols="12"
                            class="text-center"
                        >
                            <AuthProvider />
                        </VCol>
                    </VRow>
                </VForm>
            </VCardText>

        </VCard>
    </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
