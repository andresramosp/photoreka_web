<template>
  <div class="tab-content">
    <div class="processing-section">
      <!-- Processing Jobs Table -->
      <div v-if="processingJobs.length > 0" class="processing-table-container">
        <!-- <div class="section-header">
          <h3 class="photo-hub-title">Analysis Processes</h3>
          <span class="photo-count">{{ processingJobs.length }} processes</span>
        </div> -->

        <div class="photo-hub-header">
          <n-icon :color="`var(--warning-color)`" size="18">
            <BookInformation20Regular />
          </n-icon>
          <h3 class="photo-hub-title">
            Here you can monitor the analysis process for your photos. They will
            appear in your Workspace once the process is complete (up to two
            hours).
          </h3>
        </div>

        <div class="processing-table">
          <div
            v-for="job in processingJobs"
            :key="job.id"
            class="processing-row"
            :class="{
              expanded: job.expanded,
              finished: job.status === 'finished',
            }"
            @click="toggleJobExpansion(job.id)"
          >
            <!-- Main Row -->
            <div class="row-main">
              <div class="row-cell date-cell">
                <span class="cell-label">Started</span>
                <span class="cell-value">{{ formatDate(job.startDate) }}</span>
              </div>
              <div class="row-cell photos-cell">
                <span class="cell-label">Photos</span>
                <span class="cell-value">{{ job.photoCount }}</span>
              </div>
              <div class="row-cell type-cell">
                <span class="cell-label">Process</span>
                <span class="cell-value">{{ job.processType }}</span>
              </div>
              <div class="row-cell status-cell">
                <span class="cell-label">Status</span>
                <n-tag
                  size="small"
                  class="status-tag"
                  :class="{
                    'status-processing': job.status === 'processing',
                    'status-finished': job.status === 'finished',
                  }"
                >
                  {{ job.status === "processing" ? "Processing" : "Finished" }}
                </n-tag>
              </div>
              <div class="row-cell expand-cell">
                <n-icon size="16" class="expand-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6l1.41-1.41z"
                    />
                  </svg>
                </n-icon>
              </div>
            </div>

            <!-- Expanded Row Content -->
            <div v-if="job.expanded" class="row-expanded">
              <div class="expanded-content">
                <div class="expanded-header">
                  <span class="expanded-title"
                    >Processing Photos ({{ job.photos.length }})</span
                  >
                  <div v-if="job.status === 'processing'" class="progress-info">
                    <n-progress
                      type="line"
                      :percentage="job.progress"
                      :show-indicator="false"
                      class="job-progress"
                    />
                    <span class="progress-text"
                      >{{ job.progress }}% complete</span
                    >
                  </div>
                </div>
                <div class="photos-grid-mini">
                  <div
                    v-for="photo in job.photos"
                    :key="photo.id"
                    class="mini-photo"
                  >
                    <img
                      :src="photo.url"
                      :alt="photo.name"
                      class="mini-photo-image"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Processing State -->
      <div
        v-if="
          processingJobs.length === 0 ||
          processingJobs.every((job) => job.status === 'finished')
        "
        class="empty-processing-state"
      >
        <div class="empty-state-content">
          <n-icon size="64" color="#6b7280">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
          </n-icon>
          <h3 class="empty-state-title">No photos being processed</h3>
          <p class="empty-state-description">
            Upload photos in the Upload tab to see them here during processing
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { mockedJobs, type ProcessingJob } from "@/assets/mocked";
import {
  Notifications,
  NotificationsCircleOutline,
  NotificationsOutline,
} from "@vicons/ionicons5";
import { BookInformation20Regular } from "@vicons/fluent";

// Processing jobs state
const processingJobs = ref<ProcessingJob[]>(mockedJobs);

// Utility functions
const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Processing jobs functions
const toggleJobExpansion = (jobId: string) => {
  const job = processingJobs.value.find((j) => j.id === jobId);
  if (job) {
    job.expanded = !job.expanded;
  }
};
</script>

<style scoped>
.tab-content {
  padding: var(--spacing-3xl);
  background-color: var(--bg-container);
}

/* Processing Section */
.processing-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0;
}

.photo-count {
  font-size: 14px;
  color: #ffffff73;
}

/* Processing Table */
.processing-table-container {
  margin-bottom: 32px;
}

.processing-table {
  background-color: #1a1a1f;
  border-radius: 12px;
  border: 1px solid #2c2c32;
  overflow: hidden;
}

.processing-row {
  border-bottom: 1px solid #2c2c32;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.processing-row:last-child {
  border-bottom: none;
}

.processing-row:hover {
  background-color: rgba(139, 92, 246, 0.05);
}

.processing-row.finished {
  opacity: 0.7;
}

.processing-row.expanded {
  background-color: rgba(139, 92, 246, 0.05);
}

.row-main {
  display: grid;
  grid-template-columns: 1fr 80px 1fr 120px 40px;
  gap: 16px;
  padding: 16px 20px;
  align-items: center;
}

.row-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-label {
  font-size: 12px;
  color: #ffffff60;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cell-value {
  font-size: 14px;
  color: #ffffffd1;
  font-weight: 500;
}

.photos-cell .cell-value {
  font-size: 16px;
  font-weight: 600;
  color: #8b5cf6;
}

.status-cell {
  align-items: flex-start;
}

.expand-cell {
  justify-content: center;
  align-items: center;
}

.expand-icon {
  color: #ffffff73;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.processing-row.expanded .expand-icon {
  transform: rotate(180deg);
}

/* Expanded Row Content */
.row-expanded {
  border-top: 1px solid #2c2c32;
  background-color: #16161a;
  animation: expandRow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes expandRow {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.expanded-content {
  padding: 20px;
}

.expanded-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.expanded-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffffd1;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.job-progress {
  width: 120px;
}

.progress-text {
  font-size: 12px;
  color: #ffffff73;
  min-width: 80px;
}

/* Mini Photos Grid */
.photos-grid-mini {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.mini-photo {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #2c2c32;
  transition: all 0.2s ease;
}

.mini-photo:hover {
  transform: scale(1.05);
  border-color: #8b5cf6;
}

.mini-photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Empty Processing State */
.empty-processing-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
}

.empty-state-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 16px 0 8px 0;
}

.empty-state-description {
  font-size: 16px;
  color: #ffffff73;
  margin: 0;
}

/* Custom Status Badge Colors */
.status-processing {
  background-color: #f59e0b !important;
  color: #ffffff !important;
  border-color: #f59e0b !important;
}

.status-finished {
  background-color: #10b981 !important;
  color: #ffffff !important;
  border-color: #10b981 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .tab-content {
    padding: 16px;
  }

  /* Processing Table Responsive */
  .row-main {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px 16px;
  }

  .row-cell {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #2c2c32;
  }

  .row-cell:last-child {
    border-bottom: none;
  }

  .expand-cell {
    position: absolute;
    top: 12px;
    right: 16px;
  }

  .photos-grid-mini {
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 6px;
  }

  .expanded-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .progress-info {
    width: 100%;
  }

  .job-progress {
    width: 100%;
  }
}
</style>
