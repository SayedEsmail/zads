<script setup>
import { useChildrenStore } from '~/stores/children'
import { useSearchStore } from '~/stores/search'

definePageMeta({
    layout: 'default',
})

const childrenStore = useChildrenStore()
const searchStore = useSearchStore()
const { t } = useI18n()

const showDialog = ref(false)
const dialogMode = ref('add') // 'add' or 'edit'
const editingChildId = ref(null)

const formValue = ref({
    name: '',
    stageId: null,
    subjectIds: [],
})

const rules = {
    required: v => !!v || 'هذا الحقل مطلوب',
}

onMounted(async () => {
    await Promise.all([
        childrenStore.fetchChildren(),
        searchStore.initReferenceData(), // For stages and subjects
    ])
})

const openAddDialog = () => {
    dialogMode.value = 'add'
    formValue.value = { name: '', stageId: null, subjectIds: [] }
    showDialog.value = true
}

const openEditDialog = (child) => {
    dialogMode.value = 'edit'
    editingChildId.value = child.id
    formValue.value = {
        name: child.name,
        stageId: child.stageId,
        subjectIds: child.subjects?.map(s => s.subjectId) || [],
    }
    showDialog.value = true
}

const saveChild = async () => {
    // Validate minimally
    if (!formValue.value.name || !formValue.value.stageId) return

    if (dialogMode.value === 'add') {
        await childrenStore.addChild(formValue.value)
    } else {
        await childrenStore.updateChild({
            childId: editingChildId.value,
            ...formValue.value,
        })
    }
    showDialog.value = false
}

const handleDelete = async (childId) => {
    if (confirm(t('CompleteProfile.ConfirmDeleteChild') || 'هل أنت متأكد من حذف هذا الطفل؟')) {
        await childrenStore.deleteChild(childId)
    }
}
</script>

<template>
    <div class="children-manager">
        <VRow class="mb-6" align="center">
            <VCol cols="12" sm="8">
                <h1 class="text-h4 mb-2">
                    {{ $t('MyChildren') }}
                </h1>
                <p class="text-body-1 text-secondary mb-0">
                    {{ $t('CompleteProfile.ChildrenDesc') }}
                </p>
            </VCol>
            <VCol cols="12" sm="4" class="text-sm-right">
                <VBtn
                    color="primary"
                    prepend-icon="tabler-plus"
                    @click="openAddDialog"
                >
                    {{ $t('CompleteProfile.AddNewChild') }}
                </VBtn>
            </VCol>
        </VRow>

        <div v-if="childrenStore.loading && !childrenStore.children.length" class="d-flex justify-center py-12">
            <VProgressCircular indeterminate color="primary" size="48" />
        </div>

        <VAlert
            v-else-if="childrenStore.error"
            color="error"
            variant="tonal"
            class="mb-6"
        >
            {{ childrenStore.error }}
            <template #append>
                <VBtn variant="text" size="small" @click="childrenStore.fetchChildren">
                    {{ $t('FavoritesPage.Retry') }}
                </VBtn>
            </template>
        </VAlert>

        <!-- Empty State -->
        <VCard
            v-else-if="!childrenStore.children.length"
            class="text-center py-12"
            elevation="0"
            border
        >
            <VIcon
                size="64"
                icon="tabler-mood-kid"
                color="secondary"
                class="mb-4"
            />
            <h4 class="text-h6 mb-2">
                لا يوجد أبناء مضافين
            </h4>
            <p class="text-body-2 text-secondary mb-6">
                قم بإضافة أبنائك لنتمكن من ترشيح المعلمين المناسبين لهم
            </p>
            <VBtn
                color="primary"
                @click="openAddDialog"
            >
                {{ $t('CompleteProfile.AddNewChild') }}
            </VBtn>
        </VCard>

        <!-- Cards Grid -->
        <VRow v-else>
            <VCol
                v-for="child in childrenStore.children"
                :key="child.id"
                cols="12"
                md="6"
                lg="4"
            >
                <VCard class="h-100 child-card rounded-xl">
                    <VCardItem>
                        <template #prepend>
                            <VAvatar
                                color="primary"
                                variant="tonal"
                                size="48"
                                class="rounded-lg"
                            >
                                <VIcon icon="tabler-user" size="24" />
                            </VAvatar>
                        </template>

                        <VCardTitle class="text-h6 font-weight-bold">
                            {{ child.name }}
                        </VCardTitle>
                        <VCardSubtitle class="text-secondary mt-1">
                            {{ child.stage?.nameAr }}
                        </VCardSubtitle>
                        
                        <template #append>
                            <VMenu location="bottom end">
                                <template #activator="{ props }">
                                    <VBtn
                                        icon="tabler-dots-vertical"
                                        variant="text"
                                        color="secondary"
                                        v-bind="props"
                                    />
                                </template>
                                <VList density="compact">
                                    <VListItem @click="openEditDialog(child)">
                                        <template #prepend>
                                            <VIcon icon="tabler-edit" size="18" class="me-2 text-primary" />
                                        </template>
                                        <VListItemTitle>تعديل</VListItemTitle>
                                    </VListItem>
                                    <VListItem @click="handleDelete(child.id)">
                                        <template #prepend>
                                            <VIcon icon="tabler-trash" size="18" class="me-2 text-error" />
                                        </template>
                                        <VListItemTitle class="text-error">حذف</VListItemTitle>
                                    </VListItem>
                                </VList>
                            </VMenu>
                        </template>
                    </VCardItem>

                    <VCardText class="pt-4">
                        <div class="text-caption font-weight-bold text-uppercase mb-2 text-secondary">
                            {{ $t('CompleteProfile.PreferredSubjects') }}
                        </div>
                        <div v-if="child.subjects?.length" class="d-flex flex-wrap gap-2">
                            <VChip
                                v-for="sub in child.subjects"
                                :key="sub.id"
                                size="small"
                                color="primary"
                                variant="tonal"
                            >
                                {{ sub.subject?.nameAr }}
                            </VChip>
                        </div>
                        <div v-else class="text-body-2 text-disabled">
                            لم يتم تحديد مواد مفضلة
                        </div>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>

        <!-- Add/Edit Dialog -->
        <VDialog
            v-model="showDialog"
            max-width="500"
            scrollable
            persistent
        >
            <VCard>
                <VCardItem class="pb-4">
                    <VCardTitle class="text-h5">
                        {{ dialogMode === 'add' ? $t('CompleteProfile.AddNewChild') : 'تعديل بيانات الطفل' }}
                    </VCardTitle>
                    <template #append>
                        <VBtn
                            icon="tabler-x"
                            variant="text"
                            size="small"
                            @click="showDialog = false"
                        />
                    </template>
                </VCardItem>

                <VDivider />

                <VCardText class="pa-4 pa-sm-6">
                    <VForm @submit.prevent>
                        <VRow>
                            <VCol cols="12">
                                <VLabel class="mb-2 text-caption font-weight-bold text-uppercase">{{ $t('CompleteProfile.Name') }} *</VLabel>
                                <VTextField
                                    v-model="formValue.name"
                                    :placeholder="$t('CompleteProfile.EnterChildName')"
                                    :rules="[rules.required]"
                                    variant="outlined"
                                    density="comfortable"
                                />
                            </VCol>

                            <VCol cols="12">
                                <VLabel class="mb-2 text-caption font-weight-bold text-uppercase">{{ $t('CompleteProfile.EducationalStage') }} *</VLabel>
                                <VAutocomplete
                                    v-model="formValue.stageId"
                                    :items="searchStore.stages"
                                    item-title="nameAr"
                                    item-value="id"
                                    :placeholder="$t('CompleteProfile.SelectStage')"
                                    :rules="[rules.required]"
                                    variant="outlined"
                                    density="comfortable"
                                />
                            </VCol>

                            <VCol cols="12">
                                <VLabel class="mb-2 text-caption font-weight-bold text-uppercase">{{ $t('CompleteProfile.PreferredSubjects') }}</VLabel>
                                <VAutocomplete
                                    v-model="formValue.subjectIds"
                                    :items="searchStore.subjects"
                                    item-title="nameAr"
                                    item-value="id"
                                    :placeholder="$t('CompleteProfile.SearchSelectSubjects')"
                                    variant="outlined"
                                    density="comfortable"
                                    multiple
                                    chips
                                    closable-chips
                                />
                            </VCol>
                        </VRow>
                    </VForm>
                </VCardText>

                <VDivider />

                <VCardText class="d-flex justify-end gap-3 pa-4">
                    <VBtn
                        variant="tonal"
                        color="secondary"
                        @click="showDialog = false"
                    >
                        إلغاء
                    </VBtn>
                    <VBtn
                        color="primary"
                        :loading="childrenStore.loading"
                        :disabled="!formValue.name || !formValue.stageId"
                        @click="saveChild"
                    >
                        حفظ
                    </VBtn>
                </VCardText>
            </VCard>
        </VDialog>
    </div>
</template>

<style lang="scss" scoped>
.child-card {
    transition: all 0.2s ease;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        border-color: rgba(var(--v-theme-primary), 0.3);
    }
}
</style>
