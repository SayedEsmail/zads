<script setup>
import { useContactRequestsStore } from '~/stores/contactRequests'

definePageMeta({
    layout: 'default',
})

const store = useContactRequestsStore()

const statusColors = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error',
}

const statusLabels = {
    pending: 'انتظار',
    accepted: 'مقبول',
    rejected: 'مرفوض',
}

onMounted(() => {
    store.fetchMyRequests()
})
</script>

<template>
    <div>
        <VRow class="mb-6">
            <VCol cols="12">
                <h1 class="text-h4 mb-2">
                    طلبات التواصل 📨
                </h1>
                <p class="text-body-1 text-secondary">
                    تابع حالة طلبات التواصل مع المعلمين
                </p>
            </VCol>
        </VRow>

        <div v-if="store.loading" class="d-flex justify-center py-12">
            <VProgressCircular indeterminate color="primary" size="48" />
        </div>

        <VAlert
            v-else-if="store.error"
            color="error"
            variant="tonal"
            class="mb-4"
        >
            {{ store.error }}
            <template #append>
                <VBtn
                    variant="text"
                    size="small"
                    @click="store.fetchMyRequests"
                >
                    إعادة المحاولة
                </VBtn>
            </template>
        </VAlert>

        <VCard v-else-if="!store.requests.length" class="text-center py-12">
            <VIcon size="64" icon="tabler-mail-off" color="secondary" />
            <h4 class="text-h6 mt-4">لا توجد طلبات</h4>
            <p class="text-body-2 text-secondary">
                لم تقم بإرسال أي طلبات تواصل بعد
            </p>
            <VBtn
                to="/parent"
                color="primary"
                class="mt-4"
            >
                ابحث عن معلمين
            </VBtn>
        </VCard>

        <VRow v-else>
            <VCol
                v-for="request in store.requests"
                :key="request.id"
                cols="12"
                md="6"
            >
                <VCard>
                    <VCardItem>
                        <template #prepend>
                            <VAvatar
                                size="48"
                                :image="request.teacher?.user?.avatarUrl"
                                color="primary"
                            >
                                <span v-if="!request.teacher?.user?.avatarUrl">
                                    {{ request.teacher?.user?.name?.charAt(0) }}
                                </span>
                            </VAvatar>
                        </template>

                        <VCardTitle>
                            {{ request.teacher?.user?.name }}
                        </VCardTitle>
                        <VCardSubtitle>
                            {{ new Date(request.createdAt).toLocaleDateString('ar-EG') }}
                        </VCardSubtitle>

                        <template #append>
                            <VChip
                                :color="statusColors[request.status]"
                                size="small"
                                class="text-capitalize"
                            >
                                {{ statusLabels[request.status] || request.status }}
                            </VChip>
                        </template>
                    </VCardItem>

                    <VCardText>
                        <div class="d-flex align-center mb-3">
                            <VIcon
                                start
                                icon="tabler-user"
                                size="16"
                                color="secondary"
                            />
                            <span class="text-body-2">
                                الطالب: {{ request.child?.name }}
                            </span>
                            <VChip
                                size="x-small"
                                class="ms-2"
                                variant="tonal"
                            >
                                {{ request.child?.stage?.nameAr }}
                            </VChip>
                        </div>

                        <div v-if="request.message" class="bg-grey-100 pa-3 rounded mb-3">
                            <p class="text-caption text-secondary mb-1">
                                رسالتك:
                            </p>
                            <p class="text-body-2 mb-0">
                                {{ request.message }}
                            </p>
                        </div>

                        <!-- Teacher Contact Info (if accepted) -->
                        <div
                            v-if="request.status === 'accepted'"
                            class="bg-success-subtle pa-3 rounded border border-success"
                        >
                            <div class="d-flex align-center mb-2">
                                <VIcon
                                    start
                                    icon="tabler-phone"
                                    color="success"
                                    size="18"
                                />
                                <span class="text-body-2 font-weight-bold text-success">
                                    {{ request.teacher?.user?.phone }}
                                </span>
                            </div>
                            <p class="text-caption text-success mb-0">
                                يمكنك الآن التواصل مع المعلم مباشرة
                            </p>
                        </div>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>
    </div>
</template>
