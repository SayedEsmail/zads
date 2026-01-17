<script setup>
import api from '@/services/api'

// Placeholder data for Tutor Requests
const requests = ref([])
const loading = ref(true)

// Pagination
const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)

// Table headers
const headers = [
    { title: 'ولي الأمر', key: 'parent', sortable: false },
    { title: 'المادة / المرحلة', key: 'education', sortable: false },
    { title: 'التفاصيل', key: 'details', sortable: false },
    { title: 'ملاحظات', key: 'notes', sortable: false },
    { title: 'الحالة', key: 'status', sortable: true },
    { title: 'التاريخ', key: 'createdAt', sortable: true },
]

// Fetch requests
const fetchRequests = async () => {
    try {
        loading.value = true

        // TODO: Integrate real API endpoint
        // const response = await api.get('/admin/tutor-requests', {
        //     params: { page: page.value, limit: itemsPerPage.value }
        // })

        // Simulating delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // Placeholder Data
        requests.value = [
            {
                id: 1,
                parent: { user: { name: 'أحمد محمد', phone: '01012345678' } },
                subject: { nameAr: 'اللغة العربية' },
                stage: { nameAr: 'الصف الثالث الإعدادي' },
                type: 'at_student',
                notes: 'محتاج مدرس شاطر في النحو',
                status: 'pending',
                createdAt: new Date().toISOString(),
            },
            {
                id: 2,
                parent: { user: { name: 'سارة علي', phone: '01234567890' } },
                subject: { nameAr: 'الرياضيات' },
                stage: { nameAr: 'الصف الأول الثانوي' },
                type: 'online',
                notes: '',
                status: 'accepted',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
        ]
        totalItems.value = 2
    }
    catch (error) {
        console.error('Failed to fetch tutor requests:', error)
    }
    finally {
        loading.value = false
    }
}

watch([page, itemsPerPage], () => {
    fetchRequests()
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
                            <span>{{ item.parent?.user?.name?.charAt(0) }}</span>
                        </VAvatar>
                        <div>
                            <div class="text-body-1 font-weight-medium">
                                {{ item.parent?.user?.name }}
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
                    <span
                        v-if="item.notes"
                        class="text-body-2 text-truncate d-inline-block"
                        style="max-width: 200px;"
                    >
                        {{ item.notes }}
                    </span>
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
                <!-- Could add view details button here if needed -->

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
    </div>
</template>
