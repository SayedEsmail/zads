<script setup>
const props = defineProps({
    modelValue: Boolean,
    parent: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['update:modelValue'])

const isDialogVisible = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val),
})

const formatDate = dateStr => {
    if (!dateStr) return '-'
    
    return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
</script>

<template>
    <VDialog
        v-model="isDialogVisible"
        max-width="700"
    >
        <VCard>
            <!-- Header -->
            <VCardText class="d-flex align-center gap-4 py-8">
                <VAvatar
                    size="80"
                    color="info"
                    variant="tonal"
                >
                    <span class="text-h3">{{ parent.user?.name?.charAt(0) }}</span>
                </VAvatar>

                <div>
                    <h4 class="text-h4 mb-1">
                        {{ parent.user?.name }}
                    </h4>
                    <div class="d-flex align-center gap-4 text-body-1 text-medium-emphasis mb-2">
                        <span dir="ltr">{{ parent.user?.phone }}</span>
                        <VDivider vertical />
                        <span>{{ parent.user?.email || '-' }}</span>
                    </div>
                    <VChip
                        :color="parent.user?.status === 'active' ? 'success' : 'error'"
                        size="small"
                        label
                    >
                        {{ parent.user?.status === 'active' ? 'نشط' : 'موقوف' }}
                    </VChip>
                </div>
            </VCardText>

            <VDivider />

            <!-- Content -->
            <VCardText>
                <div class="mb-6">
                    <div class="d-flex align-center justify-space-between mb-4">
                        <h6 class="text-h6">
                            الأبناء ({{ parent.children?.length || 0 }})
                        </h6>
                    </div>

                    <VList
                        v-if="parent.children?.length"
                        class="card-list"
                        border
                        rounded
                    >
                        <VListItem
                            v-for="child in parent.children"
                            :key="child.id"
                        >
                            <template #prepend>
                                <VAvatar
                                    color="secondary"
                                    variant="tonal"
                                    size="34"
                                    rounded
                                >
                                    <VIcon
                                        icon="tabler-user"
                                        size="20"
                                    />
                                </VAvatar>
                            </template>

                            <VListItemTitle class="font-weight-medium">
                                {{ child.name }}
                            </VListItemTitle>
                            <VListItemSubtitle>
                                {{ child.stage?.nameAr }}
                            </VListItemSubtitle>
                        </VListItem>
                    </VList>

                    <div
                        v-else
                        class="text-center pa-4 text-medium-emphasis bg-var-theme-background rounded"
                    >
                        لا يوجد أبناء مسجلين
                    </div>
                </div>

                <div>
                    <h6 class="text-h6 mb-4">
                        إحصائيات
                    </h6>
                    <div class="d-flex gap-4">
                        <VCard
                            variant="outlined"
                            class="flex-grow-1 text-center pa-4"
                        >
                            <div class="text-h4 text-primary">
                                {{ parent.tutorRequests?.length || 0 }}
                            </div>
                            <div class="text-caption">
                                طلبات دروس
                            </div>
                        </VCard>
                        <VCard
                            variant="outlined"
                            class="flex-grow-1 text-center pa-4"
                        >
                            <div class="text-h4 text-info">
                                {{ parent.contactRequests?.length || 0 }}
                            </div>
                            <div class="text-caption">
                                طلبات تواصل
                            </div>
                        </VCard>
                    </div>
                </div>
            </VCardText>

            <VDivider />

            <VCardActions class="justify-end">
                <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="isDialogVisible = false"
                >
                    إغلاق
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>
