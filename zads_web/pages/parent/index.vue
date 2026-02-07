<script setup>
import { useSearchStore } from '~/stores/search'
import { useFavoritesStore } from '~/stores/favorites'
import { useAuthStore } from '~/stores/auth'
import { useParentStore } from '~/stores/parent'
import TeacherCard from '~/components/TeacherCard.vue'
import SubjectsDialog from '~/components/SubjectsDialog.vue'

definePageMeta({
    layout: 'default',
})

const searchStore = useSearchStore()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()
const parentStore = useParentStore()

const lessonTypeOptions = [
    { title: 'الكل', value: null },
    { title: 'أونلاين', value: 'online' },
    { title: 'حضوري', value: 'offline' },
    { title: 'كلاهما', value: 'both' },
]

const quickActions = [
    { label: 'أبنائي', icon: 'tabler-users', color: '#E3F2FD', iconColor: '#2196F3', to: '/parent/children' },
    { label: 'المفضلة', icon: 'tabler-heart', color: '#FFEBEE', iconColor: '#F44336', to: '/parent/favorites' },
    { label: 'طلباتي', icon: 'tabler-clipboard-list', color: '#E0F2F1', iconColor: '#009688', to: '/parent/requests' },
]

// Initialize reference data on mount
onMounted(async () => {
    await Promise.all([
        searchStore.initReferenceData(),
        parentStore.fetchProfile()
    ])
    
    // Auto-search nearby teachers if profile has location
    if (parentStore.profile?.areaId) {
        searchStore.filters.areaId = parentStore.profile.areaId
        searchStore.filters.cityId = parentStore.profile.area?.cityId
        searchStore.filters.governorateId = parentStore.profile.area?.city?.governorateId
    }
    
    await searchStore.searchTeachers()
})

const userFirstName = computed(() => {
    return authStore.user?.name?.split(' ')[0] || 'يا زائر'
})

const hasLocation = computed(() => !!parentStore.profile?.areaId)
const locationName = computed(() => {
    if (!hasLocation.value) return 'لم يتم تحديد الموقع'
    return parentStore.profile.area?.nameAr || parentStore.profile.area?.city?.nameAr || 'الموقع المحدد'
})

// Watch governorate changes
watch(() => searchStore.filters.governorateId, async val => {
    if (val) {
        await searchStore.fetchCities(val)
    }
})

// Watch city changes
watch(() => searchStore.filters.cityId, async val => {
    if (val) {
        await searchStore.fetchAreas(val)
    }
})

const handleSearch = () => {
    searchStore.searchTeachers(1)
}

const handlePageChange = page => {
    searchStore.searchTeachers(page)
}

const handleClearFilters = () => {
    searchStore.clearFilters()
    searchStore.searchTeachers(1)
}

const handleSubjectClick = (subjectId) => {
    searchStore.filters.subjectId = subjectId
    handleSearch()
}

const handleFavorite = teacher => {
    // Will integrate with favorites store
    console.log('Toggle favorite:', teacher.id)
}

const handleContact = teacher => {
    // Will open contact dialog
    console.log('Contact teacher:', teacher.id)
}
</script>

<template>
    <div class="parent-home">
        <!-- Dashboard Style Header (Mobile Parity) -->
        <div class="hero-section bg-surface-variant pa-6 pa-md-10 mb-8 border-b">
            <VContainer>
                <VRow align="center">
                    <VCol cols="12" md="7">
                        <!-- Greeting Banner -->
                        <div class="greeting-banner pa-6 rounded-xl mb-6" style="background-color: #FFF4E6;">
                            <VRow align="center">
                                <VCol cols="12" sm="8">
                                    <h2 class="text-h4 font-weight-bold mb-2" style="color: #2D2D2D;">
                                        مرحباً {{ userFirstName }}
                                    </h2>
                                    <p class="text-body-1 mb-0" style="color: #666666;">
                                        اعثر على أفضل المعلمين لأبنائك بسهولة
                                    </p>
                                </VCol>
                                <VCol cols="12" sm="4" class="text-center d-none d-sm-block">
                                    <VIcon icon="tabler-school" size="80" color="primary" style="opacity: 0.8;" />
                                </VCol>
                            </VRow>
                        </div>

                        <!-- Location & Search -->
                        <div class="location-header d-flex align-center gap-2 mb-4">
                            <VIcon icon="tabler-map-pin" color="primary" />
                            <span class="text-body-1 font-weight-bold">{{ locationName }}</span>
                            <VBtn variant="text" color="primary" size="small" to="/parent/profile/edit" class="ms-auto">
                                تغيير الموقع
                            </VBtn>
                        </div>
                        
                        <VTextField
                            v-model="searchStore.filters.search"
                            placeholder="ابحث عن معلم أو مادة..."
                            variant="solo"
                            elevation="2"
                            class="search-hero-bar"
                            clearable
                            @keyup.enter="handleSearch"
                        >
                            <template #prepend-inner>
                                <VIcon icon="tabler-search" class="text-secondary" />
                            </template>
                            <template #append-inner>
                                <VBtn color="primary" @click="handleSearch">
                                    بحث الآن
                                </VBtn>
                            </template>
                        </VTextField>
                    </VCol>
                    
                    <VCol cols="12" md="5" class="d-none d-md-block">
                        <!-- Quick Actions Grid -->
                        <div class="text-overline font-weight-bold mb-4 px-2">وصول سريع</div>
                        <VRow dense>
                            <VCol v-for="action in quickActions" :key="action.label" cols="4">
                                <VCard :href="action.to" flat border class="quick-action-card text-center pa-4 rounded-xl d-flex flex-column align-center gap-2" :ripple="false">
                                    <div class="icon-wrapper pa-3 rounded-xl mb-1" :style="{ backgroundColor: action.color }">
                                        <VIcon :icon="action.icon" :color="action.iconColor" size="32" />
                                    </div>
                                    <span class="text-caption font-weight-bold">{{ action.label }}</span>
                                </VCard>
                            </VCol>
                        </VRow>
                    </VCol>
                </VRow>
            </VContainer>
        </div>

        <VContainer>
            <!-- Categories (Subjects) Horizontal Scroll -->
            <div class="mb-10">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h3 class="text-h5 font-weight-bold">المواد الدراسية</h3>
                    <VBtn variant="text" color="primary" @click="searchStore.openSubjectsDialog">عرض الكل</VBtn>
                </div>
                <div class="subjects-scroll d-flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    <VCard
                        v-for="subject in searchStore.subjects.slice(0, 8)"
                        :key="subject.id"
                        flat border
                        class="subject-chip-card px-6 py-3 rounded-pill cursor-pointer flex-shrink-0"
                        :class="{ 'border-primary bg-primary-lighten-5': searchStore.filters.subjectId === subject.id }"
                        @click="handleSubjectClick(subject.id)"
                    >
                        <span class="text-body-2 font-weight-medium">{{ subject.nameAr }}</span>
                    </VCard>
                </div>
            </div>

            <VRow>
                <!-- Desktop Sidebar Filters (Moved or Kept? Mobile uses bottom sheet, web uses sidebar) -->
                <!-- Let's keep the sidebar for web results refinement -->
                <VCol cols="12" md="3" class="d-none d-md-block">
                    <div class="position-sticky" style="top: 100px;">
                        <VCard border flat>
                            <VCardItem class="pb-2">
                                <template #prepend>
                                    <VIcon icon="tabler-filter" color="primary" class="me-2" />
                                </template>
                                <VCardTitle class="text-h6 font-weight-bold">تصفية النتائج</VCardTitle>
                                <template #append>
                                    <VBtn
                                        v-if="searchStore.hasFilters"
                                        variant="text"
                                        size="x-small"
                                        color="error"
                                        @click="handleClearFilters"
                                    >
                                        إعادة ضبط
                                    </VBtn>
                                </template>
                            </VCardItem>
                            
                            <VDivider />
                            
                            <VCardText class="pa-4 d-flex flex-column gap-6">
                                <!-- Same filter components as before but polished -->
                                <div>
                                    <VLabel class="mb-2 text-caption font-weight-bold text-uppercase">المادة الدراسية</VLabel>
                                    <VAutocomplete
                                        v-model="searchStore.filters.subjectId"
                                        :items="searchStore.subjects"
                                        item-title="nameAr"
                                        item-value="id"
                                        placeholder="اختر المادة"
                                        variant="outlined"
                                        density="compact"
                                        hide-details
                                        clearable
                                    />
                                </div>

                                <div>
                                    <VLabel class="mb-2 text-caption font-weight-bold text-uppercase">المرحلة</VLabel>
                                    <VAutocomplete
                                        v-model="searchStore.filters.stageId"
                                        :items="searchStore.stages"
                                        item-title="nameAr"
                                        item-value="id"
                                        placeholder="اختر المرحلة"
                                        variant="outlined"
                                        density="compact"
                                        hide-details
                                        clearable
                                    />
                                </div>

                                <div>
                                    <VLabel class="mb-2 text-caption font-weight-bold text-uppercase">الموقع</VLabel>
                                    <div class="d-flex flex-column gap-2">
                                        <VAutocomplete
                                            v-model="searchStore.filters.governorateId"
                                            :items="searchStore.governorates"
                                            item-title="nameAr"
                                            item-value="id"
                                            placeholder="المحافظة"
                                            variant="outlined"
                                            density="compact"
                                            hide-details
                                        />
                                        <VAutocomplete
                                            v-model="searchStore.filters.cityId"
                                            :items="searchStore.cities"
                                            item-title="nameAr"
                                            item-value="id"
                                            placeholder="المدينة"
                                            variant="outlined"
                                            density="compact"
                                            hide-details
                                            :disabled="!searchStore.filters.governorateId"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <VLabel class="mb-2 text-caption font-weight-bold text-uppercase">نوع الحصة</VLabel>
                                    <VChipGroup v-model="searchStore.filters.lessonType" color="primary">
                                        <VChip v-for="opt in lessonTypeOptions.filter(o => o.value)" :key="opt.value" :value="opt.value" label size="small" variant="tonal">
                                            {{ opt.title }}
                                        </VChip>
                                    </VChipGroup>
                                </div>

                                <VBtn block color="primary" @click="handleSearch" :loading="searchStore.loading">
                                    تحديث النتائج
                                </VBtn>
                            </VCardText>
                        </VCard>
                    </div>
                </VCol>

                <!-- Results Grid -->
                <VCol cols="12" md="9">
                    <div class="d-flex align-center justify-space-between mb-6">
                        <div class="text-body-2 text-secondary">
                            تم العثور على <span class="font-weight-bold text-primary">{{ searchStore.pagination.total }}</span> معلم متميز
                        </div>
                        <!-- Optional: Sort dropdown could go here -->
                    </div>

                    <!-- Loader / Grid / No Results -->
                     <div v-if="searchStore.loading" class="text-center py-12">
                         <VProgressCircular indeterminate color="primary" size="64" />
                     </div>

                     <VAlert v-else-if="searchStore.error" type="error" variant="tonal" class="mb-4">
                         {{ searchStore.error }}
                     </VAlert>

                     <div v-else-if="!searchStore.teachers.length" class="text-center py-12">
                         <VIcon icon="tabler-mood-sad" size="80" color="secondary" class="mb-4" />
                         <h3 class="text-h5">لا توجد نتائج مطابقة</h3>
                         <p class="text-secondary">جرب تغيير الفلاتر أو البحث بكلمات أخرى</p>
                     </div>

                     <template v-else>
                         <VRow>
                             <VCol v-for="teacher in searchStore.teachers" :key="teacher.id" cols="12" sm="6" lg="4">
                                 <TeacherCard :teacher="teacher" @favorite="handleFavorite" @contact="handleContact" />
                             </VCol>
                         </VRow>
                         
                         <div v-if="searchStore.pagination.totalPages > 1" class="d-flex justify-center mt-8">
                             <VPagination
                                v-model="searchStore.pagination.page"
                                :length="searchStore.pagination.totalPages"
                                :total-visible="5"
                                color="primary"
                                @update:model-value="handlePageChange"
                             />
                         </div>
                     </template>
                </VCol>
            </VRow>
        </VContainer>

        <!-- Mobile Filter Drawer -->
        <VNavigationDrawer
            v-model="searchStore.isFilterDrawerOpen"
            location="bottom"
            temporary
            height="auto"
            class="filter-drawer-mobile rounded-t-xl"
        >
            <div class="pa-4">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h3 class="text-h6 font-weight-bold">تصفية البحث</h3>
                    <VBtn icon="tabler-x" variant="text" @click="searchStore.toggleFilterDrawer" />
                </div>
                
                <div class="d-flex flex-column gap-6 pb-6">
                    <!-- Mobile Filters Content (Same as sidebar) -->
                    <div>
                        <VLabel class="mb-2 text-caption font-weight-bold text-uppercase">المادة الدراسية</VLabel>
                        <VAutocomplete
                            v-model="searchStore.filters.subjectId"
                            :items="searchStore.subjects"
                            item-title="nameAr"
                            item-value="id"
                            placeholder="اختر المادة"
                            variant="outlined"
                            density="compact"
                            hide-details
                            clearable
                        />
                    </div>
                    
                    <div>
                         <VLabel class="mb-2 text-caption font-weight-bold text-uppercase">الموقع</VLabel>
                         <VRow dense>
                             <VCol cols="6">
                                 <VAutocomplete
                                    v-model="searchStore.filters.governorateId"
                                    :items="searchStore.governorates"
                                    item-title="nameAr"
                                    item-value="id"
                                    placeholder="المحافظة"
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                 />
                             </VCol>
                             <VCol cols="6">
                                 <VAutocomplete
                                    v-model="searchStore.filters.cityId"
                                    :items="searchStore.cities"
                                    item-title="nameAr"
                                    item-value="id"
                                    placeholder="المدينة"
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                    :disabled="!searchStore.filters.governorateId"
                                 />
                             </VCol>
                         </VRow>
                    </div>

                    <VBtn block color="primary" size="large" @click="handleSearch(); searchStore.toggleFilterDrawer()">
                        إظهار النتائج
                    </VBtn>
                </div>
            </div>
        </VNavigationDrawer>

        <!-- Subjects View All Dialog -->
        <SubjectsDialog />
    </div>
</template>

<style lang="scss" scoped>
.parent-home {
    .bg-surface-variant {
        background-color: #f8f9fa !important;
    }

    .hero-section {
        position: relative;
        overflow: hidden;
        
        &::before {
            content: '';
            position: absolute;
            top: -50px;
            right: -50px;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.05) 0%, transparent 70%);
            border-radius: 50%;
        }
    }

    .greeting-banner {
        transition: transform 0.3s ease;
        &:hover {
            transform: scale(1.01);
        }
    }

    .quick-action-card {
        transition: all 0.2s ease;
        cursor: pointer;
        
        &:hover {
            transform: translateY(-4px);
            border-color: rgba(var(--v-theme-primary), 0.5) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);

            .icon-wrapper {
                transform: scale(1.1);
            }
        }

        .icon-wrapper {
            transition: transform 0.2s ease;
        }
    }

    .subject-chip-card {
        transition: all 0.2s ease;
        
        &:hover {
            border-color: rgba(var(--v-theme-primary), 0.4) !important;
            background-color: rgba(var(--v-theme-primary), 0.02) !important;
        }
    }

    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
        &::-webkit-scrollbar {
            display: none;
        }
    }

    .subjects-scroll {
        cursor: grab;
        &:active {
            cursor: grabbing;
        }
    }

    .search-hero-bar {
        :deep(.v-field__outline) {
            display: none;
        }
        :deep(.v-field) {
            border-radius: 12px !important;
            padding: 4px;
        }
    }
}

.primary-lighten-5 {
    background-color: rgba(var(--v-theme-primary), 0.05) !important;
}
</style>
