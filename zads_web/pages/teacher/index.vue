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
    <div>
        <!-- Greeting Section -->
        <VRow class="mb-4">
            <VCol cols="12">
                <VCard border flat color="var-theme-surface" class="bg-primary-lighten-5">
                    <VCardText class="d-flex align-center justify-space-between pa-6">
                        <div>
                            <h1 class="text-h4 font-weight-bold mb-2 text-primary-darken-1">
                                {{ $t('TeacherDashboard.WelcomeBack', { name: teacherStore.profile?.user?.name?.split(' ')[0] || '' }) }}
                            </h1>
                            <p class="text-body-1 text-secondary mb-0">
                                {{ $t('TeacherDashboard.CompleteProfileDesc') || 'أكمل ملفك الشخصي لتظهر للطلاب وابدأ في التدريس' }}
                            </p>
                        </div>
                        <!-- Placeholder Logo / Graphic -->
                        <VIcon icon="tabler-school" color="primary" size="80" class="opacity-80 d-none d-sm-block" />
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>

        <VRow v-if="isLoading && !teacherStore.profile" class="mb-6">
            <VCol cols="12" class="d-flex justify-center py-12">
                <VProgressCircular indeterminate color="primary" size="48" />
            </VCol>
        </VRow>

        <template v-else>
            <!-- Stats Row -->
            <VRow class="mb-6">
                <!-- Total Profile Views -->
                <VCol cols="12" sm="4">
                    <VCard class="h-100" border flat>
                        <VCardItem>
                            <template #prepend>
                                <VAvatar color="info" variant="tonal" size="48" class="mr-3 rounded-lg">
                                    <VIcon icon="tabler-eye" size="24" />
                                </VAvatar>
                            </template>
                            <VCardTitle class="text-body-2 text-secondary mb-1">
                                {{ $t('TeacherDashboard.TotalViews') || 'المشاهدات' }}
                            </VCardTitle>
                            <VCardSubtitle class="text-h5 font-weight-bold text-high-emphasis opacity-100">
                                {{ stats.views }}
                            </VCardSubtitle>
                        </VCardItem>
                    </VCard>
                </VCol>

                <!-- Contact Requests -->
                <VCol cols="12" sm="4">
                    <VCard class="h-100 cursor-pointer" border flat hover @click="$router.push('/teacher/requests')">
                        <VCardItem>
                            <template #prepend>
                                <VAvatar color="success" variant="tonal" size="48" class="mr-3 rounded-lg">
                                    <VIcon icon="tabler-message" size="24" />
                                </VAvatar>
                            </template>
                            <VCardTitle class="text-body-2 text-secondary mb-1">
                                {{ $t('TeacherDashboard.ContactRequests') || 'الرسائل' }}
                            </VCardTitle>
                            <VCardSubtitle class="text-h5 font-weight-bold text-high-emphasis opacity-100">
                                {{ stats.contactRequests }}
                            </VCardSubtitle>
                        </VCardItem>
                    </VCard>
                </VCol>

                <!-- Opportunities (General Requests) -->
                <VCol cols="12" sm="4">
                    <VCard class="h-100 cursor-pointer" border flat hover @click="$router.push('/teacher/requests')">
                        <VCardItem>
                            <template #prepend>
                                <VAvatar color="warning" variant="tonal" size="48" class="mr-3 rounded-lg">
                                    <VIcon icon="tabler-school" size="24" />
                                </VAvatar>
                            </template>
                            <VCardTitle class="text-body-2 text-secondary mb-1">
                                {{ $t('TeacherDashboard.Opportunities') || 'الفرص' }}
                            </VCardTitle>
                            <VCardSubtitle class="text-h5 font-weight-bold text-high-emphasis opacity-100">
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
                        <VCard border flat hover @click="$router.push('/teacher/profile')" class="rounded-lg">
                            <VCardItem class="pa-3">
                                <div class="d-flex align-center gap-3">
                                    <VAvatar color="primary" variant="tonal" size="40" class="rounded">
                                        <VIcon icon="tabler-user-edit" size="20" />
                                    </VAvatar>
                                    <div>
                                        <div class="font-weight-bold text-body-1">{{ $t('TeacherDashboard.EditProfile') || 'تعديل الملف الشخصي' }}</div>
                                        <div class="text-caption text-secondary">{{ $t('TeacherDashboard.EditProfileDesc') || 'أضف معلوماتك ومواد التدريس' }}</div>
                                    </div>
                                    <VSpacer />
                                    <VIcon icon="tabler-chevron-left" class="text-secondary" />
                                </div>
                            </VCardItem>
                        </VCard>

                        <!-- Manage Subjects -->
                        <VCard border flat hover @click="$router.push('/teacher/subjects')" class="rounded-lg">
                            <VCardItem class="pa-3">
                                <div class="d-flex align-center gap-3">
                                    <VAvatar color="primary" variant="tonal" size="40" class="rounded">
                                        <VIcon icon="tabler-books" size="20" />
                                    </VAvatar>
                                    <div>
                                        <div class="font-weight-bold text-body-1">{{ $t('TeacherDashboard.ManageSubjects') || 'تحديد المواد والمراحل' }}</div>
                                        <div class="text-caption text-secondary">{{ $t('TeacherDashboard.ManageSubjectsDesc') || 'حدد المواد والمراحل التي تدرسها' }}</div>
                                    </div>
                                    <VSpacer />
                                    <VIcon icon="tabler-chevron-left" class="text-secondary" />
                                </div>
                            </VCardItem>
                        </VCard>

                        <!-- Set Location -->
                        <VCard border flat hover @click="$router.push('/teacher/profile')" class="rounded-lg">
                            <VCardItem class="pa-3">
                                <div class="d-flex align-center gap-3">
                                    <VAvatar color="primary" variant="tonal" size="40" class="rounded">
                                        <VIcon icon="tabler-map-pin" size="20" />
                                    </VAvatar>
                                    <div>
                                        <div class="font-weight-bold text-body-1">{{ $t('TeacherDashboard.FilterLocation') || 'تحديد الموقع' }}</div>
                                        <div class="text-caption text-secondary">{{ $t('TeacherDashboard.FilterLocationDesc') || 'حدد منطقتك الجغرافية' }}</div>
                                    </div>
                                    <VSpacer />
                                    <VIcon icon="tabler-chevron-left" class="text-secondary" />
                                </div>
                            </VCardItem>
                        </VCard>
                    </div>
                </VCol>
            </VRow>
        </template>
    </div>
</template>

<style lang="scss" scoped>
.bg-primary-lighten-5 {
    background-color: rgba(var(--v-theme-primary), 0.05) !important;
}
</style>
