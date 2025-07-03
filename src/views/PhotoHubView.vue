<template>
  <div class="photo-hub-container view-container">
    <!-- Header Section -->
    <div class="hub-header">
      <div class="header-content">
        <h1 class="page-title">Photo Hub</h1>
        <p class="page-subtitle">
          Upload, analyze, and view your photo catalog here.
        </p>
      </div>
      <div class="header-actions">
        <n-button type="info" size="large" @click="() => {}">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                />
              </svg>
            </n-icon>
          </template>
          Get more space
        </n-button>
      </div>
    </div>

    <!-- Tabs Section -->
    <div class="tabs-container">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'upload' }"
          @click="activeTab = 'upload'"
        >
          Upload
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'processing' }"
          @click="activeTab = 'processing'"
        >
          Processing
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'catalog' }"
          @click="activeTab = 'catalog'"
        >
          Catalog
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content-container">
        <!-- Tab 1: Upload -->
        <PhotosUpload v-show="activeTab === 'upload'" @on-analyze="() => {}" />

        <!-- Tab 2: Processing -->
        <ProcessingPhotos v-show="activeTab === 'processing'" />

        <!-- Tab 3: Catalog -->
        <div v-show="activeTab === 'catalog'" class="tab-content">
          <div class="catalog-section">
            <!-- Static Example Photos -->
            <div class="catalog-photos">
              <!-- Catalog Title -->
              <div class="catalog-header">
                <h3 class="catalog-title">
                  Here are all your processed photos.
                </h3>
              </div>

              <!-- Grid Controls -->
              <div class="grid-controls grid-controls-base">
                <div class="results-info results-info-base">
                  <span class="results-count results-count-base"
                    >{{ catalogPhotos.length }} photos</span
                  >
                </div>
                <div class="grid-size-controls grid-size-controls-base">
                  <span class="grid-label grid-label-base">Columns:</span>
                  <n-button-group>
                    <n-button
                      v-for="size in [3, 4, 5, 6]"
                      :key="size"
                      :type="gridColumns === size ? 'primary' : 'default'"
                      size="small"
                      @click="setGridColumns(size)"
                    >
                      {{ size }}
                    </n-button>
                  </n-button-group>
                </div>
              </div>

              <!-- Photo Grid -->
              <div
                class="photos-grid photo-grid-base"
                :class="`grid-cols-${gridColumns}`"
              >
                <PhotoCardInfo
                  v-for="photo in catalogPhotos"
                  :key="photo.id"
                  :photo="{
                    ...photo,
                    size: parseFloat(photo.size) * 1024 * 1024, // Convert MB to bytes
                  }"
                  @info="showPhotoInfo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import PhotoCardInfo from "../components/PhotoCardInfo.vue";
import { mockedPhotos, type CatalogPhoto } from "@/assets/mocked";
import PhotosUpload from "@/components/photo-hub/PhotosUpload.vue";
import ProcessingPhotos from "@/components/photo-hub/ProcessingPhotos.vue";

interface Photo {
  id: string;
  name: string;
  size: number;
  url?: string;
  file: File;
  uploadDate?: Date;
  isDuplicate: boolean;
  isUploading?: boolean;
}

// Reactive state
const activeTab = ref("upload");
const tabText = computed(() => {
  if (activeTab.value == "upload") {
    return "Here you will find photos that have been uploaded to your catalog but havent yet been processed. You can accumulate photos and process them whenever you want.";
  }
  if (activeTab.value == "processing") {
    return "Here you'll see photos being analyzed, as well as previously performed analyses.";
  }
  return "This is your catalog of already analyzed photos, ready to use in any tool.";
});

// Grid columns state
const gridColumns = ref(4);

// Mock processing jobs for the Processing tab
const processingJobs = ref<ProcessingJob[]>(mockedJobs);
// Static catalog photos for demonstration
const catalogPhotos = ref<CatalogPhoto[]>(mockedPhotos);

// Computed properties

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

// Photo selection functions

const showPhotoInfo = (photo: any) => {
  console.log("Show photo info:", photo);
  // Here you would implement the photo info modal/panel
};

// Grid columns function
const setGridColumns = (columns: number) => {
  gridColumns.value = columns;
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
.photo-hub-container {
  padding: var(--spacing-2xl);
  margin: 0 auto;
  background-color: var(--bg-body);
}

/* Header Section */
.hub-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3xl);
  gap: var(--spacing-2xl);
}

/* Tabs Section */
.tabs-container {
  background-color: var(--bg-container);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  margin-bottom: var(--spacing-2xl);
}

/* Custom Tab Navigation */
.tab-navigation {
  display: flex;
  background-color: var(--bg-container);
  padding: var(--spacing-sm);
  gap: var(--spacing-xs);
}

.tab-button {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-2xl);
  background-color: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: center;
}

.tab-button:hover {
  background-color: var(--bg-surface);
  color: var(--text-primary);
}

.tab-button.active {
  background-color: var(--bg-surface);
  color: var(--text-primary);
}

/* Tab Content Container */
.tab-content-container {
  background-color: var(--bg-container);
}

.tab-content {
  padding: var(--spacing-3xl);
  background-color: var(--bg-container);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: var(--line-height-tight);
}

.page-subtitle {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

/* Duplicate Notification */
.duplicate-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
}

/* Photos Section */
.photos-section,
.uploaded-photos-section,
.upload-queue {
  margin-top: 24px;
}

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

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.analyze-btn {
  height: 36px;
}

.photo-count {
  font-size: 14px;
  color: #ffffff73;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.photo-card {
  background-color: #1a1a1f;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  border: 1px solid #2c2c32;
}

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.photo-card.duplicate {
  border-color: #f59e0b;
}

.skeleton-card {
  opacity: 0.8;
}

/* Note: Photo skeleton styles moved to global.scss */

.photo-thumbnail {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.duplicate-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(245, 158, 11, 0.9);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-thumbnail:hover .photo-overlay {
  opacity: 1;
}

.overlay-btn {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

.photo-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.photo-name {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #ffffff73;
}

.photo-status {
  padding: 0 16px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.duplicate-tag {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.upload-progress-indicator {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upload-text {
  font-size: 12px;
  color: #ffffff73;
}

/* Processing Section */
.processing-section {
  flex: 1;
  display: flex;
  flex-direction: column;
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

.upload-queue {
  margin-bottom: 32px;
}

.processing-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.processing-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: #2c2c32;
  border-radius: 12px;
  padding: 16px;
}

.processing-thumbnail {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.processing-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.processing-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.processing-name {
  font-size: 16px;
  font-weight: 500;
  color: #ffffffd1;
}

.processing-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.processing-status {
  flex-shrink: 0;
}

/* Catalog Section */
.catalog-header {
  margin-bottom: 24px;
}

.catalog-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0;
  text-align: left;
}

/* Empty States */
.empty-processing-state,
.empty-catalog-state {
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

/* Responsive */
@media (max-width: 768px) {
  .photo-hub-container {
    padding: 16px;
  }

  .hub-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    justify-content: stretch;
  }

  .action-btn {
    flex: 1;
  }

  .upload-dropzone {
    padding: 48px 24px;
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-controls {
    width: 100%;
    justify-content: space-between;
  }

  .duplicate-notification {
    top: 16px;
    right: 16px;
    left: 16px;
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
</style>
