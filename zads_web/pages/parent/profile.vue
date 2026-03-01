<script setup>
import { useParentStore } from '~/stores/parent'
import { useChildrenStore } from '~/stores/children'
import { useSearchStore } from '~/stores/search'

definePageMeta({
    layout: 'default',
})

const router = useRouter()
const parentStore = useParentStore()
const childrenStore = useChildrenStore()
const searchStore = useSearchStore()
const { t } = useI18n()

const loading = ref(false)
const finishing = ref(false)

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

// Add Child
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
    if (!confirm(t('CompleteProfile.ConfirmDeleteChild'))) return

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

// Final Step: Save Location and Subjects, then go to home
const finishSetup = async () => {
    if (!location.value.areaId) {
        alert(t('CompleteProfile.LocationRequired'))
        return
    }
    if (childrenStore.children.length === 0) {
        alert(t('CompleteProfile.AddAtLeastOneChild'))
        return
    }

    finishing.value = true
    try {
        // Save location
        await parentStore.updateProfile({ areaId: location.value.areaId })

        // Save subjects
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
        console.error('Failed to finish setup:', error)
    } finally {
        finishing.value = false
    }
}

// Skip and go home
const skipToHome = () => {
    router.push('/parent')
}
</script>

<template>
    <div class="parent-profile-page">
        <!-- Premium Header Section -->
        <PremiumPageHeader
            :title="$t('CompleteProfile.CompleteProfile')"
            :description="$t('CompleteProfile.ProfileStepsDesc')"
        />

        <VContainer class="max-width-900 pa-0">
            <!-- Main Content Sections -->
            <VCard class="rounded-xl elevation-2 overflow-hidden mb-6">
                <!-- Section 1: Location -->
                <div class="pa-6 pa-md-8 border-b">
                    <div class="d-flex align-center gap-4 mb-6">
                        <VAvatar color="primary-lighten-5" size="56" class="rounded-lg">
                            <VIcon icon="tabler-map-pin" size="28" color="primary" />
                        </VAvatar>
                        <div>
                            <h3 class="text-h5 font-weight-bold">{{ $t('CompleteProfile.WhereDoYouLive?') }}</h3>
                            <p class="text-body-2 text-secondary mb-0">{{ $t('CompleteProfile.LocationDesc') }}</p>
                        </div>
                    </div>

                            <VRow>
                                <VCol cols="12">
                                    <VSelect
                                        v-model="location.governorateId"
                                        :items="parentStore.governorates"
                                        item-title="nameAr"
                                        item-value="id"
                                        :label="$t('CompleteProfile.Governorate')"
                                        :placeholder="$t('CompleteProfile.SelectGovernorate')"
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
                                        :label="$t('CompleteProfile.City')"
                                        :placeholder="$t('CompleteProfile.SelectCity')"
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
                                        :label="$t('CompleteProfile.Area')"
                                        :placeholder="$t('CompleteProfile.SelectArea')"
                                        :disabled="!location.cityId"
                                        prepend-inner-icon="tabler-point"
                                        variant="outlined"
                                        color="primary"
                                    />
                                </VCol>
                            </VRow>
                </div>

                <!-- Section 2: Children -->
                <div class="pa-6 pa-md-8 border-b">
                    <div class="d-flex align-center gap-4 mb-6">
                        <VAvatar color="primary-lighten-5" size="56" class="rounded-lg">
                            <VIcon icon="tabler-users" size="28" color="primary" />
                        </VAvatar>
                        <div>
                            <h3 class="text-h5 font-weight-bold">{{ $t('CompleteProfile.AddChildren') }}</h3>
                            <p class="text-body-2 text-secondary mb-0">{{ $t('CompleteProfile.ChildrenDesc') }}</p>
                        </div>
                    </div>

                            <!-- Existing children List -->
                            <div v-if="childrenStore.children.length" class="mb-6">
                                <VLabel class="mb-2 font-weight-bold">{{ $t('CompleteProfile.AddedChildren') }}</VLabel>
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
                                    {{ $t('CompleteProfile.AddNewChild') }}
                                </h4>
                                <VRow>
                                    <VCol cols="12" sm="6">
                                        <VTextField
                                            v-model="newChild.name"
                                            :label="$t('CompleteProfile.Name')"
                                            :placeholder="$t('CompleteProfile.EnterChildName')"
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
                                            :label="$t('CompleteProfile.EducationalStage')"
                                            :placeholder="$t('CompleteProfile.SelectStage')"
                                            variant="outlined"
                                            bg-color="surface"
                                            hide-details="auto"
                                        />
                                    </VCol>
                                    <VCol cols="12" sm="3" class="text-end">
                                        <VBtn
                                            color="secondary"
                                            size="large"
                                            block
                                            variant="outlined"
                                            class="rounded-pill font-weight-bold"
                                            :loading="loading"
                                            :disabled="!newChild.name || !newChild.stageId"
                                            @click="addChild"
                                            height="48"
                                            prepend-icon="tabler-plus"
                                        >
                                            {{ $t('CompleteProfile.AddToList') }}
                                        </VBtn>
                                    </VCol>
                                </VRow>
                            </VCard>
                </div>

                <!-- Section 3: Subjects -->
                <div class="pa-6 pa-md-8">
                    <div class="d-flex align-center gap-4 mb-6">
                        <VAvatar color="primary-lighten-5" size="56" class="rounded-lg">
                            <VIcon icon="tabler-books" size="28" color="primary" />
                        </VAvatar>
                        <div>
                            <h3 class="text-h5 font-weight-bold">{{ $t('CompleteProfile.PreferredSubjects') }}</h3>
                            <p class="text-body-2 text-secondary mb-0">{{ $t('CompleteProfile.SubjectsDesc') }}</p>
                        </div>
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
                                    :label="$t('CompleteProfile.SearchSelectSubjects')"
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
                </div>
            </VCard>

            <!-- Actions Footer -->
            <div class="d-flex flex-column flex-sm-row align-center justify-space-between gap-4 mt-6">
                <VBtn
                    variant="text"
                    size="large"
                    color="secondary"
                    class="font-weight-bold"
                    @click="skipToHome"
                >
                    {{ $t('CompleteProfile.SkipAndCompleteLater') }}
                </VBtn>
                
                <VBtn
                    color="secondary"
                    size="x-large"
                    class="px-8 rounded-pill font-weight-bold shadow-secondary"
                    :loading="finishing"
                    :disabled="!location.areaId || childrenStore.children.length === 0"
                    @click="finishSetup"
                >
                    {{ $t('CompleteProfile.FinishAndStart') }}
                    <VIcon end icon="tabler-rocket" class="ms-2" />
                </VBtn>
            </div>
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.parent-profile-page {

    .shadow-secondary {
        box-shadow: 0 8px 16px rgba(var(--v-theme-secondary), 0.2) !important;
    }

    // Form Field Refinement
    :deep(.v-field) {
        border-radius: 12px !important;
        background: #fdfdfd !important;
        
        &.v-field--focused {
            .v-field__outline {
                color: rgb(var(--v-theme-primary)) !important;
            }
        }
    }
}
</style>
