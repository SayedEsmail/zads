<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'primary',
  },
  value: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <VCard class="pa-4 dashboard-stat-widget">
    <div class="d-flex align-start gap-3">
      <!-- Icon in a soft, tonal circle -->
      <VAvatar 
        :color="color" 
        variant="tonal" 
        rounded="lg" 
        size="48"
        class="mt-1"
      >
        <VIcon :icon="icon" size="24" />
      </VAvatar>
      
      <!-- Stats Information -->
      <div class="d-flex flex-column flex-grow-1">
        <!-- Optional Top subtitle (e.g., 'Course in Progress' like Eduvi) -->
        <span v-if="subtitle" class="text-caption text-medium-emphasis mb-1 font-weight-medium text-uppercase tracking-wide">
          <VIcon icon="tabler-point" size="14" :color="color" class="me-1" />
          {{ subtitle }}
        </span>
        
        <h4 class="text-h4 font-weight-bold text-high-emphasis mb-0 mt-n1">
          {{ value }}
        </h4>
        
        <span class="text-body-2 text-medium-emphasis mt-1">
          {{ label }}
        </span>
      </div>
    </div>
  </VCard>
</template>

<style scoped>
.dashboard-stat-widget {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: default;
}

.dashboard-stat-widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.tracking-wide {
  letter-spacing: 0.5px;
}
</style>
