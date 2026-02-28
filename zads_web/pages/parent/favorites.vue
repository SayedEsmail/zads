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
    <div>
        <VRow class="mb-6">
            <VCol cols="12">
                <h1 class="text-h4 mb-2 d-flex align-center gap-2">
                    {{ $t('FavoritesPage.MyFavorites❤️') }}
                    <VIcon icon="tabler-heart-filled" color="error" size="32" />
                </h1>
                <p class="text-body-1 text-secondary">
                    {{ $t('FavoritesPage.FavoritesDesc') }}
                </p>
            </VCol>
        </VRow>

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
        <VCard
            v-else-if="!store.favoriteTeachers.length"
            class="text-center py-12"
        >
            <VIcon
                size="64"
                icon="tabler-heart-off"
                color="secondary"
            />
            <h4 class="text-h6 mt-4">
                {{ $t('FavoritesPage.NoFavorites') }}
            </h4>
            <p class="text-body-2 text-secondary">
                {{ $t('FavoritesPage.NoFavoritesDesc') }}
            </p>
            <VBtn
                to="/parent"
                color="primary"
                class="mt-4"
            >
                {{ $t('FavoritesPage.BrowseTeachers') }}
            </VBtn>
        </VCard>

        <!-- Grid -->
        <VRow v-else>
            <VCol
                v-for="teacher in store.favoriteTeachers"
                :key="teacher.id"
                cols="12"
                sm="6"
                lg="4"
            >
                <TeacherCard
                    :teacher="{ ...teacher, isFavorite: true }"
                    @favorite="handleFavorite"
                    @contact="handleContact"
                />
            </VCol>
        </VRow>
    </div>
</template>
