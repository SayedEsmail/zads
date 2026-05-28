<script setup>
import { useFavoritesStore } from '~/stores/favorites'
import api from '~/services/api'
import ContactRequestDialog from '~/components/ContactRequestDialog.vue'

definePageMeta({
    layout: 'default',
})

const route = useRoute()
const router = useRouter()
const favoritesStore = useFavoritesStore()
const { t } = useI18n()

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

const getLessonTypeLabel = (type) => {
    switch (type) {
        case 'online': return t('Online') || 'أونلاين'
        case 'offline': return t('InPerson') || 'حضوري'
        case 'both': return t('OnlineInPerson') || 'أونلاين وحضوري'
        default: return t('Unknown') || 'غير محدد'
    }
}

const formatPrice = price => {
    if (!price) return '-'
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

    <div v-else-if="teacher" class="teacher-details-page">
        <!-- Full Bleed Teacher Header Section -->
        <div class="teacher-header-section bg-secondary-light pt-6 pb-12 border-b position-relative">
            <VContainer class="position-relative z-1">
                <!-- Back Button -->
                <VBtn
                    variant="text"
                    color="secondary"
                    prepend-icon="tabler-arrow-right"
                    class="mb-6 font-weight-bold px-0 rtl-mirror"
                    @click="router.back()"
                >
                    {{ $t('Back') }}
                </VBtn>

                <!-- Avatar and basic info -->
                <div class="d-flex flex-column align-center text-center">
                    <VAvatar
                        size="140"
                        :image="teacher.user?.avatarUrl"
                        color="primary"
                        class="elevation-4 mb-4 border-4 border-white shadow-sm"
                    >
                        <span v-if="!teacher.user?.avatarUrl" class="text-h2 font-weight-black">
                            {{ teacher.user?.name?.charAt(0) }}
                        </span>
                    </VAvatar>
                    
                    <h2 class="text-h3 font-weight-bold mb-3 text-high-emphasis">
                        {{ teacher.user?.name }}
                    </h2>
                    
                    <div class="d-flex align-center justify-center text-body-1 text-secondary mb-6 font-weight-medium">
                        <VIcon start icon="tabler-map-pin" size="20" color="primary" />
                        {{ teacher.area?.city?.nameAr }} - {{ teacher.area?.nameAr }}
                    </div>
                    
                    <div class="d-flex flex-wrap justify-center gap-3 mb-8">
                        <VChip
                            color="primary"
                            variant="flat"
                            size="large"
                            class="font-weight-bold px-6 rounded-pill shadow-primary"
                        >
                            <VIcon start icon="tabler-video" size="18" />
                            {{ getLessonTypeLabel(teacher.lessonType) }}
                        </VChip>
                        <VChip
                            v-if="teacher.yearsOfExperience"
                            color="secondary"
                            variant="tonal"
                            size="large"
                            class="font-weight-bold px-6 rounded-pill bg-white"
                        >
                            <VIcon start icon="tabler-briefcase" size="18" />
                            {{ teacher.yearsOfExperience }} {{ $t('YearsExperience') || 'سنوات خبرة' }}
                        </VChip>
                    </div>

                    <!-- Actions -->
                    <div class="d-flex gap-4 justify-center flex-wrap w-100 max-width-600">
                        <VBtn
                            color="secondary"
                            size="x-large"
                            class="flex-grow-1 rounded-pill font-weight-bold shadow-secondary px-8 text-white"
                            @click="showContactDialog = true"
                        >
                            <VIcon start icon="tabler-message-circle" size="24" />
                            {{ $t('TeacherProfile.ContactTeacher') }}
                        </VBtn>
                        
                        <VBtn
                            :color="favoritesStore.isFavorite(teacher.id) ? 'error' : 'secondary'"
                            :variant="favoritesStore.isFavorite(teacher.id) ? 'flat' : 'outlined'"
                            size="x-large"
                            class="rounded-pill font-weight-bold px-6 border-2"
                            :class="favoritesStore.isFavorite(teacher.id) ? 'shadow-error text-white border-transparent' : 'bg-white border-secondary'"
                            @click="handleFavorite"
                        >
                            <VIcon :start="true" :icon="favoritesStore.isFavorite(teacher.id) ? 'tabler-heart-filled' : 'tabler-heart'" size="24" />
                            {{ favoritesStore.isFavorite(teacher.id) ? ($t('FavoritesPage.RemoveFavorite') || 'إزالة المفضلة') : ($t('FavoritesPage.AddFavorite') || 'إضافة للمفضلة') }}
                        </VBtn>
                    </div>
                </div>
            </VContainer>
        </div>

        <VContainer class="py-xl-8 py-8">
            <!-- About Section -->
            <VCard v-if="teacher.bio" class="mb-8 rounded-xl elevation-2 teacher-main-card overflow-hidden">
                <div class="pa-6 pa-md-10">
                    <div class="d-flex align-center gap-3 mb-4">
                        <VAvatar color="secondary" variant="tonal" size="48" class="rounded-lg">
                            <VIcon icon="tabler-user-circle" size="28" />
                        </VAvatar>
                        <h3 class="text-h5 font-weight-bold text-high-emphasis">نبذة عن المعلم</h3>
                    </div>
                    <p class="text-body-1 line-height-relaxed text-secondary ps-sm-15 mb-0">
                        {{ teacher.bio }}
                    </p>
                </div>
            </VCard>

        <VRow>
            <VCol cols="12" md="8">
                <VCard class="h-100 rounded-xl elevation-2">
                    <div class="pa-6 border-b d-flex align-center gap-3">
                        <VAvatar color="primary-lighten-5" size="48" class="rounded-lg">
                            <VIcon icon="tabler-books" size="28" color="primary" />
                        </VAvatar>
                        <h3 class="text-h5 font-weight-bold text-high-emphasis m-0">المواد والأسعار</h3>
                    </div>
                    
                    <VList lines="two" bg-color="transparent" class="pricing-list pa-4 d-flex flex-column gap-3">
                        <template v-for="subject in teacher.subjects" :key="subject.id">
                            <VListItem class="px-6 py-4 rounded-xl border elevation-0 bg-white transition-all align-center subject-list-item">
                                <template #prepend>
                                    <VAvatar size="48" color="primary" variant="tonal" class="me-4 rounded-xl shadow-sm">
                                        <VIcon icon="tabler-book" size="24" />
                                    </VAvatar>
                                </template>
                                
                                <VListItemTitle class="font-weight-bold text-h6 mb-1 text-high-emphasis">
                                    {{ subject.subject?.nameAr }}
                                </VListItemTitle>
                                
                                <VListItemSubtitle>
                                    <VChip size="small" color="secondary" variant="flat" class="font-weight-bold rounded-lg px-3 shadow-sm">
                                        {{ subject.stage?.nameAr }}
                                    </VChip>
                                </VListItemSubtitle>
                                
                                <template #append>
                                    <div class="text-end bg-surface pa-3 rounded-xl border shadow-sm">
                                        <div class="text-primary font-weight-black text-h5 line-height-1 mb-1">
                                            {{ formatPrice(subject.price) }}
                                        </div>
                                        <div class="text-caption text-secondary font-weight-bold text-uppercase tracking-wider">
                                            / {{ $t('Lesson') || 'حصة' }}
                                        </div>
                                    </div>
                                </template>
                            </VListItem>
                        </template>
                    </VList>
                </VCard>
            </VCol>

            <VCol cols="12" md="4">
                <VCard class="h-100 rounded-xl elevation-2 bg-secondary-light border-0">
                    <div class="pa-6 border-b border-opacity-10 d-flex align-center gap-3">
                        <VAvatar color="secondary" size="48" class="rounded-lg shadow-sm text-white">
                            <VIcon icon="tabler-info-circle" size="28" />
                        </VAvatar>
                        <h3 class="text-h5 font-weight-bold text-secondary m-0">معلومات إضافية</h3>
                    </div>
                    
                    <VList bg-color="transparent" class="pa-4 flex-column gap-2 d-flex">
                        <VListItem class="rounded-xl bg-white pa-4 border elevation-0 mb-3 shadow-sm">
                            <template #prepend>
                                <VAvatar color="primary-lighten-5" class="me-3 rounded-lg text-primary">
                                    <VIcon icon="tabler-calendar-event" />
                                </VAvatar>
                            </template>
                            <VListItemTitle class="text-caption font-weight-bold text-secondary text-uppercase mb-1">تاريخ الانضمام</VListItemTitle>
                            <VListItemSubtitle class="text-body-1 font-weight-bold text-high-emphasis opacity-100">
                                {{ new Date(Teacher?.createdAt || Date.now()).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' }) }}
                            </VListItemSubtitle>
                        </VListItem>
                        
                        <VListItem v-if="teacher?.gender" class="rounded-xl bg-white pa-4 border elevation-0 shadow-sm">
                            <template #prepend>
                                <VAvatar color="primary-lighten-5" class="me-3 rounded-lg text-primary">
                                    <VIcon :icon="teacher.gender === 'male' ? 'tabler-gender-male' : 'tabler-gender-female'" />
                                </VAvatar>
                            </template>
                            <VListItemTitle class="text-caption font-weight-bold text-secondary text-uppercase mb-1">الجنس</VListItemTitle>
                            <VListItemSubtitle class="text-body-1 font-weight-bold text-high-emphasis opacity-100 text-capitalize">
                                {{ teacher.gender === 'male' ? 'ذكر' : 'أنثى' }}
                            </VListItemSubtitle>
                        </VListItem>
                    </VList>
                </VCard>
            </VCol>
        </VRow>

        <ContactRequestDialog
            v-model="showContactDialog"
            :teacher="teacher"
            @success="showContactDialog = false"
        />
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.teacher-details-page {
    .teacher-header-section {
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: -50px;
            right: -50px;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.05) 0%, transparent 70%);
            border-radius: 50%;
        }
    }

    .teacher-main-card {
        .bg-primary-lighten-5 {
            background-color: rgb(var(--v-theme-primary-light)) !important;
        }

        .border-4 {
            border-width: 4px !important;
            border-style: solid !important;
        }
    }

    .pricing-list {
        .subject-list-item {
            &:hover {
                border-color: rgba(var(--v-theme-primary), 0.3) !important;
                box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.08) !important;
                transform: translateY(-2px);
            }
        }
    }

    .shadow-primary {
        box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.2) !important;
    }

    .shadow-secondary {
        box-shadow: 0 8px 16px rgba(var(--v-theme-secondary), 0.2) !important;
    }

    .shadow-error {
        box-shadow: 0 8px 16px rgba(var(--v-theme-error), 0.2) !important;
    }

    .max-width-600 {
        max-width: 600px;
    }

    .line-height-1 {
        line-height: 1;
    }

    .line-height-relaxed {
        line-height: 1.7;
    }
    
    .tracking-wider {
        letter-spacing: 0.05em;
    }
}

[dir="rtl"] {
    .rtl-mirror {
        .v-icon {
            transform: scaleX(-1);
        }
    }
}
</style>
