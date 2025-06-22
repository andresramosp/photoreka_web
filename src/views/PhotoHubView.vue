<template>
  <div class="photo-hub-container">
    <!-- Header Section -->
    <div class="hub-header">
      <div class="header-content">
        <h1 class="page-title">Photo Hub</h1>
        <p class="page-subtitle">
          Upload and analyze your photos with AI-powered insights
        </p>
      </div>
      <div class="header-actions">
        <n-button
          type="primary"
          size="medium"
          class="action-btn"
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
          Upload Photos
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

    <!-- Upload Dropzone -->
    <div
      v-if="uploadedPhotos.length === 0 && !isUploading"
      class="upload-section"
    >
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
          </div>
          <div class="file-formats">
            <span class="format-text"
              >Supports JPG, PNG, WebP up to 50MB per file</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Photos Grid -->
    <div v-if="uploadedPhotos.length > 0 || isUploading" class="photos-section">
      <div class="section-header">
        <h3 class="section-title">Your Photos</h3>
        <div class="header-controls">
          <span class="photo-count">{{ uploadedPhotos.length }} photos</span>
          <n-button
            type="primary"
            ghost
            size="small"
            @click="triggerFileInput"
            :disabled="isUploading"
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
            Add More
          </n-button>
        </div>
      </div>

      <div class="photos-grid">
        <!-- Skeleton loaders for uploading photos -->
        <div
          v-for="skeleton in skeletonCount"
          :key="`skeleton-${skeleton}`"
          class="photo-card skeleton-card"
        >
          <div class="photo-skeleton">
            <n-skeleton height="100%" />
          </div>
          <div class="photo-info">
            <n-skeleton text :repeat="1" width="60%" />
            <n-skeleton text :repeat="1" width="40%" />
          </div>
          <div class="upload-progress-indicator">
            <n-spin size="small" />
            <span class="upload-text">Uploading...</span>
          </div>
        </div>

        <!-- Uploaded photos -->
        <div
          v-for="photo in uploadedPhotos"
          :key="photo.id"
          class="photo-card"
          :class="{ duplicate: photo.isDuplicate }"
        >
          <div class="photo-thumbnail">
            <img :src="photo.url" :alt="photo.name" />

            <!-- Duplicate indicator -->
            <div v-if="photo.isDuplicate" class="duplicate-indicator">
              <n-icon size="16" color="#f59e0b">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1zm1 11h-2v-6h2v6z"
                  />
                </svg>
              </n-icon>
            </div>

            <!-- Photo overlay -->
            <div class="photo-overlay">
              <n-button circle size="small" class="overlay-btn">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <n-button circle size="small" class="overlay-btn">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
            </div>
          </div>

          <div class="photo-info">
            <div class="photo-name" :title="photo.name">{{ photo.name }}</div>
            <div class="photo-details">
              <span class="photo-size">{{ formatFileSize(photo.size) }}</span>
              <span class="photo-date">{{ formatDate(photo.uploadDate) }}</span>
            </div>
          </div>

          <div class="photo-status">
            <n-tag
              v-if="photo.isDuplicate"
              size="small"
              type="warning"
              class="duplicate-tag"
            >
              Duplicate
            </n-tag>
            <n-tag v-else size="small" type="success"> Uploaded </n-tag>
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
import { ref, computed, nextTick } from "vue";

interface Photo {
  id: string;
  name: string;
  size: number;
  url: string;
  file: File;
  uploadDate: Date;
  isDuplicate: boolean;
}

// Reactive state
const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement>();
const uploadedPhotos = ref<Photo[]>([]);
const isUploading = ref(false);
const uploadedCount = ref(0);
const totalFiles = ref(0);
const skeletonCount = ref(0);
const showDuplicateNotification = ref(false);

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
  skeletonCount.value = imageFiles.length;

  // Simulate uploading files one by one
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];

    // Simulate upload delay (1-3 seconds per file)
    const uploadDelay = Math.random() * 2000 + 1000;
    await new Promise((resolve) => setTimeout(resolve, uploadDelay));

    const newPhoto: Photo = {
      id: `photo-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      file: file,
      uploadDate: new Date(),
      isDuplicate: false,
    };

    uploadedPhotos.value.push(newPhoto);
    uploadedCount.value++;
    skeletonCount.value--;
  }

  isUploading.value = false;
  skeletonCount.value = 0;

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

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<style scoped>
.photo-hub-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #16161a;
  min-height: 100vh;
}

/* Header Section */
.hub-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffffd1;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #ffffff73;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  height: 40px;
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
  border-color: #8b5cf6;
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

.file-formats {
  color: #ffffff73;
  font-size: 14px;
}

/* Photos Section */
.photos-section {
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

.photo-skeleton {
  aspect-ratio: 1;
  overflow: hidden;
}

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
}
</style>
