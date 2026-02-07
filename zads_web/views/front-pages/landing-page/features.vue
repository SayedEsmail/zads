<script setup>
import check from '@images/svg/Check.svg'
import diamond from '@images/svg/Diamond.svg'
import laptop from '@images/svg/laptop.svg'
import paper from '@images/svg/paper-send.svg'
import rocket from '@images/svg/rocket.svg'
import wallet from '@images/svg/Wallet.svg'

const featuresData = [
  {
    title: 'Verified Tutors',
    desc: 'Every teacher profile is carefully reviewed to ensure qualifications and safety for your peace of mind.',
    icon: check,
  },
  {
    title: 'Smart Matching',
    desc: 'Find the perfect tutor based on subject, educational stage, and location instantly.',
    icon: rocket,
  },
  {
    title: 'Direct Communication',
    desc: 'Connect directly with teachers to discuss your child\'s needs before committing to lessons.',
    icon: paper,
  },
  {
    title: 'Transparent Pricing',
    desc: 'Clear hourly or monthly rates set by teachers. compare options to fit your budget.',
    icon: wallet,
  },
  {
    title: 'Top Quality',
    desc: 'Access a network of highly rated educators dedicated to student success and excellence.',
    icon: diamond,
  },
  {
    title: 'All Subjects',
    desc: 'From Mathematics and Science to Languages and Arts, find tutors for every educational need.',
    icon: laptop,
  },
]
</script>

<template>
  <VContainer id="features">
    <div class="feature-cards">
      <div class="headers d-flex justify-center flex-column align-center mb-12">
        <VChip
          label
          color="primary"
          class="mb-4"
          size="small"
        >
          Why Choose Zads
        </VChip>
        <div class="d-flex text-h4 mb-1 align-center flex-wrap justify-center">
          <div class="position-relative me-2">
            <div class="section-title">
              Everything you need
            </div>
          </div>
          to support your child's education
        </div>
        <p class="text-body-1 mb-0">
          Zads connects you with the best private tutors in Egypt through a simple, safe, and effective platform.
        </p>
      </div>
      <VRow>
        <VCol
          v-for="(data, index) in featuresData"
          :key="index"
          cols="12"
          md="4"
          sm="6"
        >
          <div class="d-flex flex-column align-center justify-center gap-4 mx-auto">
            <VIcon
              :icon="data.icon"
              size="64"
              color="primary"
            />
            <div class="text-center">
              <h5 class="text-h5 mb-2">
                {{ data.title }}
              </h5>
              <p
                class="text-body-1 mb-6"
                style="max-inline-size: 310px;"
              >
                {{ data.desc }}
              </p>
            </div>
          </div>
        </VCol>
      </VRow>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.feature-cards {
  margin-block: 3.75rem;
}

.section-title::after {
  position: absolute;
  background: url("../../../assets/images/front-pages/icons/section-title-icon.png") no-repeat left bottom;
  background-size: contain;
  block-size: 100%;
  content: "";
  inline-size: 120%;
  inset-block-end: 0;
  inset-inline-start: -12%;
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  line-height: 36px;
}

.feature {
  .v-avatar {
    &.v-avatar--variant-outlined {
      border: 2px solid rgba(var(--v-theme-primary), 0.32);

      &:hover {
        background: rgba(var(--v-theme-primary), 0.16);
        cursor: pointer;
      }
    }
  }
}
</style>
