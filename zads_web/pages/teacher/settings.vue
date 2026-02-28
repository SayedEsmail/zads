<script setup>
import { useAuthStore } from '~/stores/auth'
import { useSnackbar } from '~/composables/useSnackbar'
import { useI18n } from 'vue-i18n'

definePageMeta({
    layout: 'default',
    middleware: ['auth'],
})

const authStore = useAuthStore()
const snackbar = useSnackbar()
const { t } = useI18n()

const loading = ref(false)
const accountForm = ref(null)

const accountData = ref({
    name: '',
    phone: '',
    password: '',
})

onMounted(() => {
    if (authStore.user) {
        accountData.value.name = authStore.user.name || ''
        accountData.value.phone = authStore.user.phone || ''
    }
})

const updateAccount = async () => {
    const { valid } = await accountForm.value.validate()
    if (!valid) return

    loading.value = true
    try {
        const payload = {
            name: accountData.value.name,
            phone: accountData.value.phone,
        }
        if (accountData.value.password) {
            payload.password = accountData.value.password
        }

        await authStore.updateAccount(payload)
        accountData.value.password = '' // clear password
        snackbar.show(t('Settings.AccountUpdatedSuccessfully'), 'success')
    } catch (e) {
        snackbar.show(e?.response?.data?.message || t('General.Error'), 'error')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="teacher-settings-page">
        <VRow>
            <!-- Navigation Sidebar (similar to parent, but only one tab for now) -->
            <VCol cols="12" md="3">
                <VCard elevation="2" class="rounded-lg h-100">
                    <VCardTitle class="px-4 py-3 bg-primary text-white">
                        <VIcon icon="tabler-settings" class="me-2" />
                        {{ $t('Settings.AccountSettings') }}
                    </VCardTitle>
                    <VList nav density="compact" class="py-2">
                        <VListItem
                            active
                            color="primary"
                            rounded="lg"
                        >
                            <template #prepend>
                                <VIcon icon="tabler-user" />
                            </template>
                            <VListItemTitle>{{ $t('Settings.ProfileInfo') }}</VListItemTitle>
                        </VListItem>
                    </VList>
                </VCard>
            </VCol>

            <!-- Main Form -->
            <VCol cols="12" md="9">
                <VCard elevation="2" class="rounded-lg h-100">
                    <VCardItem class="border-b">
                        <VCardTitle>{{ $t('Settings.ProfileInfo') }}</VCardTitle>
                        <VCardSubtitle>{{ $t('Settings.UpdateYourCoreInformation') }}</VCardSubtitle>
                    </VCardItem>
                    
                    <VCardText class="pa-6">
                        <VForm ref="accountForm" @submit.prevent="updateAccount">
                            <VRow>
                                <VCol cols="12" md="6">
                                    <VTextField
                                        v-model="accountData.name"
                                        :label="$t('CompleteProfile.FullName')"
                                        prepend-inner-icon="tabler-user"
                                        variant="outlined"
                                        :rules="[v => !!v || 'Name is required']"
                                    />
                                </VCol>
                                <VCol cols="12" md="6">
                                    <VTextField
                                        v-model="accountData.phone"
                                        :label="$t('Auth.PhoneNumber')"
                                        prepend-inner-icon="tabler-phone"
                                        variant="outlined"
                                        :rules="[v => !!v || 'Phone is required']"
                                        dir="ltr"
                                    />
                                </VCol>
                                <VCol cols="12">
                                    <VTextField
                                        v-model="accountData.password"
                                        :label="$t('Auth.NewPasswordOptional')"
                                        type="password"
                                        prepend-inner-icon="tabler-lock"
                                        variant="outlined"
                                    />
                                </VCol>
                            </VRow>
                            <div class="d-flex justify-end mt-4">
                                <VBtn
                                    type="submit"
                                    color="primary"
                                    :loading="loading"
                                    prepend-icon="tabler-device-floppy"
                                >
                                    {{ $t('Settings.SaveChanges') }}
                                </VBtn>
                            </div>
                        </VForm>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>
    </div>
</template>
