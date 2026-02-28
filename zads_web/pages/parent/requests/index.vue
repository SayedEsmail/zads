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
        <VRow class="mb-6 align-center">
            <VCol cols="12" sm="8">
                <h1 class="text-h4 font-weight-bold d-flex align-center gap-2">
                    {{ $t('MyTutorRequests.Title') }}
                    <VIcon icon="tabler-clipboard-list" color="primary" />
                </h1>
                <p class="text-body-1 text-secondary mt-2">
                    {{ $t('RequestsPage.RequestsDesc') }}
                </p>
            </VCol>
            <VCol cols="12" sm="4" class="text-sm-end" v-if="activeTab === 'tutor-requests'">
                <VBtn color="primary" prepend-icon="tabler-plus" @click="openCreateDialog">
                    {{ $t('MyTutorRequests.CreateNew') }}
                </VBtn>
            </VCol>
            <VCol cols="12" sm="4" class="text-sm-end" v-else>
                <VBtn color="primary" prepend-icon="tabler-search" to="/parent">
                    {{ $t('RequestsPage.FindTeachersBtn') }}
                </VBtn>
            </VCol>
        </VRow>

        <VCard elevation="2" class="rounded-xl overflow-hidden mb-8">
            <VTabs
                v-model="activeTab"
                bg-color="primary"
                align-tabs="center"
                stacked
                class="text-white"
            >
                <VTab value="tutor-requests">
                    <VIcon icon="tabler-clipboard-text" class="mb-1" />
                    {{ $t('MyTutorRequests.Title') }}
                </VTab>
                <VTab value="contact-requests">
                    <VIcon icon="tabler-mail" class="mb-1" />
                    {{ $t('RequestsPage.ContactRequests📨') }}
                </VTab>
            </VTabs>
        </VCard>

        <VWindow v-model="activeTab" :touch="false">
            <!-- Tutor Requests Tab -->
            <VWindowItem value="tutor-requests">
                <VRow class="mb-6">
                    <VCol cols="12">
                        <VChipGroup v-model="tutorFilter" mandatory selected-class="bg-primary text-white" color="primary">
                            <VChip value="all" variant="outlined" class="font-weight-bold px-4 py-2">
                                {{ $t('All') }}
                                <v-badge inline color="primary-lighten-4" text-color="primary" :content="tutorStore.myRequests.length" class="ms-2 font-weight-bold" />
                            </VChip>
                            <VChip value="active" variant="outlined" class="font-weight-bold px-4 py-2">
                                {{ $t('MyTutorRequests.StatusActive') }}
                                <v-badge inline color="success-lighten-4" text-color="success" :content="activeTutorRequestsCount" class="ms-2 font-weight-bold" />
                            </VChip>
                            <VChip value="closed" variant="outlined" class="font-weight-bold px-4 py-2">
                                {{ $t('MyTutorRequests.StatusClosed') }}
                                <v-badge inline color="secondary-lighten-4" text-color="secondary" :content="closedTutorRequestsCount" class="ms-2 font-weight-bold" />
                            </VChip>
                        </VChipGroup>
                    </VCol>
                </VRow>

                <VRow v-if="tutorStore.loading && !tutorStore.myRequests.length" justify="center" class="py-12">
                    <VProgressCircular indeterminate color="primary" size="48" />
                </VRow>

                <VRow v-else-if="!filteredTutorRequests.length">
                    <VCol cols="12">
                        <VCard class="text-center py-12" border flat bg-color="transparent">
                            <VCardText>
                                <VIcon icon="tabler-clipboard-x" size="64" color="secondary" class="mb-4 opacity-50" />
                                <h6 class="text-h6 font-weight-medium mb-2">{{ tutorFilter === 'active' ? $t('MyTutorRequests.NoActiveRequests') : $t('MyTutorRequests.NoRequests') }}</h6>
                                <p class="text-secondary mb-4">{{ $t('MyTutorRequests.NoRequestsDesc') }}</p>
                                <VBtn color="primary" variant="outlined" @click="openCreateDialog">
                                    {{ $t('MyTutorRequests.CreateNew') }}
                                </VBtn>
                            </VCardText>
                        </VCard>
                    </VCol>
                </VRow>

                <VRow v-else>
                    <VCol v-for="request in filteredTutorRequests" :key="request.id" cols="12" md="6">
                        <VCard border flat class="h-100 d-flex flex-column rounded-xl" :class="{ 'opacity-70': request.status !== 'active' }">
                            <VCardItem class="pb-2">
                                <template #prepend>
                                    <VAvatar :color="getStatusColor(request.status)" variant="tonal" class="rounded-lg mr-3">
                                        <VIcon icon="tabler-book" />
                                    </VAvatar>
                                </template>
                                <VCardTitle class="text-h6 font-weight-bold">
                                    {{ request.subject?.nameAr }}
                                </VCardTitle>
                                <VCardSubtitle>
                                    {{ request.stage?.nameAr }}
                                </VCardSubtitle>
                                <template #append>
                                    <VChip size="small" :color="getStatusColor(request.status)" variant="elevated" class="text-uppercase font-weight-bold">
                                        {{ request.status === 'active' ? $t('MyTutorRequests.StatusActive') : $t('MyTutorRequests.StatusClosed') }}
                                    </VChip>
                                </template>
                            </VCardItem>

                            <VCardText class="flex-grow-1">
                                <div class="bg-grey-50 rounded-lg pa-3 mb-4 mt-2 border">
                                    <p class="text-body-2 mb-0 font-italic">
                                        "{{ request.description }}"
                                    </p>
                                </div>

                                <div class="d-flex align-center gap-4 text-caption text-secondary py-2 border-b mb-4">
                                    <span class="d-flex align-center gap-1">
                                        <VIcon icon="tabler-video" size="16" />
                                        {{ lessonTypes.find(lt => lt.value === request.preferredLessonType)?.title }}
                                    </span>
                                    <span class="d-flex align-center gap-1">
                                        <VIcon icon="tabler-currency-dollar" size="16" />
                                        {{ request.budgetMin || 0 }} - {{ request.budgetMax || '...' }} EGP
                                    </span>
                                </div>

                                <div class="d-flex align-center justify-space-between bg-primary-lighten-5 rounded-lg pa-3">
                                    <div class="d-flex align-center gap-2">
                                        <VIcon icon="tabler-mail-opened" color="primary" />
                                        <span class="font-weight-bold text-primary">{{ $t('MyTutorRequests.ContactCount') }}:</span>
                                    </div>
                                    <VChip color="primary" variant="flat" size="small" class="font-weight-bold">
                                        {{ request.contactCount || 0 }}
                                    </VChip>
                                </div>
                            </VCardText>

                            <VDivider />

                            <VCardActions class="px-4 py-3 justify-end gap-2">
                                <VBtn 
                                    v-if="request.status === 'active'" 
                                    color="warning" 
                                    variant="tonal" 
                                    size="small" 
                                    prepend-icon="tabler-lock"
                                    @click="closeRequest(request.id)"
                                >
                                    {{ $t('MyTutorRequests.Close') }}
                                </VBtn>
                                <VBtn 
                                    color="error" 
                                    variant="text" 
                                    size="small" 
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
                    class="mb-4"
                >
                    {{ contactStore.error }}
                    <template #append>
                        <VBtn variant="text" size="small" @click="contactStore.fetchMyRequests">
                            {{ $t('FavoritesPage.Retry') }}
                        </VBtn>
                    </template>
                </VAlert>

                <VCard v-else-if="!contactStore.requests.length" border flat bg-color="transparent" class="text-center py-12">
                    <VCardText>
                        <VIcon size="64" icon="tabler-mail-off" color="secondary" class="mb-4 opacity-50" />
                        <h4 class="text-h6 font-weight-medium mb-2">{{ $t('RequestsPage.NoRequests') }}</h4>
                        <p class="text-body-2 text-secondary mb-4">
                            {{ $t('RequestsPage.NoRequestsDesc') }}
                        </p>
                        <VBtn to="/parent" variant="outlined" color="primary">
                            {{ $t('RequestsPage.FindTeachersBtn') }}
                        </VBtn>
                    </VCardText>
                </VCard>

                <VRow v-else>
                    <VCol v-for="request in contactStore.requests" :key="request.id" cols="12" md="6">
                        <VCard border flat class="h-100 rounded-xl">
                            <VCardItem>
                                <template #prepend>
                                    <VAvatar size="48" :image="request.teacher?.user?.avatarUrl" color="primary">
                                        <span v-if="!request.teacher?.user?.avatarUrl">
                                            {{ request.teacher?.user?.name?.charAt(0) }}
                                        </span>
                                    </VAvatar>
                                </template>

                                <VCardTitle class="font-weight-bold">
                                    {{ request.teacher?.user?.name }}
                                </VCardTitle>
                                <VCardSubtitle>
                                    {{ new Date(request.createdAt).toLocaleDateString('ar-EG') }}
                                </VCardSubtitle>

                                <template #append>
                                    <VChip :color="contactStatusColors[request.status]" variant="elevated" size="small" class="text-capitalize font-weight-bold">
                                        {{ contactStatusLabels[request.status] || request.status }}
                                    </VChip>
                                </template>
                            </VCardItem>

                            <VCardText>
                                <div class="d-flex align-center mb-3">
                                    <VIcon start icon="tabler-user" size="16" color="secondary" />
                                    <span class="text-body-2 font-weight-medium">
                                        {{ $t('RequestsPage.Student') }}: {{ request.child?.name }}
                                    </span>
                                    <VChip size="x-small" class="ms-2" variant="tonal" color="primary">
                                        {{ request.child?.stage?.nameAr }}
                                    </VChip>
                                </div>

                                <div v-if="request.message" class="bg-grey-50 pa-3 rounded-lg mb-3 border">
                                    <p class="text-caption text-secondary mb-1 font-weight-bold">
                                        {{ $t('RequestsPage.YourMessage') }}
                                    </p>
                                    <p class="text-body-2 mb-0 font-italic">
                                        "{{ request.message }}"
                                    </p>
                                </div>

                                <!-- Teacher Contact Info (if accepted) -->
                                <div
                                    v-if="request.status === 'accepted'"
                                    class="bg-success-subtle pa-3 rounded-lg border border-success d-flex flex-column flex-sm-row justify-space-between align-center gap-3 mt-4"
                                >
                                    <div>
                                        <div class="d-flex align-center mb-1">
                                            <VIcon start icon="tabler-phone" color="success" size="18" />
                                            <span class="text-body-2 font-weight-bold text-success">
                                                {{ request.teacher?.user?.phone }}
                                            </span>
                                        </div>
                                        <p class="text-caption text-success mb-0 font-weight-medium">
                                            {{ $t('RequestsPage.DirectContactMessage') }}
                                        </p>
                                    </div>
                                    <VBtn
                                        color="success"
                                        variant="elevated"
                                        prepend-icon="tabler-brand-whatsapp"
                                        class="text-white"
                                        @click="logWhatsAppClick(request.teacherId, request.teacher?.user?.phone)"
                                    >
                                        WhatsApp
                                    </VBtn>
                                </div>
                            </VCardText>
                        </VCard>
                    </VCol>
                </VRow>
            </VWindowItem>
        </VWindow>

        <!-- Create Request Dialog -->
        <VDialog v-model="isCreateDialogOpen" max-width="600">
            <VCard class="rounded-xl">
                <VCardTitle class="bg-primary text-white pa-4 d-flex justify-space-between align-center">
                    <span class="text-h6">{{ $t('MyTutorRequests.CreateNew') }}</span>
                    <VBtn icon="tabler-x" variant="text" size="small" @click="isCreateDialogOpen = false" />
                </VCardTitle>
                <VCardText class="pa-6">
                    <VForm ref="newRequestForm" @submit.prevent="submitRequest">
                        <VRow>
                            <VCol cols="12" md="6">
                                <VSelect
                                    v-model="newRequest.subjectId"
                                    :items="searchStore.subjects"
                                    item-title="nameAr"
                                    item-value="id"
                                    :label="$t('CompleteProfile.SelectSubjects')"
                                    :rules="[v => !!v || 'Required']"
                                    variant="outlined"
                                    prepend-inner-icon="tabler-book"
                                />
                            </VCol>
                            <VCol cols="12" md="6">
                                <VSelect
                                    v-model="newRequest.stageId"
                                    :items="searchStore.stages"
                                    item-title="nameAr"
                                    item-value="id"
                                    :label="$t('CompleteProfile.EducationalStage')"
                                    :rules="[v => !!v || 'Required']"
                                    variant="outlined"
                                    prepend-inner-icon="tabler-school"
                                />
                            </VCol>
                            <VCol cols="12">
                                <VTextarea
                                    v-model="newRequest.description"
                                    :label="$t('MyTutorRequests.DescriptionLabel')"
                                    :rules="[v => !!v || 'Required']"
                                    variant="outlined"
                                    rows="3"
                                    prepend-inner-icon="tabler-align-left"
                                    :placeholder="$t('MyTutorRequests.DescriptionPlaceholder')"
                                />
                            </VCol>
                            <VCol cols="12">
                                <VLabel class="mb-2">{{ $t('MyTutorRequests.PreferredLessonType') }}</VLabel>
                                <VChipGroup v-model="newRequest.preferredLessonType" color="primary" mandatory>
                                    <VChip v-for="lt in lessonTypes" :key="lt.value" :value="lt.value" label>
                                        {{ lt.title }}
                                    </VChip>
                                </VChipGroup>
                            </VCol>
                            <VCol cols="12" md="6">
                                <VTextField
                                    v-model="newRequest.budgetMin"
                                    :label="$t('MyTutorRequests.BudgetMin')"
                                    type="number"
                                    variant="outlined"
                                    prepend-inner-icon="tabler-currency-dollar"
                                />
                            </VCol>
                            <VCol cols="12" md="6">
                                <VTextField
                                    v-model="newRequest.budgetMax"
                                    :label="$t('MyTutorRequests.BudgetMax')"
                                    type="number"
                                    variant="outlined"
                                    prepend-inner-icon="tabler-currency-dollar"
                                />
                            </VCol>
                        </VRow>
                    </VForm>
                </VCardText>
                <VCardActions class="pa-4 border-t bg-grey-50">
                    <VSpacer />
                    <VBtn color="secondary" variant="text" @click="isCreateDialogOpen = false">{{ $t('Cancel') }}</VBtn>
                    <VBtn color="primary" variant="elevated" :loading="isSubmitting" @click="submitRequest">{{ $t('MyTutorRequests.Submit') }}</VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </div>
</template>
