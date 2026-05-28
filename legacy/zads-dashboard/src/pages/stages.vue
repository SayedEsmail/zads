<script setup>
import api from '@/services/api'

// Data
const stages = ref([])
const loading = ref(true)

// Dialog
const isDialogOpen = ref(false)
const isEditing = ref(false)
const editingStage = ref(null)

const form = ref({
    nameAr: '',
    nameEn: '',
    sortOrder: 0,
})

// Table headers
const headers = [
    { title: 'الاسم بالعربية', key: 'nameAr', sortable: true },
    { title: 'الاسم بالإنجليزية', key: 'nameEn', sortable: true },
    { title: 'الترتيب', key: 'sortOrder', sortable: true },
    { title: 'الحالة', key: 'isActive', sortable: true },
    { title: 'الإجراءات', key: 'actions', sortable: false },
]

// Fetch stages
const fetchStages = async () => {
    try {
        loading.value = true

        const response = await api.get('/stages')

        stages.value = response.data
    } catch (error) {
        console.error('Failed to fetch stages:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchStages()
})

// Open add dialog
const openAddDialog = () => {
    isEditing.value = false
    editingStage.value = null
    form.value = {
        nameAr: '',
        nameEn: '',
        sortOrder: stages.value.length + 1,
    }
    isDialogOpen.value = true
}

// Open edit dialog
const openEditDialog = stage => {
    isEditing.value = true
    editingStage.value = stage
    form.value = {
        nameAr: stage.nameAr,
        nameEn: stage.nameEn || '',
        sortOrder: stage.sortOrder,
    }
    isDialogOpen.value = true
}

// Save stage
const saveStage = async () => {
    try {
        if (isEditing.value) {
            await api.put(`/stages/${editingStage.value.id}`, form.value)
        } else {
            await api.post('/stages', form.value)
        }
        isDialogOpen.value = false
        await fetchStages()
    } catch (error) {
        console.error('Failed to save stage:', error)
    }
}

// Toggle active status
const toggleActive = async stage => {
    try {
        await api.put(`/stages/${stage.id}`, {
            isActive: !stage.isActive,
        })
        await fetchStages()
    } catch (error) {
        console.error('Failed to toggle status:', error)
    }
}
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="d-flex align-center justify-space-between mb-6">
            <div>
                <h4 class="text-h4 mb-1">
                    المراحل التعليمية
                </h4>
                <p class="text-body-1 text-medium-emphasis mb-0">
                    إدارة المراحل التعليمية المتاحة
                </p>
            </div>
            <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                @click="openAddDialog"
            >
                إضافة مرحلة
            </VBtn>
        </div>

        <!-- Data Table -->
        <VCard>
            <VDataTable
                :headers="headers"
                :items="stages"
                :loading="loading"
                class="text-no-wrap"
            >
                <!-- Active Column -->
                <template #item.isActive="{ item }">
                    <VChip
                        :color="item.isActive ? 'success' : 'secondary'"
                        size="small"
                        label
                    >
                        {{ item.isActive ? 'مفعل' : 'معطل' }}
                    </VChip>
                </template>

                <!-- Actions Column -->
                <template #item.actions="{ item }">
                    <div class="d-flex gap-1">
                        <VBtn
                            icon
                            variant="text"
                            size="small"
                            color="primary"
                            @click="openEditDialog(item)"
                        >
                            <VIcon icon="tabler-edit" />
                            <VTooltip activator="parent">
                                تعديل
                            </VTooltip>
                        </VBtn>

                        <VBtn
                            icon
                            variant="text"
                            size="small"
                            :color="item.isActive ? 'error' : 'success'"
                            @click="toggleActive(item)"
                        >
                            <VIcon :icon="item.isActive ? 'tabler-eye-off' : 'tabler-eye'" />
                            <VTooltip activator="parent">
                                {{ item.isActive ? 'تعطيل' : 'تفعيل' }}
                            </VTooltip>
                        </VBtn>
                    </div>
                </template>
            </VDataTable>
        </VCard>

        <!-- Add/Edit Dialog -->
        <VDialog
            v-model="isDialogOpen"
            max-width="500"
        >
            <VCard>
                <VCardTitle class="pt-4 px-6">
                    {{ isEditing ? 'تعديل المرحلة' : 'إضافة مرحلة جديدة' }}
                </VCardTitle>
                <VCardText>
                    <VForm @submit.prevent="saveStage">
                        <VRow>
                            <VCol cols="12">
                                <AppTextField
                                    v-model="form.nameAr"
                                    label="الاسم بالعربية"
                                    placeholder="مثال: ابتدائي"
                                    required
                                />
                            </VCol>
                            <VCol cols="12">
                                <AppTextField
                                    v-model="form.nameEn"
                                    label="الاسم بالإنجليزية"
                                    placeholder="Example: Primary"
                                    dir="ltr"
                                />
                            </VCol>
                            <VCol cols="12">
                                <AppTextField
                                    v-model.number="form.sortOrder"
                                    label="الترتيب"
                                    type="number"
                                />
                            </VCol>
                        </VRow>
                    </VForm>
                </VCardText>
                <VCardActions class="pa-6 pt-0">
                    <VSpacer />
                    <VBtn
                        variant="tonal"
                        @click="isDialogOpen = false"
                    >
                        إلغاء
                    </VBtn>
                    <VBtn
                        color="primary"
                        @click="saveStage"
                    >
                        {{ isEditing ? 'حفظ التعديلات' : 'إضافة' }}
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </div>
</template>
