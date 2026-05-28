<script setup>
const props = defineProps({
    modelValue: Boolean,
    teacher: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['update:modelValue'])

const isDialogVisible = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val),
})

const formatDate = dateStr => {
    if (!dateStr) return '-'
    
    return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
</script>

<template>
    <VDialog
        v-model="isDialogVisible"
        max-width="800"
    >
        <VCard>
            <!-- Header -->
            <VCardText class="d-flex align-center gap-4 py-8">
                <VAvatar
                    size="80"
                    :image="teacher.user?.avatarUrl"
                    color="primary"
                    variant="tonal"
                >
                    <span
                        v-if="!teacher.user?.avatarUrl"
                        class="text-h3"
                    >
                        {{ teacher.user?.name?.charAt(0) }}
                    </span>
                </VAvatar>

                <div>
                    <div class="d-flex align-center gap-2 mb-1">
                        <h4 class="text-h4">
                            {{ teacher.user?.name }}
                        </h4>
                        <VIcon
                            v-if="teacher.isVerified"
                            icon="tabler-discount-check-filled"
                            color="success"
                            size="24"
                        />
                    </div>
                    <div class="d-flex align-center gap-4 text-body-1 text-medium-emphasis mb-2">
                        <span dir="ltr">{{ teacher.user?.phone }}</span>
                        <VDivider vertical />
                        <span>{{ teacher.user?.email || '-' }}</span>
                    </div>
                    <div class="d-flex gap-2">
                        <VChip
                            :color="teacher.user?.status === 'active' ? 'success' : 'error'"
                            size="small"
                            label
                        >
                            {{ teacher.user?.status === 'active' ? 'نشط' : 'موقوف' }}
                        </VChip>
                        <VChip
                            size="small"
                            variant="outlined"
                        >
                            {{ teacher.experienceYears }} سنوات خبرة
                        </VChip>
                    </div>
                </div>
            </VCardText>

            <VDivider />

            <!-- Content -->
            <VCardText class="pa-0">
                <div class="d-flex flex-row">
                    <VTabs
                        direction="vertical"
                        class="v-tabs-pill my-4 mx-2"
                        style="min-width: 150px;"
                    >
                        <VTab value="info">
                            <VIcon
                                icon="tabler-info-circle"
                                start
                            />
                            المعلومات
                        </VTab>
                        <VTab value="subjects">
                            <VIcon
                                icon="tabler-books"
                                start
                            />
                            المواد ({{ teacher.subjects?.length || 0 }})
                        </VTab>
                    </VTabs>

                    <VDivider vertical />

                    <VWindow class="flex-grow-1 pa-4">
                        <!-- info -->
                        <VWindowItem value="info">
                            <div class="d-flex flex-column gap-4">
                                <div>
                                    <h6 class="text-h6 mb-2">
                                        نبذة عني
                                    </h6>
                                    <p class="text-body-1">
                                        {{ teacher.bio || 'لا توجد نبذة' }}
                                    </p>
                                </div>
                
                                <VDivider />

                                <div class="d-flex gap-8">
                                    <div>
                                        <span class="text-caption text-medium-emphasis">التقييم</span>
                                        <div class="d-flex align-center gap-1 mt-1">
                                            <VIcon
                                                icon="tabler-star-filled"
                                                color="warning"
                                                size="20"
                                            />
                                            <span class="text-h6">{{ teacher.avgRating }}</span>
                                            <span class="text-caption">({{ teacher.ratingCount }} تقييم)</span>
                                        </div>
                                    </div>
                  
                                    <div>
                                        <span class="text-caption text-medium-emphasis">المشاهدات</span>
                                        <div class="d-flex align-center gap-1 mt-1">
                                            <VIcon
                                                icon="tabler-eye"
                                                size="20"
                                            />
                                            <span class="text-h6">{{ teacher.viewsCount }}</span>
                                        </div>
                                    </div>
                                </div>

                                <VDivider />
                 
                                <div>
                                    <h6 class="text-h6 mb-2">
                                        المؤهلات
                                    </h6>
                                    <p class="text-body-1">
                                        {{ teacher.qualification || '-' }}
                                    </p>
                                </div>
                            </div>
                        </VWindowItem>

                        <!-- subjects -->
                        <VWindowItem value="subjects">
                            <VTable
                                density="compact"
                                class="text-no-wrap"
                            >
                                <thead>
                                    <tr>
                                        <th>المادة</th>
                                        <th>المرحلة</th>
                                        <th>السعر (طالب/معلم/مجموعة)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="subject in teacher.subjects"
                                        :key="subject.id"
                                    >
                                        <td>{{ subject.subject?.nameAr }}</td>
                                        <td>{{ subject.stage?.nameAr }}</td>
                                        <td>
                                            <div class="d-flex gap-2 text-caption">
                                                <VChip
                                                    size="x-small"
                                                    variant="flat"
                                                    color="primary"
                                                >
                                                    {{ subject.priceAtStudent || '-' }}
                                                </VChip>
                                                <VChip
                                                    size="x-small"
                                                    variant="flat"
                                                    color="info"
                                                >
                                                    {{ subject.priceAtTeacher || '-' }}
                                                </VChip>
                                                <VChip
                                                    size="x-small"
                                                    variant="flat"
                                                    color="secondary"
                                                >
                                                    {{ subject.priceGroup || '-' }}
                                                </VChip>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </VTable>
                        </VWindowItem>
                    </VWindow>
                </div>
            </VCardText>

            <VDivider />

            <VCardActions class="justify-end">
                <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="isDialogVisible = false"
                >
                    إغلاق
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>
