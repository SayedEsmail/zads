<script setup>
const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    maxWidth: {
        type: [Number, String],
        default: 500,
    },
    persistent: {
        type: Boolean,
        default: true,
    },
    scrollable: {
        type: Boolean,
        default: true,
    },
    cancelText: {
        type: String,
        default: 'إلغاء',
    },
    confirmText: {
        type: String,
        default: 'حفظ التغييرات',
    },
    loading: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    icon: {
        type: String,
        default: null, // e.g. 'tabler-send'
    },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isVisible = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val),
})

const handleCancel = () => {
    emit('cancel')
    isVisible.value = false
}

const handleConfirm = () => {
    emit('confirm')
}
</script>

<template>
    <VDialog
        v-model="isVisible"
        :max-width="maxWidth"
        :scrollable="scrollable"
        :persistent="persistent"
        transition="dialog-bottom-transition"
        class="premium-dialog"
        z-index="1000"
    >
        <VCard class="rounded-xl overflow-hidden bg-surface">
            <!-- Header -->
            <VCardItem class="pa-6 pb-2">
                <VCardTitle class="text-h5 font-weight-bold text-high-emphasis">
                    {{ title }}
                </VCardTitle>
                <template #append>
                    <VBtn
                        icon="tabler-x"
                        variant="tonal"
                        color="secondary"
                        size="small"
                        class="rounded-lg"
                        @click="handleCancel"
                    />
                </template>
            </VCardItem>

            <!-- Body -->
            <VCardText class="pa-6 pt-2">
                <slot />
            </VCardText>

            <!-- Footer Actions -->
            <VCardActions class="pa-6 pt-0">
                <VSpacer />
                
                <!-- Cancel Button (Gray) -->
                <VBtn
                    variant="text"
                    color="primary"
                    class="px-6 rounded-pill"
                    @click="handleCancel"
                >
                    {{ cancelText }}
                </VBtn>

                <!-- Confirm Button (Target Color with Background) -->
                <VBtn
                    color="secondary"
                    variant="flat"
                    :loading="loading"
                    :disabled="disabled"
                    class="px-8 rounded-pill shadow-primary font-weight-bold"
                    @click="handleConfirm"
                >
                    <VIcon v-if="icon" start :icon="icon" />
                    {{ confirmText }}
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<style scoped>
.shadow-primary {
    box-shadow: 0 8px 16px -4px rgba(var(--v-theme-primary), 0.3) !important;
}

/* Secondary tonal variant override for purely gray cancel buttons */
.v-btn.v-btn--variant-tonal.text-secondary {
    background-color: rgb(var(--v-theme-secondary), 0.08) !important;
    color: rgb(var(--v-theme-secondary)) !important;
}
</style>
