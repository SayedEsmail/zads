<script setup>
import ContactRequestDialog from '~/components/ContactRequestDialog.vue'

defineProps({
    teacher: {
        type: Object,
        required: true,
    },
    showFavorite: {
        type: Boolean,
        default: true,
    },
})

defineEmits(['favorite', 'contact'])

const showContactDialog = ref(false)

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
        case 'online': return 'Online'
        case 'offline': return 'In-Person'
        case 'both': return 'Online & In-Person'
        default: return 'Unknown'
    }
}

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
        class="teacher-card"
        :to="`/parent/teacher/${teacher.id}`"
    >
        <VCardItem>
            <template #prepend>
                <VAvatar
                    size="64"
                    :image="teacher.user?.avatarUrl"
                    color="primary"
                >
                    <span
                        v-if="!teacher.user?.avatarUrl"
                        class="text-h5"
                    >
                        {{ teacher.user?.name?.charAt(0) }}
                    </span>
                </VAvatar>
            </template>

            <VCardTitle>{{ teacher.user?.name }}</VCardTitle>

            <VCardSubtitle>
                <VIcon
                    size="14"
                    icon="tabler-map-pin"
                    class="me-1"
                />
                {{ teacher.area?.city?.nameAr || 'غير محدد' }}
            </VCardSubtitle>

            <template #append>
                <VBtn
                    v-if="showFavorite"
                    icon
                    variant="text"
                    :color="teacher.isFavorite ? 'error' : 'default'"
                    @click.prevent="$emit('favorite', teacher)"
                >
                    <VIcon :icon="teacher.isFavorite ? 'tabler-heart-filled' : 'tabler-heart'" />
                </VBtn>
            </template>
        </VCardItem>

        <VCardText>
            <p
                v-if="teacher.bio"
                class="text-body-2 mb-3 text-truncate-2"
            >
                {{ teacher.bio }}
            </p>

            <div
                v-if="teacher.subjects?.length"
                class="mb-3"
            >
                <VChip
                    v-for="subject in teacher.subjects.slice(0, 3)"
                    :key="subject.id"
                    size="small"
                    class="me-1 mb-1"
                    color="primary"
                    variant="tonal"
                >
                    {{ subject.subject?.nameAr }}
                </VChip>
                <VChip
                    v-if="teacher.subjects.length > 3"
                    size="small"
                    variant="text"
                >
                    +{{ teacher.subjects.length - 3 }}
                </VChip>
            </div>

            <div class="d-flex align-center flex-wrap gap-3">
                <div class="d-flex align-center">
                    <VIcon
                        size="18"
                        :icon="getLessonTypeIcon(teacher.lessonType)"
                        color="secondary"
                        class="me-1"
                    />
                    <span class="text-body-2 text-secondary">
                        {{ getLessonTypeLabel(teacher.lessonType) }}
                    </span>
                </div>

                <div
                    v-if="teacher.yearsOfExperience"
                    class="d-flex align-center"
                >
                    <VIcon
                        size="18"
                        icon="tabler-briefcase"
                        color="secondary"
                        class="me-1"
                    />
                    <span class="text-body-2 text-secondary">
                        {{ teacher.yearsOfExperience }} سنة
                    </span>
                </div>

                <div
                    v-if="teacher.minPrice"
                    class="d-flex align-center"
                >
                    <VIcon
                        size="18"
                        icon="tabler-currency-pound"
                        color="success"
                        class="me-1"
                    />
                    <span class="text-body-2 text-success font-weight-medium">
                        {{ formatPrice(teacher.minPrice) }}
                        <span v-if="teacher.maxPrice && teacher.maxPrice !== teacher.minPrice">
                            - {{ formatPrice(teacher.maxPrice) }}
                        </span>
                    </span>
                </div>
            </div>
        </VCardText>

        <VCardActions>
            <VBtn
                color="primary"
                variant="tonal"
                block
                @click.prevent.stop="showContactDialog = true"
            >
                <VIcon
                    start
                    icon="tabler-message"
                />
                تواصل الآن
            </VBtn>
        </VCardActions>

        <ContactRequestDialog
            v-model="showContactDialog"
            :teacher="teacher"
            @success="$emit('contact', teacher)"
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
