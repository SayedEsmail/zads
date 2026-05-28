<script setup>
import { useTutorRequestsStore } from '~/stores/tutorRequests'
import { useSearchStore } from '~/stores/search'
import { useTeacherStore } from '~/stores/teacher'
import { useAnalytics } from '~/composables/useAnalytics'

definePageMeta({
    layout: 'default',
})

const tutorRequestsStore = useTutorRequestsStore()
const searchStore = useSearchStore()
const teacherStore = useTeacherStore()
const { logWhatsAppClick } = useAnalytics()
const { t } = useI18n()

onMounted(async () => {
    await Promise.all([
        searchStore.fetchGovernorates(),
        teacherStore.fetchProfile()
    ])
    
    // Auto-search nearby requests if profile has location
    if (teacherStore.profile?.areaId) {
        tutorRequestsStore.filters.areaId = teacherStore.profile.areaId
        tutorRequestsStore.filters.cityId = teacherStore.profile.area?.cityId
        tutorRequestsStore.filters.governorateId = teacherStore.profile.area?.city?.governorateId
        
        // Ensure dropdowns have data
        if (tutorRequestsStore.filters.governorateId) {
            await searchStore.fetchCities(tutorRequestsStore.filters.governorateId)
        }
        if (tutorRequestsStore.filters.cityId) {
            await searchStore.fetchAreas(tutorRequestsStore.filters.cityId)
        }
    }

    await tutorRequestsStore.fetchTutorRequests(1)
})

watch(() => tutorRequestsStore.filters.governorateId, async (val, oldVal) => {
    if (val === oldVal) return
    if (oldVal !== undefined && oldVal !== null) {
        tutorRequestsStore.filters.cityId = null
        tutorRequestsStore.filters.areaId = null
    }
    if (val) await searchStore.fetchCities(val)
})

watch(() => tutorRequestsStore.filters.cityId, async (val, oldVal) => {
    if (val === oldVal) return
    if (oldVal !== undefined && oldVal !== null) {
        tutorRequestsStore.filters.areaId = null
    }
    if (val) await searchStore.fetchAreas(val)
})

const handleFilterChange = () => {
    tutorRequestsStore.fetchTutorRequests(1)
}

const handleClearFilters = () => {
    tutorRequestsStore.filters.governorateId = null
    tutorRequestsStore.filters.cityId = null
    tutorRequestsStore.filters.areaId = null
    tutorRequestsStore.fetchTutorRequests(1)
}

const loadMore = async () => {
    if (tutorRequestsStore.pagination.page < tutorRequestsStore.pagination.totalPages) {
        await tutorRequestsStore.fetchTutorRequests(tutorRequestsStore.pagination.page + 1)
    }
}
</script>

<template>
    <div class="teacher-browse-page">
        <!-- Premium Header Section -->
        <PremiumPageHeader
            :title="$t('TeacherBrowse.Title')"
            :description="$t('TeacherBrowse.Desc')"
        />

        <VContainer class="mt-n8">
        <!-- Glassmorphism Filters Section -->
        <VCard elevation="0" class="mb-8 glassmorphism-card border rounded-xl overflow-hidden pa-2">
            <VCardText class="pa-4">
                <VRow align="center" dense>
                <VCol cols="12" md="3">
                    <VAutocomplete
                        v-model="tutorRequestsStore.filters.governorateId"
                        :items="searchStore.governorates"
                        item-title="nameAr"
                        item-value="id"
                        :placeholder="$t('CompleteProfile.Governorate')"
                        variant="outlined"
                        bg-color="surface"
                        density="compact"
                        hide-details
                        clearable
                        prepend-inner-icon="tabler-map"
                        @update:model-value="handleFilterChange"
                    />
                </VCol>
                <VCol cols="12" md="3">
                    <VAutocomplete
                        v-model="tutorRequestsStore.filters.cityId"
                        :items="searchStore.cities"
                        item-title="nameAr"
                        item-value="id"
                        :placeholder="$t('CompleteProfile.City')"
                        variant="outlined"
                        bg-color="surface"
                        density="compact"
                        hide-details
                        clearable
                        :disabled="!tutorRequestsStore.filters.governorateId"
                        prepend-inner-icon="tabler-building"
                        @update:model-value="handleFilterChange"
                    />
                </VCol>
                <VCol cols="12" md="3">
                    <VAutocomplete
                        v-model="tutorRequestsStore.filters.areaId"
                        :items="searchStore.areas"
                        item-title="nameAr"
                        item-value="id"
                        :placeholder="$t('CompleteProfile.Area')"
                        variant="outlined"
                        bg-color="surface"
                        density="compact"
                        hide-details
                        clearable
                        :disabled="!tutorRequestsStore.filters.cityId"
                        prepend-inner-icon="tabler-map-pin"
                        @update:model-value="handleFilterChange"
                    />
                </VCol>
                <VCol cols="12" md="3" class="d-flex justify-end gap-2">
                    <VBtn 
                        color="error" 
                        variant="text" 
                        @click="handleClearFilters"
                        v-if="tutorRequestsStore.filters.governorateId || tutorRequestsStore.filters.cityId || tutorRequestsStore.filters.areaId"
                    >
                        {{ $t('Reset') }}
                    </VBtn>
                </VCol>
            </VRow>
            </VCardText>
        </VCard>

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
                <VCard class="mb-4 border-0" flat>
                    <VCardItem class="pa-5">
                        <template #prepend>
                            <VAvatar color="primary" variant="tonal" size="64" class="rounded-xl shadow-sm mr-4">
                                <VImg v-if="request.parent?.user?.avatarUrl" :src="request.parent.user.avatarUrl" />
                                <VIcon v-else icon="tabler-user" size="32" />
                            </VAvatar>
                        </template>

                        <VCardTitle class="text-h6 font-weight-bold">
                            {{ request.parent?.user?.name || $t('UnknownParent') }}
                        </VCardTitle>
                        
                        <VCardSubtitle class="d-flex align-center flex-wrap gap-4 mt-3">
                            <span class="d-flex align-center gap-1 text-body-1 font-weight-medium">
                                <VIcon icon="tabler-book" size="20" color="primary" />
                                {{ request.subject?.nameAr }}
                            </span>
                            <span class="d-flex align-center gap-1 text-body-1 font-weight-medium">
                                <VIcon icon="tabler-school" size="20" color="secondary" />
                                {{ request.stage?.nameAr }}
                            </span>
                            <span class="d-flex align-center gap-1 text-body-1 text-disabled">
                                <VIcon icon="tabler-map-pin" size="20" />
                                {{ request.area?.nameAr }} - {{ request.area?.city?.nameAr }}
                            </span>
                        </VCardSubtitle>
                    </VCardItem>

                    <VCardText class="px-5 pb-5">
                        <div class="pa-4 bg-primary-lighten-5 rounded-lg border-primary-light">
                            <p class="text-body-1 font-italic mb-0 text-high-emphasis line-height-relaxed">
                                "{{ request.details }}"
                            </p>
                        </div>
                    </VCardText>

                    <VDivider class="border-opacity-10 mx-5" />

                    <VCardActions class="pa-5 justify-end">
                        <VBtn
                            color="success"
                            variant="flat"
                            size="large"
                            class="font-weight-bold px-8"
                            prepend-icon="tabler-brand-whatsapp"
                            @click="logWhatsAppClick(teacherStore.profile?.id, request.parent?.user?.phone)"
                        >
                            {{ $t('TeacherBrowse.ContactParent') }}
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VCol>
        </VRow>

        <!-- Pagination Controls -->
        <VRow v-if="tutorRequestsStore.pagination.totalPages > 1" class="mt-6 mb-8">
            <VCol cols="12" class="d-flex justify-center">
                <VPagination
                    v-model="tutorRequestsStore.pagination.page"
                    :length="tutorRequestsStore.pagination.totalPages"
                    @update:model-value="tutorRequestsStore.fetchTutorRequests($event)"
                    active-color="primary"
                    variant="elevated"
                    elevation="2"
                    class="premium-pagination"
                />
            </VCol>
        </VRow>
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.teacher-browse-page {
    .glassmorphism-card {
        background: rgba(var(--v-theme-surface), 0.7) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(var(--v-theme-primary), 0.1) !important;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05) !important;
    }

    .bg-primary-lighten-5 {
        background-color: rgba(var(--v-theme-primary), 0.04) !important;
    }

    .border-primary-light {
        border: 1px solid rgba(var(--v-theme-primary), 0.1);
    }

    .line-height-relaxed {
        line-height: 1.8;
    }
}
</style>
