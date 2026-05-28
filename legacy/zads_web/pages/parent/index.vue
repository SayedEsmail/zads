<script setup>
import { useAuthStore } from '~/stores/auth'
import { useParentStore } from '~/stores/parent'
import { useI18n } from 'vue-i18n'

import DashboardLayout from '~/layouts/components/DashboardLayout.vue'
import HeroBanner from '~/components/dashboard/HeroBanner.vue'
import StatWidget from '~/components/dashboard/StatWidget.vue'
import CourseProgressCard from '~/components/dashboard/CourseProgressCard.vue'
import QuickProfileCard from '~/components/dashboard/QuickProfileCard.vue'
import ScheduleTimeline from '~/components/dashboard/ScheduleTimeline.vue'

import { useChildrenStore } from '~/stores/children'
import { useTutorRequestsStore } from '~/stores/tutorRequests'
import { useContactRequestsStore } from '~/stores/contactRequests'

import parentDashboardIllustration from '@images/illustrations/parent_dashboard.png'

definePageMeta({
  layout: 'blank', // We are using DashboardLayout as the root component now
})

const authStore = useAuthStore()
const parentStore = useParentStore()
const childrenStore = useChildrenStore()
const tutorRequestsStore = useTutorRequestsStore()
const contactRequestsStore = useContactRequestsStore()
const { t } = useI18n()

// Data fetching
onMounted(async () => {
  await Promise.all([
    parentStore.fetchProfile(),
    childrenStore.fetchChildren(),
    tutorRequestsStore.fetchMyRequests(),
    contactRequestsStore.fetchMyRequests()
  ])
})

const userFirstName = computed(() => {
  return authStore.user?.name?.split(' ')[0] || t('Visitor')
})

const dashboardStats = computed(() => [
  { label: t('Active Children'), value: childrenStore.children.length, icon: 'tabler-users', color: 'info' },
  { label: t('Active Requests'), value: tutorRequestsStore.myRequests.length, icon: 'tabler-file-check', color: 'success' },
  { label: t('Messages'), value: contactRequestsStore.requests.length, icon: 'tabler-message', color: 'error' },
])

const recentMessages = computed(() => {
    if (!contactRequestsStore.requests.length) return []
    return contactRequestsStore.requests.slice(0, 3).map(req => ({
        time: new Date(req.createdAt).toLocaleDateString(),
        title: req.message ? (req.message.substring(0, 20) + '...') : t('Message'),
        subtitle: req.teacher?.user?.name || t('Teacher'),
        color: 'primary',
        isDone: req.status === 'replied' || req.status === 'accepted'
    }))
})

const editProfile = () => {
    navigateTo('/parent/profile')
}
</script>

<template>
  <DashboardLayout>
    
    <!-- Hero Banner -->
    <HeroBanner
      :title="`${$t('Welcome')} ${userFirstName} 👋`"
      :subtitle="$t('FindTeachers')"
      :button-text="$t('MyRequests')"
      :button-action="() => navigateTo('/parent/requests')"
      :image-src="parentDashboardIllustration"
      bg-color="primary-light"
    />

    <!-- Quick Stats Grid -->
    <VRow class="mb-6" dense>
      <VCol v-for="stat in dashboardStats" :key="stat.label" cols="12" md="4">
        <StatWidget
          :icon="stat.icon"
          :color="stat.color"
          :value="stat.value"
          :label="stat.label"
        />
      </VCol>
    </VRow>

    <!-- Children Progress Feed -->
    <div class="mb-4 d-flex align-center justify-space-between">
      <h3 class="text-h5 font-weight-bold">{{ $t('Children Progress') }}</h3>
      <VBtn variant="tonal" color="primary" size="small" to="/parent/children">{{ $t('ViewAll') }}</VBtn>
    </div>

    <div v-for="child in childrenStore.children" :key="child.id" class="mb-8">
      <div class="d-flex align-center gap-3 mb-4">
        <VAvatar color="secondary-light" class="text-secondary font-weight-bold border">
          {{ child.name.charAt(0).toUpperCase() }}
        </VAvatar>
        <span class="text-h6 font-weight-bold">{{ child.name }}</span>
      </div>
      
      <VRow v-if="child.subjects && child.subjects.length">
        <VCol v-for="subject in child.subjects" :key="subject.id" cols="12" md="6" lg="4">
          <CourseProgressCard
            :title="subject.name"
            :subtitle="child.stage?.name || $t('Subjects.Assigned')"
            :progress="0"
            color="primary"
            :progress-text-left="$t('ParentChildren.NoRequestsYet')"
            progress-text-right=""
            :action-text="$t('Find Teachers')"
          />
        </VCol>
      </VRow>
      <div v-else class="text-medium-emphasis ms-2 mb-4">
          {{ $t('ParentChildren.NoSubjectsForChild') }}
      </div>
    </div>
    
    <div v-if="!childrenStore.children.length" class="text-center text-medium-emphasis mt-8 mb-8">
        {{ $t('ParentChildren.NoChildrenFound') }}
    </div>

    <!-- Right Sidebar Content Injection -->
    <template #right-sidebar>
      <QuickProfileCard
        :user-name="authStore.user?.name || 'Parent Profile'"
        :user-role="$t('Parent')"
        :stats="[
          { label: $t('ParentChildren.Children'), value: childrenStore.children.length, icon: 'tabler-users' },
          { label: $t('Requests'), value: tutorRequestsStore.myRequests.length, icon: 'tabler-mail' }
        ]"
        class="mb-6 border-0 shadow-none bg-transparent px-0"
        @edit="editProfile"
      />
      
      <VDivider class="mb-6" />

      <!-- Quick Action Buttons -->
      <div class="d-flex flex-column gap-3 mb-8">
        <VBtn variant="tonal" color="primary" block class="justify-start font-weight-medium" to="/parent/children">
          <VIcon icon="tabler-user-plus" start class="text-primary opacity-70" />
          {{ $t('Add Child') }}
        </VBtn>
        <VBtn variant="tonal" color="secondary" block class="justify-start font-weight-medium" to="/parent/index">
          <VIcon icon="tabler-search" start class="text-secondary opacity-70" />
          {{ $t('Find Teachers') }}
        </VBtn>
      </div>

      <VDivider class="mb-6" />

      <!-- Timeline Widget -->
      <ScheduleTimeline
        v-if="recentMessages.length"
        :title="$t('ContactRequests.RecentMessages')"
        :events="recentMessages"
        class="px-0"
      />
      <div v-else class="text-center text-medium-emphasis mt-8 px-4">
          <VIcon icon="tabler-message-off" size="48" class="mb-2 opacity-50" />
          <p>{{ $t('ContactRequests.NoRecentActivity') }}</p>
      </div>
    </template>

  </DashboardLayout>
</template>
