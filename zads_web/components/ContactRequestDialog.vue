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
    <PremiumDialog
        v-model="isVisible"
        :title="`تواصل مع ${teacher.user?.name}`"
        :loading="loading"
        :disabled="!selectedChildId"
        icon="tabler-send"
        confirm-text="إرسال الطلب"
        @confirm="handleSubmit"
    >
        <VAlert
            v-if="error"
            color="error"
            variant="tonal"
            class="mb-4 rounded-lg"
        >
            {{ error }}
        </VAlert>

        <p class="text-body-2 text-secondary mb-6">
            أرسل طلب تواصل للمعلم بخصوص أحد أبنائك. سيقوم المعلم بالرد عليك قريباً.
        </p>

        <VForm @submit.prevent="handleSubmit">
            <VLabel class="mb-2 text-caption font-weight-bold text-uppercase text-secondary">اختر الابن/الابنة *</VLabel>
            <VSelect
                v-model="selectedChildId"
                :items="childrenStore.children"
                item-title="name"
                item-value="id"
                :rules="[rules.required]"
                class="mb-4"
                placeholder="اختر الطالب"
                variant="outlined"
                density="comfortable"
            >
                <template #item="{ props: itemProps, item }">
                    <VListItem
                        v-bind="itemProps"
                        :subtitle="item.raw.stage?.nameAr"
                    />
                </template>
            </VSelect>

            <VLabel class="mb-2 text-caption font-weight-bold text-uppercase text-secondary">رسالة (اختياري)</VLabel>
            <VTextarea
                v-model="message"
                placeholder="اكتب أي تفاصيل إضافية للمعلم..."
                rows="3"
                auto-grow
                variant="outlined"
                density="comfortable"
            />
        </VForm>
    </PremiumDialog>
</template>

<style scoped>
.shadow-secondary {
    box-shadow: 0 8px 16px -4px rgba(var(--v-theme-secondary), 0.3) !important;
}
</style>
