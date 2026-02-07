<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import {
    confirmedValidator,
    phoneValidator,
    requiredValidator,
} from '@validators'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

definePageMeta({
    layout: 'blank',
    public: true,
})

const form = ref({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
})

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
    loading.value = true
    error.value = ''

    try {
        await authStore.registerParent(form.value.name, form.value.phone, form.value.password)

        // Navigate based on user type
        router.push('/parent')
    } catch (err) {
        error.value = err.message || 'Registration failed'
    } finally {
        loading.value = false
    }
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

            <VCardText class="pt-2">
                <h5 class="text-h5 mb-1">
                    Parent Registration 👨‍👩‍👧‍👦
                </h5>
                <p class="mb-0">
                    Create an account to find the best teachers for your children
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

                <VForm @submit.prevent="onSubmit">
                    <VRow>
                        <!-- Name -->
                        <VCol cols="12">
                            <AppTextField
                                v-model="form.name"
                                label="Full Name"
                                placeholder="John Doe"
                                :rules="[requiredValidator]"
                            />
                        </VCol>

                        <!-- Phone -->
                        <VCol cols="12">
                            <AppTextField
                                v-model="form.phone"
                                label="Phone Number"
                                placeholder="01xxxxxxxxx"
                                :rules="[requiredValidator, phoneValidator]"
                            />
                        </VCol>

                        <!-- Password -->
                        <VCol cols="12">
                            <AppTextField
                                v-model="form.password"
                                label="Password"
                                :type="isPasswordVisible ? 'text' : 'password'"
                                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                                :rules="[requiredValidator]"
                                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                            />
                        </VCol>

                        <!-- Confirm Password -->
                        <VCol cols="12">
                            <AppTextField
                                v-model="form.confirmPassword"
                                label="Confirm Password"
                                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                                :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                                :rules="[requiredValidator, confirmedValidator(form.confirmPassword, form.password)]"
                                @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                            />
                        </VCol>

                        <VCol cols="12">
                            <VBtn
                                block
                                type="submit"
                                :loading="loading"
                            >
                                Sign up
                            </VBtn>
                        </VCol>

                        <VCol
                            cols="12"
                            class="d-flex align-center"
                        >
                            <VDivider />
                            <span class="mx-4">or</span>
                            <VDivider />
                        </VCol>

                        <!-- login instead -->
                        <VCol
                            cols="12"
                            class="text-center text-base"
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
                </VForm>
            </VCardText>
        </VCard>
    </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
