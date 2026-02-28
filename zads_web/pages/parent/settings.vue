<script setup>
import { useAuthStore } from '~/stores/auth'
import { useParentStore } from '~/stores/parent'
import { useChildrenStore } from '~/stores/children'
import { useSearchStore } from '~/stores/search'
import { useSnackbar } from '~/composables/useSnackbar'
import { useI18n } from 'vue-i18n'

definePageMeta({
    layout: 'default',
    middleware: ['auth'],
})

const authStore = useAuthStore()
const parentStore = useParentStore()
const childrenStore = useChildrenStore()
const searchStore = useSearchStore()
const snackbar = useSnackbar()
const { t } = useI18n()

const activeTab = ref('account')
const loading = ref(false)

// Tab: Account
const accountForm = ref(null)
const accountData = ref({
    name: '',
    phone: '',
    password: '',
})

// Tab: Location
const locationData = ref({
    governorateId: null,
    cityId: null,
    areaId: null,
})

// Tab: Children
const newChild = ref({
    name: '',
    stageId: null,
})
const selectedSubjects = ref({})

// Fetch Initial Data
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            parentStore.fetchGovernorates(),
            parentStore.fetchProfile(),
            childrenStore.fetchChildren(),
            searchStore.fetchSubjects(),
            searchStore.fetchStages(),
        ])

        // Prefill Account
        if (authStore.user) {
            accountData.value.name = authStore.user.name || ''
            accountData.value.phone = authStore.user.phone || ''
        }

        // Prefill Location (if exists, we need to reverse look it up, 
        // but for now let's just let them select from scratch if they want to change, 
        // or we try to map if area is loaded. Simple approach: let them select new)
        if (parentStore.profile?.area?.city?.governorateId) {
            locationData.value.governorateId = parentStore.profile.area.city.governorateId
            await parentStore.fetchCities(locationData.value.governorateId)
            locationData.value.cityId = parentStore.profile.area.cityId
            await parentStore.fetchAreas(locationData.value.cityId)
            locationData.value.areaId = parentStore.profile.areaId
        }

        // Prefill Subjects
        if (childrenStore.children.length) {
            childrenStore.children.forEach(child => {
                selectedSubjects.value[child.id] = child.subjects?.map(s => s.subjectId) || []
            })
        }
    } catch (e) {
        console.error('Failed to load settings data', e)
    } finally {
        loading.value = false
    }
})

// Cascading Watchers
watch(() => locationData.value.governorateId, async (newVal, oldVal) => {
    if (newVal === oldVal) return
    if (oldVal !== undefined && oldVal !== null) {
        locationData.value.cityId = null
        locationData.value.areaId = null
    }
    if (newVal) {
        await parentStore.fetchCities(newVal)
    }
})

watch(() => locationData.value.cityId, async (newVal, oldVal) => {
    if (newVal === oldVal) return
    if (oldVal !== undefined && oldVal !== null) {
        locationData.value.areaId = null
    }
    if (newVal) {
        await parentStore.fetchAreas(newVal)
    }
})

// Actions
const updateAccount = async () => {
    const { valid } = await accountForm.value.validate()
    if (!valid) return

    loading.value = true
    try {
        const payload = {
            name: accountData.value.name,
            phone: accountData.value.phone,
        }
        if (accountData.value.password) {
            payload.password = accountData.value.password
        }

        await authStore.updateAccount(payload)
        accountData.value.password = '' // clear password
        snackbar.show(t('Settings.AccountUpdatedSuccessfully'), 'success')
    } catch (e) {
        snackbar.show(e?.response?.data?.message || t('General.Error'), 'error')
    } finally {
        loading.value = false
    }
}

const updateLocation = async () => {
    if (!locationData.value.areaId) return

    loading.value = true
    try {
        await parentStore.updateProfile({ areaId: locationData.value.areaId })
        snackbar.show(t('Settings.LocationUpdatedSuccessfully'), 'success')
    } catch (e) {
        snackbar.show(t('General.Error'), 'error')
    } finally {
        loading.value = false
    }
}

const addChild = async () => {
    if (!newChild.value.name || !newChild.value.stageId) return

    loading.value = true
    try {
        await childrenStore.addChild({
            name: newChild.value.name,
            stageId: newChild.value.stageId,
        })
        newChild.value = { name: '', stageId: null }
        snackbar.show(t('Settings.ChildAdded'), 'success')
    } catch (e) {
        snackbar.show(t('General.Error'), 'error')
    } finally {
        loading.value = false
    }
}

const removeChild = async (childId) => {
    if (!confirm(t('CompleteProfile.ConfirmDeleteChild'))) return

    loading.value = true
    try {
        await childrenStore.deleteChild(childId)
        delete selectedSubjects.value[childId]
        snackbar.show(t('Settings.ChildRemoved'), 'success')
    } catch (e) {
        snackbar.show(t('General.Error'), 'error')
    } finally {
        loading.value = false
    }
}

const updateChildSubjects = async (childId) => {
    loading.value = true
    try {
        await childrenStore.updateChild({
            childId,
            subjectIds: selectedSubjects.value[childId] || [],
        })
        snackbar.show(t('Settings.SubjectsUpdated'), 'success')
    } catch (e) {
        snackbar.show(t('General.Error'), 'error')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="parent-settings-page">
        <VRow>
            <VCol cols="12" md="3">
                <!-- Navigation Tabs -->
                <VCard elevation="2" class="rounded-lg h-100">
                    <VCardTitle class="px-4 py-3 bg-primary text-white">
                        <VIcon icon="tabler-settings" class="me-2" />
                        {{ $t('Settings.AccountSettings') }}
                    </VCardTitle>
                    <VList nav density="compact" class="py-2">
                        <VListItem
                            :active="activeTab === 'account'"
                            color="primary"
                            rounded="lg"
                            @click="activeTab = 'account'"
                        >
                            <template #prepend>
                                <VIcon icon="tabler-user" />
                            </template>
                            <VListItemTitle>{{ $t('Settings.ProfileInfo') }}</VListItemTitle>
                        </VListItem>
                        <VListItem
                            :active="activeTab === 'location'"
                            color="primary"
                            rounded="lg"
                            @click="activeTab = 'location'"
                        >
                            <template #prepend>
                                <VIcon icon="tabler-map-pin" />
                            </template>
                            <VListItemTitle>{{ $t('Settings.Location') }}</VListItemTitle>
                        </VListItem>
                        <VListItem
                            :active="activeTab === 'children'"
                            color="primary"
                            rounded="lg"
                            @click="activeTab = 'children'"
                        >
                            <template #prepend>
                                <VIcon icon="tabler-users" />
                            </template>
                            <VListItemTitle>{{ $t('Settings.ChildrenAndSubjects') }}</VListItemTitle>
                        </VListItem>
                    </VList>
                </VCard>
            </VCol>

            <VCol cols="12" md="9">
                <!-- Content Area -->
                <VWindow v-model="activeTab" class="h-100" :touch="false">
                    <!-- Account Tab -->
                    <VWindowItem value="account">
                        <VCard elevation="2" class="rounded-lg h-100">
                            <VCardItem class="border-b">
                                <VCardTitle>{{ $t('Settings.ProfileInfo') }}</VCardTitle>
                                <VCardSubtitle>{{ $t('Settings.UpdateYourCoreInformation') }}</VCardSubtitle>
                            </VCardItem>
                            <VCardText class="pa-6">
                                <VForm ref="accountForm" @submit.prevent="updateAccount">
                                    <VRow>
                                        <VCol cols="12" md="6">
                                            <VTextField
                                                v-model="accountData.name"
                                                :label="$t('CompleteProfile.FullName')"
                                                prepend-inner-icon="tabler-user"
                                                variant="outlined"
                                                :rules="[v => !!v || 'Name is required']"
                                            />
                                        </VCol>
                                        <VCol cols="12" md="6">
                                            <VTextField
                                                v-model="accountData.phone"
                                                :label="$t('Auth.PhoneNumber')"
                                                prepend-inner-icon="tabler-phone"
                                                variant="outlined"
                                                :rules="[v => !!v || 'Phone is required']"
                                                dir="ltr"
                                            />
                                        </VCol>
                                        <VCol cols="12">
                                            <VTextField
                                                v-model="accountData.password"
                                                :label="$t('Auth.NewPasswordOptional')"
                                                type="password"
                                                prepend-inner-icon="tabler-lock"
                                                variant="outlined"
                                            />
                                        </VCol>
                                    </VRow>
                                    <div class="d-flex justify-end mt-4">
                                        <VBtn
                                            type="submit"
                                            color="primary"
                                            :loading="loading"
                                            prepend-icon="tabler-device-floppy"
                                        >
                                            {{ $t('Settings.SaveChanges') }}
                                        </VBtn>
                                    </div>
                                </VForm>
                            </VCardText>
                        </VCard>
                    </VWindowItem>

                    <!-- Location Tab -->
                    <VWindowItem value="location">
                        <VCard elevation="2" class="rounded-lg h-100">
                            <VCardItem class="border-b">
                                <VCardTitle>{{ $t('Settings.Location') }}</VCardTitle>
                                <VCardSubtitle>{{ $t('Settings.UpdateYourLocationToFindNearbyTeachers') }}</VCardSubtitle>
                            </VCardItem>
                            <VCardText class="pa-6">
                                <VRow>
                                    <VCol cols="12" md="4">
                                        <VSelect
                                            v-model="locationData.governorateId"
                                            :items="parentStore.governorates"
                                            item-title="nameAr"
                                            item-value="id"
                                            :label="$t('CompleteProfile.Governorate')"
                                            prepend-inner-icon="tabler-map"
                                            variant="outlined"
                                        />
                                    </VCol>
                                    <VCol cols="12" md="4">
                                        <VSelect
                                            v-model="locationData.cityId"
                                            :items="parentStore.cities"
                                            item-title="nameAr"
                                            item-value="id"
                                            :label="$t('CompleteProfile.City')"
                                            :disabled="!locationData.governorateId"
                                            prepend-inner-icon="tabler-building"
                                            variant="outlined"
                                        />
                                    </VCol>
                                    <VCol cols="12" md="4">
                                        <VSelect
                                            v-model="locationData.areaId"
                                            :items="parentStore.areas"
                                            item-title="nameAr"
                                            item-value="id"
                                            :label="$t('CompleteProfile.Area')"
                                            :disabled="!locationData.cityId"
                                            prepend-inner-icon="tabler-map-pin"
                                            variant="outlined"
                                        />
                                    </VCol>
                                </VRow>
                                <div class="d-flex justify-end mt-4">
                                    <VBtn
                                        color="primary"
                                        :loading="loading"
                                        :disabled="!locationData.areaId"
                                        prepend-icon="tabler-device-floppy"
                                        @click="updateLocation"
                                    >
                                        {{ $t('Settings.SaveChanges') }}
                                    </VBtn>
                                </div>
                            </VCardText>
                        </VCard>
                    </VWindowItem>

                    <!-- Children & Subjects Tab -->
                    <VWindowItem value="children">
                        <VCard elevation="2" class="rounded-lg h-100 bg-transparent" flat>
                            
                            <!-- Add Child Section -->
                            <VCard elevation="2" class="rounded-lg mb-6">
                                <VCardItem class="border-b">
                                    <VCardTitle>{{ $t('Settings.AddNewChild') }}</VCardTitle>
                                </VCardItem>
                                <VCardText class="pa-6">
                                    <VRow align="center">
                                        <VCol cols="12" sm="5">
                                            <VTextField
                                                v-model="newChild.name"
                                                :label="$t('CompleteProfile.ChildName')"
                                                prepend-inner-icon="tabler-user-circle"
                                                variant="outlined"
                                                hide-details
                                            />
                                        </VCol>
                                        <VCol cols="12" sm="5">
                                            <VSelect
                                                v-model="newChild.stageId"
                                                :items="searchStore.stages"
                                                item-title="nameAr"
                                                item-value="id"
                                                :label="$t('CompleteProfile.EducationalStage')"
                                                prepend-inner-icon="tabler-school"
                                                variant="outlined"
                                                hide-details
                                            />
                                        </VCol>
                                        <VCol cols="12" sm="2" class="text-end">
                                            <VBtn
                                                color="primary"
                                                prepend-icon="tabler-plus"
                                                block
                                                :disabled="!newChild.name || !newChild.stageId"
                                                :loading="loading"
                                                @click="addChild"
                                            >
                                                {{ $t('CompleteProfile.AddChild') }}
                                            </VBtn>
                                        </VCol>
                                    </VRow>
                                </VCardText>
                            </VCard>

                            <!-- Children List -->
                            <h3 class="text-h6 font-weight-bold mb-4 mt-8">{{ $t('Settings.ManageChildren') }}</h3>
                            
                            <VSkeletonLoader v-if="loading && !childrenStore.children.length" type="card" class="mb-4" />
                            
                            <template v-else-if="childrenStore.children.length">
                                <VCard 
                                    v-for="(child, index) in childrenStore.children" 
                                    :key="child.id"
                                    elevation="1"
                                    class="mb-4 rounded-lg overflow-hidden border"
                                >
                                    <div class="bg-surface pa-4 border-b d-flex justify-space-between align-center flex-wrap gap-2">
                                        <div class="d-flex align-center gap-3">
                                            <VAvatar color="primary-lighten-4" class="text-primary font-weight-bold">
                                                {{ index + 1 }}
                                            </VAvatar>
                                            <div>
                                                <div class="text-h6 font-weight-bold">{{ child.name }}</div>
                                                <div class="text-caption text-secondary d-flex align-center">
                                                    <VIcon icon="tabler-school" size="14" class="me-1" />
                                                    {{ child.stage?.nameAr }}
                                                </div>
                                            </div>
                                        </div>
                                        <VBtn
                                            color="error"
                                            variant="tonal"
                                            size="small"
                                            prepend-icon="tabler-trash"
                                            @click="removeChild(child.id)"
                                        >
                                            {{ $t('CompleteProfile.Remove') }}
                                        </VBtn>
                                    </div>
                                    <div class="bg-grey-50 pa-4">
                                        <label class="d-block text-subtitle-2 font-weight-bold mb-2 text-primary">
                                            <VIcon icon="tabler-books" size="18" class="me-1" />
                                            {{ $t('Settings.SubjectsForThisChild') }}
                                        </label>
                                        
                                        <VRow align="center">
                                            <VCol cols="12" sm="9">
                                                <VSelect
                                                    v-model="selectedSubjects[child.id]"
                                                    :items="searchStore.subjects"
                                                    item-title="nameAr"
                                                    item-value="id"
                                                    multiple
                                                    chips
                                                    closable-chips
                                                    variant="outlined"
                                                    density="comfortable"
                                                    hide-details
                                                    :placeholder="$t('CompleteProfile.SelectSubjects')"
                                                >
                                                    <template #selection="{ item, index: chipIndex }">
                                                        <VChip v-if="chipIndex < 3" size="small" color="primary">
                                                            <span>{{ item.title }}</span>
                                                        </VChip>
                                                        <span v-if="chipIndex === 3" class="text-caption ms-2">
                                                            (+{{ selectedSubjects[child.id].length - 3 }} {{ $t('CompleteProfile.Others') }})
                                                        </span>
                                                    </template>
                                                </VSelect>
                                            </VCol>
                                            <VCol cols="12" sm="3" class="text-end">
                                                <VBtn 
                                                    color="primary" 
                                                    variant="outlined"
                                                    block
                                                    prepend-icon="tabler-device-floppy"
                                                    @click="updateChildSubjects(child.id)"
                                                >
                                                    {{ $t('Settings.SaveSubjects') }}
                                                </VBtn>
                                            </VCol>
                                        </VRow>
                                    </div>
                                </VCard>
                            </template>
                            
                            <VAlert
                                v-else
                                icon="tabler-info-circle"
                                variant="tonal"
                                color="info"
                                class="mt-4"
                            >
                                {{ $t('CompleteProfile.NoChildrenAdded') }}
                            </VAlert>
                        </VCard>
                    </VWindowItem>
                </VWindow>
            </VCol>
        </VRow>
    </div>
</template>


