<script setup>
import { useTeacherStore } from '~/stores/teacher'
import { useSearchStore } from '~/stores/search'
import { useAuthStore } from '~/stores/auth'
import { useSnackbar } from '~/composables/useSnackbar'

definePageMeta({
    layout: 'default',
})

const teacherStore = useTeacherStore()
const searchStore = useSearchStore()
const authStore = useAuthStore()
const { t } = useI18n()
const { showSnackbar } = useSnackbar()

// Avatar state
const fileInput = ref(null)
const isUploadingImage = ref(false)

// Form reference
const refForm = ref()
const isSaving = ref(false)
const isInitializingLocation = ref(true)

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
    isInitializingLocation.value = true

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
    
    isInitializingLocation.value = false
})

// Watchers for drill-down location dropdowns
watch(selectedGovernorateId, async (newId) => {
    if (isInitializingLocation.value) return;

    if (newId) {
        await searchStore.fetchCities(newId)
    } else {
        searchStore.cities = []
        searchStore.areas = []
    }
    
    selectedCityId.value = null
    formData.value.areaId = null
})

watch(selectedCityId, async (newId) => {
    if (isInitializingLocation.value) return;

    if (newId) {
        await searchStore.fetchAreas(newId)
    } else {
        searchStore.areas = []
    }
    
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

const triggerFileInput = () => {
    fileInput.value.click()
}

const onFileSelected = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    isUploadingImage.value = true
    try {
        await authStore.uploadAvatar(file)
        showSnackbar(t('TeacherProfile.AvatarUpdatedSuccess') || 'تم تحديث الصورة بنجاح', 'success')
    } catch (error) {
        showSnackbar(error?.response?.data?.message || t('General.Error') || 'حدث خطأ', 'error')
    } finally {
        isUploadingImage.value = false
        event.target.value = '' // reset
    }
}
</script>

<template>
    <div class="teacher-profile-page">
        <!-- Premium Header Section -->
        <PremiumPageHeader
            :title="$t('TeacherProfile.Title')"
            :description="$t('TeacherProfile.Desc')"
        >
            <template #actions>
                <VBtn
                    color="primary"
                    size="large"
                    prepend-icon="tabler-device-floppy"
                    class="px-8 font-weight-bold mt-4 mt-md-0"
                    :loading="isSaving"
                    :disabled="isSaving"
                    @click="saveProfile"
                >
                    {{ $t('Save') }}
                </VBtn>
            </template>
        </PremiumPageHeader>

        <VContainer class="mt-n8 position-relative z-index-1">

            <VCol cols="12" md="10" lg="8" class="mx-auto">
                <VCard class="border-0 overflow-visible mt-12 bg-surface" flat>
                    <VCardText class="px-6 pb-8 pt-0">
                        <!-- Avatar Upload (Overlapping Top) -->
                        <div class="d-flex justify-center mb-8 avatar-wrapper">
                            <div class="position-relative">
                                <VAvatar
                                    color="white"
                                    size="130"
                                    class="rounded-circle avatar-border border-sm"
                                >
                                    <VImg v-if="authStore.user?.avatarUrl" :src="authStore.user?.avatarUrl" />
                                    <span v-else class="text-h2 font-weight-bold text-primary">{{ authStore.user?.name?.charAt(0) || 'U' }}</span>
                                </VAvatar>
                                
                                <VBtn
                                    icon="tabler-camera"
                                    color="primary"
                                    size="small"
                                    class="position-absolute"
                                    style="bottom: 4px; right: 4px; z-index: 1"
                                    :loading="isUploadingImage"
                                    @click="triggerFileInput"
                                />
                                <input
                                    ref="fileInput"
                                    type="file"
                                    accept="image/*"
                                    class="d-none"
                                    @change="onFileSelected"
                                >
                            </div>
                        </div>

                        <!-- User Intro Info -->
                        <div class="text-center mb-8">
                            <h2 class="text-h4 font-weight-bold mb-1">{{ authStore.user?.name }}</h2>
                            <p class="text-body-1 text-secondary d-flex align-center justify-center gap-2">
                                <VIcon icon="tabler-mail" size="18" />
                                <span dir="ltr">{{ authStore.user?.email }}</span>
                            </p>
                        </div>
                        
                        <VDivider class="border-opacity-10 mb-8 mx-auto" style="max-width: 200px;" />

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
                            </VRow>
                        </VForm>
                    </VCardText>
                </VCard>
            </VCol>
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.teacher-profile-page {
    .z-index-1 {
        z-index: 1;
    }

    .avatar-wrapper {
        margin-top: -85px; // Pull avatar up over the card edge
    }

    .avatar-border {
        border: 6px solid rgb(var(--v-theme-surface));
    }
}
</style>
