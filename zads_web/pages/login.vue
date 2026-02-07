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
        if (userType === 'teacher') {
            router.push('/teacher')
        } else if (userType === 'parent') {
            router.push('/parent')
        } else {
            router.push('/')
        }
    } catch (err) {
        error.value = err.message || 'Invalid phone or password'
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
                    Welcome to <span class="text-capitalize"> {{ themeConfig.app.title }} </span>! 👋🏻
                </h5>
                <p class="mb-0">
                    Please sign-in to your account and start the adventure
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
                        Parent Phone: <strong>01222222222</strong> / Pass: <strong>parent123</strong>
                    </p>
                    <p class="text-sm mb-0">
                        Teacher Phone: <strong>01111111111</strong> / Pass: <strong>teacher123</strong>
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
                                label="Phone Number"
                                placeholder="01xxxxxxxxx"
                                type="tel"
                                autofocus
                                :rules="[requiredValidator, phoneValidator]"
                            />
                        </VCol>

                        <!-- password -->
                        <VCol cols="12">
                            <AppTextField
                                v-model="form.password"
                                label="Password"
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
                                    label="Remember me"
                                />
                                <NuxtLink
                                    class="text-primary ms-2 mb-1"
                                    :to="{ name: 'forgot-password' }"
                                >
                                    Forgot Password?
                                </NuxtLink>
                            </div>

                            <VBtn
                                block
                                type="submit"
                                :loading="loading"
                            >
                                Login
                            </VBtn>
                        </VCol>

                        <!-- create account -->
                        <VCol
                            cols="12"
                            class="text-center"
                        >
                            <span>New on our platform?</span>
                            <NuxtLink
                                class="text-primary ms-1"
                                :to="{ name: 'register' }"
                            >
                                Create an account
                            </NuxtLink>
                        </VCol>

                        <VCol
                            cols="12"
                            class="d-flex align-center"
                        >
                            <VDivider />
                            <span class="mx-4">or</span>
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
