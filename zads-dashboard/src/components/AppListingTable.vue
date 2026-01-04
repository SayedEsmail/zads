<script setup>
import api from '@/services/api'

const props = defineProps({
    // Table configuration
    headers: {
        type: Array,
        required: true,
    },
    apiUrl: {
        type: String,
        required: true,
    },
    resource: {
        type: String,
        required: true,
    },

    // Filters configuration
    filters: {
        type: Array,
        default: () => [],
    },

    // Actions configuration
    singleActions: {
        type: Array,
        default: () => [],
    },
    bulkActions: {
        type: Array,
        default: () => [],
    },

    // Additional options
    showSelect: {
        type: Boolean,
        default: false,
    },
    searchable: {
        type: Boolean,
        default: true,
    },
    searchPlaceholder: {
        type: String,
        default: 'بحث...',
    },
})

const emit = defineEmits(['action', 'update:modelValue'])

// Expose methods via ref
defineExpose({
    refresh: fetchData,
})

// State
const items = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedRows = defineModel({ default: () => [] })

// Filter values (dynamic based on props.filters)
const filterValues = ref({})

// Initialize filter values
props.filters.forEach(filter => {
    filterValues.value[filter.key] = null
})

// Pagination
const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)

// Fetch data from API
async function fetchData() {
    try {
        loading.value = true

        const params = {
            page: page.value,
            limit: itemsPerPage.value,
        }

        // Add search
        if (searchQuery.value)
            params.search = searchQuery.value

        // Add filter values
        Object.keys(filterValues.value).forEach(key => {
            if (filterValues.value[key] !== null && filterValues.value[key] !== undefined)
                params[key] = filterValues.value[key]
        })

        const response = await api.get(props.apiUrl, { params })

        items.value = response.data
        totalItems.value = response.pagination?.total || 0
    }
    catch (error) {
        console.error(`Failed to fetch ${props.resource}:`, error)
    }
    finally {
        loading.value = false
    }
}

// Watch for filter changes
watch([searchQuery, filterValues], () => {
    page.value = 1
    fetchData()
}, { deep: true })

watch([page, itemsPerPage], () => {
    fetchData()
})

onMounted(() => {
    fetchData()
})

// Handle single action
const handleSingleAction = (action, item) => {
    emit('action', { type: action.key, item })
}

// Handle bulk action
const handleBulkAction = action => {
    emit('action', { type: action.key, items: selectedRows.value })
}
</script>

<template>
    <div>
        <!-- Filters Card -->
        <VCard class="mb-6">
            <VCardText>
                <VRow>
                    <!-- Search Field -->
                    <VCol
                        v-if="searchable"
                        cols="12"
                        :md="filters.length > 0 ? 4 : 6"
                    >
                        <AppTextField
                            v-model="searchQuery"
                            label="بحث"
                            :placeholder="searchPlaceholder"
                            prepend-inner-icon="tabler-search"
                            clearable
                            density="compact"
                        />
                    </VCol>

                    <!-- Dynamic Filters -->
                    <VCol
                        v-for="filter in filters"
                        :key="filter.key"
                        cols="12"
                        :md="filter.cols || 3"
                    >
                        <AppSelect
                            v-if="filter.type === 'select'"
                            v-model="filterValues[filter.key]"
                            :items="filter.options"
                            :label="filter.label"
                            density="compact"
                            clearable
                        />
                        <AppTextField
                            v-else
                            v-model="filterValues[filter.key]"
                            :label="filter.label"
                            density="compact"
                            clearable
                        />
                    </VCol>

                    <!-- Refresh Button -->
                    <VCol
                        cols="12"
                        md="2"
                        class="d-flex align-center"
                    >
                        <VBtn
                            color="primary"
                            variant="tonal"
                            prepend-icon="tabler-refresh"
                            :loading="loading"
                            @click="fetchData"
                        >
                            تحديث
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
        </VCard>

        <!-- Bulk Actions Bar -->
        <VCard
            v-if="showSelect && selectedRows.length > 0 && bulkActions.length > 0"
            class="mb-4"
        >
            <VCardText class="d-flex align-center gap-4">
                <span class="text-body-1">
                    تم تحديد {{ selectedRows.length }} عنصر
                </span>
                <VSpacer />
                <div class="d-flex gap-2">
                    <VBtn
                        v-for="action in bulkActions"
                        :key="action.key"
                        :color="action.color || 'primary'"
                        variant="tonal"
                        size="small"
                        :prepend-icon="action.icon"
                        @click="handleBulkAction(action)"
                    >
                        {{ action.label }}
                    </VBtn>
                </div>
            </VCardText>
        </VCard>

        <!-- Data Table -->
        <VCard>
            <VDataTableServer
                v-model="selectedRows"
                v-model:page="page"
                v-model:items-per-page="itemsPerPage"
                :headers="headers"
                :items="items"
                :items-length="totalItems"
                :loading="loading"
                :show-select="showSelect"
                class="text-no-wrap"
                item-value="id"
            >
                <!-- Pass through all slots -->
                <template
                    v-for="(_, slotName) in $slots"
                    :key="slotName"
                    #[slotName]="slotProps"
                >
                    <slot
                        :name="slotName"
                        v-bind="slotProps"
                    />
                </template>

                <!-- Default Actions Column -->
                <template
                    v-if="singleActions.length > 0"
                    #item.actions="{ item }"
                >
                    <div class="d-flex gap-1">
                        <template
                            v-for="action in singleActions"
                            :key="action.key"
                        >
                            <VBtn
                                v-if="!action.condition || action.condition(item)"
                                icon
                                variant="text"
                                size="small"
                                :color="action.color || 'primary'"
                                @click="handleSingleAction(action, item)"
                            >
                                <VIcon :icon="action.icon" />
                                <VTooltip activator="parent">
                                    {{ action.label }}
                                </VTooltip>
                            </VBtn>
                        </template>
                    </div>
                </template>
            </VDataTableServer>
        </VCard>
    </div>
</template>
