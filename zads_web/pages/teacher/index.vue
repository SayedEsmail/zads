<script setup>
import { useTeacherStore } from '~/stores/teacher'

definePageMeta({
    layout: 'default',
})

const teacherStore = useTeacherStore()
const { t } = useI18n()

onMounted(async () => {
    await Promise.all([
        teacherStore.fetchProfile(),
        teacherStore.fetchStats(),
    ])
})

const stats = computed(() => teacherStore.stats || {
    views: 0,
    rating: 0,
    ratingCount: 0,
    contactRequests: 0,
})

const isLoading = computed(() => teacherStore.loading)
</script>

<template>
    <div>
        <VRow class="mb-6">
            <VCol cols="12">
                <h1 class="text-h4 mb-2 d-flex align-center gap-2">
                    {{ $t('TeacherDashboard.Title') }}
                    <VIcon icon="tabler-dashboard" color="primary" size="32" />
                </h1>
                <p class="text-body-1 text-secondary">
                    {{ $t('TeacherDashboard.WelcomeBack', { name: teacherStore.profile?.user?.name || '' }) }}
                </p>
            </VCol>
        </VRow>

        <VRow v-if="isLoading" class="mb-6">
            <VCol cols="12" class="d-flex justify-center py-12">
                <VProgressCircular indeterminate color="primary" size="48" />
            </VCol>
        </VRow>

        <VRow v-else class="mb-6">
            <!-- Total Profile Views -->
            <VCol cols="12" sm="6" md="4">
                <VCard class="h-100" border flat>
                    <VCardItem>
                        <template #prepend>
                            <VAvatar color="primary" variant="tonal" size="48" class="mr-3 rounded-lg">
                                <VIcon icon="tabler-eye" size="24" />
                            </VAvatar>
                        </template>
                        <VCardTitle class="text-body-2 text-secondary mb-1">
                            {{ $t('TeacherDashboard.TotalViews') }}
                        </VCardTitle>
                        <VCardSubtitle class="text-h5 font-weight-bold text-high-emphasis opacity-100">
                            {{ stats.views }}
                        </VCardSubtitle>
                    </VCardItem>
                </VCard>
            </VCol>

            <!-- Average Rating -->
            <VCol cols="12" sm="6" md="4">
                <VCard class="h-100" border flat>
                    <VCardItem>
                        <template #prepend>
                            <VAvatar color="warning" variant="tonal" size="48" class="mr-3 rounded-lg">
                                <VIcon icon="tabler-star-filled" size="24" />
                            </VAvatar>
                        </template>
                        <VCardTitle class="text-body-2 text-secondary mb-1">
                            {{ $t('TeacherDashboard.AverageRating') }}
                        </VCardTitle>
                        <VCardSubtitle class="d-flex align-center gap-2 text-h5 font-weight-bold text-high-emphasis opacity-100">
                            {{ Number(stats.rating).toFixed(1) }}
                            <span class="text-caption text-secondary font-weight-regular mt-1">
                                ({{ stats.ratingCount }} {{ $t('TeacherDashboard.Reviews') }})
                            </span>
                        </VCardSubtitle>
                    </VCardItem>
                </VCard>
            </VCol>

            <!-- Pending Contact Requests -->
            <VCol cols="12" sm="6" md="4">
                <VCard class="h-100 cursor-pointer" border flat hover @click="$router.push('/teacher/requests')">
                    <VCardItem>
                        <template #prepend>
                            <VAvatar color="info" variant="tonal" size="48" class="mr-3 rounded-lg">
                                <VIcon icon="tabler-mail" size="24" />
                            </VAvatar>
                        </template>
                        <VCardTitle class="text-body-2 text-secondary mb-1">
                            {{ $t('TeacherDashboard.ContactRequests') }}
                        </VCardTitle>
                        <VCardSubtitle class="d-flex align-center justify-space-between text-h5 font-weight-bold text-high-emphasis opacity-100">
                            <span>{{ stats.contactRequests }}</span>
                            <VIcon icon="tabler-arrow-right" size="20" class="text-secondary" />
                        </VCardSubtitle>
                    </VCardItem>
                </VCard>
            </VCol>
        </VRow>

        <!-- Keep things simple for now, we can add a quick links section or recent requests summary later -->
    </div>
</template>

<style lang="scss" scoped>
/* Responsive overrides if needed */
</style>
