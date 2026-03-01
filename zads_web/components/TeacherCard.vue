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
            return t('OnlineInPerson')
        }
        if (types.includes('online')) return t('Online')
        if (types.includes('at_teacher') || types.includes('at_student')) return t('InPerson')
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
        case 'offline': return t('InPerson')
        case 'both': return t('OnlineInPerson')
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
        class="teacher-card rounded-xl-24 overflow-hidden"
        :to="`/parent/teacher/${teacher.id}`"
        flat
    >
        <VRow no-gutters>
            <!-- Left Panel: Avatar & Rating -->
            <VCol cols="12" md="3" class="pa-6 border-e-md d-flex flex-column align-center justify-center bg-grey-lighten-5">
                <div class="position-relative mb-4">
                    <VAvatar
                        size="100"
                        color="secondary-light"
                        variant="flat"
                        class="child-avatar-premium mb-4"
                    >
                        <VImg
                            v-if="teacher.user?.avatarUrl"
                            :src="teacher.user?.avatarUrl"
                            cover
                        />
                        <span v-else class="text-h4 text-primary font-weight-bold">
                            {{ teacher.user?.name?.charAt(0) }}
                        </span>
                    </VAvatar>
                    <VChip
                        v-if="isNearby"
                        color="success"
                        size="small"
                        variant="flat"
                        class="nearby-badge position-absolute rounded-lg"
                        style="top: 0; left: -10px; z-index: 1;"
                    >
                        <VIcon icon="tabler-map-pin" start size="14" />
                        {{ $t('Nearby') }}
                    </VChip>
                </div>

                <div v-if="Number(teacher.avgRating) > 0" class="d-flex align-center gap-1 mb-2">
                    <VIcon icon="tabler-star-filled" size="18" color="warning" />
                    <span class="text-h6 font-weight-bold">{{ Number(teacher.avgRating).toFixed(1) }}</span>
                </div>

                <div class="text-body-2 text-secondary d-flex align-center">
                    <VIcon icon="tabler-map-pin" size="16" class="me-1" />
                    {{ teacher.area?.city?.nameAr || $t('NotSpecified') }}
                </div>
            </VCol>

            <!-- Middle Panel: Content -->
            <VCol cols="12" md="6" class="pa-6 d-flex flex-column">
                <div class="d-flex align-center justify-space-between mb-2">
                    <h3 class="text-h5 font-weight-bold text-high-emphasis">
                        {{ teacher.user?.name }}
                    </h3>
                    <VBtn
                        icon
                        variant="tonal"
                        density="comfortable"
                        class="rounded-lg"
                        :color="teacher.isFavorite ? 'error' : 'secondary'"
                        @click.prevent="emit('favorite', teacher)"
                    >
                        <VIcon :icon="teacher.isFavorite ? 'tabler-heart-filled' : 'tabler-heart'" />
                    </VBtn>
                </div>

                <div class="d-flex gap-2 flex-wrap mb-4">
                    <VChip
                        v-for="subject in teacher.subjects?.slice(0, 5)"
                        :key="subject.id"
                        size="small"
                        color="primary"
                        variant="tonal"
                        class="rounded-lg font-weight-medium"
                    >
                        {{ subject.subject?.nameAr }}
                    </VChip>
                </div>

                <p v-if="teacher.bio" class="text-body-1 text-secondary text-truncate-3 mb-0 flex-grow-1">
                    {{ teacher.bio }}
                </p>
                
                <div class="mt-4 pt-4 border-t d-flex align-center gap-4">
                    <div class="d-flex align-center gap-1 text-caption text-secondary">
                        <VIcon :icon="lessonTypeIcon" size="16" color="primary" />
                        {{ lessonTypeLabel }}
                    </div>
                </div>
            </VCol>

            <!-- Right Panel: Actions -->
            <VCol cols="12" md="3" class="pa-6 d-flex flex-column align-center justify-center border-s-md">
                <div v-if="computedMinPrice" class="text-center mb-6">
                    <div class="text-h4 font-weight-bold text-primary mb-1">
                        {{ formatPrice(computedMinPrice) }}
                    </div>
                    <div class="text-body-2 text-secondary">
                        لكل {{ $t('Lesson') }}
                    </div>
                </div>

                <VBtn
                    block
                    color="secondary"
                    variant="flat"
                    height="48"
                    class="rounded-pill font-weight-bold shadow-secondary mb-3"
                    @click.prevent.stop="showContactDialog = true"
                >
                    {{ $t('ContactNow') }}
                </VBtn>

                <VBtn
                    block
                    variant="outlined"
                    color="secondary"
                    height="48"
                    class="rounded-pill font-weight-bold"
                    :to="`/parent/teacher/${teacher.id}`"
                >
                    عرض الملف الشخصي
                </VBtn>
            </VCol>
        </VRow>

        <ContactRequestDialog
            v-model="showContactDialog"
            :teacher="teacher"
            @success="emit('contact', teacher)"
        />
    </VCard>
</template>

<style lang="scss" scoped>
.teacher-card {
    border-radius: 24px !important;
    border: 1px solid rgba(var(--v-border-color), 0.12) !important;
    border-bottom: 3px solid rgba(var(--v-theme-primary), 0.1) !important;
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    box-shadow: 0 4px 12px -2px rgba(var(--v-theme-on-surface), 0.05) !important;

    &:hover {
        transform: translateY(-8px);
        border-color: rgba(var(--v-theme-primary), 0.2) !important;
        border-bottom-color: rgb(var(--v-theme-primary)) !important;
        box-shadow: 0 20px 40px -12px rgba(var(--v-theme-on-surface), 0.12) !important;
        
        .border-1 {
            box-shadow: 0 0 0 2px rgb(var(--v-theme-primary));
        }
    }

    .border-1 {
        border: 2px solid #fff;
        box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.1);
        transition: box-shadow 0.3s ease;
    }
}

.text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
