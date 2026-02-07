<script setup>
import { useFavoritesStore } from '~/stores/favorites'
import api from '~/services/api'
import ContactRequestDialog from '~/components/ContactRequestDialog.vue'

definePageMeta({
    layout: 'default',
})

const route = useRoute()
const favoritesStore = useFavoritesStore()

const teacherId = route.params.id
const teacher = ref(null)
const loading = ref(true)
const error = ref(null)
const showContactDialog = ref(false)

const fetchTeacher = async () => {
    loading.value = true
    error.value = null
    try {
        const response = await api.get(`/teachers/${teacherId}`)
        teacher.value = response.data
    } catch (err) {
        error.value = err.message || 'Failed to load teacher profile'
    } finally {
        loading.value = false
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

onMounted(() => {
    fetchTeacher()
})

const handleFavorite = async () => {
    await favoritesStore.toggleFavorite(teacher.value.id)
    if (teacher.value.isFavorite !== undefined) {
        teacher.value.isFavorite = !teacher.value.isFavorite
    } else {
        // Optimistic update if property missing
        await fetchTeacher()
    }
}
</script>

<template>
    <div v-if="loading" class="d-flex justify-center py-12">
        <VProgressCircular indeterminate color="primary" size="48" />
    </div>

    <VAlert
        v-else-if="error"
        color="error"
        variant="tonal"
        class="mb-4"
    >
        {{ error }}
        <template #append>
            <VBtn
                variant="text"
                size="small"
                @click="fetchTeacher"
            >
                Retry
            </VBtn>
        </template>
    </VAlert>

    <div v-else-if="teacher">
        <VCard class="mb-6">
            <VCardText class="d-flex flex-column flex-sm-row gap-6">
                <!-- Avatar -->
                <div class="d-flex justify-center">
                    <VAvatar
                        size="120"
                        :image="teacher.user?.avatarUrl"
                        color="primary"
                        class="elevation-2"
                    >
                        <span v-if="!teacher.user?.avatarUrl" class="text-h3">
                            {{ teacher.user?.name?.charAt(0) }}
                        </span>
                    </VAvatar>
                </div>

                <!-- Info -->
                <div class="flex-grow-1">
                    <div class="d-flex justify-space-between align-start flex-wrap gap-4">
                        <div>
                            <h1 class="text-h4 font-weight-bold mb-2">
                                {{ teacher.user?.name }}
                            </h1>
                            <div class="d-flex align-center text-body-1 text-secondary mb-2">
                                <VIcon start icon="tabler-map-pin" size="18" />
                                {{ teacher.area?.city?.nameAr }} - {{ teacher.area?.nameAr }}
                            </div>
                            <div class="d-flex flex-wrap gap-2">
                                <VChip
                                    color="primary"
                                    variant="tonal"
                                    size="small"
                                >
                                    {{ getLessonTypeLabel(teacher.lessonType) }}
                                </VChip>
                                <VChip
                                    v-if="teacher.yearsOfExperience"
                                    color="secondary"
                                    variant="tonal"
                                    size="small"
                                >
                                    {{ teacher.yearsOfExperience }} Years Experience
                                </VChip>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="d-flex gap-2">
                            <VBtn
                                :color="favoritesStore.isFavorite(teacher.id) ? 'error' : 'default'"
                                :variant="favoritesStore.isFavorite(teacher.id) ? 'tonal' : 'outlined'"
                                icon
                                @click="handleFavorite"
                            >
                                <VIcon :icon="favoritesStore.isFavorite(teacher.id) ? 'tabler-heart-filled' : 'tabler-heart'" />
                            </VBtn>
                            <VBtn
                                color="primary"
                                @click="showContactDialog = true"
                            >
                                <VIcon start icon="tabler-message" />
                                Contact Teacher
                            </VBtn>
                        </div>
                    </div>

                    <VDivider class="my-4" />

                    <div v-if="teacher.bio">
                        <h3 class="text-h6 mb-2">About</h3>
                        <p class="text-body-1">{{ teacher.bio }}</p>
                    </div>
                </div>
            </VCardText>
        </VCard>

        <VRow>
            <VCol cols="12" md="8">
                <VCard title="Subjects & Pricing" class="h-100">
                    <VCardText>
                        <VTable hover>
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Stage</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="subject in teacher.subjects"
                                    :key="subject.id"
                                >
                                    <td>
                                        <div class="d-flex align-center">
                                            <VAvatar
                                                size="32"
                                                color="primary"
                                                variant="tonal"
                                                class="me-2"
                                            >
                                                <VIcon icon="tabler-book" size="18" />
                                            </VAvatar>
                                            {{ subject.subject?.nameAr }}
                                        </div>
                                    </td>
                                    <td>
                                        <VChip size="small">
                                            {{ subject.stage?.nameAr }}
                                        </VChip>
                                    </td>
                                    <td class="text-primary font-weight-bold">
                                        {{ formatPrice(subject.price) }}
                                    </td>
                                </tr>
                            </tbody>
                        </VTable>
                    </VCardText>
                </VCard>
            </VCol>

            <VCol cols="12" md="4">
                <VCard title="Additional Info" class="h-100">
                    <VCardText>
                        <VList density="compact">
                            <VListItem>
                                <template #prepend>
                                    <VIcon icon="tabler-users" color="secondary" />
                                </template>
                                <VListItemTitle>Joined</VListItemTitle>
                                <VListItemSubtitle>
                                    {{ new Date(teacher.createdAt).toLocaleDateString('ar-EG') }}
                                </VListItemSubtitle>
                            </VListItem>
                            
                            <VListItem v-if="teacher.gender">
                                <template #prepend>
                                    <VIcon icon="tabler-gender-bigender" color="secondary" />
                                </template>
                                <VListItemTitle>Gender</VListItemTitle>
                                <VListItemSubtitle class="text-capitalize">
                                    {{ teacher.gender }}
                                </VListItemSubtitle>
                            </VListItem>
                        </VList>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>

        <ContactRequestDialog
            v-model="showContactDialog"
            :teacher="teacher"
            @success="showContactDialog = false"
        />
    </div>
</template>
