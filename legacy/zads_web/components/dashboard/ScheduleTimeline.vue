<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Schedule', // Default translation key or text
  },
  dateSubtitle: {
    type: String,
    default: 'Today',
  },
  // Events format: [{ time: '12:00', title: 'Math Class', subtitle: 'Grade 5', color: 'primary', isDone: false }]
  events: {
    type: Array,
    required: true,
  },
  emptyText: {
    type: String,
    default: 'No events scheduled for today.',
  },
  actionText: {
    type: String,
    default: 'See all',
  }
})

const emit = defineEmits(['actionClicked'])
</script>

<template>
  <VCard class="pa-5" elevation="0" color="transparent">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-5">
      <div>
        <h6 class="text-h6 font-weight-bold mb-0">{{ title }}</h6>
        <span class="text-caption text-medium-emphasis">{{ dateSubtitle }}</span>
      </div>
      
      <span 
        class="text-caption text-primary cursor-pointer font-weight-bold action-hover"
        @click="emit('actionClicked')"
      >
        {{ actionText }}
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="!events.length" class="text-center py-4 bg-grey-light rounded-lg">
      <span class="text-body-2 text-medium-emphasis">{{ emptyText }}</span>
    </div>

    <!-- Timeline Wrapper -->
    <div v-else class="schedule-timeline-wrapper">
      <VTimeline 
        density="compact" 
        align="start"
        truncate-line="both"
        class="v-timeline--custom-spacing"
      >
        <VTimelineItem
          v-for="(event, i) in events"
          :key="i"
          :dot-color="event.color || 'primary'"
          :icon="event.isDone ? 'tabler-check' : ''"
          size="small"
          elevation="0"
        >
          <div class="d-flex justify-space-between align-start mb-2 pt-1 gap-2">
            <!-- Event Details -->
            <div class="timeline-event-card flex-grow-1 pa-3 rounded-lg" :class="`bg-${(event.color || 'primary')}-light`">
              <span class="text-caption font-weight-bold d-block mb-1 text-high-emphasis opacity-80">
                {{ event.time }}
              </span>
              <span class="text-body-2 font-weight-bold d-block text-high-emphasis">
                {{ event.title }}
              </span>
              <span v-if="event.subtitle" class="text-caption text-medium-emphasis d-block mt-1">
                {{ event.subtitle }}
              </span>
            </div>
          </div>
        </VTimelineItem>
      </VTimeline>
    </div>
  </VCard>
</template>

<style lang="scss" scoped>
.action-hover:hover {
  text-decoration: underline;
}

.opacity-80 {
  opacity: 0.8;
}

/* Customizing Vuetify Timeline to make it very compact */
.v-timeline--custom-spacing {
  :deep(.v-timeline-item__body) {
    padding-inline-start: 1rem !important; /* Reduce gap between dot and card */
  }
  
  :deep(.v-timeline-divider__dot) {
    background: transparent !important;
  }
}

.timeline-event-card {
  transition: transform 0.2s ease, opacity 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
}
</style>
