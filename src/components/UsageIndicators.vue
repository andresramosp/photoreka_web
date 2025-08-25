<template>
  <div class="usage-indicators">
    <div class="usage-card">
      <div class="usage-header">
        <div class="usage-title">
          <n-icon size="16" color="var(--info-color)">
            <DriveFolderUploadFilled />
          </n-icon>
          Upload Usage
        </div>
        <span class="usage-count">{{ photosUsage }} / {{ photosLimit }}</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill upload-progress"
          :style="{ width: uploadPercentage + '%' }"
        ></div>
      </div>
      <div class="usage-footer">
        <span class="remaining-text"
          >{{ photosRemaining }} photos remaining</span
        >
      </div>
    </div>

    <!-- <div class="usage-card">
      <div class="usage-header">
        <div class="usage-title">
          <n-icon size="16" color="var(--primary-color)">
            <InProgress />
          </n-icon>
          Analysis Usage
        </div>
        <span class="usage-count"
          >{{ analyzedPhotosUsage }} / {{ analyzedPhotosLimit }}</span
        >
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill analysis-progress"
          :style="{ width: analysisPercentage + '%' }"
        ></div>
      </div>
      <div class="usage-footer">
        <span class="remaining-text"
          >{{ analyzedPhotosRemaining }} analyses remaining</span
        >
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "@/stores/userStore";
import { DriveFolderUploadFilled } from "@vicons/material";
import { InProgress } from "@vicons/carbon";

const userStore = useUserStore();

// Default values if usage is not available
const photosUsage = computed(() => userStore.user?.usage?.photosUsage || 0);
const photosLimit = computed(() => userStore.user?.usage?.photosLimit || 5000);
const photosRemaining = computed(() => userStore.user?.usage?.photosRemaining);
const analyzedPhotosUsage = computed(
  () => userStore.user?.usage?.analyzedPhotosUsage || 0
);
const analyzedPhotosLimit = computed(
  () => userStore.user?.usage?.analyzedPhotosLimit || 2000
);
const analyzedPhotosRemaining = computed(
  () =>
    userStore.user?.usage?.analyzedPhotosRemaining || analyzedPhotosLimit.value
);

// Calculate percentages
const uploadPercentage = computed(() => {
  if (photosLimit.value === 0) return 0;
  return Math.min((photosUsage.value / photosLimit.value) * 100, 100);
});

const analysisPercentage = computed(() => {
  if (analyzedPhotosLimit.value === 0) return 0;
  return Math.min(
    (analyzedPhotosUsage.value / analyzedPhotosLimit.value) * 100,
    100
  );
});
</script>

<style scoped>
.usage-indicators {
  display: flex;
  gap: var(--spacing-lg);
  align-items: stretch;
}

.usage-card {
  flex: 1;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  min-width: 200px;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.usage-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.usage-count {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--bg-container);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.upload-progress {
  background-color: var(--info-color);
}

.analysis-progress {
  background-color: var(--primary-color);
}

.usage-footer {
  display: flex;
  justify-content: flex-end;
}

.remaining-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .usage-indicators {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .usage-card {
    min-width: unset;
  }
}
</style>
