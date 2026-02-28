<script setup>
import { useContactRequestsStore } from '~/stores/contactRequests'

definePageMeta({
    layout: 'default',
})

const requestsStore = useContactRequestsStore()
const { t } = useI18n()
const { showSnackbar } = useSnackbar()

const isUpdating = ref(null) // Stores the ID of the request currently being updated

onMounted(async () => {
    await requestsStore.fetchIncomingRequests()
})

const handleStatusUpdate = async (requestId, newStatus) => {
    isUpdating.value = requestId
    try {
        await requestsStore.updateRequestStatus(requestId, newStatus)
        showSnackbar(t('TeacherRequests.StatusUpdatedSuccess'), 'success')
    } catch (error) {
        showSnackbar(t('TeacherRequests.StatusUpdateFailed'), 'error')
    } finally {
        isUpdating.value = null
    }
}

const statusColors = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error'
}

const statusIcons = {
    pending: 'tabler-clock',
    accepted: 'tabler-check',
    rejected: 'tabler-x'
}
</script>

<template>
    <div>
        <VRow class="mb-6">
            <VCol cols="12">
                <h1 class="text-h4 mb-2 d-flex align-center gap-2">
                    {{ $t('TeacherRequests.Title') }}
                    <VIcon icon="tabler-mail" color="primary" size="32" />
                </h1>
                <p class="text-body-1 text-secondary">
                    {{ $t('TeacherRequests.Desc') }}
                </p>
            </VCol>
        </VRow>

        <VRow v-if="requestsStore.loading && !requestsStore.requests.length" justify="center" class="py-12">
            <VProgressCircular indeterminate color="primary" size="48" />
        </VRow>

        <VRow v-else-if="!requestsStore.requests.length">
            <VCol cols="12">
                <VCard class="text-center py-12" border flat bg-color="transparent">
                    <VCardText>
                        <VIcon icon="tabler-mail-off" size="64" color="secondary" class="mb-4 opacity-50" />
                        <h6 class="text-h6 font-weight-medium mb-2">{{ $t('TeacherRequests.NoRequests') }}</h6>
                        <p class="text-secondary">{{ $t('TeacherRequests.NoRequestsDesc') }}</p>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>

        <VRow v-else>
            <VCol v-for="request in requestsStore.requests" :key="request.id" cols="12">
                <VCard border flat class="mb-2">
                    <VCardItem>
                        <template #prepend>
                            <VAvatar color="primary" variant="tonal" size="56" class="rounded-lg mr-4">
                                <VImg v-if="request.parent?.user?.avatarUrl" :src="request.parent.user.avatarUrl" />
                                <VIcon v-else icon="tabler-user" size="28" />
                            </VAvatar>
                        </template>

                        <VCardTitle class="d-flex align-center justify-space-between flex-wrap gap-2 text-h6 font-weight-bold">
                            {{ request.parent?.user?.name || $t('UnknownParent') }}
                            
                            <VChip
                                :color="statusColors[request.status]"
                                size="small"
                                class="font-weight-medium"
                                variant="flat"
                            >
                                <VIcon start :icon="statusIcons[request.status]" size="14" />
                                {{ $t(`RequestStatus.${request.status}`) }}
                            </VChip>
                        </VCardTitle>
                        
                        <VCardSubtitle class="d-flex align-center gap-4 mt-2">
                            <!-- Show phone only if request is accepted -->
                            <span v-if="request.status === 'accepted'" class="d-flex align-center gap-1 text-body-2">
                                <VIcon icon="tabler-phone" size="18" />
                                {{ request.parent?.user?.phone || '-' }}
                            </span>
                            <span class="d-flex align-center gap-1 text-body-2">
                                <VIcon icon="tabler-school" size="18" />
                                {{ request.child?.name }} ({{ request.child?.stage?.nameAr }})
                            </span>
                        </VCardSubtitle>
                    </VCardItem>

                    <VCardText class="pt-4 pb-4 bg-var-theme-background opacity-90 rounded-b-lg mx-4 mb-4 mt-2">
                        <p class="text-body-1 font-italic mb-0 text-high-emphasis">
                            "{{ request.message }}"
                        </p>
                    </VCardText>

                    <!-- Action buttons are hidden if the request is not pending -->
                    <VCardActions v-if="request.status === 'pending'" class="px-6 pb-4 pt-0 justify-end gap-3">
                        <VBtn
                            color="error"
                            variant="outlined"
                            prepend-icon="tabler-x"
                            :loading="isUpdating === request.id"
                            :disabled="isUpdating === request.id"
                            @click="handleStatusUpdate(request.id, 'rejected')"
                        >
                            {{ $t('TeacherRequests.Reject') }}
                        </VBtn>
                        <VBtn
                            color="success"
                            variant="flat"
                            prepend-icon="tabler-check"
                            :loading="isUpdating === request.id"
                            :disabled="isUpdating === request.id"
                            @click="handleStatusUpdate(request.id, 'accepted')"
                        >
                            {{ $t('TeacherRequests.Accept') }}
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VCol>
        </VRow>
    </div>
</template>
