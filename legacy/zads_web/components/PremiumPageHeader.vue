<script setup>
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
})
</script>

<template>
    <div class="premium-header-section bg-secondary-light pa-6 pa-md-10 mb-8 border-b">
        <VContainer>
            <VRow align="center" justify="space-between">
                <!-- Title & Description (Right side in RTL) -->
                <VCol cols="12" md="7" lg="8">
                    <h1 class="text-h3 font-weight-bold mb-3 text-high-emphasis">
                        {{ title }}
                    </h1>
                    <p
                        v-if="description"
                        class="text-body-1 text-secondary mb-0"
                        style="max-width: 600px;"
                    >
                        {{ description }}
                    </p>
                </VCol>
                
                <!-- Actions Slot (Left side in RTL) -->
                <VCol cols="12" md="5" lg="4" class="d-flex justify-md-end justify-start mt-4 mt-md-0">
                    <div class="d-flex flex-wrap gap-4 w-100 justify-md-end">
                        <slot name="actions" />
                    </div>
                </VCol>
            </VRow>
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.premium-header-section {
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: -50px;
        right: -50px;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.05) 0%, transparent 70%);
        border-radius: 50%;
    }
}
</style>
