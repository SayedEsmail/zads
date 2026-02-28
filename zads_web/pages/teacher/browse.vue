<script setup>
import { useTutorRequestsStore } from '~/stores/tutorRequests'

definePageMeta({
    layout: 'default',
})

const tutorRequestsStore = useTutorRequestsStore()
const { t } = useI18n()

onMounted(async () => {
    await tutorRequestsStore.fetchTutorRequests(1)
})

const loadMore = async () => {
    if (tutorRequestsStore.pagination.page < tutorRequestsStore.pagination.totalPages) {
        // Simple manual pagination handling for now (append to current list or just navigate)
        // Here we just override the list with the requested page.
        await tutorRequestsStore.fetchTutorRequests(tutorRequestsStore.pagination.page + 1)
    }
}
</script>

<template>
    <div>
        <VRow class="mb-6">
            <VCol cols="12">
                <h1 class="text-h4 mb-2 d-flex align-center gap-2">
                    {{ $t('TeacherBrowse.Title') }}
                    <VIcon icon="tabler-search" color="primary" size="32" />
                </h1>
                <p class="text-body-1 text-secondary">
                    {{ $t('TeacherBrowse.Desc') }}
                </p>
            </VCol>
        </VRow>

        <VRow v-if="tutorRequestsStore.loading && !tutorRequestsStore.requests.length" justify="center" class="py-12">
            <VProgressCircular indeterminate color="primary" size="48" />
        </VRow>

        <VRow v-else-if="!tutorRequestsStore.requests.length">
            <VCol cols="12">
                <VCard class="text-center py-12" border flat bg-color="transparent">
                    <VCardText>
                        <VIcon icon="tabler-search-off" size="64" color="secondary" class="mb-4 opacity-50" />
                        <h6 class="text-h6 font-weight-medium mb-2">{{ $t('TeacherBrowse.NoRequests') }}</h6>
                        <p class="text-secondary">{{ $t('TeacherBrowse.NoRequestsDesc') }}</p>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>

        <VRow v-else>
            <VCol v-for="request in tutorRequestsStore.requests" :key="request.id" cols="12">
                <VCard border flat class="mb-2">
                    <VCardItem>
                        <template #prepend>
                            <VAvatar color="primary" variant="tonal" size="56" class="rounded-lg mr-4">
                                <VImg v-if="request.parent?.user?.avatarUrl" :src="request.parent.user.avatarUrl" />
                                <VIcon v-else icon="tabler-user" size="28" />
                            </VAvatar>
                        </template>

                        <VCardTitle class="text-h6 font-weight-bold">
                            {{ request.parent?.user?.name || $t('UnknownParent') }}
                        </VCardTitle>
                        
                        <VCardSubtitle class="d-flex align-center flex-wrap gap-4 mt-2">
                            <span class="d-flex align-center gap-1 text-body-2">
                                <VIcon icon="tabler-book" size="18" />
                                {{ request.subject?.nameAr }}
                            </span>
                            <span class="d-flex align-center gap-1 text-body-2">
                                <VIcon icon="tabler-school" size="18" />
                                {{ request.stage?.nameAr }}
                            </span>
                            <span class="d-flex align-center gap-1 text-body-2">
                                <VIcon icon="tabler-map-pin" size="18" />
                                {{ request.area?.nameAr }} - {{ request.area?.city?.nameAr }}
                            </span>
                        </VCardSubtitle>
                    </VCardItem>

                    <VCardText class="pt-4 pb-4 bg-var-theme-background opacity-90 rounded-b-lg mx-4 mb-4 mt-2">
                        <p class="text-body-1 font-italic mb-0 text-high-emphasis">
                            "{{ request.details }}"
                        </p>
                    </VCardText>

                    <VCardActions class="px-6 pb-4 pt-0 justify-end">
                        <VBtn
                            color="primary"
                            variant="flat"
                            prepend-icon="tabler-brand-whatsapp"
                            :href="`https://wa.me/${request.parent?.user?.phone}`"
                            target="_blank"
                        >
                            {{ $t('TeacherBrowse.ContactParent') }}
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VCol>
        </VRow>

        <!-- Pagination Controls -->
        <VRow v-if="tutorRequestsStore.pagination.totalPages > 1" class="mt-4">
            <VCol cols="12" class="d-flex justify-center">
                <VPagination
                    v-model="tutorRequestsStore.pagination.page"
                    :length="tutorRequestsStore.pagination.totalPages"
                    @update:model-value="tutorRequestsStore.fetchTutorRequests($event)"
                    active-color="primary"
                />
            </VCol>
        </VRow>
    </div>
</template>
