<script setup>
import { useTeacherStore } from '~/stores/teacher'
import { useTutorRequestsStore } from '~/stores/tutorRequests'

definePageMeta({
    layout: 'default',
})

const teacherStore = useTeacherStore()
const tutorRequestsStore = useTutorRequestsStore()
const { t } = useI18n()

onMounted(async () => {
    await Promise.all([
        teacherStore.fetchProfile(),
        teacherStore.fetchStats(),
    ])
    
    if (teacherStore.profile?.areaId) {
        tutorRequestsStore.filters.areaId = teacherStore.profile.areaId
    }
    // Fetch 1st page of requests in their area to display in the dashboard
    await tutorRequestsStore.fetchTutorRequests(1)
})

const stats = computed(() => teacherStore.stats || {
    views: 0,
    rating: 0,
    ratingCount: 0,
    contactRequests: 0,
})

const isLoading = computed(() => teacherStore.loading || tutorRequestsStore.loading)
</script>

<template>
    <div class="teacher-dashboard-page">
        <!-- Premium Greeting Section -->
        <PremiumPageHeader
            :title="$t('TeacherDashboard.WelcomeBack', { name: teacherStore.profile?.user?.name?.split(' ')[0] || '' })"
            :description="$t('TeacherDashboard.CompleteProfileDesc') || 'أكمل ملفك الشخصي لتظهر للطلاب وابدأ في التدريس'"
        >
            <template #actions>
                <VIcon icon="tabler-school" color="primary" size="64" class="opacity-20 d-none d-sm-block ms-auto" />
            </template>
        </PremiumPageHeader>

        <VContainer class="mt-n8">
        <VRow v-if="isLoading && !teacherStore.profile" class="mb-6">
            <VCol cols="12" class="d-flex justify-center py-12">
                <VProgressCircular indeterminate color="primary" size="48" />
            </VCol>
        </VRow>

        <template v-else>
            <!-- Premium Stats Row -->
            <VRow class="mb-8">
                <!-- Total Profile Views -->
                <VCol cols="12" sm="4">
                    <VCard class="h-100 stat-card-premium bg-info-subtle border-0" flat>
                        <VCardItem class="pa-6">
                            <template #prepend>
                                <VAvatar color="info" variant="flat" size="56" class="mr-4 rounded-xl shadow-sm text-white">
                                    <VIcon icon="tabler-eye" size="28" />
                                </VAvatar>
                            </template>
                            <VCardTitle class="text-body-1 font-weight-bold text-secondary mb-1 text-uppercase tracking-wide">
                                {{ $t('TeacherDashboard.TotalViews') || 'المشاهدات' }}
                            </VCardTitle>
                            <VCardSubtitle class="text-h4 font-weight-black text-info opacity-100 line-height-1">
                                {{ stats.views }}
                            </VCardSubtitle>
                        </VCardItem>
                    </VCard>
                </VCol>

                <!-- Contact Requests -->
                <VCol cols="12" sm="4">
                    <VCard class="h-100 stat-card-premium bg-success-subtle border-0 cursor-pointer transition-all" flat hover @click="$router.push('/teacher/requests')">
                        <VCardItem class="pa-6">
                            <template #prepend>
                                <VAvatar color="success" variant="flat" size="56" class="mr-4 rounded-xl shadow-sm text-white">
                                    <VIcon icon="tabler-message" size="28" />
                                </VAvatar>
                            </template>
                            <VCardTitle class="text-body-1 font-weight-bold text-secondary mb-1 text-uppercase tracking-wide">
                                {{ $t('TeacherDashboard.ContactRequests') || 'الرسائل' }}
                            </VCardTitle>
                            <VCardSubtitle class="text-h4 font-weight-black text-success opacity-100 line-height-1">
                                {{ stats.contactRequests }}
                            </VCardSubtitle>
                        </VCardItem>
                    </VCard>
                </VCol>

                <!-- Opportunities (General Requests) -->
                <VCol cols="12" sm="4">
                    <VCard class="h-100 stat-card-premium bg-warning-subtle border-0 cursor-pointer transition-all" flat hover @click="$router.push('/teacher/requests')">
                        <VCardItem class="pa-6">
                            <template #prepend>
                                <VAvatar color="warning" variant="flat" size="56" class="mr-4 rounded-xl shadow-sm text-white">
                                    <VIcon icon="tabler-school" size="28" />
                                </VAvatar>
                            </template>
                            <VCardTitle class="text-body-1 font-weight-bold text-secondary mb-1 text-uppercase tracking-wide">
                                {{ $t('TeacherDashboard.Opportunities') || 'الفرص' }}
                            </VCardTitle>
                            <VCardSubtitle class="text-h4 font-weight-black text-warning opacity-100 line-height-1">
                                {{ tutorRequestsStore.pagination.total || tutorRequestsStore.requests.length }}
                            </VCardSubtitle>
                        </VCardItem>
                    </VCard>
                </VCol>
            </VRow>

            <VDivider class="my-6" />

            <!-- Students Requests in Area & Quick Actions -->
            <VRow>
                <VCol cols="12" md="7" lg="8">
                    <div class="d-flex align-center justify-space-between mb-4">
                        <h2 class="text-h6 font-weight-bold mb-0">
                            {{ $t('TeacherDashboard.RequestsInYourArea') || 'طلبات الطلاب في منطقتك' }}
                        </h2>
                        <NuxtLink to="/teacher/requests" class="text-primary font-weight-bold text-decoration-none text-body-2">
                            {{ $t('ViewAll') || 'عرض الكل' }}
                        </NuxtLink>
                    </div>

                    <div v-if="tutorRequestsStore.loading && !tutorRequestsStore.requests.length" class="text-center py-6">
                        <VProgressCircular indeterminate color="primary" />
                    </div>

                    <div v-else-if="!tutorRequestsStore.requests.length" class="text-center pa-8 bg-var-theme-background border rounded-lg">
                        <VIcon icon="tabler-school-off" size="48" color="secondary" class="mb-3 opacity-50" />
                        <h3 class="text-body-1 font-weight-bold text-secondary">{{ $t('TeacherDashboard.NoRequestsInArea') || 'لا توجد طلبات جديدة في منطقتك' }}</h3>
                    </div>

                    <div v-else class="d-flex flex-column gap-3">
                        <TutorRequestCard
                            v-for="request in tutorRequestsStore.requests.slice(0, 5)"
                            :key="request.id"
                            :request="request"
                            :compact="true"
                            @click="$router.push('/teacher/requests')"
                        />
                    </div>
                </VCol>

                <!-- Quick Actions -->
                <VCol cols="12" md="5" lg="4">
                    <h2 class="text-h6 font-weight-bold mb-4">
                        {{ $t('TeacherDashboard.QuickActions') || 'إجراءات سريعة' }}
                    </h2>

                    <div class="d-flex flex-column gap-3">
                        <!-- Edit Profile -->
                        <VCard flat hover @click="$router.push('/teacher/profile')" class="rounded-xl border shadow-sm transition-all quick-action-card">
                            <VCardItem class="pa-4">
                                <div class="d-flex align-center gap-4">
                                    <VAvatar color="primary" variant="tonal" size="48" class="rounded-lg">
                                        <VIcon icon="tabler-user-edit" size="24" />
                                    </VAvatar>
                                    <div>
                                        <div class="font-weight-bold text-body-1">{{ $t('TeacherDashboard.EditProfile') || 'تعديل الملف الشخصي' }}</div>
                                        <div class="text-caption text-secondary">{{ $t('TeacherDashboard.EditProfileDesc') || 'أضف معلوماتك ومواد التدريس' }}</div>
                                    </div>
                                    <VSpacer />
                                    <VIcon icon="tabler-chevron-left" class="text-secondary opacity-50" />
                                </div>
                            </VCardItem>
                        </VCard>

                        <!-- Manage Subjects -->
                        <VCard flat hover @click="$router.push('/teacher/subjects')" class="rounded-xl border shadow-sm transition-all quick-action-card">
                            <VCardItem class="pa-4">
                                <div class="d-flex align-center gap-4">
                                    <VAvatar color="secondary" variant="tonal" size="48" class="rounded-lg">
                                        <VIcon icon="tabler-books" size="24" />
                                    </VAvatar>
                                    <div>
                                        <div class="font-weight-bold text-body-1">{{ $t('TeacherDashboard.ManageSubjects') || 'تحديد المواد والمراحل' }}</div>
                                        <div class="text-caption text-secondary">{{ $t('TeacherDashboard.ManageSubjectsDesc') || 'حدد المواد والمراحل التي تدرسها' }}</div>
                                    </div>
                                    <VSpacer />
                                    <VIcon icon="tabler-chevron-left" class="text-secondary opacity-50" />
                                </div>
                            </VCardItem>
                        </VCard>

                        <!-- Set Location -->
                        <VCard flat hover @click="$router.push('/teacher/profile')" class="rounded-xl border shadow-sm transition-all quick-action-card">
                            <VCardItem class="pa-4">
                                <div class="d-flex align-center gap-4">
                                    <VAvatar color="info" variant="tonal" size="48" class="rounded-lg">
                                        <VIcon icon="tabler-map-pin" size="24" />
                                    </VAvatar>
                                    <div>
                                        <div class="font-weight-bold text-body-1">{{ $t('TeacherDashboard.FilterLocation') || 'تحديد الموقع' }}</div>
                                        <div class="text-caption text-secondary">{{ $t('TeacherDashboard.FilterLocationDesc') || 'حدد منطقتك الجغرافية' }}</div>
                                    </div>
                                    <VSpacer />
                                    <VIcon icon="tabler-chevron-left" class="text-secondary opacity-50" />
                                </div>
                            </VCardItem>
                        </VCard>
                    </div>
                </VCol>
            </VRow>
        </template>
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.teacher-dashboard-page {
    .bg-primary-lighten-5 {
        background-color: rgba(var(--v-theme-primary), 0.05) !important;
    }
    
    .bg-info-subtle {
        background-color: rgba(var(--v-theme-info), 0.08) !important;
    }
    
    .bg-success-subtle {
        background-color: rgba(var(--v-theme-success), 0.08) !important;
    }
    
    .bg-warning-subtle {
        background-color: rgba(var(--v-theme-warning), 0.08) !important;
    }

    .stat-card-premium {
        border-radius: 24px !important;
        
        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05) !important;
        }
    }

    .shadow-sm {
        box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
    }

    .quick-action-card {
        border-color: rgba(var(--v-border-color), 0.08) !important;
        
        &:hover {
            border-color: rgba(var(--v-theme-primary), 0.2) !important;
            box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.08) !important;
            transform: translateX(-4px); // RTL friendly slide
        }
    }

    .tracking-wide {
        letter-spacing: 0.5px;
    }
    
    .line-height-1 {
        line-height: 1;
    }
}
</style>
