<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :style="{ maxWidth: '90vw', width: '600px', maxHeight: '90vh' }"
    :bordered="false"
    :closable="false"
    :mask-closable="false"
    :auto-focus="false"
    class="welcome-modal"
  >
    <template #header>
      <div class="welcome-header">
        <h2 class="welcome-title">Welcome to Photoreka</h2>
        <p class="welcome-subtitle">
          Your journey with intelligent photo management starts here
        </p>
      </div>
    </template>

    <div class="welcome-content">
      <div class="welcome-message">
        <div class="welcome-icon">
          <n-icon size="64" color="var(--primary-color)">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
          </n-icon>
        </div>

        <div class="message-text">
          <p class="main-message">
            Photoreka is designed to work with large photo collections and
            complete bodies of work. To ensure consistent performance and the
            best experience, we require a minimum of
            <strong>100 photos</strong> to unlock the full potential of the
            platform.
          </p>

          <p class="secondary-message">Here's how to get started:</p>

          <ul class="steps-list">
            <li>Upload your photos to the <strong>Lightbox</strong></li>
            <li>Watch your progress as you approach 100 photos</li>
            <li>Analyze your first batch of 100+ photos</li>
            <li>Enjoy unrestricted access with no minimum limits thereafter</li>
          </ul>

          <p class="final-message">
            Once you've processed your first 100 photos, you can add and process
            any number of photos without restrictions!
          </p>
        </div>
      </div>

      <div class="welcome-actions">
        <n-button
          type="primary"
          size="large"
          @click="getStarted"
          class="get-started-button"
        >
          Get Started
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { computed } from "vue";
import { NModal, NButton, NIcon } from "naive-ui";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "get-started"]);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const getStarted = () => {
  emit("get-started");
  visible.value = false;
};
</script>

<style scoped>
.welcome-modal {
  backdrop-filter: blur(8px);
}

.welcome-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.welcome-title {
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

.welcome-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-xl);
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-round);
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.1),
    rgba(59, 130, 246, 0.1)
  );
  border: 2px solid rgba(37, 99, 235, 0.2);
}

.message-text {
  max-width: 500px;
}

.main-message {
  font-size: 16px;
  color: var(--text-primary);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--spacing-lg) 0;
}

.secondary-message {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
  font-weight: var(--font-weight-medium);
}

.steps-list {
  text-align: left;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--spacing-lg) 0;
  padding-left: var(--spacing-lg);
}

.steps-list li {
  margin-bottom: var(--spacing-xs);
}

.steps-list strong {
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.final-message {
  font-size: 14px;
  color: var(--text-tertiary);
  line-height: var(--line-height-relaxed);
  margin: 0;
  font-style: italic;
}

.welcome-actions {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-lg);
}

.get-started-button {
  min-width: 160px;
  height: 44px;
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
}

/* Responsive Design */
@media (max-width: 768px) {
  .welcome-title {
    font-size: var(--font-size-2xl);
  }

  .welcome-icon {
    width: 64px;
    height: 64px;
  }

  .welcome-icon :deep(.n-icon) {
    font-size: 48px;
  }

  .main-message {
    font-size: 15px;
  }

  .secondary-message {
    font-size: 14px;
  }

  .steps-list {
    font-size: 13px;
  }

  .final-message {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .welcome-modal :deep(.n-card) {
    margin: var(--spacing-md);
  }

  .get-started-button {
    width: 100%;
  }
}
</style>
