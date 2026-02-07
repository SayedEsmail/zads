<script setup>
import { useSearchStore } from '~/stores/search'
import { useFavoritesStore } from '~/stores/favorites'
import TeacherCard from '~/components/TeacherCard.vue'

definePageMeta({
    layout: 'default',
})

const searchStore = useSearchStore()
const favoritesStore = useFavoritesStore()

const lessonTypeOptions = [
    { title: 'الكل', value: null },
    { title: 'أونلاين', value: 'online' },
    { title: 'حضوري', value: 'offline' },
    { title: 'كلاهما', value: 'both' },
]

// Initialize reference data on mount
onMounted(async () => {
    await searchStore.initReferenceData()
    await searchStore.searchTeachers()
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
        <!-- Unified Hero Header -->
        <div class="hero-section bg-surface pa-6 pa-md-10 mb-8 border-b">
            <VContainer>
                <VRow align="center">
                    <VCol cols="12" md="8">
                        <div class="d-flex align-center gap-2 mb-2">
                            <VIcon icon="tabler-school" color="primary" size="24" />
                            <span class="text-overline font-weight-bold text-primary">تطبيق زادس التعليمي</span>
                        </div>
                        <h1 class="text-h3 font-weight-bold mb-4">
                            نخبة من <span class="text-primary text-decoration-underline">أفضل المعلمين</span> بين يديك
                        </h1>
                        <p class="text-body-1 text-secondary mb-6 max-width-600">
                             اكتشف معلمين مؤهلين في جميع المواد الدراسية. نوفر لك تجربة تعليمية متميزة لأبنائك سواء أونلاين أو حضورياً.
                        </p>
                        
                        <!-- Search Bar -->
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
                                <VBtn color="primary" @click="handleSearch" class="d-none d-sm-flex">
                                    بحث الآن
                                </VBtn>
                                <VBtn icon color="primary" @click="searchStore.toggleFilterDrawer" class="d-flex d-md-none ms-2" variant="tonal">
                                    <VIcon icon="tabler-adjustments-horizontal" />
                                </VBtn>
                            </template>
                        </VTextField>
                    </VCol>
                    
                    <VCol cols="12" md="4" class="d-none d-md-flex justify-center">
                        <VIcon icon="tabler-layout-dashboard" size="200" color="primary" style="opacity: 0.1;" />
                    </VCol>
                </VRow>
            </VContainer>
        </div>

        <VContainer>
            <VRow>
                <!-- Desktop Sidebar Filters -->
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
    </div>
</template>
