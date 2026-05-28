<script setup>
import { computed } from 'vue'

const props = defineProps({
    request: {
        type: Object,
        required: true
    },
    compact: {
        type: Boolean,
        default: false
    }
})

const parentName = computed(() => {
    return props.request.parent?.user?.name || 'ولي أمر'
})

const parentAvatar = computed(() => {
    return props.request.parent?.user?.avatarUrl || null
})

const subjectName = computed(() => {
    return props.request.subject?.nameAr || props.request.subject?.name || 'مادة'
})

const stageName = computed(() => {
    return props.request.stage?.nameAr || props.request.stage?.name || 'مرحلة'
})

const description = computed(() => {
    return props.request.description || ''
})

const parentInitials = computed(() => {
    if (!parentName.value) return 'U'
    return parentName.value.substring(0, 2)
})

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(d)
}
</script>

<template>
    <VCard border flat class="mb-3 hover-card" @click="$emit('click')">
        <VCardItem class="pa-4">
            <template #prepend>
                <VAvatar color="primary" variant="tonal" size="48" class="mr-4 rounded-circle">
                    <VImg v-if="parentAvatar" :src="parentAvatar" />
                    <span v-else class="text-h6 font-weight-bold">{{ parentInitials }}</span>
                </VAvatar>
            </template>

            <VCardTitle class="d-flex align-center justify-space-between flex-wrap gap-2 text-subtitle-1 font-weight-bold mb-1">
                <span class="d-flex justify-space-between w-100 align-center">
                    {{ parentName }}
                    <VChip
                        color="success"
                        size="x-small"
                        class="font-weight-medium px-2"
                        variant="flat"
                    >
                        {{ $t('New') }}
                    </VChip>
                </span>
            </VCardTitle>
            
            <VCardSubtitle class="text-body-2 mb-2 d-flex justify-space-between">
                <span class="text-primary font-weight-bold">{{ subjectName }}</span>
                <span class="text-caption">{{ formatDate(request.createdAt) }}</span>
            </VCardSubtitle>
            
            <VCardText class="pa-0">
                <p class="text-body-2 text-secondary mb-2 line-clamp-2">
                    {{ description || `${stageName} - ${subjectName}` }}
                </p>
                <VChip size="small" variant="tonal" color="secondary" class="font-weight-medium">
                    {{ stageName }}
                </VChip>
            </VCardText>
        </VCardItem>

        <VCardActions v-if="!compact" class="px-4 pb-4 pt-1">
            <VBtn
                block
                color="primary"
                variant="flat"
                prepend-icon="tabler-message-circle"
                @click.stop="$emit('contact', request)"
            >
                {{ $t('TeacherRequests.ContactParent') }}
            </VBtn>
        </VCardActions>
    </VCard>
</template>

<style scoped>
.hover-card {
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}
.hover-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
}
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;  
    overflow: hidden;
}
</style>
