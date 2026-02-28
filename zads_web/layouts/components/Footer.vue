<template>
  <div class="h-100 d-flex align-center justify-center">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center text-medium-emphasis">
      &copy;
      {{ new Date().getFullYear() }}
      {{ $t('Footer.AllRightsReserved') }}
      <VIcon
        icon="tabler-heart-filled"
        color="error"
        size="1.25rem"
        class="mx-1 ms-2"
      />
      {{ $t('Footer.By') }}
      <RouterLink
        to="/"
        class="text-primary ms-1"
      >Zads</RouterLink>
    </span>
  </div>
</template>
