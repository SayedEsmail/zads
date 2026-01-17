<script setup>
import api from '@/services/api'

// Data
const requests = ref([])
const loading = ref(true)
const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const searchQuery = ref('')

// Delete Dialog
const deleteDialog = ref(false)
const requestToDelete = ref(null)
const deleting = ref(false)

// Table headers
const headers = [
    { title: 'ولي الأمر', key: 'parent', sortable: false },
    { title: 'المادة / المرحلة', key: 'education', sortable: false },
    { title: 'التفاصيل', key: 'details', sortable: false },
    { title: 'ملاحظات', key: 'notes', sortable: false },
    { title: 'الحالة', key: 'status', sortable: true },
    { title: 'التاريخ', key: 'createdAt', sortable: true },
    { title: 'إجراءات', key: 'actions', sortable: false },
]

// Fetch requests
const fetchRequests = async () => {
    try {
        loading.value = true
        const response = await api.get('/admin/tutor-requests', {
            params: {
                page: page.value,
                limit: itemsPerPage.value,
                search: searchQuery.value,
            },
        })

        requests.value = response.data
        totalItems.value = response.pagination.total
    }
    catch (error) {
        console.error('Failed to fetch tutor requests:', error)
    }
    finally {
        loading.value = false
    }
}

// Delete Request
const confirmDelete = item => {
    requestToDelete.value = item
    deleteDialog.value = true
}

const deleteRequest = async () => {
    if (!requestToDelete.value) return

    try {
        deleting.value = true
        await api.delete(`/admin/tutor-requests/${requestToDelete.value.id}`)
        deleteDialog.value = false
        fetchRequests() // Typo fix: fetchRequests
    }
    catch (error) {
        console.error('Failed to delete request:', error)
    }
    finally {
        deleting.value = false
        requestToDelete.value = null
        // Reload
        fetchRequests()
    }
}

watch([page, itemsPerPage], () => {
    fetchRequests()
})

// Debounced search
let searchTimeout
watch(searchQuery, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        page.value = 1
        fetchRequests()
    }, 500)
})

onMounted(() => {
    fetchRequests()
})

// Utilities
const formatDate = dateStr => {
    if (!dateStr)
        return '-'

    return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

const getStatusColor = status => {
    switch (status) {
    case 'pending': return 'warning'
    case 'accepted': return 'success'
    case 'rejected': return 'error'
    case 'completed': return 'info'
    default: return 'secondary'
    }
}

const getStatusLabel = status => {
    switch (status) {
    case 'pending': return 'قيد الانتظار'
    case 'accepted': return 'مقبول'
    case 'rejected': return 'مرفوض'
    case 'completed': return 'مكتمل'
    default: return status
    }
}

const getTypeLabel = type => {
    switch (type) {
    case 'at_student': return 'في منزل الطالب'
    case 'at_teacher': return 'في منزل المعلم'
    case 'online': return 'أونلاين'
    case 'group': return 'مجموعة'
    default: return type
    }
}
</script>

<template>
    <div>
        <!-- Header -->
        <div class="d-flex align-center justify-space-between mb-6">
            <div>
                <h4 class="text-h4 mb-1">
                    طلبات الدروس الخصوصية
                </h4>
                <p class="text-body-1 text-medium-emphasis mb-0">
                    إدارة طلبات الدروس المرسلة من أولياء الأمور
                </p>
            </div>
            <VBtn
                color="primary"
                variant="tonal"
                prepend-icon="tabler-refresh"
                :loading="loading"
                @click="fetchRequests"
            >
                تحديث
            </VBtn>
        </div>

        <VCard class="mb-6">
            <VCardText>
                <VTextField
                    v-model="searchQuery"
                    label="بحث عن ولي أمر..."
                    prepend-inner-icon="tabler-search"
                    density="compact"
                    variant="outlined"
                    hide-details
                    single-line
                    style="max-width: 300px"
                />
            </VCardText>
        </VCard>

        <!-- Table -->
        <VCard>
            <VDataTableServer
                v-model:page="page"
                v-model:items-per-page="itemsPerPage"
                :headers="headers"
                :items="requests"
                :items-length="totalItems"
                :loading="loading"
                class="text-no-wrap"
                item-value="id"
            >
                <!-- Parent -->
                <template #item.parent="{ item }">
                    <div class="d-flex align-center gap-x-3">
                        <VAvatar
                            size="34"
                            color="info"
                            variant="tonal"
                        >
                            <VImg
                                v-if="item.parent?.user?.avatarUrl"
                                :src="item.parent.user.avatarUrl"
                            />
                            <span v-else>{{ item.parent?.user?.name?.charAt(0) }}</span>
                        </VAvatar>
                        <div>
                            <div class="text-body-1 font-weight-medium">
                                {{ item.parent?.user?.name || 'غير معروف' }}
                            </div>
                            <div
                                class="text-body-2 text-medium-emphasis"
                                dir="ltr"
                            >
                                {{ item.parent?.user?.phone }}
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Education (Subject + Stage) -->
                <template #item.education="{ item }">
                    <div class="d-flex flex-column gap-y-1">
                        <VChip
                            size="small"
                            color="primary"
                            variant="tonal"
                            class="justify-center"
                        >
                            {{ item.subject?.nameAr }}
                        </VChip>
                        <span class="text-caption text-medium-emphasis text-center">
                            {{ item.stage?.nameAr }}
                        </span>
                    </div>
                </template>

                <!-- Details (Type) -->
                <template #item.details="{ item }">
                    <VChip
                        size="small"
                        variant="outlined"
                    >
                        {{ getTypeLabel(item.type) }}
                    </VChip>
                </template>

                <!-- Notes -->
                <template #item.notes="{ item }">
                    <VTooltip v-if="item.notes" location="top">
                        <template #activator="{ props }">
                            <span
                                v-bind="props"
                                class="text-body-2 text-truncate d-inline-block cursor-pointer"
                                style="max-width: 200px;"
                            >
                                {{ item.notes }}
                            </span>
                        </template>
                        <span>{{ item.notes }}</span>
                    </VTooltip>
                    <span
                        v-else
                        class="text-disabled"
                    >-</span>
                </template>

                <!-- Status -->
                <template #item.status="{ item }">
                    <VChip
                        :color="getStatusColor(item.status)"
                        size="small"
                        label
                    >
                        {{ getStatusLabel(item.status) }}
                    </VChip>
                </template>

                <!-- Date -->
                <template #item.createdAt="{ item }">
                    {{ formatDate(item.createdAt) }}
                </template>

                <!-- Actions -->
                <template #item.actions="{ item }">
                    <VBtn
                        icon
                        variant="text"
                        color="error"
                        size="small"
                        @click="confirmDelete(item)"
                    >
                        <VIcon icon="tabler-trash" />
                    </VBtn>
                </template>

                <template #no-data>
                    <div class="text-center pa-8">
                        <VIcon
                            icon="tabler-clipboard-list"
                            size="48"
                            color="secondary"
                            class="mb-4"
                        />
                        <p class="text-body-1 text-medium-emphasis">
                            لا توجد طلبات دروس حتى الآن
                        </p>
                    </div>
                </template>
            </VDataTableServer>
        </VCard>

        <!-- Delete Dialog -->
        <VDialog
            v-model="deleteDialog"
            max-width="400"
        >
            <VCard title="حذف الطلب">
                <VCardText>
                    هل أنت متأكد من رغبتك في حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
                </VCardText>

                <VCardActions>
                    <VSpacer />
                    <VBtn
                        color="secondary"
                        variant="text"
                        @click="deleteDialog = false"
                    >
                        إلغاء
                    </VBtn>
                    <VBtn
                        color="error"
                        variant="elevated"
                        :loading="deleting"
                        @click="deleteRequest"
                    >
                        حذف
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </div>
</template>
