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

const activeTab = ref('account')
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
        <!-- Premium Header Section -->
        <PremiumPageHeader
            :title="$t('Settings.AccountSettings')"
            :description="$t('Settings.UpdateYourCoreInformation')"
        >
            <template #actions>
                <!-- Premium Horizontal Tabs -->
                <div class="premium-tabs-container w-100 mt-2">
                    <VTabs
                        v-model="activeTab"
                        color="primary"
                        align-tabs="start"
                        class="premium-tabs rounded-pill"
                        hide-slider
                    >
                        <VTab value="account" class="rounded-pill px-6">
                            <VIcon icon="tabler-user" start />
                            {{ $t('Settings.ProfileInfo') }}
                        </VTab>
                    </VTabs>
                </div>
            </template>
        </PremiumPageHeader>

        <VContainer class="settings-content-container mt-n8">
            <VWindow v-model="activeTab" class="h-100" :touch="false">
                <!-- Account Tab -->
                <VWindowItem value="account">
                    <VCard class="window-card border-0" flat>
                        <VCardItem class="border-b px-6 py-4">
                            <VCardTitle class="text-h6 font-weight-bold">{{ $t('Settings.ProfileInfo') }}</VCardTitle>
                            <VCardSubtitle>{{ $t('Settings.UpdateYourCoreInformation') }}</VCardSubtitle>
                        </VCardItem>
                        
                        <VCardText class="pa-6 pa-md-8">
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
                                <div class="d-flex justify-end mt-8">
                                    <VBtn
                                        type="submit"
                                        color="primary"
                                        size="large"
                                        :loading="loading"
                                        prepend-icon="tabler-device-floppy"
                                        class="rounded-pill px-8 font-weight-bold shadow-primary"
                                    >
                                        {{ $t('Settings.SaveChanges') }}
                                    </VBtn>
                                </div>
                            </VForm>
                        </VCardText>
                    </VCard>
                </VWindowItem>
            </VWindow>
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.teacher-settings-page {
    .premium-tabs-container {
        .premium-tabs {
            background: rgba(var(--v-theme-primary), 0.03);
            border: 1px solid rgba(var(--v-theme-primary), 0.05);
            padding: 4px;
            display: inline-flex;

            :deep(.v-slide-group__content) {
                gap: 4px;
            }

            .v-tab {
                text-transform: none;
                letter-spacing: 0;
                font-weight: 600;
                transition: all 0.3s ease;
                min-width: 140px;
                height: 48px;

                &.v-tab--selected {
                    background: rgb(var(--v-theme-primary));
                    color: #fff !important;
                    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
                }

                &:not(.v-tab--selected) {
                    color: rgba(var(--v-theme-primary), 0.7);
                }
            }
        }
    }

    .settings-content-container {
        .window-card {
            border-radius: 24px !important;
            border: 1px solid rgba(var(--v-border-color), 0.08) !important;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.04) !important;
            background: rgba(var(--v-theme-surface), 0.9);
            backdrop-filter: blur(10px);
        }
    }

    .shadow-primary {
        box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.2) !important;
    }

    // Form Field Refinement
    :deep(.v-field) {
        border-radius: 12px !important;
        
        &.v-field--focused {
            box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.05);
        }
    }
}
</style>
