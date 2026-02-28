<script setup>
import hero3DIllustration from '@images/hero.png'
import { useTheme } from 'vuetify'

const theme = useTheme()
</script>

<template>
  <div
    id="home"
    :style="{ background: 'rgb(var(--v-theme-surface))' }"
  >
    <div id="landingHero">
      <div
        class="landing-hero"
        :class="theme.current.value.dark ? 'landing-hero-dark-bg' : 'landing-hero-light-bg'"
      >
        <VContainer>
          <VRow align="center" class="gap-y-12 py-12">
            <!-- Text Section -->
            <VCol cols="12" lg="6" class="text-center text-lg-start">
              <div class="hero-content">
                <div class="d-inline-flex align-center gap-2 pa-2 pe-4 mb-6 rounded-pill bg-primary-lighten-5 border border-primary-opacity-20 translate-y-n2">
                    <VChip color="primary" size="small" label variant="elevated" class="rounded-pill">New</VChip>
                    <span class="text-caption font-weight-bold text-primary">{{ $t('Register.JoinZads🚀') }}</span>
                </div>
                
                <h1 class="hero-title-v2 font-weight-black mb-6 leading-tight">
                   {{ $t('FindPerfectTutor') }} <br>
                   <span class="text-gradient"> {{ $t('ForYourChild') }} </span>
                </h1>
                
                <p class="text-h6 text-secondary leading-relaxed mb-10 max-w-500 mx-auto mx-lg-0">
                  {{ $t('HeroDesc') }}
                </p>

                <div class="d-flex flex-wrap justify-center justify-lg-start gap-4">
                  <VBtn
                    size="x-large"
                    color="primary"
                    :to="{ name: 'register-parent' }"
                    class="px-10 rounded-xl elevation-4 text-capitalize font-weight-bold"
                    height="56"
                  >
                    <template #prepend>
                        <VIcon icon="tabler-users" size="24" />
                    </template>
                    {{ $t('Auth.Parent') }}
                  </VBtn>
                  
                  <VBtn
                    size="x-large"
                    color="secondary"
                    variant="tonal"
                    :to="{ name: 'register-teacher' }"
                    class="px-10 rounded-xl font-weight-bold text-capitalize"
                    height="56"
                  >
                    <template #prepend>
                        <VIcon icon="tabler-school" size="24" />
                    </template>
                    {{ $t('Auth.Teacher') }}
                  </VBtn>
                </div>

                <div class="mt-8 d-flex align-center justify-center justify-lg-start gap-3">
                   <div class="d-flex -space-x-2">
                        <VAvatar size="32" class="border-2 border-surface" image="https://i.pravatar.cc/100?u=1" />
                        <VAvatar size="32" class="border-2 border-surface" image="https://i.pravatar.cc/100?u=2" />
                        <VAvatar size="32" class="border-2 border-surface" image="https://i.pravatar.cc/100?u=3" />
                   </div>
                   <div class="text-caption font-weight-medium text-secondary">
                        <span class="text-primary font-weight-bold">1000+</span> {{ $t('HappyFamilies') }}
                   </div>
                </div>
              </div>
            </VCol>

            <!-- Image Section -->
            <VCol cols="12" lg="6" class="position-relative">
              <div class="hero-image-container ps-lg-12">
                 <VImg
                    :src="hero3DIllustration"
                    class="hero-3d-img transition-bounce"
                    max-width="700"
                 />
                 
                 <!-- Decorative elements -->
                 <div class="glow-circle primary"></div>
                 <div class="glow-circle secondary"></div>
              </div>
            </VCol>
          </VRow>
        </VContainer>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.landing-hero {
  border-radius: 0 0 80px 80px;
  padding-block: 4rem 4rem;
  overflow: hidden;
  position: relative;
  min-height: calc(100vh - 120px); /* Fill screen minus navbar/buffer */
  display: flex;
  align-items: center;
}

@media (min-width: 1280px) {
    .landing-hero {
        padding-block: 6rem 6rem;
    }
}

.hero-title-v2 {
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 1.1;
    color: rgb(var(--v-theme-on-surface));
}

.text-gradient {
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-3d-img {
    filter: drop-shadow(0 20px 50px rgba(0,0,0,0.1));
    z-index: 2;
    position: relative;
}

.hero-image-container {
    perspective: 1000px;
    position: relative;
}

.glow-circle {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    filter: blur(100px);
    z-index: 1;
    opacity: 0.3;
    
    &.primary {
        background: rgb(var(--v-theme-primary));
        top: 20%;
        left: 20%;
    }
    
    &.secondary {
        background: rgb(var(--v-theme-secondary));
        bottom: 20%;
        right: 20%;
    }
}

.bg-primary-lighten-5 {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

.transition-bounce {
    animation: floating 6s ease-in-out infinite;
}

@keyframes floating {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(1deg); }
    100% { transform: translateY(0px) rotate(0deg); }
}

.landing-hero-dark-bg {
  background-color: #25293c;
  background-image: radial-gradient(circle at 20% 30%, rgba(var(--v-theme-primary), 0.1) 0%, transparent 40%),
                    radial-gradient(circle at 80% 70%, rgba(var(--v-theme-secondary), 0.1) 0%, transparent 40%);
}

.landing-hero-light-bg {
  background: linear-gradient(135deg, #f8f7ff 0%, #fff9f4 100%);
}

.max-w-500 {
    max-width: 500px;
}

.-space-x-2 > * {
    margin-left: -0.5rem;
}

[dir="rtl"] {
    .-space-x-2 > * {
        margin-left: 0;
        margin-right: -0.5rem;
    }
}
</style>
