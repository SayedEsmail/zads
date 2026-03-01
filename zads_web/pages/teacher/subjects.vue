<script setup>
import { useTeacherSubjectsStore } from '~/stores/teacherSubjects'
import { useSearchStore } from '~/stores/search'

definePageMeta({
    layout: 'default',
})

const subjectsStore = useTeacherSubjectsStore()
const searchStore = useSearchStore()
const { t } = useI18n()
const { showSnackbar } = useSnackbar()

// Dialog State
const isDialogOpen = ref(false)
const isEditing = ref(false)
const dialogForm = ref()
const isSaving = ref(false)

// Form State
const formData = ref({
    id: null,
    subjectIds: [],
    stageIds: [],
    subjectId: null,
    stageId: null,
    priceAtTeacher: null,
    priceAtStudent: null,
    priceGroup: null,
    isActive: true,
})

onMounted(async () => {
    // Make sure reference data is loaded
    if (!searchStore.subjects.length || !searchStore.stages.length) {
        await Promise.all([
            searchStore.fetchSubjects(),
            searchStore.fetchStages(),
        ])
    }
    
    await subjectsStore.fetchMySubjects()
})

const openAddDialog = () => {
    isEditing.value = false
    formData.value = {
        id: null,
        subjectIds: [],
        stageIds: [],
        subjectId: null,
        stageId: null,
        priceAtTeacher: null,
        priceAtStudent: null,
        priceGroup: null,
        isActive: true,
    }
    isDialogOpen.value = true
}

const openEditDialog = (item) => {
    isEditing.value = true
    formData.value = {
        id: item.id,
        subjectIds: [],
        stageIds: [],
        subjectId: item.subjectId,
        stageId: item.stageId,
        priceAtTeacher: item.priceAtTeacher,
        priceAtStudent: item.priceAtStudent,
        priceGroup: item.priceGroup,
        isActive: item.isActive,
    }
    isDialogOpen.value = true
}

const saveSubject = async () => {
    const { valid } = await dialogForm.value.validate()
    if (!valid) return

    isSaving.value = true
    try {
        const payloadBase = {
            priceAtTeacher: formData.value.priceAtTeacher ? Number(formData.value.priceAtTeacher) : null,
            priceAtStudent: formData.value.priceAtStudent ? Number(formData.value.priceAtStudent) : null,
            priceGroup: formData.value.priceGroup ? Number(formData.value.priceGroup) : null,
            isActive: formData.value.isActive,
        }

        if (isEditing.value) {
            await subjectsStore.updateSubject(formData.value.id, payloadBase)
            showSnackbar(t('TeacherSubjects.UpdateSuccess'), 'success')
        } else {
            const promises = []
            for (const subId of formData.value.subjectIds) {
                for (const stgId of formData.value.stageIds) {
                    promises.push(subjectsStore.addSubject({
                        ...payloadBase,
                        subjectId: subId,
                        stageId: stgId
                    }))
                }
            }
            await Promise.all(promises)
            showSnackbar(t('TeacherSubjects.AddSuccess'), 'success')
        }
        isDialogOpen.value = false
    } catch (error) {
        showSnackbar(t(isEditing.value ? 'TeacherSubjects.UpdateFailed' : 'TeacherSubjects.AddFailed'), 'error')
    } finally {
        isSaving.value = false
    }
}

const formatPrice = (price) => {
    if (!price) return '-'
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 0,
    }).format(price)
}
</script>

<template>
    <div class="teacher-subjects-page">
        <!-- Premium Header Section -->
        <PremiumPageHeader
            :title="$t('TeacherSubjects.Title')"
            :description="$t('TeacherSubjects.Desc')"
        >
            <template #actions>
                <VBtn
                    color="primary"
                    size="large"
                    prepend-icon="tabler-plus"
                    class="rounded-pill px-6 font-weight-bold shadow-primary mt-4 mt-md-0"
                    @click="openAddDialog"
                >
                    {{ $t('TeacherSubjects.AddSubject') }}
                </VBtn>
            </template>
        </PremiumPageHeader>

        <VContainer class="mt-n8">

        <VRow v-if="subjectsStore.loading && !subjectsStore.subjects.length" justify="center" class="py-12">
            <VProgressCircular indeterminate color="primary" size="48" />
        </VRow>

        <VRow v-else-if="!subjectsStore.subjects.length">
            <VCol cols="12">
                <VCard class="text-center py-12" border flat bg-color="transparent">
                    <VCardText>
                        <VIcon icon="tabler-book-off" size="64" color="secondary" class="mb-4 opacity-50" />
                        <h6 class="text-h6 font-weight-medium mb-2">{{ $t('TeacherSubjects.NoSubjects') }}</h6>
                        <p class="text-secondary mb-6">{{ $t('TeacherSubjects.NoSubjectsDesc') }}</p>
                        <VBtn color="primary" variant="outlined" @click="openAddDialog">
                            {{ $t('TeacherSubjects.AddFirstSubject') }}
                        </VBtn>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>

        <VRow v-else>
            <VCol v-for="item in subjectsStore.subjects" :key="item.id" cols="12" md="6" lg="4">
                <VCard class="h-100 subject-card-premium border-0" flat hover>
                    <VCardItem class="pa-5">
                        <template #prepend>
                            <VAvatar color="primary" variant="tonal" size="56" class="rounded-xl shadow-sm mr-4">
                                <VIcon icon="tabler-book" size="28" />
                            </VAvatar>
                        </template>
                        <VCardTitle class="d-flex align-center justify-space-between text-h6 font-weight-bold pa-0 mb-1">
                            {{ item.subject?.nameAr }}
                            <VChip :color="item.isActive ? 'success' : 'error'" size="small" variant="tonal" class="font-weight-medium">
                                {{ item.isActive ? $t('TeacherSubjects.Active') : $t('TeacherSubjects.Inactive') }}
                            </VChip>
                        </VCardTitle>
                        <VCardSubtitle class="text-body-1 d-flex align-center gap-2 pa-0 text-secondary">
                            <VIcon icon="tabler-school" size="18" />
                            {{ item.stage?.nameAr }}
                        </VCardSubtitle>
                    </VCardItem>

                    <VCardText class="px-5 pb-5 pt-0">
                        <div class="bg-primary-lighten-5 rounded-lg border-primary-light pa-4 mt-2">
                            <div class="d-flex flex-column gap-3">
                                <div class="d-flex justify-space-between align-center">
                                    <span class="text-body-2 text-secondary d-flex align-center gap-2 font-weight-medium">
                                        <VIcon icon="tabler-home" size="18" color="primary" />
                                        {{ $t('TeacherSubjects.PriceAtTeacher') }}
                                    </span>
                                    <span class="font-weight-bold text-high-emphasis">{{ formatPrice(item.priceAtTeacher) }}</span>
                                </div>
                                <div class="d-flex justify-space-between align-center">
                                    <span class="text-body-2 text-secondary d-flex align-center gap-2 font-weight-medium">
                                        <VIcon icon="tabler-user" size="18" color="secondary" />
                                        {{ $t('TeacherSubjects.PriceAtStudent') }}
                                    </span>
                                    <span class="font-weight-bold text-high-emphasis">{{ formatPrice(item.priceAtStudent) }}</span>
                                </div>
                                <div class="d-flex justify-space-between align-center">
                                    <span class="text-body-2 text-secondary d-flex align-center gap-2 font-weight-medium">
                                        <VIcon icon="tabler-users" size="18" color="info" />
                                        {{ $t('TeacherSubjects.PriceGroup') }}
                                    </span>
                                    <span class="font-weight-bold text-high-emphasis">{{ formatPrice(item.priceGroup) }}</span>
                                </div>
                            </div>
                        </div>
                    </VCardText>

                    <VDivider class="border-opacity-10 mx-5" />

                    <VCardActions class="pa-5 justify-end">
                        <VBtn
                            color="primary"
                            variant="tonal"
                            class="rounded-pill px-6 font-weight-bold"
                            prepend-icon="tabler-edit"
                            @click="openEditDialog(item)"
                        >
                            {{ $t('TeacherSubjects.Edit') }}
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VCol>
        </VRow>

        <!-- Add/Edit Dialog using PremiumDialog -->
        <PremiumDialog
            v-model="isDialogOpen"
            :title="isEditing ? $t('TeacherSubjects.EditSubject') : $t('TeacherSubjects.AddSubject')"
            :subtitle="$t('TeacherSubjects.PricingDesc')"
            icon="tabler-book"
            icon-color="primary"
            max-width="600"
            @cancel="isDialogOpen = false"
            @save="saveSubject"
            :loading="isSaving"
            :save-text="$t('Save')"
            :cancel-text="$t('Cancel')"
        >
            <VForm ref="dialogForm" @submit.prevent="saveSubject">
                <VRow class="mt-2">
                    <!-- Subject & Stage Selectors -->
                    <VCol cols="12" sm="6" v-if="!isEditing">
                        <VAutocomplete
                            v-model="formData.subjectIds"
                            :items="searchStore.subjects"
                            item-title="nameAr"
                            item-value="id"
                            :label="$t('Subject')"
                            variant="outlined"
                            multiple
                            chips
                            closable-chips
                            :rules="[v => v.length > 0 || $t('RequiredField')]"
                        />
                    </VCol>
                    <VCol cols="12" sm="6" v-else>
                        <VAutocomplete
                            v-model="formData.subjectId"
                            :items="searchStore.subjects"
                            item-title="nameAr"
                            item-value="id"
                            :label="$t('Subject')"
                            variant="outlined"
                            disabled
                        />
                    </VCol>

                    <VCol cols="12" sm="6" v-if="!isEditing">
                        <VAutocomplete
                            v-model="formData.stageIds"
                            :items="searchStore.stages"
                            item-title="nameAr"
                            item-value="id"
                            :label="$t('Stage')"
                            variant="outlined"
                            multiple
                            chips
                            closable-chips
                            :rules="[v => v.length > 0 || $t('RequiredField')]"
                        />
                    </VCol>
                    <VCol cols="12" sm="6" v-else>
                        <VAutocomplete
                            v-model="formData.stageId"
                            :items="searchStore.stages"
                            item-title="nameAr"
                            item-value="id"
                            :label="$t('Stage')"
                            variant="outlined"
                            disabled
                        />
                    </VCol>

                    <VCol cols="12"><VDivider class="my-2" /></VCol>

                    <!-- Pricing Configuration -->
                    <VCol cols="12">
                        <h6 class="text-h6 font-weight-medium mb-4">{{ $t('TeacherSubjects.PricingConfiguration') }}</h6>
                    </VCol>

                    <VCol cols="12" sm="4">
                        <VTextField
                            v-model="formData.priceAtTeacher"
                            type="number"
                            min="0"
                            :label="$t('TeacherSubjects.PriceAtTeacher')"
                            variant="outlined"
                            prefix="EGP"
                        />
                    </VCol>
                    <VCol cols="12" sm="4">
                        <VTextField
                            v-model="formData.priceAtStudent"
                            type="number"
                            min="0"
                            :label="$t('TeacherSubjects.PriceAtStudent')"
                            variant="outlined"
                            prefix="EGP"
                        />
                    </VCol>
                    <VCol cols="12" sm="4">
                        <VTextField
                            v-model="formData.priceGroup"
                            type="number"
                            min="0"
                            :label="$t('TeacherSubjects.PriceGroup')"
                            variant="outlined"
                            prefix="EGP"
                        />
                    </VCol>

                    <VCol cols="12">
                        <VSwitch
                            v-model="formData.isActive"
                            color="success"
                            :label="formData.isActive ? $t('TeacherSubjects.Active') : $t('TeacherSubjects.Inactive')"
                            inset
                        />
                    </VCol>
                </VRow>
            </VForm>
        </PremiumDialog>
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.teacher-subjects-page {
    .subject-card-premium {
        border-radius: 24px !important;
        border: 1px solid rgba(var(--v-border-color), 0.06) !important;
        transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.03) !important;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 32px rgba(var(--v-theme-primary), 0.08) !important;
            border-color: rgba(var(--v-theme-primary), 0.2) !important;
        }
    }

    .bg-primary-lighten-5 {
        background-color: rgba(var(--v-theme-primary), 0.04) !important;
    }

    .border-primary-light {
        border: 1px solid rgba(var(--v-theme-primary), 0.1);
    }

    .shadow-sm {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
    }

    .shadow-primary {
        box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.2) !important;
    }
}
</style>
