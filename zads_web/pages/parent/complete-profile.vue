<script setup>
import { useParentStore } from '~/stores/parent'
import { useChildrenStore } from '~/stores/children'
import { useSearchStore } from '~/stores/search'

definePageMeta({
    layout: 'blank',
})

const router = useRouter()
const parentStore = useParentStore()
const childrenStore = useChildrenStore()
const searchStore = useSearchStore()

const step = ref(1)
const loading = ref(false)

// Step 1: Location
const location = ref({
    governorateId: null,
    cityId: null,
    areaId: null,
})

// Step 2: Children
const newChild = ref({
    name: '',
    stageId: null,
})

// Step 3: Subjects (for each child)
const selectedSubjects = ref({}) // { childId: [subjectIds] }

// Watchers for cascading location
watch(() => location.value.governorateId, async val => {
    location.value.cityId = null
    location.value.areaId = null
    if (val) {
        await parentStore.fetchCities(val)
    }
})

watch(() => location.value.cityId, async val => {
    location.value.areaId = null
    if (val) {
        await parentStore.fetchAreas(val)
    }
})

// Initialize data
onMounted(async () => {
    loading.value = true
    await Promise.all([
        parentStore.fetchGovernorates(),
        parentStore.fetchProfile(),
        childrenStore.fetchChildren(),
        searchStore.fetchSubjects(),
        searchStore.fetchStages(),
    ])

    // Pre-fill location if exists
    if (parentStore.profile?.areaId) {
        // Find and set location from existing profile
        // This would require reverse-lookup from area to city to governorate
    }

    // Pre-fill subjects for existing children
    if (childrenStore.children.length) {
        childrenStore.children.forEach(child => {
            selectedSubjects.value[child.id] = child.subjects?.map(s => s.subjectId) || []
        })
    }

    loading.value = false
})

// Step 1: Save Location
const saveLocation = async () => {
    if (!location.value.areaId) return

    loading.value = true
    try {
        await parentStore.updateProfile({ areaId: location.value.areaId })
        step.value = 2
    } catch (error) {
        console.error('Failed to save location:', error)
    } finally {
        loading.value = false
    }
}

// Step 2: Add Child
const addChild = async () => {
    if (!newChild.value.name || !newChild.value.stageId) return

    loading.value = true
    try {
        await childrenStore.addChild({
            name: newChild.value.name,
            stageId: newChild.value.stageId,
        })
        newChild.value = { name: '', stageId: null }
    } catch (error) {
        console.error('Failed to add child:', error)
    } finally {
        loading.value = false
    }
}

const removeChild = async childId => {
    if (!confirm('هل أنت متأكد من حذف هذا الطفل؟')) return

    loading.value = true
    try {
        await childrenStore.deleteChild(childId)
        delete selectedSubjects.value[childId]
    } catch (error) {
        console.error('Failed to remove child:', error)
    } finally {
        loading.value = false
    }
}

const goToStep3 = () => {
    if (childrenStore.children.length === 0) {
        alert('أضف طفل واحد على الأقل')
        return
    }
    step.value = 3
}

// Step 3: Save Subjects
const saveSubjects = async () => {
    loading.value = true
    try {
        const promises = Object.entries(selectedSubjects.value).map(([childId, subjectIds]) => {
            return childrenStore.updateChild({
                childId,
                subjectIds,
            })
        })
        await Promise.all(promises)

        // Complete! Go to parent home
        router.push('/parent')
    } catch (error) {
        console.error('Failed to save subjects:', error)
    } finally {
        loading.value = false
    }
}

// Skip and go home
const skipToHome = () => {
    router.push('/parent')
}
</script>

<template>
    <div class="complete-profile-wrapper d-flex align-center justify-center pa-4">
        <VCard
            class="pa-6"
            max-width="600"
            width="100%"
        >
            <!-- Header -->
            <VCardTitle class="text-center mb-4">
                <h4 class="text-h4">
                    أكمل ملفك الشخصي
                </h4>
                <p class="text-body-2 text-secondary mt-2">
                    {{ step === 1 ? 'أين تسكن؟' : step === 2 ? 'أضف أبناءك' : 'اختر المواد لكل طفل' }}
                </p>
            </VCardTitle>

            <!-- Stepper -->
            <div class="d-flex justify-center mb-6">
                <VChipGroup>
                    <VChip
                        v-for="s in 3"
                        :key="s"
                        :color="step >= s ? 'primary' : 'default'"
                        :variant="step === s ? 'elevated' : 'tonal'"
                        size="small"
                    >
                        {{ s }}
                    </VChip>
                </VChipGroup>
            </div>

            <VCardText>
                <!-- Step 1: Location -->
                <div v-if="step === 1">
                    <VRow>
                        <VCol cols="12">
                            <VAutocomplete
                                v-model="location.governorateId"
                                :items="parentStore.governorates"
                                item-title="nameAr"
                                item-value="id"
                                label="المحافظة"
                                placeholder="اختر المحافظة"
                            />
                        </VCol>
                        <VCol cols="12">
                            <VAutocomplete
                                v-model="location.cityId"
                                :items="parentStore.cities"
                                item-title="nameAr"
                                item-value="id"
                                label="المدينة"
                                placeholder="اختر المدينة"
                                :disabled="!location.governorateId"
                            />
                        </VCol>
                        <VCol cols="12">
                            <VAutocomplete
                                v-model="location.areaId"
                                :items="parentStore.areas"
                                item-title="nameAr"
                                item-value="id"
                                label="المنطقة"
                                placeholder="اختر المنطقة"
                                :disabled="!location.cityId"
                            />
                        </VCol>
                    </VRow>

                    <VBtn
                        block
                        color="primary"
                        class="mt-4"
                        :loading="loading"
                        :disabled="!location.areaId"
                        @click="saveLocation"
                    >
                        التالي
                        <VIcon
                            end
                            icon="tabler-arrow-left"
                        />
                    </VBtn>
                </div>

                <!-- Step 2: Children -->
                <div v-if="step === 2">
                    <!-- Existing children -->
                    <div
                        v-if="childrenStore.children.length"
                        class="mb-4"
                    >
                        <h6 class="text-h6 mb-2">
                            أبناؤك
                        </h6>
                        <VChipGroup column>
                            <VChip
                                v-for="child in childrenStore.children"
                                :key="child.id"
                                closable
                                color="primary"
                                variant="tonal"
                                @click:close="removeChild(child.id)"
                            >
                                {{ child.name }}
                                <span class="text-caption ms-1">
                                    ({{ child.stage?.nameAr }})
                                </span>
                            </VChip>
                        </VChipGroup>
                    </div>

                    <!-- Add new child -->
                    <VRow>
                        <VCol
                            cols="12"
                            sm="6"
                        >
                            <VTextField
                                v-model="newChild.name"
                                label="اسم الطفل"
                                placeholder="أدخل الاسم"
                            />
                        </VCol>
                        <VCol
                            cols="12"
                            sm="6"
                        >
                            <VAutocomplete
                                v-model="newChild.stageId"
                                :items="searchStore.stages"
                                item-title="nameAr"
                                item-value="id"
                                label="المرحلة الدراسية"
                                placeholder="اختر المرحلة"
                            />
                        </VCol>
                        <VCol cols="12">
                            <VBtn
                                variant="tonal"
                                color="secondary"
                                block
                                :loading="loading"
                                :disabled="!newChild.name || !newChild.stageId"
                                @click="addChild"
                            >
                                <VIcon
                                    start
                                    icon="tabler-plus"
                                />
                                إضافة طفل
                            </VBtn>
                        </VCol>
                    </VRow>

                    <div class="d-flex gap-2 mt-4">
                        <VBtn
                            variant="text"
                            @click="step = 1"
                        >
                            <VIcon
                                start
                                icon="tabler-arrow-right"
                            />
                            السابق
                        </VBtn>
                        <VSpacer />
                        <VBtn
                            color="primary"
                            :disabled="childrenStore.children.length === 0"
                            @click="goToStep3"
                        >
                            التالي
                            <VIcon
                                end
                                icon="tabler-arrow-left"
                            />
                        </VBtn>
                    </div>
                </div>

                <!-- Step 3: Subjects -->
                <div v-if="step === 3">
                    <div
                        v-for="child in childrenStore.children"
                        :key="child.id"
                        class="mb-4"
                    >
                        <h6 class="text-h6 mb-2">
                            {{ child.name }}
                            <span class="text-caption text-secondary">
                                ({{ child.stage?.nameAr }})
                            </span>
                        </h6>
                        <VAutocomplete
                            v-model="selectedSubjects[child.id]"
                            :items="searchStore.subjects"
                            item-title="nameAr"
                            item-value="id"
                            label="المواد"
                            placeholder="اختر المواد"
                            multiple
                            chips
                            closable-chips
                        />
                    </div>

                    <div class="d-flex gap-2 mt-4">
                        <VBtn
                            variant="text"
                            @click="step = 2"
                        >
                            <VIcon
                                start
                                icon="tabler-arrow-right"
                            />
                            السابق
                        </VBtn>
                        <VSpacer />
                        <VBtn
                            color="primary"
                            :loading="loading"
                            @click="saveSubjects"
                        >
                            <VIcon
                                start
                                icon="tabler-check"
                            />
                            إنهاء
                        </VBtn>
                    </div>
                </div>
            </VCardText>

            <!-- Skip link -->
            <VCardActions class="justify-center">
                <VBtn
                    variant="text"
                    size="small"
                    @click="skipToHome"
                >
                    تخطي الآن
                </VBtn>
            </VCardActions>
        </VCard>
    </div>
</template>

<style lang="scss" scoped>
.complete-profile-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
}
</style>
