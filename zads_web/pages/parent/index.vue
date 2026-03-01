<script setup>
import { useSearchStore } from '~/stores/search'
import { useFavoritesStore } from '~/stores/favorites'
import { useAuthStore } from '~/stores/auth'
import { useParentStore } from '~/stores/parent'
import TeacherCard from '~/components/TeacherCard.vue'
import SubjectsDialog from '~/components/SubjectsDialog.vue'
import parentDashboardIllustration from '@images/parent_dashboard.png'

definePageMeta({
    layout: 'default',
})

const searchStore = useSearchStore()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()
const parentStore = useParentStore()
const { t } = useI18n()

const lessonTypeOptions = [
    { title: t('ViewAll'), value: null },
    { title: t('Online'), value: 'online' },
    { title: t('InPerson'), value: 'offline' },
    { title: t('OnlineInPerson'), value: 'both' },
]

const quickActions = [
    { label: t('MyChildren'), icon: 'tabler-users', color: '#E3F2FD', iconColor: '#2196F3', to: '/parent/children' },
    { label: t('Favorites'), icon: 'tabler-heart', color: '#FFEBEE', iconColor: '#F44336', to: '/parent/favorites' },
    { label: t('MyRequests'), icon: 'tabler-clipboard-list', color: '#E0F2F1', iconColor: '#009688', to: '/parent/requests' },
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
    return authStore.user?.name?.split(' ')[0] || t('Visitor')
})

const hasLocation = computed(() => !!parentStore.profile?.areaId)
const locationName = computed(() => {
    if (!hasLocation.value) return t('NoLocation')
    return parentStore.profile.area?.nameAr || parentStore.profile.area?.city?.nameAr || t('CustomLocation')
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
        <div class="hero-section bg-secondary-light pa-6 pa-md-10 mb-8 border-b">
            <VContainer>
                <VRow align="center">
                    <VCol cols="12" md="7">
                        <!-- Greeting Banner -->
                        <div class="greeting-banner-premium pa-6 rounded-xl mb-6 d-flex align-center">
                            <VRow align="center" no-gutters>
                                <VCol cols="12" sm="8">
                                    <div class="pe-sm-6">
                                        <h2 class="text-h4 font-weight-bold mb-2 text-high-emphasis">
                                            {{ $t('Welcome') }} {{ userFirstName }}
                                        </h2>
                                        <p class="text-body-1 mb-0 text-secondary">
                                            {{ $t('FindTeachers') }}
                                        </p>
                                    </div>
                                </VCol>
                                <VCol cols="12" sm="4" class="text-center d-none d-sm-block">
                                    <VImg
                                        :src="parentDashboardIllustration"
                                        max-height="140"
                                        contain
                                        class="greeting-illustration"
                                    />
                                </VCol>
                            </VRow>
                        </div>

                        <!-- Location & Search -->
                        <div class="location-header d-flex align-center gap-2 mb-4">
                            <VIcon icon="tabler-map-pin" color="primary" size="20" />
                            <span class="text-body-2 font-weight-bold text-secondary">{{ locationName }}</span>
                            <VBtn variant="text" color="primary" size="small" to="/parent/profile" class="ms-auto font-weight-bold">
                                {{ $t('ChangeLocation') }}
                            </VBtn>
                        </div>
                        
                        <VTextField
                            v-model="searchStore.filters.search"
                            :placeholder="$t('SearchByTeacher')"
                            variant="solo"
                            elevation="2"
                            class="search-hero-bar"
                            clearable
                            @keyup.enter="handleSearch"
                        >
                            <template #prepend-inner>
                                <VIcon icon="tabler-search" class="text-secondary opacity-60" />
                            </template>
                            <template #append-inner>
                                <VBtn color="primary" @click="handleSearch" class="px-6 rounded-lg font-weight-bold shadow-primary">
                                    {{ $t('SearchNow') }}
                                </VBtn>
                            </template>
                        </VTextField>
                    </VCol>
                    
                    <VCol cols="12" md="5" class="d-none d-md-block">
                        <!-- Quick Actions Grid -->
                        <div class="text-overline font-weight-bold mb-4 px-2 text-secondary">{{ $t('QuickAccess') }}</div>
                        <VRow dense>
                            <VCol v-for="action in quickActions" :key="action.label" cols="4">
                                <VCard 
                                    :href="action.to" 
                                    flat 
                                    class="quick-action-card-premium text-center pa-4 rounded-xl d-flex flex-column align-center gap-2" 
                                    :ripple="false"
                                >
                                    <div class="icon-avatar-premium pa-3 rounded-xl mb-1" :style="{ backgroundColor: `${action.iconColor}10` }">
                                        <VIcon :icon="action.icon" :color="action.iconColor" size="32" />
                                    </div>
                                    <span class="text-caption font-weight-bold text-high-emphasis">{{ action.label }}</span>
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
                    <h3 class="text-h5 font-weight-bold">{{ $t('Categories') }}</h3>
                    <VBtn variant="text" color="primary" @click="searchStore.openSubjectsDialog">{{ $t('ViewAll') }}</VBtn>
                </div>
                <div class="subjects-scroll d-flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    <VCard
                        v-for="subject in searchStore.subjects.slice(0, 8)"
                        :key="subject.id"
                        flat 
                        class="subject-chip-card px-6 py-3 rounded-pill cursor-pointer flex-shrink-0 border"
                        :class="searchStore.filters.subjectId === subject.id ? 'bg-primary text-white border-primary shadow-primary' : 'bg-surface border-light text-secondary'"
                        @click="handleSubjectClick(subject.id)"
                    >
                        <span class="text-body-2 font-weight-bold">{{ subject.nameAr }}</span>
                    </VCard>
                </div>
            </div>

            <VRow>
                <!-- Desktop Sidebar Filters (Moved or Kept? Mobile uses bottom sheet, web uses sidebar) -->
                <!-- Let's keep the sidebar for web results refinement -->
                <VCol cols="12" md="3" class="d-none d-md-block">
                    <div class="position-sticky" style="top: 100px;">
                        <VCard border flat class="rounded-xl premium-sidebar">
                            <VCardItem class="pb-2">
                                <template #prepend>
                                    <VIcon icon="tabler-filter-search" color="primary" class="me-2" />
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
                                        {{ $t('Reset') }}
                                    </VBtn>
                                </template>
                            </VCardItem>
                            
                            <VDivider />
                            
                            <VCardText class="pa-4 d-flex flex-column gap-6">
                                <!-- Educational Path Section -->
                                <div>
                                    <div class="text-caption font-weight-bold text-uppercase text-secondary mb-3 d-flex align-center">
                                        <VIcon icon="tabler-book-2" size="16" class="me-2" />
                                        المسار التعليمي
                                    </div>
                                    <div class="d-flex flex-column gap-3">
                                        <VAutocomplete
                                            v-model="searchStore.filters.subjectId"
                                            :items="searchStore.subjects"
                                            item-title="nameAr"
                                            item-value="id"
                                            placeholder="المادة الدراسية"
                                            variant="outlined"
                                            density="compact"
                                            hide-details
                                            clearable
                                        />
                                        <VAutocomplete
                                            v-model="searchStore.filters.stageId"
                                            :items="searchStore.stages"
                                            item-title="nameAr"
                                            item-value="id"
                                            placeholder="المرحلة الدراسية"
                                            variant="outlined"
                                            density="compact"
                                            hide-details
                                            clearable
                                        />
                                    </div>
                                </div>

                                <!-- Location Section -->
                                <div>
                                    <div class="text-caption font-weight-bold text-uppercase text-secondary mb-3 d-flex align-center">
                                        <VIcon icon="tabler-map-2" size="16" class="me-2" />
                                        نطاق البحث
                                    </div>
                                    <div class="d-flex flex-column gap-3">
                                        <VAutocomplete
                                            v-model="searchStore.filters.governorateId"
                                            :items="searchStore.governorates"
                                            item-title="nameAr"
                                            item-value="id"
                                            placeholder="المحافظة"
                                            variant="outlined"
                                            density="compact"
                                            hide-details
                                            clearable
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
                                            clearable
                                            :disabled="!searchStore.filters.governorateId"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div class="text-caption font-weight-bold text-uppercase text-secondary mb-3">نوع الحصة</div>
                                    <VChipGroup v-model="searchStore.filters.lessonType" color="primary">
                                        <VChip 
                                            v-for="opt in lessonTypeOptions.filter(o => o.value)" 
                                            :key="opt.value" 
                                            :value="opt.value" 
                                            label 
                                            size="small" 
                                            :variant="searchStore.filters.lessonType === opt.value ? 'flat' : 'tonal'"
                                        >
                                            {{ opt.title }}
                                        </VChip>
                                    </VChipGroup>
                                </div>

                                <VBtn block color="secondary" @click="handleSearch" :loading="searchStore.loading" class="rounded-lg shadow-secondary">
                                    {{ $t('UpdateResults') }}
                                </VBtn>
                            </VCardText>
                        </VCard>
                    </div>
                </VCol>

                <!-- Results Grid -->
                <VCol cols="12" md="9">
                    <div class="d-flex align-center justify-space-between mb-4">
                        <div class="text-body-2 text-secondary">
                            {{ $t('FoundTeachers', { count: searchStore.pagination.total }) }}
                        </div>
                    </div>

                    <!-- Quick Filters row -->
                    <div class="d-flex gap-2 flex-wrap mb-6">
                        <VChip
                            :variant="searchStore.filters.lessonType === 'online' ? 'flat' : 'tonal'"
                            size="small"
                            class="rounded-lg"
                            :color="searchStore.filters.lessonType === 'online' ? 'primary' : 'default'"
                            @click="searchStore.filters.lessonType = searchStore.filters.lessonType === 'online' ? null : 'online'; handleSearch()"
                        >
                            <VIcon icon="tabler-video" start size="14" />
                            أونلاين
                        </VChip>
                        <VChip
                            :variant="searchStore.filters.rating === 5 ? 'flat' : 'tonal'"
                            size="small"
                            class="rounded-lg"
                            :color="searchStore.filters.rating === 5 ? 'primary' : 'default'"
                            @click="searchStore.filters.rating = searchStore.filters.rating === 5 ? null : 5; handleSearch()"
                        >
                            <VIcon icon="tabler-star" start size="14" />
                            الأعلى تقييماً
                        </VChip>
                        <VChip
                            v-if="hasLocation"
                            :variant="searchStore.filters.nearby ? 'flat' : 'tonal'"
                            size="small"
                            class="rounded-lg"
                            :color="searchStore.filters.nearby ? 'primary' : 'default'"
                            @click="searchStore.filters.nearby = !searchStore.filters.nearby; handleSearch()"
                        >
                            <VIcon icon="tabler-map-pin" start size="14" />
                            بالقرب مني
                        </VChip>
                    </div>

                    <!-- Loader / Grid / No Results -->
                     <div v-if="searchStore.loading" class="text-center py-12">
                         <VProgressCircular indeterminate color="primary" size="64" />
                     </div>

                     <VAlert v-else-if="searchStore.error" type="error" variant="tonal" class="mb-4">
                         {{ searchStore.error }}
                     </VAlert>

                     <div v-else-if="!searchStore.teachers.length" class="text-center py-16 bg-surface rounded-xl border-dashed border-2 opacity-80" style="border-color: rgba(var(--v-border-color), 0.1) !important;">
                         <VIcon icon="tabler-search-off" size="64" color="secondary" class="mb-4 opacity-20" />
                         <h3 class="text-h5 font-weight-bold text-high-emphasis mb-2">{{ $t('NoResults') }}</h3>
                         <p class="text-secondary mb-6">{{ $t('TryFilters') }}</p>
                         <VBtn variant="tonal" color="primary" @click="handleClearFilters" class="rounded-pill px-8">
                             {{ $t('ViewAll') }}
                         </VBtn>
                     </div>

                     <template v-else>
                         <VRow>
                             <VCol v-for="teacher in searchStore.teachers" :key="teacher.id" cols="12">
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
    .bg-secondary-light {
        background-color: rgb(var(--v-theme-secondary-light)) !important;
    }

    .hero-section {
        position: relative;
        overflow: hidden;
        background: linear-gradient(180deg, rgb(var(--v-theme-secondary-light)) 0%, #fff 100%);
        border-bottom: 1.5px solid rgba(var(--v-border-color), 0.05) !important;
        
        &::before {
            content: '';
            position: absolute;
            top: -100px;
            right: -100px;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.04) 0%, transparent 70%);
            border-radius: 50%;
        }
    }

    .greeting-banner-premium {
        background: #fff;
        border: 1px solid rgba(var(--v-border-color), 0.05);
        box-shadow: 0 10px 30px -10px rgba(var(--v-theme-secondary), 0.1);
        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        
        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px -15px rgba(var(--v-theme-secondary), 0.15);
        }
    }

    .greeting-illustration {
        filter: drop-shadow(0 8px 16px rgba(0,0,0,0.05));
        transition: transform 0.4s ease;
        
        &:hover {
            transform: scale(1.05) rotate(-2deg);
        }
    }

    .quick-action-card-premium {
        background: #fff;
        border: 1px solid rgba(var(--v-border-color), 0.04) !important;
        transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        cursor: pointer;
        
        &:hover {
            transform: translateY(-8px);
            border-color: rgba(var(--v-theme-primary), 0.2) !important;
            box-shadow: 0 12px 24px -10px rgba(var(--v-theme-primary), 0.15);

            .icon-avatar-premium {
                transform: scale(1.15) rotate(-5deg);
            }
        }

        .icon-avatar-premium {
            transition: transform 0.3s ease;
        }
    }

    .subject-chip-card {
        transition: all 0.2s ease;
        border-radius: 12px !important;
        
        &:hover {
            border-color: rgba(var(--v-theme-primary), 0.4) !important;
            background-color: rgba(var(--v-theme-primary), 0.02) !important;
        }
        
        &.bg-primary-lighten-5 {
            background-color: rgb(var(--v-theme-primary-light)) !important;
            border-color: rgb(var(--v-theme-primary)) !important;
        }
    }

    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
        &::-webkit-scrollbar {
            display: none;
        }
    }

    .premium-sidebar {
        background: #fff !important;
        border: 1px solid rgba(var(--v-border-color), 0.05) !important;
        box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05) !important;
        
        :deep(.v-field--variant-outlined) {
            .v-field__outline {
                --v-field-border-opacity: 0.1 !important;
            }
            &.v-field--focused .v-field__outline {
                --v-field-border-opacity: 0.5 !important;
            }
        }
    }

    .v-chip.v-chip--variant-tonal {
        transition: all 0.2s ease;
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
    }

    .search-hero-bar {
        :deep(.v-field__outline) {
            display: none;
        }
        :deep(.v-field) {
            border-radius: 16px !important;
            padding: 6px;
            background: #fff !important;
            box-shadow: 0 8px 24px -4px rgba(0,0,0,0.08) !important;
            transition: box-shadow 0.3s ease;
            
            &.v-field--focused {
                box-shadow: 0 12px 32px -4px rgba(var(--v-theme-primary), 0.15) !important;
            }
        }
    }
}

.shadow-primary {
    box-shadow: 0 4px 14px 0 rgba(var(--v-theme-primary), 0.39) !important;
}
</style>
