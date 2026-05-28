<script setup>
import api from '@/services/api'

// Data
const subjects = ref([])
const loading = ref(true)

// Dialog
const isDialogOpen = ref(false)
const isEditing = ref(false)
const editingSubject = ref(null)

const form = ref({
    nameAr: '',
    nameEn: '',
    icon: '',
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

// Fetch subjects
const fetchSubjects = async () => {
    try {
        loading.value = true

        const response = await api.get('/subjects')

        subjects.value = response.data
    } catch (error) {
        console.error('Failed to fetch subjects:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchSubjects()
})

// Open add dialog
const openAddDialog = () => {
    isEditing.value = false
    editingSubject.value = null
    form.value = {
        nameAr: '',
        nameEn: '',
        icon: '',
        sortOrder: subjects.value.length + 1,
    }
    isDialogOpen.value = true
}

// Open edit dialog
const openEditDialog = subject => {
    isEditing.value = true
    editingSubject.value = subject
    form.value = {
        nameAr: subject.nameAr,
        nameEn: subject.nameEn || '',
        icon: subject.icon || '',
        sortOrder: subject.sortOrder,
    }
    isDialogOpen.value = true
}

// Save subject
const saveSubject = async () => {
    try {
        if (isEditing.value) {
            await api.put(`/subjects/${editingSubject.value.id}`, form.value)
        } else {
            await api.post('/subjects', form.value)
        }
        isDialogOpen.value = false
        await fetchSubjects()
    } catch (error) {
        console.error('Failed to save subject:', error)
    }
}

// Toggle active status
const toggleActive = async subject => {
    try {
        await api.put(`/subjects/${subject.id}`, {
            isActive: !subject.isActive,
        })
        await fetchSubjects()
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
                    المواد الدراسية
                </h4>
                <p class="text-body-1 text-medium-emphasis mb-0">
                    إدارة المواد الدراسية المتاحة
                </p>
            </div>
            <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                @click="openAddDialog"
            >
                إضافة مادة
            </VBtn>
        </div>

        <!-- Data Table -->
        <VCard>
            <VDataTable
                :headers="headers"
                :items="subjects"
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
                    {{ isEditing ? 'تعديل المادة' : 'إضافة مادة جديدة' }}
                </VCardTitle>
                <VCardText>
                    <VForm @submit.prevent="saveSubject">
                        <VRow>
                            <VCol cols="12">
                                <AppTextField
                                    v-model="form.nameAr"
                                    label="الاسم بالعربية"
                                    placeholder="مثال: الرياضيات"
                                    required
                                />
                            </VCol>
                            <VCol cols="12">
                                <AppTextField
                                    v-model="form.nameEn"
                                    label="الاسم بالإنجليزية"
                                    placeholder="Example: Mathematics"
                                    dir="ltr"
                                />
                            </VCol>
                            <VCol cols="12">
                                <AppTextField
                                    v-model="form.icon"
                                    label="الأيقونة"
                                    placeholder="مثال: calculator"
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
                        @click="saveSubject"
                    >
                        {{ isEditing ? 'حفظ التعديلات' : 'إضافة' }}
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </div>
</template>
