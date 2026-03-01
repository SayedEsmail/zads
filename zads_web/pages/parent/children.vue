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
        <!-- Premium Header Section -->
        <PremiumPageHeader
            :title="$t('MyChildren')"
            :description="$t('CompleteProfile.ChildrenDesc')"
        >
            <template #actions>
                <VBtn
                    color="primary"
                    size="large"
                    prepend-icon="tabler-plus"
                    class="px-8 rounded-pill font-weight-bold shadow-primary"
                    @click="openAddDialog"
                >
                    {{ $t('CompleteProfile.AddNewChild') }}
                </VBtn>
            </template>
        </PremiumPageHeader>

        <VContainer>
            <div v-if="childrenStore.loading && !childrenStore.children.length" class="d-flex justify-center py-12">
                <VProgressCircular indeterminate color="primary" size="48" />
            </div>

            <VAlert
                v-else-if="childrenStore.error"
                color="error"
                variant="tonal"
                class="mb-6 rounded-xl"
            >
                {{ childrenStore.error }}
                <template #append>
                    <VBtn variant="text" size="small" @click="childrenStore.fetchChildren">
                        {{ $t('FavoritesPage.Retry') }}
                    </VBtn>
                </template>
            </VAlert>

            <!-- Empty State -->
            <div
                v-else-if="!childrenStore.children.length"
                class="text-center py-16 bg-surface rounded-xl border-dashed border-2 opacity-80 empty-state-premium"
            >
                <VIcon
                    size="64"
                    icon="tabler-mood-kid"
                    color="secondary"
                    class="mb-4 opacity-20"
                />
                <h4 class="text-h5 font-weight-bold mb-2 text-high-emphasis">
                    لا يوجد أبناء مضافين
                </h4>
                <p class="text-body-1 text-secondary mb-8">
                    قم بإضافة أبنائك لنتمكن من ترشيح المعلمين المناسبين لهم
                </p>
                <VBtn
                    color="primary"
                    size="large"
                    variant="tonal"
                    class="rounded-pill px-10"
                    @click="openAddDialog"
                >
                    {{ $t('CompleteProfile.AddNewChild') }}
                </VBtn>
            </div>

            <!-- Cards Grid -->
            <VRow v-else>
                <VCol
                    v-for="child in childrenStore.children"
                    :key="child.id"
                    cols="12"
                    sm="6"
                    lg="4"
                >
                    <VCard class="h-100 child-card-premium">
                        <VCardItem class="pb-2">
                            <template #prepend>
                                <VAvatar
                                    color="primary"
                                    variant="tonal"
                                    size="56"
                                    class="rounded-xl child-avatar-premium"
                                >
                                    <VIcon icon="tabler-user" size="28" />
                                </VAvatar>
                            </template>

                            <VCardTitle class="text-h6 font-weight-bold text-high-emphasis">
                                {{ child.name }}
                            </VCardTitle>
                            <VCardSubtitle class="text-primary font-weight-medium mt-1">
                                {{ child.stage?.nameAr }}
                            </VCardSubtitle>
                            
                            <template #append>
                                <VMenu location="bottom end">
                                    <template #activator="{ props }">
                                        <VBtn
                                            icon="tabler-dots"
                                            variant="text"
                                            color="secondary"
                                            density="comfortable"
                                            v-bind="props"
                                        />
                                    </template>
                                    <VList density="compact" class="rounded-lg border shadow-sm">
                                        <VListItem @click="openEditDialog(child)" class="py-2">
                                            <template #prepend>
                                                <VIcon icon="tabler-edit" size="18" class="me-2 text-primary" />
                                            </template>
                                            <VListItemTitle class="font-weight-medium">تعديل</VListItemTitle>
                                        </VListItem>
                                        <VListItem @click="handleDelete(child.id)" class="py-2">
                                            <template #prepend>
                                                <VIcon icon="tabler-trash" size="18" class="me-2 text-error" />
                                            </template>
                                            <VListItemTitle class="text-error font-weight-medium">حذف</VListItemTitle>
                                        </VListItem>
                                    </VList>
                                </VMenu>
                            </template>
                        </VCardItem>

                        <VCardText class="pt-4">
                            <div class="text-caption font-weight-bold text-uppercase mb-3 text-secondary tracking-wide">
                                {{ $t('CompleteProfile.PreferredSubjects') }}
                            </div>
                            <div v-if="child.subjects?.length" class="d-flex flex-wrap gap-2">
                                <VChip
                                    v-for="sub in child.subjects"
                                    :key="sub.id"
                                    size="small"
                                    color="primary"
                                    variant="tonal"
                                    class="rounded-lg font-weight-medium"
                                >
                                    {{ sub.subject?.nameAr }}
                                </VChip>
                            </div>
                            <div v-else class="text-body-2 text-disabled italic">
                                لم يتم تحديد مواد مفضلة
                            </div>
                        </VCardText>
                    </VCard>
                </VCol>
            </VRow>
        </VContainer>

        <!-- Add/Edit Dialog -->
        <PremiumDialog
            v-model="showDialog"
            :title="dialogMode === 'add' ? $t('CompleteProfile.AddNewChild') : 'تعديل بيانات الطفل'"
            :loading="childrenStore.loading"
            :disabled="!formValue.name || !formValue.stageId"
            :confirm-text="$t('CompleteProfile.SaveChanges') || 'حفظ التغييرات'"
            @confirm="saveChild"
        >
            <p class="text-body-2 text-secondary mb-6">
                يرجى إدخال تفاصيل الطفل بدقة لنتمكن من توفير أفضل تجربة تعليمية.
            </p>
            <VForm @submit.prevent>
                <VRow>
                    <VCol cols="12">
                        <VLabel class="mb-2 text-caption font-weight-bold text-uppercase text-secondary">{{ $t('CompleteProfile.Name') }} *</VLabel>
                        <VTextField
                            v-model="formValue.name"
                            :placeholder="$t('CompleteProfile.EnterChildName')"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="comfortable"
                            class="rounded-lg"
                        />
                    </VCol>

                    <VCol cols="12">
                        <VLabel class="mb-2 text-caption font-weight-bold text-uppercase text-secondary">{{ $t('CompleteProfile.EducationalStage') }} *</VLabel>
                        <VAutocomplete
                            v-model="formValue.stageId"
                            :items="searchStore.stages"
                            item-title="nameAr"
                            item-value="id"
                            :placeholder="$t('CompleteProfile.SelectStage')"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="comfortable"
                            class="rounded-lg"
                        />
                    </VCol>

                    <VCol cols="12">
                        <VLabel class="mb-2 text-caption font-weight-bold text-uppercase text-secondary">{{ $t('CompleteProfile.PreferredSubjects') }}</VLabel>
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
                            class="rounded-lg"
                        />
                    </VCol>
                </VRow>
            </VForm>
        </PremiumDialog>
    </div>
</template>

<style lang="scss" scoped>
.children-manager {

    .child-card-premium {
        border-radius: 24px !important;
        border: 1px solid rgba(var(--v-border-color), 0.12) !important;
        border-bottom: 3px solid rgba(var(--v-theme-primary), 0.1) !important;
        transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        box-shadow: 0 4px 12px -2px rgba(var(--v-theme-on-surface), 0.05) !important;

        &:hover {
            transform: translateY(-8px);
            border-color: rgba(var(--v-theme-primary), 0.2) !important;
            border-bottom-color: rgb(var(--v-theme-primary)) !important;
            box-shadow: 0 20px 40px -12px rgba(var(--v-theme-on-surface), 0.12) !important;
            
            .child-avatar-premium {
                box-shadow: 0 0 0 2px rgb(var(--v-theme-primary));
            }
        }
    }

    .child-avatar-premium {
        border: 2px solid #fff;
        box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.1);
        transition: box-shadow 0.3s ease;
    }

    .empty-state-premium {
        border-color: rgba(var(--v-border-color), 0.1) !important;
        transition: all 0.3s ease;
        
        &:hover {
            border-color: rgba(var(--v-theme-primary), 0.3) !important;
            background-color: rgba(var(--v-theme-primary), 0.02) !important;
        }
    }

    .shadow-primary {
        box-shadow: 0 8px 16px -4px rgba(var(--v-theme-primary), 0.3) !important;
    }

    .tracking-wide {
        letter-spacing: 0.5px;
    }

    .shadow-sm {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
    }
}
</style>
