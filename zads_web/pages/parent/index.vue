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
    <div>
        <!-- Header -->
        <VRow class="mb-6">
            <VCol cols="12">
                <h1 class="text-h4 mb-2">
                    ابحث عن معلم 🔍
                </h1>
                <p class="text-body-1 text-secondary">
                    اعثر على المعلم المناسب لأبنائك
                </p>
            </VCol>
        </VRow>

        <VRow>
            <!-- Filters Sidebar -->
            <VCol
                cols="12"
                md="3"
            >
                <VCard>
                    <VCardTitle class="d-flex align-center justify-space-between">
                        <span>
                            <VIcon
                                start
                                icon="tabler-filter"
                            />
                            الفلاتر
                        </span>
                        <VBtn
                            v-if="searchStore.hasFilters"
                            variant="text"
                            size="small"
                            color="error"
                            @click="handleClearFilters"
                        >
                            مسح
                        </VBtn>
                    </VCardTitle>

                    <VCardText>
                        <VRow>
                            <!-- Subject -->
                            <VCol cols="12">
                                <VAutocomplete
                                    v-model="searchStore.filters.subjectId"
                                    :items="searchStore.subjects"
                                    item-title="nameAr"
                                    item-value="id"
                                    label="المادة"
                                    placeholder="اختر المادة"
                                    clearable
                                    density="compact"
                                />
                            </VCol>

                            <!-- Stage -->
                            <VCol cols="12">
                                <VAutocomplete
                                    v-model="searchStore.filters.stageId"
                                    :items="searchStore.stages"
                                    item-title="nameAr"
                                    item-value="id"
                                    label="المرحلة الدراسية"
                                    placeholder="اختر المرحلة"
                                    clearable
                                    density="compact"
                                />
                            </VCol>

                            <VCol cols="12">
                                <VDivider />
                            </VCol>

                            <!-- Governorate -->
                            <VCol cols="12">
                                <VAutocomplete
                                    v-model="searchStore.filters.governorateId"
                                    :items="searchStore.governorates"
                                    item-title="nameAr"
                                    item-value="id"
                                    label="المحافظة"
                                    placeholder="اختر المحافظة"
                                    clearable
                                    density="compact"
                                />
                            </VCol>

                            <!-- City -->
                            <VCol cols="12">
                                <VAutocomplete
                                    v-model="searchStore.filters.cityId"
                                    :items="searchStore.cities"
                                    item-title="nameAr"
                                    item-value="id"
                                    label="المدينة"
                                    placeholder="اختر المدينة"
                                    clearable
                                    density="compact"
                                    :disabled="!searchStore.filters.governorateId"
                                />
                            </VCol>

                            <!-- Area -->
                            <VCol cols="12">
                                <VAutocomplete
                                    v-model="searchStore.filters.areaId"
                                    :items="searchStore.areas"
                                    item-title="nameAr"
                                    item-value="id"
                                    label="المنطقة"
                                    placeholder="اختر المنطقة"
                                    clearable
                                    density="compact"
                                    :disabled="!searchStore.filters.cityId"
                                />
                            </VCol>

                            <VCol cols="12">
                                <VDivider />
                            </VCol>

                            <!-- Lesson Type -->
                            <VCol cols="12">
                                <VSelect
                                    v-model="searchStore.filters.lessonType"
                                    :items="lessonTypeOptions"
                                    label="نوع الحصة"
                                    density="compact"
                                />
                            </VCol>

                            <!-- Price Range -->
                            <VCol cols="6">
                                <VTextField
                                    v-model.number="searchStore.filters.minPrice"
                                    type="number"
                                    label="السعر من"
                                    density="compact"
                                    hide-details
                                />
                            </VCol>
                            <VCol cols="6">
                                <VTextField
                                    v-model.number="searchStore.filters.maxPrice"
                                    type="number"
                                    label="السعر إلى"
                                    density="compact"
                                    hide-details
                                />
                            </VCol>

                            <!-- Search Button -->
                            <VCol cols="12">
                                <VBtn
                                    block
                                    color="primary"
                                    :loading="searchStore.loading"
                                    @click="handleSearch"
                                >
                                    <VIcon
                                        start
                                        icon="tabler-search"
                                    />
                                    بحث
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCardText>
                </VCard>
            </VCol>

            <!-- Results -->
            <VCol
                cols="12"
                md="9"
            >
                <!-- Loading -->
                <div
                    v-if="searchStore.loading"
                    class="d-flex justify-center py-12"
                >
                    <VProgressCircular
                        indeterminate
                        color="primary"
                        size="48"
                    />
                </div>

                <!-- Error -->
                <VAlert
                    v-else-if="searchStore.error"
                    color="error"
                    variant="tonal"
                    class="mb-4"
                >
                    {{ searchStore.error }}
                </VAlert>

                <!-- No Results -->
                <VCard
                    v-else-if="!searchStore.teachers.length"
                    class="text-center py-12"
                >
                    <VIcon
                        size="64"
                        icon="tabler-search-off"
                        color="secondary"
                    />
                    <h4 class="text-h6 mt-4">
                        لا توجد نتائج
                    </h4>
                    <p class="text-body-2 text-secondary">
                        جرب تغيير الفلاتر للحصول على نتائج أفضل
                    </p>
                </VCard>

                <!-- Results Grid -->
                <template v-else>
                    <div class="d-flex align-center justify-space-between mb-4">
                        <span class="text-body-2 text-secondary">
                            {{ searchStore.pagination.total }} معلم
                        </span>
                    </div>

                    <VRow>
                        <VCol
                            v-for="teacher in searchStore.teachers"
                            :key="teacher.id"
                            cols="12"
                            sm="6"
                            lg="4"
                        >
                            <TeacherCard
                                :teacher="teacher"
                                @favorite="handleFavorite"
                                @contact="handleContact"
                            />
                        </VCol>
                    </VRow>

                    <!-- Pagination -->
                    <div
                        v-if="searchStore.pagination.totalPages > 1"
                        class="d-flex justify-center mt-6"
                    >
                        <VPagination
                            :model-value="searchStore.pagination.page"
                            :length="searchStore.pagination.totalPages"
                            :total-visible="5"
                            @update:model-value="handlePageChange"
                        />
                    </div>
                </template>
            </VCol>
        </VRow>
    </div>
</template>
