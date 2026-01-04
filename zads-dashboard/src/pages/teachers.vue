<script setup>
import AppListingTable from '@/components/AppListingTable.vue'

// Table ref for refresh
const tableRef = ref(null)
const selectedRows = ref([])

// Table headers
const headers = [
    { title: 'المدرس', key: 'user', sortable: true },
    { title: 'رقم الهاتف', key: 'phone', sortable: false },
    { title: 'المواد', key: 'subjects', sortable: false },
    { title: 'التقييم', key: 'rating', sortable: true },
    { title: 'المشاهدات', key: 'views', sortable: true },
    { title: 'الحالة', key: 'status', sortable: true },
    { title: 'تاريخ التسجيل', key: 'createdAt', sortable: true },
    { title: 'الإجراءات', key: 'actions', sortable: false },
]

// Filters
const filters = [
    {
        key: 'status',
        label: 'الحالة',
        type: 'select',
        cols: 3,
        options: [
            { title: 'الكل', value: null },
            { title: 'نشط', value: 'active' },
            { title: 'موقوف', value: 'suspended' },
        ],
    },
]

// Actions
const actions = {
    single: [
        { key: 'view', label: 'عرض التفاصيل', icon: 'tabler-eye', color: 'primary' },
        {
            key: 'suspend',
            label: 'إيقاف',
            icon: 'tabler-ban',
            color: 'error',
            condition: item => item.user?.status === 'active',
        },
        {
            key: 'activate',
            label: 'تفعيل',
            icon: 'tabler-check',
            color: 'success',
            condition: item => item.user?.status !== 'active',
        },
    ],
    bulk: [],
}

// Handle actions
const handleAction = async ({ type, item }) => {
    if (type === 'view') {
        // TODO: Navigate to details or open modal
        console.log('View teacher:', item)
    }
    else if (type === 'suspend') {
        await updateStatus(item.user?.id, 'suspended')
    }
    else if (type === 'activate') {
        await updateStatus(item.user?.id, 'active')
    }
}

// Update status
import api from '@/services/api'

const updateStatus = async (userId, newStatus) => {
    try {
        await api.patch(`/admin/users/${userId}/status`, { status: newStatus })
        tableRef.value?.refresh()
    }
    catch (error) {
        console.error('Failed to update status:', error)
    }
}

// Helper functions
const formatDate = dateStr => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

const getStatusColor = status => {
    return status === 'active' ? 'success' : 'error'
}

const getStatusLabel = status => {
    return status === 'active' ? 'نشط' : 'موقوف'
}
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="d-flex align-center justify-space-between mb-6">
            <div>
                <h4 class="text-h4 mb-1">
                    إدارة المدرسين
                </h4>
                <p class="text-body-1 text-medium-emphasis mb-0">
                    عرض وإدارة جميع المدرسين المسجلين
                </p>
            </div>
        </div>

        <!-- Reusable Table Component -->
        <AppListingTable
            ref="tableRef"
            v-model="selectedRows"
            :headers="headers"
            :filters="filters"
            :single-actions="actions.single"
            :bulk-actions="actions.bulk"
            api-url="/admin/teachers"
            resource="teachers"
            search-placeholder="الاسم أو رقم الهاتف..."
            @action="handleAction"
        >
            <!-- User Column -->
            <template #item.user="{ item }">
                <div class="d-flex align-center gap-x-3">
                    <VAvatar
                        size="34"
                        :image="item.user?.avatarUrl"
                        color="primary"
                        variant="tonal"
                    >
                        <span v-if="!item.user?.avatarUrl">
                            {{ item.user?.name?.charAt(0) }}
                        </span>
                    </VAvatar>
                    <div>
                        <div class="text-body-1 font-weight-medium">
                            {{ item.user?.name }}
                        </div>
                        <div class="text-body-2 text-medium-emphasis">
                            {{ item.user?.email || '-' }}
                        </div>
                    </div>
                </div>
            </template>

            <!-- Phone Column -->
            <template #item.phone="{ item }">
                <span dir="ltr">{{ item.user?.phone }}</span>
            </template>

            <!-- Subjects Column -->
            <template #item.subjects="{ item }">
                <div class="d-flex flex-wrap gap-1">
                    <VChip
                        v-for="(ts, idx) in item.subjects?.slice(0, 2)"
                        :key="idx"
                        size="small"
                        color="primary"
                        variant="tonal"
                    >
                        {{ ts.subject?.nameAr }}
                    </VChip>
                    <VChip
                        v-if="item.subjects?.length > 2"
                        size="small"
                        color="secondary"
                    >
                        +{{ item.subjects.length - 2 }}
                    </VChip>
                </div>
            </template>

            <!-- Rating Column -->
            <template #item.rating="{ item }">
                <div class="d-flex align-center gap-1">
                    <VIcon
                        icon="tabler-star-filled"
                        color="warning"
                        size="18"
                    />
                    <span>{{ item.avgRating || 0 }}</span>
                </div>
            </template>

            <!-- Views Column -->
            <template #item.views="{ item }">
                {{ item.viewsCount?.toLocaleString('ar-EG') || 0 }}
            </template>

            <!-- Status Column -->
            <template #item.status="{ item }">
                <VChip
                    :color="getStatusColor(item.user?.status)"
                    size="small"
                    label
                >
                    {{ getStatusLabel(item.user?.status) }}
                </VChip>
            </template>

            <!-- Created At Column -->
            <template #item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
            </template>
        </AppListingTable>
    </div>
</template>
