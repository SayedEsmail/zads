<script setup>
</script>

<template>
  <div class="footer">
    <!-- 👉 Footer Line -->
    <div class="footer-line w-100">
      <VContainer>
          <div class="text-body-1 text-white-variant text-wrap text-center me-4">
            &copy;

            {{ new Date().getFullYear() }}
            <a
              href="https://zads.app/"
              target="_blank"
              rel="noopener noreferrer"
              class="font-weight-bold ms-1 text-white"
            >Zads</a>,
            All rights reserved.
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
