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
        const payload = {
            priceAtTeacher: formData.value.priceAtTeacher ? Number(formData.value.priceAtTeacher) : null,
            priceAtStudent: formData.value.priceAtStudent ? Number(formData.value.priceAtStudent) : null,
            priceGroup: formData.value.priceGroup ? Number(formData.value.priceGroup) : null,
            isActive: formData.value.isActive,
        }

        if (isEditing.value) {
            await subjectsStore.updateSubject(formData.value.id, payload)
            showSnackbar(t('TeacherSubjects.UpdateSuccess'), 'success')
        } else {
            payload.subjectId = formData.value.subjectId
            payload.stageId = formData.value.stageId
            await subjectsStore.addSubject(payload)
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
    <div>
        <VRow class="mb-6 align-center">
            <VCol cols="12" md="8">
                <h1 class="text-h4 mb-2 d-flex align-center gap-2">
                    {{ $t('TeacherSubjects.Title') }}
                    <VIcon icon="tabler-books" color="primary" size="32" />
                </h1>
                <p class="text-body-1 text-secondary mb-0">
                    {{ $t('TeacherSubjects.Desc') }}
                </p>
            </VCol>
            <VCol cols="12" md="4" class="text-md-end text-start">
                <VBtn color="primary" prepend-icon="tabler-plus" @click="openAddDialog">
                    {{ $t('TeacherSubjects.AddSubject') }}
                </VBtn>
            </VCol>
        </VRow>

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
                <VCard border flat class="h-100 position-relative transition-all" hover>
                    <VCardItem>
                        <template #prepend>
                            <VAvatar color="primary" variant="tonal" class="rounded-lg mr-3">
                                <VIcon icon="tabler-book" />
                            </VAvatar>
                        </template>
                        <VCardTitle class="d-flex align-center justify-space-between text-h6 font-weight-bold">
                            {{ item.subject?.nameAr }}
                            <VChip :color="item.isActive ? 'success' : 'error'" size="x-small" variant="flat">
                                {{ item.isActive ? $t('TeacherSubjects.Active') : $t('TeacherSubjects.Inactive') }}
                            </VChip>
                        </VCardTitle>
                        <VCardSubtitle>
                            {{ item.stage?.nameAr }}
                        </VCardSubtitle>
                    </VCardItem>

                    <VCardText class="pt-2">
                        <VDivider class="mb-4" />
                        <div class="d-flex flex-column gap-3">
                            <div class="d-flex justify-space-between align-center">
                                <span class="text-body-2 text-secondary d-flex align-center gap-2">
                                    <VIcon icon="tabler-home" size="18" />
                                    {{ $t('TeacherSubjects.PriceAtTeacher') }}
                                </span>
                                <span class="font-weight-medium">{{ formatPrice(item.priceAtTeacher) }}</span>
                            </div>
                            <div class="d-flex justify-space-between align-center">
                                <span class="text-body-2 text-secondary d-flex align-center gap-2">
                                    <VIcon icon="tabler-user" size="18" />
                                    {{ $t('TeacherSubjects.PriceAtStudent') }}
                                </span>
                                <span class="font-weight-medium">{{ formatPrice(item.priceAtStudent) }}</span>
                            </div>
                            <div class="d-flex justify-space-between align-center">
                                <span class="text-body-2 text-secondary d-flex align-center gap-2">
                                    <VIcon icon="tabler-users" size="18" />
                                    {{ $t('TeacherSubjects.PriceGroup') }}
                                </span>
                                <span class="font-weight-medium">{{ formatPrice(item.priceGroup) }}</span>
                            </div>
                        </div>
                    </VCardText>

                    <VCardActions class="px-4 pb-4 pt-0 justify-end">
                        <VBtn size="small" variant="outlined" color="primary" @click="openEditDialog(item)">
                            {{ $t('TeacherSubjects.Edit') }}
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VCol>
        </VRow>

        <!-- Add/Edit Dialog -->
        <VDialog v-model="isDialogOpen" max-width="600px">
            <VCard>
                <VCardTitle class="px-6 py-4 border-b">
                    {{ isEditing ? $t('TeacherSubjects.EditSubject') : $t('TeacherSubjects.AddSubject') }}
                </VCardTitle>
                <VCardText class="pa-6">
                    <VForm ref="dialogForm" @submit.prevent="saveSubject">
                        <VRow>
                            <!-- Subject & Stage Selectors (Disabled during edit because API requires dropping/adding for core changes, or we just freeze them) -->
                            <VCol cols="12" sm="6">
                                <VAutocomplete
                                    v-model="formData.subjectId"
                                    :items="searchStore.subjects"
                                    item-title="nameAr"
                                    item-value="id"
                                    :label="$t('Subject')"
                                    variant="outlined"
                                    :disabled="isEditing"
                                    :rules="[v => !!v || $t('RequiredField')]"
                                />
                            </VCol>
                            <VCol cols="12" sm="6">
                                <VAutocomplete
                                    v-model="formData.stageId"
                                    :items="searchStore.stages"
                                    item-title="nameAr"
                                    item-value="id"
                                    :label="$t('Stage')"
                                    variant="outlined"
                                    :disabled="isEditing"
                                    :rules="[v => !!v || $t('RequiredField')]"
                                />
                            </VCol>

                            <VCol cols="12"><VDivider /></VCol>

                            <!-- Pricing Configuration -->
                            <VCol cols="12">
                                <h6 class="text-h6 font-weight-medium mb-1">{{ $t('TeacherSubjects.PricingConfiguration') }}</h6>
                                <p class="text-caption text-secondary mb-4">{{ $t('TeacherSubjects.PricingDesc') }}</p>
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
                                    color="primary"
                                    :label="formData.isActive ? $t('TeacherSubjects.Active') : $t('TeacherSubjects.Inactive')"
                                />
                            </VCol>
                        </VRow>
                    </VForm>
                </VCardText>
                <VCardActions class="px-6 py-4 border-t justify-end">
                    <VBtn variant="text" color="secondary" @click="isDialogOpen = false" :disabled="isSaving">
                        {{ $t('Cancel') }}
                    </VBtn>
                    <VBtn variant="flat" color="primary" @click="saveSubject" :loading="isSaving">
                        {{ $t('Save') }}
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </div>
</template>

<style lang="scss" scoped>
.transition-all {
    transition: all 0.2s ease-in-out;
}
</style>
