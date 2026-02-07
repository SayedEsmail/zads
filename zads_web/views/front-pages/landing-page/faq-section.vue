<script setup>
import boyWithLogo from '@images/front-pages/landing-page/faq-boy-with-logos.png'

const faqData = [
  {
    question: 'How do I find a tutor?',
    answer: 'Simply browse our list of qualified teachers, filter by subject, educational stage, and location to find the perfect match for your child.',
  },
  {
    question: 'Is Zads free for parents?',
    answer: 'Yes, registration and searching for tutors is completely free for parents. You deal directly with the teachers.',
  },
  {
    question: 'How can I become a tutor?',
    answer: 'Register as a teacher, complete your profile with your qualifications and subjects, and start receiving requests from parents immediately.',
  },
  {
    question: 'Are the teachers verified?',
    answer: 'We review every teacher profile to ensure quality and safety for our community giving you peace of mind.',
  },
  {
    question: 'Can I teach online?',
    answer: 'Yes, teachers can offer both online and in-home tutoring sessions based on their preference and agreement with parents.',
  },
]
</script>

<template>
  <div id="faq">
    <VContainer>
      <!-- 👉 Header  -->
      <div class="faq-section">
        <div class="headers d-flex justify-center flex-column align-center">
          <VChip
            label
            color="primary"
            size="small"
            class="mb-4"
          >
            FAQ
          </VChip>
          <h4 class="d-flex align-center text-h4 mb-1 flex-wrap justify-center">
            Frequently Asked
            <div class="position-relative ms-2">
              <div class="section-title">
                questions
              </div>
            </div>
          </h4>
          <p class="text-body-1 mb-0">
            Browse through these FAQs to find answers to commonly asked questions.
          </p>
        </div>
        <VRow>
          <VCol
            cols="12"
            md="5"
          >
            <div class="pt-10 d-flex align-center justify-center h-100">
              <VImg
                :src="boyWithLogo"
                height="330"
                width="330"
              />
            </div>
          </VCol>
          <VCol
            cols="12"
            md="7"
          >
            <VExpansionPanels class="pt-16">
              <VExpansionPanel
                v-for="faq in faqData"
                :key="faq.question"
              >
                <VExpansionPanelTitle>
                  {{ faq.question }}
                </VExpansionPanelTitle>
                <VExpansionPanelText>
                  {{ faq.answer }}
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </VCol>
        </VRow>
      </div>
    </VContainer>
  </div>
</template>

<style lang="scss" scoped>
.faq-section {
  margin-block: 5.25rem;
}

@media (max-width: 600px) {
  .faq-section {
    margin-block: 4rem;
  }
}

#faq {
  border-radius: 3.75rem 3.75rem 0 0;
  background-color: rgba(var(--v-theme-background));
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  line-height: 36px;
}

.section-title::after {
  position: absolute;
  background: url("../../../assets/images/front-pages/icons/section-title-icon.png") no-repeat left bottom;
  background-size: contain;
  block-size: 100%;
  content: "";
  font-weight: 800;
  inline-size: 130%;
  inset-block-end: 12%;
  inset-inline-start: -12%;
}
</style>
