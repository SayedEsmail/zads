<script setup>
import { useSnackbar } from '~/composables/useSnackbar'

const snackbar = useSnackbar()
</script>

<template>
  <VSnackbar
    v-model="snackbar.isVisible.value"
    :color="snackbar.color.value"
    location="top end"
    :timeout="3000"
  >
    {{ snackbar.message.value }}

    <template #actions>
      <VBtn
        variant="text"
        icon="tabler-x"
        @click="snackbar.isVisible.value = false"
      />
    </template>
  </VSnackbar>
</template>
