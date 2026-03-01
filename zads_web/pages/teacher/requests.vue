<script setup>
import { useContactRequestsStore } from '~/stores/contactRequests'
import { useTutorRequestsStore } from '~/stores/tutorRequests'
import { useTeacherStore } from '~/stores/teacher'

definePageMeta({
    layout: 'default',
})

const requestsStore = useContactRequestsStore()
const tutorRequestsStore = useTutorRequestsStore()
const teacherStore = useTeacherStore()

const { t } = useI18n()
const { showSnackbar } = useSnackbar()

const isUpdating = ref(null) // Stores the ID of the request currently being updated
const activeTab = ref('students')

onMounted(async () => {
    // Fetch Contact Requests
    await requestsStore.fetchIncomingRequests()

    // Fetch General Tutor Requests in the teacher's area
    let profile = teacherStore.profile
    if (!profile) {
        profile = await teacherStore.fetchProfile()
    }
    if (profile?.areaId) {
        tutorRequestsStore.filters.areaId = profile.areaId
    }
    await tutorRequestsStore.fetchTutorRequests(1)
})

const handleStatusUpdate = async (requestId, newStatus) => {
    isUpdating.value = requestId
    try {
        await requestsStore.updateRequestStatus(requestId, newStatus)
        showSnackbar(t('TeacherRequests.StatusUpdatedSuccess') || 'تم التحديث بنجاح', 'success')
    } catch (error) {
        showSnackbar(t('TeacherRequests.StatusUpdateFailed') || 'حدث خطأ أثناء التحديث', 'error')
    } finally {
        isUpdating.value = null
    }
}

const handleContactParent = (request) => {
    // Mobile parity: The mobile app currently has a "// TODO" for this action.
    showSnackbar(t('TeacherRequests.ContactParentComingSoon') || 'ميزة تعيين التواصل مع ولي الأمر ستتوفر قريباً!', 'info')
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

const handlePageChange = async (page) => {
    await tutorRequestsStore.fetchTutorRequests(page)
}
</script>

<template>
    <div class="teacher-requests-page">
        <!-- Premium Header Section -->
        <PremiumPageHeader
            :title="$t('TeacherRequests.Title')"
            :description="$t('TeacherRequests.Desc') || 'إدارة طلبات الطلاب وطلبات التواصل الواردة'"
        >
            <template #actions>
                <div class="premium-tabs-container w-100 mt-2">
                    <VTabs
                        v-model="activeTab"
                        color="primary"
                        align-tabs="start"
                        class="premium-tabs rounded-pill"
                        hide-slider
                    >
                        <VTab value="students" class="rounded-pill px-6">
                            <VIcon icon="tabler-school" start />
                            {{ $t('TeacherRequests.StudentsTab') || 'الطلاب' }}
                            <VBadge
                                v-if="tutorRequestsStore.pagination?.total"
                                :content="tutorRequestsStore.pagination.total"
                                color="error"
                                class="ml-2"
                                inline
                            />
                        </VTab>
                        <VTab value="contact" class="rounded-pill px-6">
                            <VIcon icon="tabler-message" start />
                            {{ $t('TeacherRequests.ContactRequestsTab') || 'طلبات التواصل' }}
                            <VBadge
                                v-if="requestsStore.requests?.length"
                                :content="requestsStore.requests.length"
                                color="error"
                                class="ml-2"
                                inline
                            />
                        </VTab>
                    </VTabs>
                </div>
            </template>
        </PremiumPageHeader>

        <VContainer class="mt-n8">

        <VWindow v-model="activeTab" :touch="false" class="overflow-visible">
            <!-- Students Tab (General Tutor Requests) -->
            <VWindowItem value="students">
                <VRow v-if="tutorRequestsStore.loading && !tutorRequestsStore.requests.length" justify="center" class="py-12">
                    <VProgressCircular indeterminate color="primary" size="48" />
                </VRow>
                
                <VRow v-else-if="!tutorRequestsStore.requests.length">
                    <VCol cols="12">
                        <VCard class="text-center py-12" border flat bg-color="transparent">
                            <VCardText>
                                <VIcon icon="tabler-school-off" size="64" color="secondary" class="mb-4 opacity-50" />
                                <h6 class="text-h6 font-weight-medium mb-2">{{ $t('TeacherRequests.NoStudentsRequests') || 'لا توجد طلبات طلاب حالياً' }}</h6>
                                <p class="text-secondary">{{ $t('TeacherRequests.NoStudentsRequestsDesc') || 'ستظهر هنا طلبات الطلاب البحث عن معلمين في منطقتك.' }}</p>
                            </VCardText>
                        </VCard>
                    </VCol>
                </VRow>

                <VRow v-else>
                    <VCol v-for="request in tutorRequestsStore.requests" :key="request.id" cols="12" md="6" lg="4">
                        <TutorRequestCard
                            :request="request"
                            @contact="handleContactParent"
                        />
                    </VCol>
                </VRow>
                
                <!-- Pagination -->
                <div v-if="tutorRequestsStore.pagination?.totalPages > 1" class="d-flex justify-center mt-6">
                    <VPagination
                        v-model="tutorRequestsStore.pagination.page"
                        :length="tutorRequestsStore.pagination.totalPages"
                        @update:model-value="handlePageChange"
                    />
                </div>
            </VWindowItem>

            <!-- Contact Requests Tab -->
            <VWindowItem value="contact">
                <VRow v-if="requestsStore.loading && !requestsStore.requests.length" justify="center" class="py-12">
                    <VProgressCircular indeterminate color="primary" size="48" />
                </VRow>

                <VRow v-else-if="!requestsStore.requests.length">
                    <VCol cols="12">
                        <VCard class="text-center py-12" border flat bg-color="transparent">
                            <VCardText>
                                <VIcon icon="tabler-mail-off" size="64" color="secondary" class="mb-4 opacity-50" />
                                <h6 class="text-h6 font-weight-medium mb-2">{{ $t('TeacherRequests.NoRequests') || 'لا توجد طلبات تواصل' }}</h6>
                                <p class="text-secondary">{{ $t('TeacherRequests.NoRequestsDesc') || 'عندما يقوم ولي الأمر بالتواصل معك مباشرة، سيظهر الطلب هنا.' }}</p>
                            </VCardText>
                        </VCard>
                    </VCol>
                </VRow>

                <VRow v-else>
                    <VCol v-for="request in requestsStore.requests" :key="request.id" cols="12">
                        <VCard class="mb-4 request-card-premium border-0" flat>
                            <VCardItem class="pa-5">
                                <template #prepend>
                                    <VAvatar color="primary" variant="tonal" size="64" class="rounded-xl shadow-sm mr-4">
                                        <VImg v-if="request.parent?.user?.avatarUrl" :src="request.parent.user.avatarUrl" />
                                        <VIcon v-else icon="tabler-user" size="32" />
                                    </VAvatar>
                                </template>

                                <div class="d-flex align-center justify-space-between flex-wrap gap-2 w-100">
                                    <VCardTitle class="text-h6 font-weight-bold pa-0">
                                        {{ request.parent?.user?.name || $t('UnknownParent') }}
                                    </VCardTitle>
                                    
                                    <VChip
                                        :color="statusColors[request.status]"
                                        size="small"
                                        class="font-weight-medium px-4"
                                        variant="tonal"
                                    >
                                        <VIcon start :icon="statusIcons[request.status]" size="16" />
                                        {{ $t(`RequestStatus.${request.status}`) }}
                                    </VChip>
                                </div>
                                
                                <VCardSubtitle class="d-flex align-center flex-wrap gap-4 mt-3 pa-0">
                                    <span v-if="request.status === 'accepted'" class="d-flex align-center gap-1 text-body-1 font-weight-medium text-success">
                                        <VIcon icon="tabler-phone" size="20" />
                                        <span dir="ltr">{{ request.parent?.user?.phone || '-' }}</span>
                                    </span>
                                    <span class="d-flex align-center gap-1 text-body-1 font-weight-medium">
                                        <VIcon icon="tabler-school" size="20" color="secondary" />
                                        {{ request.child?.name || 'طالب' }} ({{ request.child?.stage?.nameAr || 'مرحلة' }})
                                    </span>
                                </VCardSubtitle>
                            </VCardItem>

                            <VCardText class="px-5 pb-5">
                                <div class="pa-4 bg-primary-lighten-5 rounded-lg border-primary-light">
                                    <p class="text-body-1 font-italic mb-0 text-high-emphasis line-height-relaxed">
                                        "{{ request.message }}"
                                    </p>
                                </div>
                            </VCardText>

                            <template v-if="request.status === 'pending'">
                                <VDivider class="border-opacity-10 mx-5" />

                                <VCardActions class="pa-5 justify-end gap-4">
                                    <VBtn
                                        color="error"
                                        variant="tonal"
                                        size="large"
                                        class="rounded-pill font-weight-bold px-6"
                                        prepend-icon="tabler-x"
                                        :loading="isUpdating === request.id"
                                        :disabled="isUpdating === request.id"
                                        @click="handleStatusUpdate(request.id, 'rejected')"
                                    >
                                        {{ $t('TeacherRequests.Reject') || 'رفض' }}
                                    </VBtn>
                                    <VBtn
                                        color="success"
                                        variant="flat"
                                        size="large"
                                        class="rounded-pill font-weight-bold px-8 shadow-success"
                                        prepend-icon="tabler-check"
                                        :loading="isUpdating === request.id"
                                        :disabled="isUpdating === request.id"
                                        @click="handleStatusUpdate(request.id, 'accepted')"
                                    >
                                        {{ $t('TeacherRequests.Accept') || 'قبول' }}
                                    </VBtn>
                                </VCardActions>
                            </template>
                        </VCard>
                    </VCol>
                </VRow>
            </VWindowItem>
        </VWindow>
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.teacher-requests-page {
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

    .request-card-premium {
        border-radius: 24px !important;
        border: 1px solid rgba(var(--v-border-color), 0.06) !important;
        transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.03) !important;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 32px rgba(var(--v-theme-primary), 0.08) !important;
            border-color: rgba(var(--v-theme-primary), 0.2) !important;
        }
    }

    .bg-primary-lighten-5 {
        background-color: rgba(var(--v-theme-primary), 0.04) !important;
    }

    .border-primary-light {
        border: 1px solid rgba(var(--v-theme-primary), 0.1);
    }

    .shadow-sm {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
    }

    .shadow-success {
        box-shadow: 0 8px 16px rgba(var(--v-theme-success), 0.2) !important;
    }

    .line-height-relaxed {
        line-height: 1.8;
    }
}

/* Fix to ensure dropdowns or shadows in windows aren't clipped */
.overflow-visible {
    overflow: visible !important;
}
</style>
