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
    <div>
        <VRow class="mb-4">
            <VCol cols="12">
                <h1 class="text-h4 mb-2 d-flex align-center gap-2">
                    {{ $t('TeacherRequests.Title') }}
                    <VIcon icon="tabler-mail" color="primary" size="32" />
                </h1>
                <p class="text-body-1 text-secondary">
                    {{ $t('TeacherRequests.Desc') || 'إدارة طلبات الطلاب وطلبات التواصل الواردة' }}
                </p>
            </VCol>
        </VRow>

        <!-- Tabs -->
        <VTabs v-model="activeTab" align-tabs="start" color="primary" class="mb-6">
            <VTab value="students" class="text-subtitle-1 font-weight-bold">
                <VIcon start icon="tabler-school" />
                {{ $t('TeacherRequests.StudentsTab') || 'الطلاب' }}
                <VBadge
                    v-if="tutorRequestsStore.pagination?.total"
                    :content="tutorRequestsStore.pagination.total"
                    color="error"
                    class="ml-2"
                    inline
                />
            </VTab>
            <VTab value="contact" class="text-subtitle-1 font-weight-bold">
                <VIcon start icon="tabler-message" />
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
                                    <span v-if="request.status === 'accepted'" class="d-flex align-center gap-1 text-body-2">
                                        <VIcon icon="tabler-phone" size="18" />
                                        {{ request.parent?.user?.phone || '-' }}
                                    </span>
                                    <span class="d-flex align-center gap-1 text-body-2">
                                        <VIcon icon="tabler-school" size="18" />
                                        {{ request.child?.name || 'طالب' }} ({{ request.child?.stage?.nameAr || 'مرحلة' }})
                                    </span>
                                </VCardSubtitle>
                            </VCardItem>

                            <VCardText class="pt-4 pb-4 bg-var-theme-background opacity-90 rounded-b-lg mx-4 mb-4 mt-2">
                                <p class="text-body-1 font-italic mb-0 text-high-emphasis">
                                    "{{ request.message }}"
                                </p>
                            </VCardText>

                            <VCardActions v-if="request.status === 'pending'" class="px-6 pb-4 pt-0 justify-end gap-3">
                                <VBtn
                                    color="error"
                                    variant="outlined"
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
                                    prepend-icon="tabler-check"
                                    :loading="isUpdating === request.id"
                                    :disabled="isUpdating === request.id"
                                    @click="handleStatusUpdate(request.id, 'accepted')"
                                >
                                    {{ $t('TeacherRequests.Accept') || 'قبول' }}
                                </VBtn>
                            </VCardActions>
                        </VCard>
                    </VCol>
                </VRow>
            </VWindowItem>
        </VWindow>
    </div>
</template>

<style scoped>
/* Fix to ensure dropdowns or shadows in windows aren't clipped */
.overflow-visible {
    overflow: visible !important;
}
</style>
