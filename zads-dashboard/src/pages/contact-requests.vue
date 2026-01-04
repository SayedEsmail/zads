<script setup>
import api from '@/services/api'

// Note: This page needs a new API endpoint. For now, we'll show placeholder data.
const contactRequests = ref([])
const loading = ref(true)

// Pagination
const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)

// Table headers
const headers = [
    { title: 'ولي الأمر', key: 'parent', sortable: false },
    { title: 'المدرس', key: 'teacher', sortable: false },
    { title: 'المادة', key: 'subject', sortable: false },
    { title: 'الحالة', key: 'status', sortable: true },
    { title: 'التاريخ', key: 'createdAt', sortable: true },
]

// Fetch contact requests
const fetchContactRequests = async () => {
    try {
        loading.value = true

        // TODO: Add admin endpoint for listing all contact requests
        // const response = await api.get('/admin/contact-requests', {
        //     params: { page: page.value, limit: itemsPerPage.value }
        // })
        // contactRequests.value = response.data
        // totalItems.value = response.pagination?.total || 0

        // Placeholder for now
        contactRequests.value = []
        totalItems.value = 0
    } catch (error) {
        console.error('Failed to fetch contact requests:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchContactRequests()
})

// Format date
const formatDate = dateStr => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Get status color
const getStatusColor = status => {
    switch (status) {
    case 'pending':
        return 'warning'
    case 'accepted':
        return 'success'
    case 'rejected':
        return 'error'
    default:
        return 'secondary'
    }
}

// Get status label
const getStatusLabel = status => {
    switch (status) {
    case 'pending':
        return 'في الانتظار'
    case 'accepted':
        return 'مقبول'
    case 'rejected':
        return 'مرفوض'
    default:
        return status
    }
}
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="d-flex align-center justify-space-between mb-6">
            <div>
                <h4 class="text-h4 mb-1">
                    طلبات التواصل
                </h4>
                <p class="text-body-1 text-medium-emphasis mb-0">
                    عرض جميع طلبات التواصل بين أولياء الأمور والمدرسين
                </p>
            </div>
            <VBtn
                color="primary"
                variant="tonal"
                prepend-icon="tabler-refresh"
                :loading="loading"
                @click="fetchContactRequests"
            >
                تحديث
            </VBtn>
        </div>

        <!-- Data Table -->
        <VCard>
            <VDataTableServer
                v-model:page="page"
                v-model:items-per-page="itemsPerPage"
                :headers="headers"
                :items="contactRequests"
                :items-length="totalItems"
                :loading="loading"
                class="text-no-wrap"
            >
                <!-- Parent Column -->
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

                <!-- Teacher Column -->
                <template #item.teacher="{ item }">
                    <div class="d-flex align-center gap-x-3">
                        <VAvatar
                            size="34"
                            color="primary"
                            variant="tonal"
                        >
                            <span>{{ item.teacher?.user?.name?.charAt(0) }}</span>
                        </VAvatar>
                        <div class="text-body-1 font-weight-medium">
                            {{ item.teacher?.user?.name }}
                        </div>
                    </div>
                </template>

                <!-- Subject Column -->
                <template #item.subject="{ item }">
                    <VChip
                        v-if="item.subject"
                        size="small"
                        color="primary"
                        variant="tonal"
                    >
                        {{ item.subject?.nameAr }}
                    </VChip>
                    <span v-else>-</span>
                </template>

                <!-- Status Column -->
                <template #item.status="{ item }">
                    <VChip
                        :color="getStatusColor(item.status)"
                        size="small"
                        label
                    >
                        {{ getStatusLabel(item.status) }}
                    </VChip>
                </template>

                <!-- Created At Column -->
                <template #item.createdAt="{ item }">
                    {{ formatDate(item.createdAt) }}
                </template>

                <!-- Empty state -->
                <template #no-data>
                    <div class="text-center pa-8">
                        <VIcon
                            icon="tabler-messages-off"
                            size="48"
                            color="secondary"
                            class="mb-4"
                        />
                        <p class="text-body-1 text-medium-emphasis">
                            لا توجد طلبات تواصل حتى الآن
                        </p>
                    </div>
                </template>
            </VDataTableServer>
        </VCard>
    </div>
</template>
