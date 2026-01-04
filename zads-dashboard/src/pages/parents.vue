<script setup>
import AppListingTable from '@/components/AppListingTable.vue'
import api from '@/services/api'

// Table ref for refresh
const tableRef = ref(null)
const selectedRows = ref([])

// Table headers
const headers = [
    { title: 'ولي الأمر', key: 'user', sortable: true },
    { title: 'رقم الهاتف', key: 'phone', sortable: false },
    { title: 'البريد الإلكتروني', key: 'email', sortable: false },
    { title: 'الحالة', key: 'status', sortable: true },
    { title: 'تاريخ التسجيل', key: 'createdAt', sortable: true },
    { title: 'الإجراءات', key: 'actions', sortable: false },
]

// Actions
const actions = {
    single: [
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
    if (type === 'suspend') {
        await updateStatus(item.user?.id, 'suspended')
    }
    else if (type === 'activate') {
        await updateStatus(item.user?.id, 'active')
    }
}

// Update status
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
                    إدارة أولياء الأمور
                </h4>
                <p class="text-body-1 text-medium-emphasis mb-0">
                    عرض وإدارة جميع أولياء الأمور المسجلين
                </p>
            </div>
        </div>

        <!-- Reusable Table Component -->
        <AppListingTable
            ref="tableRef"
            v-model="selectedRows"
            :headers="headers"
            :single-actions="actions.single"
            :bulk-actions="actions.bulk"
            api-url="/admin/parents"
            resource="parents"
            search-placeholder="الاسم أو رقم الهاتف..."
            @action="handleAction"
        >
            <!-- User Column -->
            <template #item.user="{ item }">
                <div class="d-flex align-center gap-x-3">
                    <VAvatar
                        size="34"
                        color="info"
                        variant="tonal"
                    >
                        <span>{{ item.user?.name?.charAt(0) }}</span>
                    </VAvatar>
                    <div class="text-body-1 font-weight-medium">
                        {{ item.user?.name }}
                    </div>
                </div>
            </template>

            <!-- Phone Column -->
            <template #item.phone="{ item }">
                <span dir="ltr">{{ item.user?.phone }}</span>
            </template>

            <!-- Email Column -->
            <template #item.email="{ item }">
                {{ item.user?.email || '-' }}
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
