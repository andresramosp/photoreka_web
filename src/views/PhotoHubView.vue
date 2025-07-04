<template>
  <div class="photo-hub-container view-container">
    <!-- Header Section -->
    <div class="hub-header">
      <div class="header-content">
        <h1 class="page-title">Photo Hub</h1>
        <p class="page-subtitle">
          Upload and analyze your photos with AI-powered insights
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

    <!-- Upload Progress Section -->
    <div v-if="isUploading" class="upload-progress-section">
      <div class="progress-header">
        <h3 class="progress-title">Uploading Photos</h3>
        <span class="progress-count"
          >{{ uploadedCount }}/{{ totalFiles }} photos uploaded</span
        >
      </div>
      <n-progress
        type="line"
        :percentage="overallProgress"
        :show-indicator="false"
        class="overall-progress"
      />
      <div class="progress-text">
        {{ Math.round(overallProgress) }}% complete
      </div>
    </div>

    <!-- Duplicate Check Notification -->
    <n-notification
      v-if="showDuplicateNotification"
      title="Checking for duplicates"
      content="Analyzing uploaded photos to detect duplicates..."
      type="info"
      :duration="0"
      class="duplicate-notification"
    />

    <!-- Tabs Section -->
    <div class="tabs-container">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'upload' }"
          @click="setActiveTab('upload')"
        >
          Upload
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'processing' }"
          @click="setActiveTab('processing')"
        >
          Processing
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'catalog' }"
          @click="setActiveTab('catalog')"
        >
          Catalog
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content-container">
        <!-- Tab 1: Upload -->
        <div v-show="activeTab === 'upload'" class="tab-content">
          <!-- Full Upload Dropzone (show when no photos) -->
          <div v-if="uploadedPhotos.length === 0" class="upload-section">
            <div
              class="upload-dropzone"
              :class="{ 'drag-over': isDragOver }"
              @dragenter.prevent="handleDragEnter"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <div class="dropzone-content">
                <div class="upload-icon">
                  <n-icon size="48" color="#8b5cf6">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                      />
                    </svg>
                  </n-icon>
                </div>
                <h3 class="dropzone-title">Drop your photos here</h3>
                <p class="dropzone-subtitle">
                  Drag and drop your images, or click to browse
                </p>
                <div class="upload-buttons">
                  <n-button type="primary" size="large" class="upload-btn">
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
                    Choose Files
                  </n-button>
                  <n-button
                    type="default"
                    size="large"
                    class="google-photos-btn"
                  >
                    <template #icon>
                      <n-icon>
                        <svg viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13L13.5 11.5C12.1 10.1 9.9 10.1 8.5 11.5L3 17V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9ZM5 19L8.5 15.5C9.3 14.7 10.7 14.7 11.5 15.5L13 17L19 11V19H5Z"
                          />
                        </svg>
                      </n-icon>
                    </template>
                    Import from Google Photos
                  </n-button>
                </div>
                <div class="file-formats">
                  <span class="format-text"
                    >Supports JPG, PNG, WebP up to 50MB per file</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Compact Upload Section (show when photos exist) -->
          <div v-else class="compact-upload-section">
            <div class="compact-upload-buttons">
              <n-button
                type="primary"
                size="medium"
                class="compact-upload-btn"
                @click="triggerFileInput"
              >
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
                Choose Files
              </n-button>
              <n-button
                type="default"
                size="medium"
                class="compact-google-photos-btn"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13L13.5 11.5C12.1 10.1 9.9 10.1 8.5 11.5L3 17V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9ZM5 19L8.5 15.5C9.3 14.7 10.7 14.7 11.5 15.5L13 17L19 11V19H5Z"
                      />
                    </svg>
                  </n-icon>
                </template>
                Import Google Photos
              </n-button>
            </div>
          </div>

          <!-- Unified Photos Section -->
          <div v-if="uploadedPhotos.length > 0" class="uploaded-photos-section">
            <!-- Grid Controls -->
            <div class="grid-controls grid-controls-base">
              <div class="results-info results-info-base">
                <span class="results-count results-count-base">
                  {{ uploadedPhotos.filter((p) => !p.isUploading).length }}/{{
                    uploadedPhotos.length
                  }}
                  photos
                  <span v-if="isUploading">
                    ({{
                      uploadedPhotos.filter((p) => p.isUploading).length
                    }}
                    uploading)</span
                  >
                </span>
              </div>
              <div class="header-controls">
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
                <n-button
                  type="primary"
                  size="medium"
                  class="analyze-btn"
                  @click="analyzePhotos"
                  :disabled="
                    uploadedPhotos.filter((p) => !p.isUploading).length === 0
                  "
                >
                  <template #icon>
                    <n-icon>
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        />
                      </svg>
                    </n-icon>
                  </template>
                  Analyze Photos
                </n-button>
              </div>
            </div>

            <!-- Photo Grid -->
            <div
              class="photos-grid photo-grid-base"
              :class="`grid-cols-${gridColumns}`"
            >
              <PhotoCardInfo
                v-for="photo in uploadedPhotos"
                :key="photo.id"
                :photo="{
                  ...photo,
                  status: photo.isUploading
                    ? 'processing'
                    : photo.isDuplicate
                      ? 'uploaded'
                      : 'uploaded',
                }"
                @select="togglePhotoSelection"
                @info="showPhotoInfo"
              />
            </div>
          </div>
        </div>

        <!-- Tab 2: Processing -->
        <div v-show="activeTab === 'processing'" class="tab-content">
          <div class="processing-section">
            <!-- Processing Jobs Table -->
            <div
              v-if="processingJobs.length > 0"
              class="processing-table-container"
            >
              <div class="section-header">
                <h3 class="section-title">Analysis Processes</h3>
                <span class="photo-count"
                  >{{ processingJobs.length }} processes</span
                >
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
                      <span class="cell-value">{{
                        formatDate(job.startDate)
                      }}</span>
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
                        {{
                          job.status === "processing"
                            ? "Processing"
                            : "Finished"
                        }}
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
                        <div
                          v-if="job.status === 'processing'"
                          class="progress-info"
                        >
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
                  Upload photos in the Upload tab to see them here during
                  processing
                </p>
              </div>
            </div>
          </div>
        </div>

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
                  @select="togglePhotoSelection"
                  @info="showPhotoInfo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import PhotoCardInfo from "../components/PhotoCardInfo.vue";
import {
  mockedJobs,
  mockedPhotos,
  processingJobs,
  type CatalogPhoto,
  type ProcessingJob,
} from "@/assets/mocked";

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

// Router
const route = useRoute();
const router = useRouter();

// Reactive state
const activeTab = ref("upload");
const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement>();
const uploadedPhotos = ref<Photo[]>([]);
const isUploading = ref(false);
const uploadedCount = ref(0);
const totalFiles = ref(0);
const skeletonCount = ref(0);
const showDuplicateNotification = ref(false);

// Photo selection state
const selectedPhotos = ref<string[]>([]);

// Grid columns state
const gridColumns = ref(4);

// Mock processing jobs for the Processing tab
const processingJobs = ref<ProcessingJob[]>(mockedJobs);
// Static catalog photos for demonstration
const catalogPhotos = ref<CatalogPhoto[]>(mockedPhotos);

// Computed properties
const overallProgress = computed(() => {
  if (totalFiles.value === 0) return 0;
  return (uploadedCount.value / totalFiles.value) * 100;
});

// Drag and drop handlers
const handleDragEnter = () => {
  isDragOver.value = true;
};

const handleDragOver = () => {
  isDragOver.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  if (
    !e.relatedTarget ||
    !(e.currentTarget as Element).contains(e.relatedTarget as Node)
  ) {
    isDragOver.value = false;
  }
};

const handleDrop = (e: DragEvent) => {
  isDragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files) {
    handleFiles(Array.from(files));
  }
};

// File handling
const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click();
  }
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    handleFiles(Array.from(target.files));
  }
  // Reset the input so the same files can be selected again
  target.value = "";
};

const handleFiles = async (files: File[]) => {
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));
  if (imageFiles.length === 0) return;

  isUploading.value = true;
  totalFiles.value = imageFiles.length;
  uploadedCount.value = 0;
  skeletonCount.value = 0; // No longer needed

  // Create placeholder photos immediately for all files
  const uploadingPhotos: Photo[] = imageFiles.map((file) => ({
    id: `photo-${Date.now()}-${Math.random()}`,
    name: file.name,
    size: file.size,
    file: file,
    isDuplicate: false,
    isUploading: true, // Mark as uploading
  }));

  // Add all uploading photos to the list immediately
  uploadedPhotos.value.push(...uploadingPhotos);

  // Simulate uploading files one by one
  for (let i = 0; i < uploadingPhotos.length; i++) {
    const photo = uploadingPhotos[i];

    // Simulate upload delay (1-3 seconds per file)
    const uploadDelay = Math.random() * 2000 + 1000;
    await new Promise((resolve) => setTimeout(resolve, uploadDelay));

    // Find the photo in the uploaded list and update it
    const photoIndex = uploadedPhotos.value.findIndex((p) => p.id === photo.id);
    if (photoIndex !== -1) {
      uploadedPhotos.value[photoIndex] = {
        ...photo,
        url: URL.createObjectURL(photo.file),
        uploadDate: new Date(),
        isUploading: false, // Mark as completed
      };
    }

    uploadedCount.value++;
  }

  isUploading.value = false;

  // Show duplicate checking notification after upload completes
  showDuplicateNotification.value = true;

  // Simulate duplicate checking process
  setTimeout(() => {
    // Randomly mark some photos as duplicates (20% chance)
    uploadedPhotos.value.forEach((photo) => {
      if (Math.random() < 0.2 && !photo.isUploading) {
        photo.isDuplicate = true;
      }
    });

    showDuplicateNotification.value = false;
  }, 2000);
};

// Function to analyze photos manually
const analyzePhotos = () => {
  if (uploadedPhotos.value.length === 0) return;

  // Show duplicate checking notification
  showDuplicateNotification.value = true;

  // Simulate duplicate checking process
  setTimeout(() => {
    // Randomly mark some photos as duplicates (20% chance)
    uploadedPhotos.value.forEach((photo) => {
      if (Math.random() < 0.2) {
        photo.isDuplicate = true;
      }
    });

    showDuplicateNotification.value = false;
  }, 2000);
};

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
const togglePhotoSelection = (photoId: string) => {
  const index = selectedPhotos.value.indexOf(photoId);
  if (index > -1) {
    selectedPhotos.value.splice(index, 1);
  } else {
    selectedPhotos.value.push(photoId);
  }
};

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

// Tab management with hash routing
const setActiveTab = (tab: string) => {
  activeTab.value = tab;
  // Update URL hash without triggering navigation
  router.replace({ name: "photo-hub", hash: `#${tab}` });
};

// Initialize tab from hash
onMounted(() => {
  const hash = route.hash.substring(1); // Remove # from hash
  if (hash && ["upload", "processing", "catalog"].includes(hash)) {
    activeTab.value = hash;
  }
});

// Watch for hash changes (e.g., browser back/forward)
watch(
  () => route.hash,
  (newHash) => {
    const tab = newHash.substring(1);
    if (tab && ["upload", "processing", "catalog"].includes(tab)) {
      activeTab.value = tab;
    } else if (!newHash) {
      activeTab.value = "upload";
    }
  },
);
</script>

<style scoped>
.photo-hub-container {
  padding: var(--spacing-2xl);
  margin: 0 auto;
  background-color: var(--bg-body);
  min-height: 100vh;
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

/* Upload Progress Section */
.upload-progress-section {
  background-color: #1a1a1f;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #2c2c32;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0;
}

.progress-count {
  font-size: 14px;
  color: #ffffff73;
}

.overall-progress {
  margin-bottom: 8px;
}

.progress-text {
  font-size: 14px;
  color: #ffffff73;
  text-align: center;
}

/* Duplicate Notification */
.duplicate-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
}

/* Upload Section */
.upload-section {
  margin-bottom: 48px;
}

.upload-dropzone {
  border: 2px dashed #2c2c32;
  border-radius: 16px;
  padding: 64px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #1a1a1f;
}

.upload-dropzone:hover,
.upload-dropzone.drag-over {
  border-color: var(--secondary-color);
  background-color: rgba(139, 92, 246, 0.05);
}

.dropzone-content {
  max-width: 400px;
  margin: 0 auto;
}

.upload-icon {
  margin-bottom: 24px;
}

.dropzone-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0 0 8px 0;
}

.dropzone-subtitle {
  font-size: 16px;
  color: #ffffff73;
  margin: 0 0 32px 0;
}

.upload-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.upload-btn {
  min-width: 180px;
}

.google-photos-btn {
  min-width: 220px;
}

.file-formats {
  color: #ffffff73;
  font-size: 14px;
}

/* Compact Upload Section */
.compact-upload-section {
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #2c2c32;
}

.compact-upload-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.compact-upload-btn {
  min-width: 120px;
}

.compact-google-photos-btn {
  min-width: 160px;
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
