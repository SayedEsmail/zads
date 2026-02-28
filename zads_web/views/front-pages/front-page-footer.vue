<script setup>
</script>

<template>
  <div class="footer">
    <!-- 👉 Footer Line -->
    <div class="footer-line w-100">
      <VContainer>
          <div class="text-body-2 text-white opacity-70 text-wrap text-center py-4">
            &copy; {{ new Date().getFullYear() }} Zads. {{ $t('Footer.AllRightsReserved') }}.
          </div>
      </VContainer>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.footer-line {
  background: #282c3e;
}
</style>

<style lang="scss">
.footer {
  @media (min-width: 600px) and (max-width: 960px) {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
