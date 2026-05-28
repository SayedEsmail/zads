<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  buttonText: {
    type: String,
    default: '',
  },
  buttonAction: {
    type: Function,
    default: () => {},
  },
  imageSrc: {
    type: String,
    default: '',
  },
  bgColor: {
    type: String,
    default: 'primary-light',
  },
})
</script>

<template>
  <VCard :class="`bg-${bgColor}`" elevation="0" rounded="xl" class="mb-6 overflow-hidden">
    <VRow no-gutters class="align-center">
      <!-- Text Content Area -->
      <VCol cols="12" sm="8" md="8" lg="9" class="pa-6 pa-md-8">
        <h2 class="text-h4 font-weight-bold mb-2 text-primary">
          {{ title }}
        </h2>
        
        <p v-if="subtitle" class="text-body-1 text-medium-emphasis mb-6 max-w-sm">
          {{ subtitle }}
        </p>
        
        <VBtn 
          v-if="buttonText" 
          color="primary" 
          rounded="pill" 
          size="large"
          class="px-6 text-none font-weight-medium"
          @click="buttonAction"
        >
          {{ buttonText }}
        </VBtn>
      </VCol>

      <!-- Optional Illustration/Image Area -->
      <VCol v-if="imageSrc" cols="12" sm="4" md="4" lg="3" class="d-none d-sm-flex justify-center align-end h-100">
        <VImg 
          :src="imageSrc" 
          max-height="180" 
          class="hero-illustration" 
          contain
        />
      </VCol>
    </VRow>
  </VCard>
</template>

<style scoped>
.hero-illustration {
  margin-bottom: -1rem; /* Allows illustration to slightly break the bottom bound for depth */
}
.max-w-sm {
  max-width: 450px;
}
</style>
