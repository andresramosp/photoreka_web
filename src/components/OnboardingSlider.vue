<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :style="{ maxWidth: '90vw', width: '700px', maxHeight: '90vh' }"
    :bordered="false"
    :closable="false"
    :mask-closable="false"
    :auto-focus="false"
    class="onboarding-modal"
  >
    <template #header>
      <div class="onboarding-header">
        <h2 class="onboarding-title">Welcome to Photoreka</h2>
        <p class="onboarding-subtitle">
          Let's get you started with your photo discovery journey
        </p>
      </div>
    </template>

    <div class="onboarding-content">
      <!-- Slide Content -->
      <div class="slide-container">
        <transition name="slide" mode="out-in">
          <div :key="currentSlide" class="slide">
            <!-- Slide 1: Add your photos -->
            <div v-if="currentSlide === 0" class="slide-content">
              <div class="slide-image">
                <img
                  src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Photo upload interface"
                  class="onboarding-image"
                />
              </div>
              <div class="slide-text">
                <h3 class="slide-title">1. Bring your photos</h3>
                <p class="slide-description">
                  Photoreka is a tool designed to work with large volumes of
                  photos and manage an entire body of work. You can bring your
                  images from different platforms (Google Photos, Drive, etc.)
                  or from your local directory.
                </p>
              </div>
            </div>

            <!-- Slide 2: Use your preprocessed photos -->
            <div v-if="currentSlide === 1" class="slide-content">
              <div class="slide-image">
                <img
                  src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Photo editing interface"
                  class="onboarding-image"
                />
              </div>
              <div class="slide-text">
                <h3 class="slide-title">2. Preview in Lightbox</h3>
                <p class="slide-description">
                  The Lightbox is where you import your photos.. You can import
                  them in batches, at your own pace, or all at once. Newly
                  uploaded photos are pre-processed and can be used in some
                  tools with limitations.
                </p>
              </div>
            </div>

            <!-- Slide 3: Unleash your catalog's potential -->
            <div v-if="currentSlide === 2" class="slide-content">
              <div class="slide-image">
                <img
                  src="https://images.unsplash.com/photo-1587614382346-4ec70e388b28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="AI photo organization interface"
                  class="onboarding-image"
                />
              </div>
              <div class="slide-text">
                <h3 class="slide-title">3. Build your Workspace</h3>
                <p class="slide-description">
                  Allow our engine to understand your photos to unleash the full
                  potential of your catalog. The photos you process to the
                  Workspace will be available for natural language exploration,
                  advanced canvas features, photo relation search, style
                  ranking, and much more...
                </p>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Navigation Dots -->
      <div class="navigation-dots">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          :class="['dot', { active: currentSlide === index }]"
          @click="goToSlide(index)"
        />
      </div>

      <!-- Navigation Buttons -->
      <div class="navigation-buttons">
        <n-button
          v-if="currentSlide > 0"
          quaternary
          size="large"
          @click="previousSlide"
          class="nav-button"
        >
          Previous
        </n-button>
        <div v-else></div>

        <n-button
          v-if="currentSlide < slides.length - 1"
          type="primary"
          size="large"
          @click="nextSlide"
          class="nav-button"
        >
          Next
        </n-button>
        <n-button
          v-else
          type="primary"
          size="large"
          @click="finish"
          class="nav-button"
        >
          Get Started
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, computed } from "vue";
import { NModal, NButton } from "naive-ui";
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "finish"]);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const currentSlide = ref(0);

const slides = [
  { id: "add-photos" },
  { id: "preprocessed" },
  { id: "ai-potential" },
];

const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++;
  }
};

const previousSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

const goToSlide = (index) => {
  currentSlide.value = index;
};

const finish = () => {
  emit("finish");
  visible.value = false;
};
</script>

<style scoped>
.onboarding-modal {
  backdrop-filter: blur(8px);
}

.onboarding-header {
  text-align: center;
}

.onboarding-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.onboarding-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
}

.onboarding-content {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.slide-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.slide {
  width: 100%;
  height: 100%;
}

.slide-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  text-align: center;
}

.slide-image {
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onboarding-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.mock-screenshot {
  width: 100%;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-container), var(--bg-surface));
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  position: relative;
  overflow: hidden;
}

/* Upload Screen Styles */
.upload-screen {
  justify-content: center;
  align-items: center;
}

.upload-area {
  border: 2px dashed var(--secondary-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-2xl);
  background: rgba(139, 92, 246, 0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-sm);
}

.upload-area h4 {
  color: var(--text-primary);
  margin: 0;
  font-size: var(--font-size-lg);
}

.upload-area p {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--font-size-sm);
}

.upload-stats {
  display: flex;
  gap: var(--spacing-xl);
  position: absolute;
  bottom: var(--spacing-lg);
  left: var(--spacing-lg);
  right: var(--spacing-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-number {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Canvas Screen Styles */
.canvas-screen {
  background: var(--bg-card);
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  position: absolute;
  top: var(--spacing-lg);
  left: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 2;
}

.canvas-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.canvas-tools {
  display: flex;
  gap: var(--spacing-xs);
}

.tool {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
}

.tool.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
}

.photo-preview {
  width: 200px;
  height: 150px;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  background:
    linear-gradient(45deg, #333 25%, transparent 25%),
    linear-gradient(-45deg, #333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #333 75%),
    linear-gradient(-45deg, transparent 75%, #333 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
  opacity: 0.3;
}

.photo-controls {
  position: absolute;
  bottom: var(--spacing-xs);
  left: var(--spacing-xs);
  right: var(--spacing-xs);
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
}

.control-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--bg-overlay);
  border: none;
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  backdrop-filter: blur(4px);
}

/* AI Screen Styles */
.ai-screen {
  gap: var(--spacing-lg);
}

.search-bar {
  position: relative;
  margin-top: 32px;
}

.search-bar input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.search-bar input::placeholder {
  color: var(--text-tertiary);
}

.search-icon {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.ai-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  flex: 1;
}

.feature-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  transition: var(--transition-normal);
}

.feature-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 24px;
  margin-bottom: var(--spacing-sm);
}

.feature-card h5 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.feature-card p {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0;
}

.slide-text {
  max-width: 500px;
}

.slide-title {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

.slide-description {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.navigation-dots {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin: var(--spacing-2xl) 0;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-round);
  border: none;
  background: var(--text-tertiary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.dot.active {
  background: var(--primary-color);
  transform: scale(1.2);
}

.dot:hover {
  background: var(--text-secondary);
}

.dot.active:hover {
  background: var(--primary-color-hover);
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-button {
  min-width: 120px;
}

/* Slide Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .onboarding-title {
    font-size: var(--font-size-2xl);
  }

  .slide-content {
    gap: var(--spacing-lg);
  }

  .slide-image {
    max-width: 400px;
  }

  .slide-title {
    font-size: var(--font-size-xl);
  }

  .slide-description {
    font-size: var(--font-size-base);
  }

  .upload-stats {
    position: static;
    margin-top: var(--spacing-lg);
  }

  .ai-features {
    grid-template-columns: 1fr;
  }

  .navigation-buttons {
    flex-direction: column-reverse;
    gap: var(--spacing-md);
  }

  .nav-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .mock-screenshot {
    padding: var(--spacing-md);
  }

  .upload-area {
    padding: var(--spacing-lg);
  }

  .upload-icon {
    font-size: 36px;
  }

  .stat-item {
    gap: var(--spacing-xs);
  }

  .stat-number {
    font-size: var(--font-size-lg);
  }
}
</style>
