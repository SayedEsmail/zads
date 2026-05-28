<script setup>
import { useSearchStore } from '~/stores/search'

const searchStore = useSearchStore()

const handleSubjectClick = (subjectId) => {
    searchStore.filters.subjectId = subjectId
    searchStore.searchTeachers(1)
    searchStore.closeSubjectsDialog()
}
</script>

<template>
    <VDialog
        v-model="searchStore.isSubjectsDialogOpen"
        max-width="600"
        scrollable
    >
        <VCard rounded="xl">
            <VCardItem class="pb-2">
                <VCardTitle class="text-h6 font-weight-bold">{{ $t('Subjects') }}</VCardTitle>
                <template #append>
                    <VBtn icon="tabler-x" variant="text" @click="searchStore.closeSubjectsDialog()" />
                </template>
            </VCardItem>
            
            <VDivider />

            <VCardText class="pa-4">
                <VRow dense>
                    <VCol
                        v-for="subject in searchStore.subjects"
                        :key="subject.id"
                        cols="12"
                        sm="6"
                    >
                        <VCard
                            flat
                            border
                            class="pa-4 rounded-xl cursor-copy d-flex align-center gap-3 transition-all"
                            :class="{ 'border-primary bg-primary-lighten-5': searchStore.filters.subjectId === subject.id }"
                            @click="handleSubjectClick(subject.id)"
                        >
                            <VIcon icon="tabler-book" :color="searchStore.filters.subjectId === subject.id ? 'primary' : 'secondary'" />
                            <span class="text-body-1 font-weight-medium">{{ subject.nameAr }}</span>
                        </VCard>
                    </VCol>
                </VRow>
            </VCardText>
        </VCard>
    </VDialog>
</template>

<style lang="scss" scoped>
.transition-all {
    transition: all 0.2s ease;
    &:hover {
        border-color: rgba(var(--v-theme-primary), 0.5) !important;
        background-color: rgba(var(--v-theme-primary), 0.02) !important;
    }
}
.primary-lighten-5 {
    background-color: rgba(var(--v-theme-primary), 0.05) !important;
}
</style>
