<script setup>
import { useContactRequestsStore } from '~/stores/contactRequests'
import { useTutorRequestsStore } from '~/stores/tutorRequests'
import { useSearchStore } from '~/stores/search'
import { useAnalytics } from '~/composables/useAnalytics'
import { useSnackbar } from '~/composables/useSnackbar'
import { useI18n } from 'vue-i18n'

definePageMeta({
    layout: 'default',
    middleware: ['auth'],
})

const contactStore = useContactRequestsStore()
const tutorStore = useTutorRequestsStore()
const searchStore = useSearchStore()
const { logWhatsAppClick } = useAnalytics()
const { t } = useI18n()
const snackbar = useSnackbar()

const activeTab = ref('tutor-requests')
const tutorFilter = ref('all') // 'all', 'active', 'closed'

// Tutor Requests Actions & State
const isCreateDialogOpen = ref(false)
const isSubmitting = ref(false)
const newRequestForm = ref(null)

const newRequest = ref({
    subjectId: null,
    stageId: null,
    description: '',
    preferredLessonType: 'both',
    budgetMin: null,
    budgetMax: null,
})

const lessonTypes = [
    { title: t('Online'), value: 'online' },
    { title: t('InPerson'), value: 'offline' },
    { title: t('OnlineInPerson'), value: 'both' },
]

onMounted(async () => {
    // Load initial data for both tabs
    contactStore.fetchMyRequests()
    await Promise.all([
        tutorStore.fetchMyRequests(),
        searchStore.fetchSubjects(),
        searchStore.fetchStages(),
    ])
})

// Tutor Request Computed
const filteredTutorRequests = computed(() => {
    if (tutorFilter.value === 'all') return tutorStore.myRequests
    return tutorStore.myRequests.filter(r => r.status === tutorFilter.value)
})

const activeTutorRequestsCount = computed(() => tutorStore.myRequests.filter(r => r.status === 'active').length)
const closedTutorRequestsCount = computed(() => tutorStore.myRequests.filter(r => r.status === 'closed').length)

// Tutor Request Methods
const openCreateDialog = () => {
    newRequest.value = {
        subjectId: null,
        stageId: null,
        description: '',
        preferredLessonType: 'both',
        budgetMin: null,
        budgetMax: null,
    }
    isCreateDialogOpen.value = true
}

const submitRequest = async () => {
    const { valid } = await newRequestForm.value.validate()
    if (!valid) return

    isSubmitting.value = true
    try {
        await tutorStore.createRequest(newRequest.value)
        snackbar.show(t('MyTutorRequests.CreatedSuccess'), 'success')
        isCreateDialogOpen.value = false
    } catch (error) {
        snackbar.show(t('General.Error'), 'error')
    } finally {
        isSubmitting.value = false
    }
}

const closeRequest = async (id) => {
    if (!confirm(t('MyTutorRequests.ConfirmClose'))) return
    try {
        await tutorStore.closeRequest(id)
        snackbar.show(t('MyTutorRequests.ClosedSuccess'), 'success')
    } catch (e) {
        snackbar.show(t('General.Error'), 'error')
    }
}

const deleteRequest = async (id) => {
    if (!confirm(t('MyTutorRequests.ConfirmDelete'))) return
    try {
        await tutorStore.deleteRequest(id)
        snackbar.show(t('MyTutorRequests.DeletedSuccess'), 'success')
    } catch (e) {
        snackbar.show(t('General.Error'), 'error')
    }
}

const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'secondary'
}

// Contact Requests Constants
const contactStatusColors = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error',
}

const contactStatusLabels = {
    pending: t('RequestsPage.Pending'),
    accepted: t('RequestsPage.Accepted'),
    rejected: t('RequestsPage.Rejected'),
}
</script>

<template>
    <div class="parent-requests-page">
        <!-- Premium Header Section -->
        <PremiumPageHeader
            :title="$t('MyTutorRequests.Title')"
            :description="$t('RequestsPage.RequestsDesc')"
        >
            <template #actions>
                <VBtn
                    v-if="activeTab === 'tutor-requests'"
                    color="primary"
                    size="large"
                    prepend-icon="tabler-plus"
                    class="px-8 font-weight-bold"
                    @click="openCreateDialog"
                >
                    {{ $t('MyTutorRequests.CreateNew') }}
                </VBtn>
                <VBtn
                    v-else
                    color="primary"
                    size="large"
                    prepend-icon="tabler-search"
                    class="px-8 font-weight-bold"
                    to="/parent"
                >
                    {{ $t('RequestsPage.FindTeachersBtn') }}
                </VBtn>
            </template>
        </PremiumPageHeader>

        <VContainer>
        <!-- Integrated Tab System -->
        <div class="tabs-container mb-8">
            <VTabs
                v-model="activeTab"
                color="primary"
                grow
                class="premium-tabs rounded-xl border pa-1"
                hide-slider
            >
                <VTab
                    value="tutor-requests"
                    class="rounded-lg transition-all"
                    selected-class="bg-primary text-white elevation-4"
                >
                    <VIcon icon="tabler-clipboard-text" class="me-2" />
                    <span class="font-weight-bold">{{ $t('MyTutorRequests.Title') }}</span>
                </VTab>
                <VTab
                    value="contact-requests"
                    class="rounded-lg transition-all"
                    selected-class="bg-primary text-white elevation-4"
                >
                    <VIcon icon="tabler-mail" class="me-2" />
                    <span class="font-weight-bold">{{ $t('RequestsPage.ContactRequests📨') }}</span>
                </VTab>
            </VTabs>
        </div>

        <VWindow v-model="activeTab" :touch="false">
            <!-- Tutor Requests Tab -->
            <VWindowItem value="tutor-requests">
                <div class="filters-chips-container mb-6 overflow-x-auto pb-2">
                    <VChipGroup v-model="tutorFilter" mandatory selected-class="bg-primary text-white" color="primary">
                        <VChip value="all" variant="flat" class="font-weight-bold px-4 rounded-lg border">
                            {{ $t('All') }}
                            <v-badge inline color="primary-lighten-4" text-color="primary" :content="tutorStore.myRequests.length" class="ms-2" />
                        </VChip>
                        <VChip value="active" variant="flat" class="font-weight-bold px-4 rounded-lg border">
                            {{ $t('MyTutorRequests.StatusActive') }}
                            <v-badge inline color="success-lighten-4" text-color="success" :content="activeTutorRequestsCount" class="ms-2" />
                        </VChip>
                        <VChip value="closed" variant="flat" class="font-weight-bold px-4 rounded-lg border">
                            {{ $t('MyTutorRequests.StatusClosed') }}
                            <v-badge inline color="secondary-lighten-4" text-color="secondary" :content="closedTutorRequestsCount" class="ms-2" />
                        </VChip>
                    </VChipGroup>
                </div>

                <VRow v-if="tutorStore.loading && !tutorStore.myRequests.length" justify="center" class="py-12">
                    <VProgressCircular indeterminate color="primary" size="48" />
                </VRow>

                <div v-else-if="!filteredTutorRequests.length" class="text-center py-16 bg-surface rounded-xl border-dashed border-2 opacity-80 empty-state-premium">
                    <VIcon
                        size="64"
                        icon="tabler-clipboard-x"
                        color="secondary"
                        class="mb-4 opacity-20"
                    />
                    <h4 class="text-h5 font-weight-bold mb-2 text-high-emphasis">
                        {{ tutorFilter === 'active' ? $t('MyTutorRequests.NoActiveRequests') : $t('MyTutorRequests.NoRequests') }}
                    </h4>
                    <p class="text-body-1 text-secondary mb-8">
                        {{ $t('MyTutorRequests.NoRequestsDesc') }}
                    </p>
                    <VBtn
                        color="primary"
                        size="large"
                        variant="tonal"
                        class="rounded-pill px-10"
                        @click="openCreateDialog"
                    >
                        {{ $t('MyTutorRequests.CreateNew') }}
                    </VBtn>
                </div>

                <VRow v-else>
                    <VCol v-for="request in filteredTutorRequests" :key="request.id" cols="12" md="6">
                        <VCard class="h-100 d-flex flex-column" :class="{ 'inactive-request': request.status !== 'active' }">
                            <VCardItem class="pb-2">
                                <template #prepend>
                                    <VAvatar :color="getStatusColor(request.status)" variant="tonal" size="48" class="rounded-xl">
                                        <VIcon icon="tabler-book" size="24" />
                                    </VAvatar>
                                </template>
                                <VCardTitle class="text-h6 font-weight-bold text-high-emphasis">
                                    {{ request.subject?.nameAr }}
                                </VCardTitle>
                                <VCardSubtitle class="text-primary font-weight-medium">
                                    {{ request.stage?.nameAr }}
                                </VCardSubtitle>
                                <template #append>
                                    <VChip size="small" :color="getStatusColor(request.status)" variant="flat" class="rounded-lg font-weight-bold px-3">
                                        {{ request.status === 'active' ? $t('MyTutorRequests.StatusActive') : $t('MyTutorRequests.StatusClosed') }}
                                    </VChip>
                                </template>
                            </VCardItem>

                            <VCardText class="flex-grow-1 pt-4">
                                <div class="bg-primary-lighten-5 rounded-xl pa-4 mb-4 border-dashed border-primary">
                                    <p class="text-body-2 mb-0 font-weight-medium line-height-relaxed">
                                        "{{ request.description }}"
                                    </p>
                                </div>

                                <div class="d-flex align-center flex-wrap gap-x-6 gap-y-3 text-caption text-secondary mb-6 px-1">
                                    <div class="d-flex align-center gap-2">
                                        <VIcon icon="tabler-video" size="18" color="primary" />
                                        <span class="font-weight-bold">{{ lessonTypes.find(lt => lt.value === request.preferredLessonType)?.title }}</span>
                                    </div>
                                    <div class="d-flex align-center gap-2">
                                        <VIcon icon="tabler-currency-dollar" size="18" color="primary" />
                                        <span class="font-weight-bold text-high-emphasis">{{ request.budgetMin || 0 }} - {{ request.budgetMax || '...' }} EGP</span>
                                    </div>
                                </div>

                                <div class="d-flex align-center justify-space-between bg-secondary-light rounded-xl pa-4">
                                    <div class="d-flex align-center gap-3">
                                        <VIcon icon="tabler-users" color="secondary" size="24" />
                                        <div>
                                            <div class="text-caption font-weight-bold text-secondary uppercase tracking-wider">{{ $t('MyTutorRequests.ContactCount') }}</div>
                                            <div class="text-h6 font-weight-black text-secondary line-height-1">
                                                {{ request.contactCount || 0 }} <span class="text-body-2">{{ $t('Teachers') || 'معلمين' }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <VIcon icon="tabler-chevron-left" class="text-secondary opacity-30" />
                                </div>
                            </VCardText>

                            <VDivider opacity="0.1" />

                            <VCardActions class="px-6 py-4 justify-end gap-3">
                                <VBtn 
                                    v-if="request.status === 'active'" 
                                    color="warning" 
                                    variant="tonal" 
                                    class="rounded-pill font-weight-bold"
                                    prepend-icon="tabler-lock"
                                    @click="closeRequest(request.id)"
                                >
                                    {{ $t('MyTutorRequests.Close') }}
                                </VBtn>
                                <VBtn 
                                    color="error" 
                                    variant="text" 
                                    class="rounded-pill font-weight-bold"
                                    prepend-icon="tabler-trash"
                                    @click="deleteRequest(request.id)"
                                >
                                    {{ $t('CompleteProfile.Remove') }}
                                </VBtn>
                            </VCardActions>
                        </VCard>
                    </VCol>
                </VRow>
            </VWindowItem>

            <!-- Contact Requests Tab -->
            <VWindowItem value="contact-requests">
                <div v-if="contactStore.loading" class="d-flex justify-center py-12">
                    <VProgressCircular indeterminate color="primary" size="48" />
                </div>

                <VAlert
                    v-else-if="contactStore.error"
                    color="error"
                    variant="tonal"
                    class="mb-6 rounded-xl"
                >
                    {{ contactStore.error }}
                    <template #append>
                        <VBtn variant="text" size="small" @click="contactStore.fetchMyRequests">
                            {{ $t('FavoritesPage.Retry') }}
                        </VBtn>
                    </template>
                </VAlert>

                <div v-else-if="!contactStore.requests.length" class="text-center py-16 bg-surface rounded-xl border-dashed border-2 opacity-80 empty-state-premium">
                    <VIcon
                        size="64"
                        icon="tabler-mail-off"
                        color="secondary"
                        class="mb-4 opacity-20"
                    />
                    <h4 class="text-h5 font-weight-bold mb-2 text-high-emphasis">
                        {{ $t('RequestsPage.NoRequests') }}
                    </h4>
                    <p class="text-body-1 text-secondary mb-8">
                        {{ $t('RequestsPage.NoRequestsDesc') }}
                    </p>
                    <VBtn
                        to="/parent"
                        color="primary"
                        size="large"
                        variant="tonal"
                        class="rounded-pill px-10"
                    >
                        {{ $t('RequestsPage.FindTeachersBtn') }}
                    </VBtn>
                </div>

                <VRow v-else>
                    <VCol v-for="request in contactStore.requests" :key="request.id" cols="12" md="6">
                        <VCard class="contact-card h-100">
                            <VCardItem class="pb-2">
                                <template #prepend>
                                    <VAvatar
                                        size="56"
                                        :image="request.teacher?.user?.avatarUrl"
                                        color="primary"
                                        variant="tonal"
                                        class="rounded-xl border-2 border-white shadow-sm"
                                    >
                                        <span v-if="!request.teacher?.user?.avatarUrl" class="text-h6 font-weight-black">
                                            {{ request.teacher?.user?.name?.charAt(0) }}
                                        </span>
                                    </VAvatar>
                                </template>

                                <VCardTitle class="text-h6 font-weight-bold text-high-emphasis">
                                    {{ request.teacher?.user?.name }}
                                </VCardTitle>
                                <VCardSubtitle class="text-secondary font-weight-medium">
                                    {{ new Date(request.createdAt).toLocaleDateString('ar-EG') }}
                                </VCardSubtitle>

                                <template #append>
                                    <VChip :color="contactStatusColors[request.status]" variant="flat" size="small" class="font-weight-bold rounded-lg px-3">
                                        {{ contactStatusLabels[request.status] || request.status }}
                                    </VChip>
                                </template>
                            </VCardItem>

                            <VCardText class="pt-4">
                                <div class="d-flex align-center mb-4 text-high-emphasis">
                                    <VIcon start icon="tabler-school" size="18" color="primary" class="me-2" />
                                    <span class="text-body-2 font-weight-bold">
                                        {{ request.child?.name }}
                                    </span>
                                    <VChip size="x-small" class="ms-3 font-weight-bold rounded-pill" variant="tonal" color="primary">
                                        {{ request.child?.stage?.nameAr }}
                                    </VChip>
                                </div>

                                <div v-if="request.message" class="bg-primary-lighten-5 pa-4 rounded-xl mb-4 border-dashed border-primary">
                                    <p class="text-caption text-primary mb-1 font-weight-black text-uppercase tracking-wider">
                                        {{ $t('RequestsPage.YourMessage') }}
                                    </p>
                                    <p class="text-body-2 mb-0 font-weight-medium line-height-relaxed">
                                        "{{ request.message }}"
                                    </p>
                                </div>

                                <!-- Journey Tracker -->
                                <div class="journey-tracker my-6 px-2">
                                    <div class="tracker-line-container position-relative py-4">
                                        <div class="line shadow-sm"></div>
                                        <div class="d-flex justify-space-between align-center position-relative">
                                            <!-- Step 1: Sent -->
                                            <div class="step active done shadow-sm">
                                                <VIcon icon="tabler-send" size="14" color="white" />
                                            </div>
                                            <!-- Step 2: Evaluation -->
                                            <div class="step shadow-sm" :class="{ 'active': request.status !== 'pending', 'done': request.status === 'accepted' }">
                                                <VIcon :icon="request.status === 'rejected' ? 'tabler-x' : 'tabler-clock'" size="14" color="white" />
                                            </div>
                                            <!-- Step 3: Contact -->
                                            <div class="step shadow-sm" :class="{ 'active done bg-success': request.status === 'accepted' }">
                                                <VIcon icon="tabler-phone" size="14" color="white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-space-between text-caption font-weight-bold text-secondary px-0">
                                        <span>أُرسل</span>
                                        <span>المراجعة</span>
                                        <span>تواصل</span>
                                    </div>
                                </div>

                                <!-- Teacher Contact Info (if accepted) -->
                                <Transition name="scale-fade">
                                    <div
                                        v-if="request.status === 'accepted'"
                                        class="bg-success-subtle pa-4 rounded-xl border border-success border-opacity-25 d-flex flex-column gap-4 mt-6 elevation-1"
                                    >
                                        <div class="d-flex align-center justify-space-between">
                                            <div class="d-flex align-center">
                                                <VAvatar color="success" size="32" class="me-3">
                                                    <VIcon icon="tabler-phone-calling" color="white" size="18" />
                                                </VAvatar>
                                                <span class="text-body-1 font-weight-black text-success tracking-wider">
                                                    {{ request.teacher?.user?.phone }}
                                                </span>
                                            </div>
                                            <VBtn
                                                color="secondary"
                                                variant="flat"
                                                prepend-icon="tabler-brand-whatsapp"
                                                class="rounded-pill font-weight-bold px-6 shadow-secondary"
                                                @click="logWhatsAppClick(request.teacherId, request.teacher?.user?.phone)"
                                            >
                                                WhatsApp
                                            </VBtn>
                                        </div>
                                        <p class="text-caption text-success mb-0 font-weight-bold text-center opacity-80">
                                            {{ $t('RequestsPage.DirectContactMessage') }}
                                        </p>
                                    </div>
                                </Transition>
                            </VCardText>
                        </VCard>
                    </VCol>
                </VRow>
            </VWindowItem>
        </VWindow>

        <!-- Create Request Dialog -->
        <PremiumDialog
            v-model="isCreateDialogOpen"
            :title="$t('MyTutorRequests.CreateNew')"
            :loading="isSubmitting"
            :confirm-text="$t('MyTutorRequests.Submit')"
            @confirm="submitRequest"
            max-width="600"
        >
            <VForm ref="newRequestForm" @submit.prevent="submitRequest">
                <VRow>
                    <VCol cols="12" md="6">
                        <VLabel class="mb-2 text-caption font-weight-bold text-uppercase text-secondary">{{ $t('CompleteProfile.SelectSubjects') }} *</VLabel>
                        <VSelect
                            v-model="newRequest.subjectId"
                            :items="searchStore.subjects"
                            item-title="nameAr"
                            item-value="id"
                            :rules="[v => !!v || 'Required']"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="tabler-book"
                        />
                    </VCol>
                    <VCol cols="12" md="6">
                        <VLabel class="mb-2 text-caption font-weight-bold text-uppercase text-secondary">{{ $t('CompleteProfile.EducationalStage') }} *</VLabel>
                        <VSelect
                            v-model="newRequest.stageId"
                            :items="searchStore.stages"
                            item-title="nameAr"
                            item-value="id"
                            :rules="[v => !!v || 'Required']"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="tabler-school"
                        />
                    </VCol>
                    <VCol cols="12">
                        <VLabel class="mb-2 text-caption font-weight-bold text-uppercase text-secondary">{{ $t('MyTutorRequests.DescriptionLabel') }} *</VLabel>
                        <VTextarea
                            v-model="newRequest.description"
                            :rules="[v => !!v || 'Required']"
                            variant="outlined"
                            density="comfortable"
                            rows="3"
                            prepend-inner-icon="tabler-align-left"
                            :placeholder="$t('MyTutorRequests.DescriptionPlaceholder')"
                        />
                    </VCol>
                    <VCol cols="12">
                        <VLabel class="mb-2 text-caption font-weight-bold text-uppercase text-secondary">{{ $t('MyTutorRequests.PreferredLessonType') }}</VLabel>
                        <VChipGroup v-model="newRequest.preferredLessonType" color="primary" mandatory>
                            <VChip v-for="lt in lessonTypes" :key="lt.value" :value="lt.value" elevation="0" class="border">
                                {{ lt.title }}
                            </VChip>
                        </VChipGroup>
                    </VCol>
                    <VCol cols="12" md="6">
                        <VLabel class="mb-2 text-caption font-weight-bold text-uppercase text-secondary">{{ $t('MyTutorRequests.BudgetMin') }}</VLabel>
                        <VTextField
                            v-model="newRequest.budgetMin"
                            type="number"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="tabler-currency-dollar"
                        />
                    </VCol>
                    <VCol cols="12" md="6">
                        <VLabel class="mb-2 text-caption font-weight-bold text-uppercase text-secondary">{{ $t('MyTutorRequests.BudgetMax') }}</VLabel>
                        <VTextField
                            v-model="newRequest.budgetMax"
                            type="number"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="tabler-currency-dollar"
                        />
                    </VCol>
                </VRow>
            </VForm>
        </PremiumDialog>
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.parent-requests-page {

    .premium-tabs {
        background-color: #fff;
        height: 64px;

        :deep(.v-tabs-bar) {
            height: 100%;
        }

        .v-tab {
            text-transform: none;
            letter-spacing: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            margin: 4px;
            height: calc(100% - 8px);
            min-width: 160px;

            &:not(.v-tab--selected) {
                color: rgba(var(--v-theme-primary), 0.6);
            }
        }
    }

    .filters-chips-container {
        scrollbar-width: none;
        &::-webkit-scrollbar {
            display: none;
        }
    }

    .inactive-request {
        opacity: 0.8;
        filter: grayscale(0.2);
        background-color: #fcfcfc;
    }

    .journey-tracker {
        .tracker-line-container {
            .line {
                position: absolute;
                top: 50%;
                left: 10px;
                right: 10px;
                height: 4px;
                background: #eee;
                transform: translateY(-50%);
                border-radius: 2px;
                z-index: 0;

                &::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    height: 100%;
                    width: 0;
                    background: rgb(var(--v-theme-primary));
                    transition: width 0.6s ease;
                }
            }
        }

        .step {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #eee;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 4px solid #fff;

            &.active {
                background: rgb(var(--v-theme-primary));
                transform: scale(1.1);
            }

            &.done {
                background: rgb(var(--v-theme-primary));
            }
        }
    }

    .line-height-relaxed {
        line-height: 1.7;
    }

    .line-height-1 {
        line-height: 1;
    }

    .scale-fade-enter-active,
    .scale-fade-leave-active {
        transition: all 0.4s ease;
    }

    .scale-fade-enter-from,
    .scale-fade-leave-to {
        opacity: 0;
        transform: scale(0.95);
    }
}

// RTL fixes for journey tracker
[dir="rtl"] {
    .journey-tracker .tracker-line-container .line::after {
        right: 0;
        left: auto;
    }
}
</style>
