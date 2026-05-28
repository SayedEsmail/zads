<script setup>
import api from '@/services/api'

// Stats data
const stats = ref({
    teachers: { total: 0, active: 0, newLast7Days: 0 },
    parents: { total: 0, newLast7Days: 0 },
    contactRequests: { total: 0, pending: 0 },
})

const loading = ref(true)

// Fetch dashboard stats
const fetchStats = async () => {
    try {
        loading.value = true

        const response = await api.get('/admin/dashboard')

        stats.value = response.data
    } catch (error) {
        console.error('Failed to fetch stats:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchStats()
})

// Stats cards configuration
const statsCards = computed(() => [
    {
        title: 'إجمالي المدرسين',
        value: stats.value.teachers?.total || 0,
        icon: 'tabler-users',
        color: 'primary',
        subtitle: `${stats.value.teachers?.newLast7Days || 0} جديد هذا الأسبوع`,
    },
    {
        title: 'المدرسين النشطين',
        value: stats.value.teachers?.active || 0,
        icon: 'tabler-user-check',
        color: 'success',
        subtitle: 'حاليا نشطين',
    },
    {
        title: 'أولياء الأمور',
        value: stats.value.parents?.total || 0,
        icon: 'tabler-user-heart',
        color: 'info',
        subtitle: `${stats.value.parents?.newLast7Days || 0} جديد هذا الأسبوع`,
    },
    {
        title: 'طلبات التواصل',
        value: stats.value.contactRequests?.total || 0,
        icon: 'tabler-messages',
        color: 'warning',
        subtitle: `${stats.value.contactRequests?.pending || 0} في الانتظار`,
    },
])
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="d-flex align-center justify-space-between mb-6">
            <div>
                <h4 class="text-h4 mb-1">
                    مرحباً بك في لوحة تحكم معلمي 👋
                </h4>
                <p class="text-body-1 text-medium-emphasis mb-0">
                    إليك نظرة عامة على إحصائيات المنصة
                </p>
            </div>
            <VBtn
                color="primary"
                prepend-icon="tabler-refresh"
                :loading="loading"
                @click="fetchStats"
            >
                تحديث
            </VBtn>
        </div>

        <!-- Stats Cards -->
        <VRow class="match-height">
            <VCol
                v-for="(card, index) in statsCards"
                :key="index"
                cols="12"
                sm="6"
                lg="3"
            >
                <VCard :loading="loading">
                    <VCardText class="d-flex justify-space-between">
                        <div>
                            <p class="text-body-1 text-medium-emphasis mb-1">
                                {{ card.title }}
                            </p>
                            <h4 class="text-h4 mb-2">
                                {{ card.value.toLocaleString('ar-EG') }}
                            </h4>
                            <p class="text-body-2 text-medium-emphasis mb-0">
                                {{ card.subtitle }}
                            </p>
                        </div>
                        <VAvatar
                            :color="card.color"
                            variant="tonal"
                            rounded
                            size="44"
                        >
                            <VIcon
                                :icon="card.icon"
                                size="28"
                            />
                        </VAvatar>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>

        <!-- Quick Actions -->
        <VRow class="mt-4">
            <VCol
                cols="12"
                md="6"
            >
                <VCard>
                    <VCardItem>
                        <VCardTitle>إجراءات سريعة</VCardTitle>
                    </VCardItem>
                    <VCardText>
                        <div class="d-flex flex-wrap gap-4">
                            <VBtn
                                color="primary"
                                variant="tonal"
                                prepend-icon="tabler-users"
                                :to="{ name: 'teachers' }"
                            >
                                عرض المدرسين
                            </VBtn>
                            <VBtn
                                color="info"
                                variant="tonal"
                                prepend-icon="tabler-user-heart"
                                :to="{ name: 'parents' }"
                            >
                                عرض أولياء الأمور
                            </VBtn>
                            <VBtn
                                color="warning"
                                variant="tonal"
                                prepend-icon="tabler-messages"
                                :to="{ name: 'contact-requests' }"
                            >
                                طلبات التواصل
                            </VBtn>
                        </div>
                    </VCardText>
                </VCard>
            </VCol>

            <VCol
                cols="12"
                md="6"
            >
                <VCard>
                    <VCardItem>
                        <VCardTitle>روابط مفيدة</VCardTitle>
                    </VCardItem>
                    <VCardText>
                        <VList>
                            <VListItem
                                prepend-icon="tabler-book"
                                title="إدارة المواد الدراسية"
                                :to="{ name: 'subjects' }"
                            />
                            <VListItem
                                prepend-icon="tabler-school"
                                title="إدارة المراحل التعليمية"
                                :to="{ name: 'stages' }"
                            />
                        </VList>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>
    </div>
</template>
