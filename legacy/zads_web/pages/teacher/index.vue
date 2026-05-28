<script setup>
import { useAuthStore } from '~/stores/auth'
import { useTeacherStore } from '~/stores/teacher'
import { useTutorRequestsStore } from '~/stores/tutorRequests'
import { useContactRequestsStore } from '~/stores/contactRequests'
import { useI18n } from 'vue-i18n'

import DashboardLayout from '~/layouts/components/DashboardLayout.vue'
import HeroBanner from '~/components/dashboard/HeroBanner.vue'
import StatWidget from '~/components/dashboard/StatWidget.vue'
import QuickProfileCard from '~/components/dashboard/QuickProfileCard.vue'
import ScheduleTimeline from '~/components/dashboard/ScheduleTimeline.vue'
import TutorRequestCard from '~/components/TutorRequestCard.vue'

// Import missing image
// import teacherDashboardIllustration from '@images/illustrations/teacher-dashboard.png'

definePageMeta({
  layout: 'blank', // Switch to new DashboardLayout
})

const authStore = useAuthStore()
const teacherStore = useTeacherStore()
const tutorRequestsStore = useTutorRequestsStore()
const contactRequestsStore = useContactRequestsStore()
const { t } = useI18n()

onMounted(async () => {
  await Promise.all([
    teacherStore.fetchProfile(),
    teacherStore.fetchStats(),
    contactRequestsStore.fetchIncomingRequests(),
  ])
  
  if (teacherStore.profile?.areaId) {
    tutorRequestsStore.filters.areaId = teacherStore.profile.areaId
  }
  // Fetch 1st page of requests in their area to display in the dashboard
  await tutorRequestsStore.fetchTutorRequests(1)
})

const userFirstName = computed(() => {
  return authStore.user?.name?.split(' ')[0] || t('Visitor')
})

const stats = computed(() => teacherStore.stats || {
  views: 0,
  rating: 0,
  ratingCount: 0,
  contactRequests: 0,
})

const teacherStats = computed(() => [
  { label: t('TeacherDashboard.TotalViews') || 'Views', value: stats.value.views, icon: 'tabler-eye', color: 'info' },
  { label: t('TeacherDashboard.ContactRequests') || 'Messages', value: stats.value.contactRequests, icon: 'tabler-message', color: 'success' },
  { label: t('TeacherDashboard.Opportunities') || 'Opportunities', value: tutorRequestsStore.pagination.total || tutorRequestsStore.requests.length, icon: 'tabler-school', color: 'warning' },
  { label: 'Rating', value: `${stats.value.rating}/5`, icon: 'tabler-star', color: 'primary' },
])

const recentMessages = computed(() => {
    if (!contactRequestsStore.requests.length) return []
    return contactRequestsStore.requests.slice(0, 3).map(req => ({
        time: new Date(req.createdAt).toLocaleDateString(),
        title: req.message ? (req.message.substring(0, 20) + '...') : (t('Message') || 'Message'),
        subtitle: req.parent?.user?.name || (t('Parent') || 'Parent'),
        color: 'primary',
        isDone: req.status === 'replied' || req.status === 'accepted'
    }))
})

const editProfile = () => {
  navigateTo('/teacher/profile')
}
</script>

<template>
  <DashboardLayout>
    
    <!-- Hero Banner -->
    <HeroBanner
      :title="`${$t('Welcome')} ${userFirstName} 👋`"
      :subtitle="$t('TeacherDashboard.CompleteProfileDesc') || 'Complete your profile to appear to students'"
      :button-text="$t('TeacherDashboard.EditProfile') || 'Edit Profile'"
      :button-action="editProfile"
      bg-color="info-light"
    />

    <!-- Quick Stats Grid -->
    <VRow class="mb-6" dense>
      <VCol v-for="stat in teacherStats" :key="stat.label" cols="6" md="3">
        <StatWidget
          :icon="stat.icon"
          :color="stat.color"
          :value="stat.value"
          :label="stat.label"
        />
      </VCol>
    </VRow>

    <!-- Students Requests in Area -->
    <div class="mb-4 d-flex align-center justify-space-between">
      <h3 class="text-h5 font-weight-bold">{{ $t('TeacherDashboard.RequestsInYourArea') || 'Local Requests' }}</h3>
      <VBtn variant="tonal" color="primary" size="small" to="/teacher/requests">{{ $t('ViewAll') }}</VBtn>
    </div>

    <div v-if="tutorRequestsStore.loading && !tutorRequestsStore.requests.length" class="text-center py-6">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <div v-else-if="!tutorRequestsStore.requests.length" class="text-center pa-10 bg-surface rounded-xl border opacity-70">
      <VIcon icon="tabler-school-off" size="48" color="secondary" class="mb-3 opacity-50" />
      <h3 class="text-body-1 font-weight-bold text-secondary">{{ $t('TeacherDashboard.NoRequestsInArea') || 'No new requests in your area' }}</h3>
    </div>

    <div v-else class="d-flex flex-column gap-3 mb-8">
      <TutorRequestCard
        v-for="request in tutorRequestsStore.requests.slice(0, 5)"
        :key="request.id"
        :request="request"
        :compact="true"
        @click="$router.push('/teacher/requests')"
      />
    </div>

    <!-- Right Sidebar Content Injection -->
    <template #right-sidebar>
      <QuickProfileCard
        :user-name="authStore.user?.name || 'Teacher Profile'"
        :user-role="$t('Teacher')"
        :stats="[
          { label: 'Rating', value: `${stats.rating}/5`, icon: 'tabler-star' },
          { label: 'Views', value: stats.views, icon: 'tabler-eye' }
        ]"
        class="mb-6 border-0 shadow-none bg-transparent px-0"
        @edit="editProfile"
      />
      
      <VDivider class="mb-6" />

      <!-- Quick Action Buttons -->
      <div class="d-flex flex-column gap-3 mb-8">
        <VBtn variant="tonal" color="primary" block class="justify-start font-weight-medium" to="/teacher/subjects">
          <VIcon icon="tabler-books" start class="text-primary opacity-70" />
          {{ $t('TeacherDashboard.ManageSubjects') || 'Manage Subjects' }}
        </VBtn>
        <VBtn variant="tonal" color="secondary" block class="justify-start font-weight-medium" to="/teacher/profile">
          <VIcon icon="tabler-map-pin" start class="text-secondary opacity-70" />
          {{ $t('TeacherDashboard.FilterLocation') || 'Update Location' }}
        </VBtn>
      </div>

      <VDivider class="mb-6" />

      <!-- Timeline Widget -->
      <ScheduleTimeline
        v-if="recentMessages.length"
        :title="$t('ContactRequests.RecentMessages') || 'Recent Messages'"
        :events="recentMessages"
        class="px-0"
      />
      <div v-else class="text-center text-medium-emphasis mt-8 px-4">
          <VIcon icon="tabler-message-off" size="48" class="mb-2 opacity-50" />
          <p>{{ $t('ContactRequests.NoRecentActivity') || 'No recent activity' }}</p>
      </div>
    </template>

  </DashboardLayout>
</template>
