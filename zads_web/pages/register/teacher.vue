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
const { t } = useI18n()

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
        await authStore.registerTeacher(form.value.name, form.value.phone, form.value.password)

        // Navigate to teacher dashboard
        router.push('/teacher')
    } catch (err) {
        error.value = err.message || t('Register.RegistrationFailed')
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
                <h5 class="text-h5 mb-1 d-flex align-center gap-2">
                    {{ $t('Register.TeacherRegistration👨‍🏫') }}
                    <VIcon icon="tabler-school" size="24" color="primary" />
                </h5>
                <p class="mb-0">
                    {{ $t('Register.GrowYourCareer') }}
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
                                :label="$t('Register.FullName')"
                                placeholder="Jane Doe"
                                :rules="[requiredValidator]"
                            />
                        </VCol>

                        <!-- Phone -->
                        <VCol cols="12">
                            <AppTextField
                                v-model="form.phone"
                                :label="$t('Auth.PhoneNumber')"
                                :placeholder="$t('Auth.PhoneNumber')"
                                :rules="[requiredValidator, phoneValidator]"
                            />
                        </VCol>

                        <!-- Password -->
                        <VCol cols="12">
                            <AppTextField
                                v-model="form.password"
                                :label="$t('Auth.Password')"
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
                                :label="$t('Register.ConfirmPassword')"
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
                                {{ $t('Register.SignUp') }}
                            </VBtn>
                        </VCol>

                        <VCol
                            cols="12"
                            class="d-flex align-center"
                        >
                            <VDivider />
                            <span class="mx-4">{{ $t('Auth.Or') }}</span>
                            <VDivider />
                        </VCol>

                        <!-- login instead -->
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
                </VForm>
            </VCardText>
        </VCard>
    </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

