<script setup>
import { useContactRequestsStore } from '~/stores/contactRequests'
import { useChildrenStore } from '~/stores/children'

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true,
    },
    teacher: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['update:modelValue', 'success'])

const contactRequestsStore = useContactRequestsStore()
const childrenStore = useChildrenStore()

const loading = ref(false)
const error = ref(null)
const selectedChildId = ref(null)
const message = ref('')

const isVisible = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val),
})

// Validation rules
const rules = {
    required: v => !!v || 'هذا الحقل مطلوب',
}

// Fetch children on mount if not already loaded
onMounted(async () => {
    if (childrenStore.children.length === 0) {
        await childrenStore.fetchChildren()
    }
})

const handleSubmit = async () => {
    if (!selectedChildId.value) return

    loading.value = true
    error.value = null

    try {
        await contactRequestsStore.createRequest({
            teacherId: props.teacher.id,
            childId: selectedChildId.value,
            message: message.value,
        })
        emit('success')
        isVisible.value = false
        // Reset form
        message.value = ''
        selectedChildId.value = null
    } catch (err) {
        error.value = err.message || 'فشل إرسال الطلب'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <VDialog
        v-model="isVisible"
        max-width="500"
    >
        <VCard>
            <VCardTitle>
                تواصل مع {{ teacher.user?.name }}
            </VCardTitle>

            <VCardText>
                <VAlert
                    v-if="error"
                    color="error"
                    variant="tonal"
                    class="mb-4"
                >
                    {{ error }}
                </VAlert>

                <p class="text-body-2 mb-4">
                    أرسل طلب تواصل للمعلم بخصوص أحد أبنائك. سيقوم المعلم بالرد عليك قريباً.
                </p>

                <VForm @submit.prevent="handleSubmit">
                    <VSelect
                        v-model="selectedChildId"
                        :items="childrenStore.children"
                        item-title="name"
                        item-value="id"
                        label="اختر الابن/الابنة"
                        :rules="[rules.required]"
                        class="mb-4"
                        placeholder="اختر الطالب"
                    >
                        <template #item="{ props: itemProps, item }">
                            <VListItem
                                v-bind="itemProps"
                                :subtitle="item.raw.stage?.nameAr"
                            />
                        </template>
                    </VSelect>

                    <VTextarea
                        v-model="message"
                        label="رسالة (اختياري)"
                        placeholder="اكتب أي تفاصيل إضافية للمعلم..."
                        rows="3"
                        auto-grow
                    />
                </VForm>
            </VCardText>

            <VCardActions>
                <VSpacer />
                <VBtn
                    color="secondary"
                    variant="text"
                    @click="isVisible = false"
                >
                    إلغاء
                </VBtn>
                <VBtn
                    color="primary"
                    :loading="loading"
                    :disabled="!selectedChildId"
                    @click="handleSubmit"
                >
                    <VIcon start icon="tabler-send" />
                    إرسال الطلب
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>
