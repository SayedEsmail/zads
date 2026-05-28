<script setup>
const props = defineProps({
  userName: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  userAvatar: {
    type: String,
    default: '',
  },
  // Stats format: [{ label: 'Days Streak', value: '54', icon: 'tabler-flame', color: 'warning' }]
  stats: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['edit'])
</script>

<template>
  <VCard class="pa-5 text-center dashboard-profile-card">
    <!-- Avatar Section -->
    <VAvatar
      size="80"
      color="primary-light"
      variant="tonal"
      class="mb-4 profile-avatar-ring"
    >
      <VImg v-if="userAvatar" :src="userAvatar" />
      <span v-else class="text-h4 font-weight-bold text-primary">
        {{ userName.charAt(0).toUpperCase() }}
      </span>
      
      <!-- Online Badge overlay -->
      <VBadge
        dot
        location="bottom right"
        offset-x="3"
        offset-y="3"
        color="success"
        bordered
      />
    </VAvatar>

    <!-- User Info -->
    <h5 class="text-h5 font-weight-bold mb-1 text-high-emphasis">
      {{ userName }}
    </h5>
    
    <span class="text-body-2 text-medium-emphasis mb-4 d-block">
      {{ userRole }}
    </span>

    <VBtn
      variant="tonal"
      color="secondary"
      size="small"
      rounded="pill"
      class="px-4 mb-6 font-weight-medium"
      @click="emit('edit')"
    >
      Edit Profile
    </VBtn>

    <VDivider v-if="stats.length" class="mb-5" />

    <!-- Optional Quick Stats Row -->
    <div v-if="stats.length" class="d-flex justify-space-around px-2">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="d-flex flex-column align-center"
      >
        <div class="d-flex align-center gap-1 mb-1">
          <VIcon v-if="stat.icon" :icon="stat.icon" :color="stat.color || 'primary'" size="18" />
          <span class="text-h6 font-weight-bold mb-0 lh-1">{{ stat.value }}</span>
        </div>
        <span class="text-caption text-medium-emphasis">{{ stat.label }}</span>
      </div>
    </div>
  </VCard>
</template>

<style scoped>
.profile-avatar-ring {
  border: 2px solid rgb(var(--v-theme-surface));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}
.lh-1 {
  line-height: 1;
}
</style>
