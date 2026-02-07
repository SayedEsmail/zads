<script setup>
import ContactRequestDialog from '~/components/ContactRequestDialog.vue'
import { useParentStore } from '~/stores/parent'

const props = defineProps({
    teacher: {
        type: Object,
        required: true,
    },
    showFavorite: {
        type: Boolean,
        default: true,
    },
})

const emit = defineEmits(['favorite', 'contact'])

const { t } = useI18n()
const parentStore = useParentStore()

const showContactDialog = ref(false)

const isNearby = computed(() => {
    return parentStore.profile?.areaId && props.teacher.areaId === parentStore.profile.areaId
})

const lessonTypeLabel = computed(() => {
    if (props.teacher.lessonType) return getLessonTypeLabel(props.teacher.lessonType)
    if (props.teacher.lessonTypes?.length) {
        const types = props.teacher.lessonTypes
        if (types.includes('online') && (types.includes('at_teacher') || types.includes('at_student'))) {
            return t('Online & In-Person')
        }
        if (types.includes('online')) return t('Online')
        if (types.includes('at_teacher') || types.includes('at_student')) return t('In-Person')
    }
    return t('Unknown')
})

const lessonTypeIcon = computed(() => {
    if (props.teacher.lessonType) return getLessonTypeIcon(props.teacher.lessonType)
    if (props.teacher.lessonTypes?.length) {
        const types = props.teacher.lessonTypes
        if (types.includes('online') && (types.includes('at_teacher') || types.includes('at_student'))) {
            return 'tabler-arrows-exchange'
        }
        if (types.includes('online')) return 'tabler-video'
        if (types.includes('at_teacher') || types.includes('at_student')) return 'tabler-home'
    }
    return 'tabler-book'
})

const getLessonTypeIcon = type => {
    switch (type) {
        case 'online': return 'tabler-video'
        case 'offline': return 'tabler-home'
        case 'both': return 'tabler-arrows-exchange'
        default: return 'tabler-book'
    }
}

const getLessonTypeLabel = type => {
    switch (type) {
        case 'online': return t('Online')
        case 'offline': return t('In-Person')
        case 'both': return t('Online & In-Person')
        default: return t('Unknown')
    }
}

const computedMinPrice = computed(() => {
    if (props.teacher.minPrice) return props.teacher.minPrice
    if (!props.teacher.subjects?.length) return null
    
    const prices = props.teacher.subjects.flatMap(s => [
        s.priceAtTeacher,
        s.priceAtStudent,
        s.priceGroup
    ]).filter(p => p != null && p > 0)
    
    return prices.length ? Math.min(...prices) : null
})

const formatPrice = price => {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 0,
    }).format(price)
}
</script>

<template>
    <VCard
        class="teacher-card h-100"
        :to="`/parent/teacher/${teacher.id}`"
        border
        flat
    >
        <VCardItem class="pb-2">
            <template #prepend>
                <div class="position-relative">
                    <VAvatar
                        size="56"
                        :image="teacher.user?.avatarUrl"
                        class="border-1"
                    >
                        <VImg
                            v-if="teacher.user?.avatarUrl"
                            :src="teacher.user?.avatarUrl"
                            cover
                        />
                        <span
                            v-else
                            class="text-h6 text-primary"
                        >
                            {{ teacher.user?.name?.charAt(0) }}
                        </span>
                    </VAvatar>
                    <VChip
                        v-if="isNearby"
                        color="success"
                        size="x-small"
                        class="nearby-badge position-absolute"
                        style="top: -8px; left: -8px; z-index: 1;"
                    >
                        قريب
                    </VChip>
                </div>
            </template>

            <VCardTitle class="text-h6 font-weight-bold mb-1 d-flex align-center justify-space-between">
                <span>{{ teacher.user?.name }}</span>
                <div v-if="Number(teacher.avgRating) > 0" class="d-flex align-center gap-1">
                    <VIcon icon="tabler-star-filled" size="16" color="warning" />
                    <span class="text-body-2 font-weight-bold">{{ Number(teacher.avgRating).toFixed(1) }}</span>
                </div>
            </VCardTitle>

            <VCardSubtitle class="d-flex align-center">
                <VIcon
                    size="16"
                    icon="tabler-map-pin"
                    class="me-1 text-secondary"
                />
                <span class="text-body-2 text-secondary">
                    {{ teacher.area?.city?.nameAr || t('Not Specified') }}
                </span>
            </VCardSubtitle>

            <template #append>
                <VBtn
                    icon
                    variant="text"
                    density="comfortable"
                    :color="teacher.isFavorite ? 'error' : 'default'"
                    @click.prevent="emit('favorite', teacher)"
                >
                    <VIcon :icon="teacher.isFavorite ? 'tabler-heart-filled' : 'tabler-heart'" />
                </VBtn>
            </template>
        </VCardItem>

        <VCardText class="flex-grow-1 pt-2">
            <div class="d-flex gap-2 flex-wrap mb-4">
                <VChip
                    v-for="subject in teacher.subjects?.slice(0, 3)"
                    :key="subject.id"
                    size="small"
                    color="primary"
                    variant="tonal"
                    label
                >
                    {{ subject.subject?.nameAr }}
                </VChip>
                 <VChip
                    v-if="teacher.subjects?.length > 3"
                    size="small"
                    variant="tonal"
                    color="secondary"
                    label
                >
                    +{{ teacher.subjects.length - 3 }}
                </VChip>
            </div>

            <p
                v-if="teacher.bio"
                class="text-body-2 mb-4 text-truncate-2 text-secondary"
                style="min-height: 40px;"
            >
                {{ teacher.bio }}
            </p>
            
            <VDivider class="mb-4" />

            <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center gap-1">
                    <VIcon
                        size="18"
                        :icon="lessonTypeIcon"
                        color="primary"
                    />
                    <span class="text-caption font-weight-medium">
                        {{ lessonTypeLabel }}
                    </span>
                </div>

                <div v-if="computedMinPrice" class="text-end">
                    <span class="text-body-2 font-weight-bold text-success">
                        {{ formatPrice(computedMinPrice) }}
                    </span>
                    <span class="text-caption text-secondary d-block" style="line-height: 1;">
                        / {{ t('Lesson') }}
                    </span>
                </div>
            </div>
        </VCardText>

        <VCardActions class="p-4 pt-0">
            <VBtn
                block
                color="primary"
                variant="flat"
                @click.prevent.stop="showContactDialog = true"
            >
                {{ t('Contact Now') }}
            </VBtn>
        </VCardActions>

        <ContactRequestDialog
            v-model="showContactDialog"
            :teacher="teacher"
            @success="emit('contact', teacher)"
        />
    </VCard>
</template>

<style lang="scss" scoped>
.teacher-card {
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(var(--v-theme-on-surface), 0.12);
    }
}

.text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
