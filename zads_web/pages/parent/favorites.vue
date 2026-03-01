<script setup>
import { useFavoritesStore } from '~/stores/favorites'
import TeacherCard from '~/components/TeacherCard.vue'

definePageMeta({
    layout: 'default',
})

const store = useFavoritesStore()

// Initialize on mount
onMounted(() => {
    store.fetchFavorites()
})

const handleFavorite = async teacher => {
    await store.toggleFavorite(teacher.id)
}

const handleContact = teacher => {
    // Contact logic handled in TeacherCard via ContactRequestDialog
    // Optional: show success snackbar
}
</script>

<template>
    <div class="parent-favorites-page">
        <!-- Premium Header Section -->
        <PremiumPageHeader
            :title="$t('FavoritesPage.MyFavorites❤️')"
            :description="$t('FavoritesPage.FavoritesDesc')"
        >
            <template #actions>
                <VBtn
                    color="primary"
                    size="large"
                    prepend-icon="tabler-search"
                    class="px-8 rounded-pill font-weight-bold shadow-primary"
                    to="/parent"
                >
                    {{ $t('FavoritesPage.BrowseTeachers') }}
                </VBtn>
            </template>
        </PremiumPageHeader>

        <VContainer>
        <!-- Loading -->
        <div v-if="store.loading && !store.favorites.length" class="d-flex justify-center py-12">
            <VProgressCircular indeterminate color="primary" size="48" />
        </div>

        <!-- Error -->
        <VAlert
            v-else-if="store.error"
            color="error"
            variant="tonal"
            class="mb-4"
        >
            {{ store.error }}
            <template #append>
                <VBtn
                    variant="text"
                    size="small"
                    @click="store.fetchFavorites"
                >
                    {{ $t('FavoritesPage.Retry') }}
                </VBtn>
            </template>
        </VAlert>

        <!-- Empty State -->
        <div v-else-if="!store.favoriteTeachers.length" class="text-center py-16 bg-surface rounded-xl border-dashed border-2 opacity-80 empty-state-premium">
            <VIcon
                size="64"
                icon="tabler-heart-off"
                color="secondary"
                class="mb-4 opacity-20"
            />
            <h4 class="text-h5 font-weight-bold mb-2 text-high-emphasis">
                {{ $t('FavoritesPage.NoFavorites') }}
            </h4>
            <p class="text-body-1 text-secondary mb-8">
                {{ $t('FavoritesPage.NoFavoritesDesc') }}
            </p>
            <VBtn
                to="/parent"
                color="primary"
                size="large"
                variant="tonal"
                class="rounded-pill px-10"
            >
                {{ $t('FavoritesPage.BrowseTeachers') }}
            </VBtn>
        </div>

        <!-- Grid (Converted to Clean List) -->
        <VRow v-else class="teachers-list-premium">
            <VCol
                v-for="teacher in store.favoriteTeachers"
                :key="teacher.id"
                cols="12"
            >
                <TeacherCard
                    :teacher="{ ...teacher, isFavorite: true }"
                    @favorite="handleFavorite"
                    @contact="handleContact"
                />
            </VCol>
        </VRow>
        </VContainer>
    </div>
</template>

<style lang="scss" scoped>
.parent-favorites-page {

    .shadow-primary {
        box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.2) !important;
    }

    .teachers-list-premium {
        :deep(.teacher-card) {
            margin-bottom: 8px;
        }
    }

    .empty-state-premium {
        border-color: rgba(var(--v-theme-primary), 0.1) !important;
    }
}
</style>
