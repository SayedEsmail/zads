<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  progress: {
    type: Number,
    required: true,
  },
  icon: {
    type: String,
    default: 'tabler-book',
  },
  color: {
    type: String,
    default: 'primary',
  },
  // E.g., '18/40 Lessons'
  progressTextLeft: {
    type: String,
    default: '',
  },
  // E.g., '2 hours left'
  progressTextRight: {
    type: String,
    default: '',
  },
  actionText: {
    type: String,
    default: 'Resume',
  },
})
</script>

<template>
  <VCard class="pa-5 h-100 d-flex flex-column card-progress">
    <!-- Header: Icon & Title -->
    <div class="d-flex align-center gap-3 mb-4">
      <VAvatar 
        :color="color" 
        variant="tonal" 
        size="44" 
        rounded="lg"
      >
        <VIcon :icon="icon" />
      </VAvatar>
      
      <div>
        <h6 class="text-h6 font-weight-bold mb-0 text-truncate max-w-200">
          {{ title }}
        </h6>
        <span class="text-caption text-medium-emphasis text-uppercase tracking-wider font-weight-medium">
          {{ subtitle }}
        </span>
      </div>
    </div>

    <VSpacer />

    <!-- Progress Bar Section -->
    <div class="mt-2">
      <VProgressLinear
        :model-value="progress"
        :color="color"
        height="6"
        rounded
        class="mb-2"
        background-color="grey-100"
      />
      
      <div class="d-flex justify-space-between align-center text-caption text-medium-emphasis">
        <div class="d-flex align-center gap-1">
          <VIcon icon="tabler-book-2" size="14" />
          <span>{{ progressTextLeft }}</span>
        </div>
        
        <div class="d-flex align-center gap-1">
          <VIcon icon="tabler-clock" size="14" />
          <span>{{ progressTextRight }}</span>
        </div>
      </div>
    </div>

    <VDivider class="my-4" />

    <!-- Action Section -->
    <div class="d-flex align-center">
      <span class="text-button text-primary font-weight-bold cursor-pointer d-flex align-center gap-1 action-link">
        {{ actionText }}
        <VIcon icon="tabler-arrow-right" size="16" class="transition-icon" />
      </span>
    </div>
  </VCard>
</template>

<style scoped>
.max-w-200 {
  max-width: 200px;
}
.tracking-wider {
  letter-spacing: 0.8px;
}
.card-progress {
  transition: border-color 0.2s;
  border: 1px solid transparent;
}
.card-progress:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
}
.action-link:hover .transition-icon {
  transform: translateX(4px);
}
.transition-icon {
  transition: transform 0.2s ease;
}
</style>
