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
    <div class="complete-profile-wrapper d-flex flex-column">
        <!-- Sticky Header (Mobile) -->
        <div class="d-md-none bg-surface elevation-2 position-sticky top-0 z-index-100 pa-4 text-center">
            <h1 class="text-h5 font-weight-bold mb-1">أكمل ملفك الشخصي</h1>
            <div class="d-flex align-center justify-center gap-2">
                <template v-for="i in 3" :key="i">
                     <div 
                        class="rounded-circle transition-all"
                        :class="step >= i ? 'bg-primary' : 'bg-secondary opacity-30'"
                        style="width: 8px; height: 8px;"
                     />
                </template>
            </div>
        </div>

        <!-- Main Content -->
        <VContainer fluid class="flex-grow-1 d-flex align-center justify-center pa-0 pa-md-6">
            <VCard
                class="pa-0 pa-md-6 w-100 h-100 h-md-auto d-flex flex-column"
                max-width="800"
                :elevation="$vuetify.display.mdAndUp ? 4 : 0"
                rounded="lg"
            >
                <!-- Desktop Header -->
                <VCardTitle class="text-center mb-6 d-none d-md-block">
                    <h2 class="text-h3 font-weight-bold text-primary mb-2">
                        أكمل ملفك الشخصي
                    </h2>
                    <p class="text-body-1 text-secondary">
                        خطوات بسيطة لنقدم لك تجربة مخصصة
                    </p>
                    
                    <!-- Desktop Stepper -->
                    <div class="d-flex justify-center mt-6">
                        <VChipGroup>
                            <VChip
                                v-for="s in 3"
                                :key="s"
                                :color="step >= s ? 'primary' : 'default'"
                                :variant="step === s ? 'elevated' : 'tonal'"
                                size="default"
                                class="px-6"
                            >
                                <span class="font-weight-bold">{{ s }}</span>
                                <span class="mx-2">{{ s === 1 ? 'العنوان' : s === 2 ? 'الأبناء' : 'المواد' }}</span>
                            </VChip>
                        </VChipGroup>
                    </div>
                </VCardTitle>

                <VCardText class="flex-grow-1 overflow-y-auto pa-4 pa-md-2" style="max-height: calc(100vh - 140px); overflow-x: hidden;">
                    <VWindow v-model="step">
                        <!-- Step 1: Location -->
                        <VWindowItem :value="1">
                            <div class="text-center mb-6">
                                <VAvatar color="primary-lighten-5" size="80" class="mb-4">
                                    <VIcon icon="tabler-map-pin" size="40" color="primary" />
                                </VAvatar>
                                <h3 class="text-h5 font-weight-bold">أين تسكن؟</h3>
                                <p class="text-body-2 text-secondary">يساعدنا هذا في العثور على معلمين قريبين منك</p>
                            </div>

                            <VRow>
                                <VCol cols="12">
                                    <VSelect
                                        v-model="location.governorateId"
                                        :items="parentStore.governorates"
                                        item-title="nameAr"
                                        item-value="id"
                                        label="المحافظة"
                                        placeholder="اختر المحافظة"
                                        prepend-inner-icon="tabler-map"
                                        variant="outlined"
                                        color="primary"
                                    />
                                </VCol>
                                <VCol cols="12">
                                    <VSelect
                                        v-model="location.cityId"
                                        :items="parentStore.cities"
                                        item-title="nameAr"
                                        item-value="id"
                                        label="المدينة"
                                        placeholder="اختر المدينة"
                                        :disabled="!location.governorateId"
                                        prepend-inner-icon="tabler-building"
                                        variant="outlined"
                                        color="primary"
                                    />
                                </VCol>
                                <VCol cols="12">
                                    <VSelect
                                        v-model="location.areaId"
                                        :items="parentStore.areas"
                                        item-title="nameAr"
                                        item-value="id"
                                        label="المنطقة"
                                        placeholder="اختر المنطقة"
                                        :disabled="!location.cityId"
                                        prepend-inner-icon="tabler-point"
                                        variant="outlined"
                                        color="primary"
                                    />
                                </VCol>
                            </VRow>
                        </VWindowItem>

                        <!-- Step 2: Children -->
                        <VWindowItem :value="2">
                             <div class="text-center mb-6">
                                <VAvatar color="primary-lighten-5" size="80" class="mb-4">
                                    <VIcon icon="tabler-users" size="40" color="primary" />
                                </VAvatar>
                                <h3 class="text-h5 font-weight-bold">أضف أبناءك</h3>
                                <p class="text-body-2 text-secondary">سنقوم بترشيح المعلمين المناسبين لمراحلهم الدراسية</p>
                            </div>

                            <!-- Existing children List -->
                            <div v-if="childrenStore.children.length" class="mb-6">
                                <VLabel class="mb-2 font-weight-bold">الأبناء المضافين</VLabel>
                                <VRow>
                                    <VCol v-for="child in childrenStore.children" :key="child.id" cols="12" sm="6">
                                        <VCard border flat class="d-flex align-center pa-3">
                                            <VAvatar color="secondary" variant="tonal" size="40" class="me-3">
                                                <VIcon icon="tabler-user" />
                                            </VAvatar>
                                            <div class="flex-grow-1">
                                                <div class="font-weight-bold">{{ child.name }}</div>
                                                <div class="text-caption text-secondary">{{ child.stage?.nameAr }}</div>
                                            </div>
                                            <VBtn icon="tabler-trash" variant="text" color="error" size="small" @click="removeChild(child.id)" />
                                        </VCard>
                                    </VCol>
                                </VRow>
                            </div>

                            <!-- Add new child Form -->
                            <VCard border flat class="bg-grey-50 pa-4 rounded-lg">
                                <h4 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
                                    <VIcon icon="tabler-plus" size="20" class="me-2" color="primary"/>
                                    إضافة طفل جديد
                                </h4>
                                <VRow>
                                    <VCol cols="12" sm="6">
                                        <VTextField
                                            v-model="newChild.name"
                                            label="الاسم"
                                            placeholder="أدخل اسم الطفل"
                                            variant="outlined"
                                            bg-color="surface"
                                            hide-details="auto"
                                        />
                                    </VCol>
                                    <VCol cols="12" sm="6">
                                        <VSelect
                                            v-model="newChild.stageId"
                                            :items="searchStore.stages"
                                            item-title="nameAr"
                                            item-value="id"
                                            label="المرحلة الدراسية"
                                            placeholder="اختر المرحلة"
                                            variant="outlined"
                                            bg-color="surface"
                                            hide-details="auto"
                                        />
                                    </VCol>
                                    <VCol cols="12">
                                        <VBtn
                                            color="black"
                                            block
                                            variant="flat"
                                            :loading="loading"
                                            :disabled="!newChild.name || !newChild.stageId"
                                            @click="addChild"
                                            height="48"
                                        >
                                            إضافة للقائمة
                                        </VBtn>
                                    </VCol>
                                </VRow>
                            </VCard>
                        </VWindowItem>

                        <!-- Step 3: Subjects -->
                        <VWindowItem :value="3">
                             <div class="text-center mb-6">
                                <VAvatar color="primary-lighten-5" size="80" class="mb-4">
                                    <VIcon icon="tabler-books" size="40" color="primary" />
                                </VAvatar>
                                <h3 class="text-h5 font-weight-bold">المواد المفضلة</h3>
                                <p class="text-body-2 text-secondary">اختر المواد التي يحتاج أبناؤك مساعدة فيها</p>
                            </div>

                            <div v-for="child in childrenStore.children" :key="child.id" class="mb-6">
                                <h4 class="text-h6 font-weight-bold mb-3 d-flex align-center">
                                    <VAvatar size="32" color="secondary" variant="tonal" class="me-2 text-caption">
                                        {{ child.name.charAt(0) }}
                                    </VAvatar>
                                    {{ child.name }}
                                    <span class="text-caption text-secondary ms-2 bg-grey-100 px-2 py-1 rounded">
                                        {{ child.stage?.nameAr }}
                                    </span>
                                </h4>
                                
                                <VAutocomplete
                                    v-model="selectedSubjects[child.id]"
                                    :items="searchStore.subjects"
                                    item-title="nameAr"
                                    item-value="id"
                                    label="ابحث واختر المواد..."
                                    multiple
                                    chips
                                    closable-chips
                                    variant="outlined"
                                    color="primary"
                                >
                                    <template #chip="{ props, item }">
                                        <VChip v-bind="props" color="primary" variant="tonal" label>
                                            {{ item.title }}
                                        </VChip>
                                    </template>
                                </VAutocomplete>
                            </div>
                        </VWindowItem>
                    </VWindow>
                </VCardText>

                <VDivider />

                <!-- Sticky Actions Footer -->
                <VCardActions class="pa-4 bg-surface">
                     <VBtn
                        v-if="step > 1"
                        variant="text"
                        color="secondary"
                        size="large"
                        @click="step--"
                        class="px-6"
                    >
                        السابق
                    </VBtn>
                    
                    <VSpacer />
                    
                    <VBtn
                         v-if="step < 3"
                        color="primary"
                        size="large"
                        class="px-8"
                        elevation="2"
                        :loading="loading"
                        :disabled="step === 1 ? !location.areaId : childrenStore.children.length === 0"
                        @click="step === 1 ? saveLocation() : goToStep3()"
                    >
                        التالي
                        <VIcon end icon="tabler-arrow-left" />
                    </VBtn>

                    <VBtn
                        v-else
                        color="primary"
                        size="large"
                        class="px-8"
                        elevation="2"
                        :loading="loading"
                        @click="saveSubjects"
                    >
                        إنهاء وبدء الاستخدام
                        <VIcon end icon="tabler-check" />
                    </VBtn>
                </VCardActions>
            </VCard>
            
            <!-- Skip Link (Absolute bottom on Desktop, below card) -->
             <div class="position-absolute bottom-0 mb-4 d-none d-md-block">
                <VBtn
                    variant="text"
                    size="small"
                    color="secondary"
                    @click="skipToHome"
                >
                    تخطي وإكمال لاحقاً
                </VBtn>
            </div>
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.complete-profile-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
}
</style>
