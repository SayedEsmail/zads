<script setup>
import { useTeacherStore } from '~/stores/teacher'
import { useSearchStore } from '~/stores/search'

definePageMeta({
    layout: 'default',
})

const teacherStore = useTeacherStore()
const searchStore = useSearchStore()
const { t } = useI18n()
const { showSnackbar } = useSnackbar()

// Form reference
const refForm = ref()
const isSaving = ref(false)

// Data models mapping to the api body requirements
const formData = ref({
    bio: '',
    experienceYears: null,
    qualification: '',
    areaId: null,
    lessonTypes: [],
})

// Location Drilldown
const selectedGovernorateId = ref(null)
const selectedCityId = ref(null)

const lessonTypeOptions = [
    { title: t('Online'), value: 'online' },
    { title: t('InPersonTeacher'), value: 'at_teacher' },
    { title: t('InPersonStudent'), value: 'at_student' },
]

// Initialize the form state
onMounted(async () => {
    // Make sure we have the original governorate arrays loaded
    if (!searchStore.governorates.length) {
        await searchStore.fetchGovernorates()
    }
    
    // Fetch user profile if not cached
    let profile = teacherStore.profile
    if (!profile) {
        profile = await teacherStore.fetchProfile()
    }

    if (profile) {
        formData.value = {
            bio: profile.bio || '',
            experienceYears: profile.experienceYears || null,
            qualification: profile.qualification || '',
            areaId: profile.areaId || null,
            lessonTypes: profile.lessonTypes || [],
        }

        // Setup the pre-selected location hierarchy if area exists
        if (profile.area) {
            selectedGovernorateId.value = profile.area.city?.governorateId || null
            
            if (selectedGovernorateId.value) {
                await searchStore.fetchCities(selectedGovernorateId.value)
                selectedCityId.value = profile.area.cityId || null
            }
            
            if (selectedCityId.value) {
                await searchStore.fetchAreas(selectedCityId.value)
                formData.value.areaId = profile.areaId
            }
        }
    }
})

// Watchers for drill-down location dropdowns
watch(selectedGovernorateId, async (newId) => {
    if (newId) {
        await searchStore.fetchCities(newId)
    } else {
        searchStore.cities = []
        searchStore.areas = []
    }
    // Prevent overriding the cached value when initially mounting the component
    if (formData.value.areaId && searchStore.areas.find(a => a.id === formData.value.areaId)) return;
    
    selectedCityId.value = null
    formData.value.areaId = null
})

watch(selectedCityId, async (newId) => {
    if (newId) {
        await searchStore.fetchAreas(newId)
    } else {
        searchStore.areas = []
    }
    
    if (formData.value.areaId && searchStore.areas.find(a => a.id === formData.value.areaId)) return;
    formData.value.areaId = null
})

const saveProfile = async () => {
    const { valid } = await refForm.value.validate()
    if (!valid) return

    isSaving.value = true
    try {
        await teacherStore.updateProfile({
            bio: formData.value.bio,
            experienceYears: Number(formData.value.experienceYears),
            qualification: formData.value.qualification,
            areaId: formData.value.areaId,
            lessonTypes: formData.value.lessonTypes,
        })
        showSnackbar(t('TeacherProfile.ProfileUpdatedSuccess'), 'success')
    } catch (error) {
        showSnackbar(t('TeacherProfile.ProfileUpdateFailed'), 'error')
    } finally {
        isSaving.value = false
    }
}
</script>

<template>
    <div>
        <VRow class="mb-6">
            <VCol cols="12">
                <h1 class="text-h4 mb-2 d-flex align-center gap-2">
                    {{ $t('TeacherProfile.Title') }}
                    <VIcon icon="tabler-user-edit" color="primary" size="32" />
                </h1>
                <p class="text-body-1 text-secondary">
                    {{ $t('TeacherProfile.Desc') }}
                </p>
            </VCol>
        </VRow>

        <VRow>
            <VCol cols="12" md="8">
                <VCard border flat>
                    <VCardText>
                        <VForm ref="refForm" @submit.prevent="saveProfile">
                            <VRow>
                                <!-- Biography -->
                                <VCol cols="12">
                                    <h6 class="text-h6 font-weight-medium mb-3">{{ $t('TeacherProfile.Biography') }}</h6>
                                    <VTextarea
                                        v-model="formData.bio"
                                        :label="$t('TeacherProfile.BioLabel')"
                                        :placeholder="$t('TeacherProfile.BioPlaceholder')"
                                        auto-grow
                                        rows="3"
                                        variant="outlined"
                                        :rules="[v => !!v || $t('RequiredField')]"
                                    />
                                </VCol>

                                <!-- Professional Details -->
                                <VCol cols="12">
                                    <h6 class="text-h6 font-weight-medium mb-3 mt-4">{{ $t('TeacherProfile.ProfessionalDetails') }}</h6>
                                    <VRow>
                                        <VCol cols="12" sm="6">
                                            <VTextField
                                                v-model="formData.qualification"
                                                :label="$t('TeacherProfile.Qualification')"
                                                variant="outlined"
                                                :rules="[v => !!v || $t('RequiredField')]"
                                            />
                                        </VCol>
                                        <VCol cols="12" sm="6">
                                            <VTextField
                                                v-model="formData.experienceYears"
                                                type="number"
                                                min="0"
                                                :label="$t('TeacherProfile.ExperienceYears')"
                                                variant="outlined"
                                                :rules="[v => v !== null && v !== '' || $t('RequiredField')]"
                                            />
                                        </VCol>
                                    </VRow>
                                </VCol>

                                <!-- Lesson Delivery Types -->
                                <VCol cols="12">
                                    <h6 class="text-h6 font-weight-medium mb-3 mt-4">{{ $t('TeacherProfile.DeliveryModes') }}</h6>
                                    <VSelect
                                        v-model="formData.lessonTypes"
                                        :items="lessonTypeOptions"
                                        :label="$t('TeacherProfile.SelectDeliveryModes')"
                                        multiple
                                        variant="outlined"
                                        chips
                                        :rules="[v => v.length > 0 || $t('TeacherProfile.SelectAtLeastOneMode')]"
                                    />
                                </VCol>

                                <!-- Location -->
                                <VCol cols="12">
                                    <h6 class="text-h6 font-weight-medium mb-3 mt-4">{{ $t('Location') }}</h6>
                                    <VRow>
                                        <VCol cols="12" sm="4">
                                            <VAutocomplete
                                                v-model="selectedGovernorateId"
                                                :items="searchStore.governorates"
                                                item-title="nameAr"
                                                item-value="id"
                                                :label="$t('Governorate')"
                                                variant="outlined"
                                            />
                                        </VCol>
                                        <VCol cols="12" sm="4">
                                            <VAutocomplete
                                                v-model="selectedCityId"
                                                :items="searchStore.cities"
                                                item-title="nameAr"
                                                item-value="id"
                                                :label="$t('City')"
                                                variant="outlined"
                                                :disabled="!selectedGovernorateId"
                                            />
                                        </VCol>
                                        <VCol cols="12" sm="4">
                                            <VAutocomplete
                                                v-model="formData.areaId"
                                                :items="searchStore.areas"
                                                item-title="nameAr"
                                                item-value="id"
                                                :label="$t('Area')"
                                                variant="outlined"
                                                :disabled="!selectedCityId"
                                                :rules="[v => !!v || $t('RequiredField')]"
                                            />
                                        </VCol>
                                    </VRow>
                                </VCol>

                                <VCol cols="12" class="mt-4">
                                    <VBtn
                                        type="submit"
                                        color="primary"
                                        size="large"
                                        :loading="isSaving"
                                        :disabled="isSaving"
                                    >
                                        {{ $t('Save') }}
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VForm>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>
    </div>
</template>
