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
        <n-button type="primary" size="medium" class="action-btn">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"
                />
              </svg>
            </n-icon>
          </template>
          Import from Camera
        </n-button>
        <n-button type="primary" ghost size="medium" class="action-btn">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                />
              </svg>
            </n-icon>
          </template>
          Upload Files
        </n-button>
      </div>
    </div>

    <!-- Tabs Section -->
    <div class="tabs-container">
      <n-tabs v-model:value="activeTab" type="segment" class="hub-tabs">
        <n-tab-pane name="upload" tab="Upload">
          <div class="tab-content">
            <!-- Upload Area -->
            <div class="upload-section">
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
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
                        />
                      </svg>
                    </n-icon>
                  </div>
                  <h3 class="dropzone-title">Drop your photos here</h3>
                  <p class="dropzone-subtitle">
                    Drag and drop your images, or click to browse
                  </p>
                  <n-button
                    type="primary"
                    size="large"
                    class="choose-files-btn"
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
                  <div class="file-formats">
                    <span class="format-text"
                      >Supports JPG, PNG, WebP up to 50MB per file</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Uploaded Photos Grid -->
            <div v-if="uploadedPhotos.length > 0" class="photos-section">
              <div class="section-header">
                <h3 class="section-title">Recently Uploaded</h3>
                <span class="photo-count"
                  >{{ uploadedPhotos.length }} photo{{
                    uploadedPhotos.length !== 1 ? "s" : ""
                  }}</span
                >
              </div>
              <div class="photos-grid">
                <div
                  v-for="photo in uploadedPhotos"
                  :key="photo.id"
                  class="photo-card"
                >
                  <div class="photo-thumbnail">
                    <img :src="photo.url" :alt="photo.name" />
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
                                d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                              />
                            </svg>
                          </n-icon>
                        </template>
                      </n-button>
                    </div>
                  </div>
                  <div class="photo-info">
                    <span class="photo-name">{{ photo.name }}</span>
                    <span class="photo-size">{{
                      formatFileSize(photo.size)
                    }}</span>
                  </div>
                  <div class="photo-status">
                    <n-tag size="small" type="warning">Pending Analysis</n-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-photos-state">
              <div class="empty-state-content">
                <n-icon size="64" color="#6b7280">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
                    />
                  </svg>
                </n-icon>
                <h3 class="empty-state-title">No photos uploaded yet</h3>
                <p class="empty-state-description">
                  Start by uploading your photos to analyze them with AI
                </p>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="processing" tab="Processing">
          <div class="tab-content">
            <div class="processing-section">
              <!-- Processing Queue -->
              <div v-if="processingPhotos.length > 0" class="processing-queue">
                <div class="section-header">
                  <h3 class="section-title">Processing Queue</h3>
                  <span class="photo-count"
                    >{{ processingPhotos.length }} photo{{
                      processingPhotos.length !== 1 ? "s" : ""
                    }}
                    in queue</span
                  >
                </div>
                <div class="processing-list">
                  <div
                    v-for="photo in processingPhotos"
                    :key="photo.id"
                    class="processing-item"
                  >
                    <div class="processing-thumbnail">
                      <img :src="photo.url" :alt="photo.name" />
                      <div class="processing-overlay">
                        <n-spin size="small" />
                      </div>
                    </div>
                    <div class="processing-info">
                      <span class="processing-name">{{ photo.name }}</span>
                      <div class="processing-progress">
                        <n-progress
                          type="line"
                          :percentage="photo.progress"
                          :show-indicator="false"
                        />
                        <span class="progress-text"
                          >{{ photo.progress }}% - {{ photo.stage }}</span
                        >
                      </div>
                    </div>
                    <div class="processing-status">
                      <n-tag size="small" type="info">Processing</n-tag>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty Processing State -->
              <div v-else class="empty-processing-state">
                <div class="empty-state-content">
                  <n-icon size="64" color="#6b7280">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      />
                    </svg>
                  </n-icon>
                  <h3 class="empty-state-title">No photos processing</h3>
                  <p class="empty-state-description">
                    Upload photos in the Upload tab to see them here during
                    analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="catalog" tab="Your Photos">
          <div class="tab-content">
            <div class="catalog-section">
              <!-- Catalog Filters -->
              <div class="catalog-filters">
                <div class="filters-left">
                  <n-input
                    v-model:value="searchQuery"
                    placeholder="Search your photos..."
                    clearable
                    class="search-input"
                  >
                    <template #prefix>
                      <n-icon>
                        <svg viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                          />
                        </svg>
                      </n-icon>
                    </template>
                  </n-input>
                  <n-select
                    v-model:value="selectedFilter"
                    :options="filterOptions"
                    placeholder="Filter by..."
                    class="filter-select"
                  />
                </div>
                <div class="filters-right">
                  <n-button-group>
                    <n-button
                      :type="viewMode === 'grid' ? 'primary' : 'default'"
                      @click="viewMode = 'grid'"
                    >
                      <template #icon>
                        <n-icon>
                          <svg viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"
                            />
                          </svg>
                        </n-icon>
                      </template>
                    </n-button>
                    <n-button
                      :type="viewMode === 'list' ? 'primary' : 'default'"
                      @click="viewMode = 'list'"
                    >
                      <template #icon>
                        <n-icon>
                          <svg viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"
                            />
                          </svg>
                        </n-icon>
                      </template>
                    </n-button>
                  </n-button-group>
                </div>
              </div>

              <!-- Catalog Photos -->
              <div v-if="catalogPhotos.length > 0" class="catalog-photos">
                <div class="section-header">
                  <h3 class="section-title">Your Photo Library</h3>
                  <span class="photo-count"
                    >{{ catalogPhotos.length }} photo{{
                      catalogPhotos.length !== 1 ? "s" : ""
                    }}</span
                  >
                </div>
                <div
                  class="photos-grid"
                  :class="{ 'list-view': viewMode === 'list' }"
                >
                  <div
                    v-for="photo in filteredCatalogPhotos"
                    :key="photo.id"
                    class="catalog-photo-card"
                  >
                    <div class="photo-thumbnail">
                      <img :src="photo.url" :alt="photo.name" />
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
                                  d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22L12 18.77L5.82 22L7 14.14l-5-4.87l6.91-1.01L12 2z"
                                />
                              </svg>
                            </n-icon>
                          </template>
                        </n-button>
                      </div>
                    </div>
                    <div class="photo-info">
                      <span class="photo-name">{{ photo.name }}</span>
                      <span class="photo-date">{{
                        formatDate(photo.uploadDate)
                      }}</span>
                    </div>
                    <div class="photo-analysis">
                      <n-tag size="small" type="success">Analyzed</n-tag>
                      <span class="analysis-count"
                        >{{ photo.tags?.length || 0 }} tags</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty Catalog State -->
              <div v-else class="empty-catalog-state">
                <div class="empty-state-content">
                  <n-icon size="64" color="#6b7280">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11.5-6L9 12.5l1.5 2L13 11l3 4H8l2.5-3zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"
                      />
                    </svg>
                  </n-icon>
                  <h3 class="empty-state-title">No photos in your catalog</h3>
                  <p class="empty-state-description">
                    Upload and analyze photos to build your personal photo
                    library
                  </p>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
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

// Reactive state
const activeTab = ref("upload");
const isDragOver = ref(false);
const searchQuery = ref("");
const selectedFilter = ref(null);
const viewMode = ref("grid");
const fileInput = ref<HTMLInputElement>();

// Mock data - In real app, this would come from API/store
const uploadedPhotos = ref<any[]>([]);
const processingPhotos = ref<any[]>([
  {
    id: 1,
    name: "IMG_001.jpg",
    url: "/api/placeholder/150/150",
    progress: 65,
    stage: "Analyzing content",
  },
  {
    id: 2,
    name: "vacation-photo.png",
    url: "/api/placeholder/150/150",
    progress: 30,
    stage: "Extracting metadata",
  },
]);

const catalogPhotos = ref<any[]>([
  {
    id: 1,
    name: "sunset-beach.jpg",
    url: "/api/placeholder/200/200",
    uploadDate: new Date("2024-01-15"),
    tags: ["sunset", "beach", "nature", "landscape"],
  },
  {
    id: 2,
    name: "family-dinner.png",
    url: "/api/placeholder/200/200",
    uploadDate: new Date("2024-01-14"),
    tags: ["family", "food", "indoor", "people"],
  },
  {
    id: 3,
    name: "mountain-hike.jpg",
    url: "/api/placeholder/200/200",
    uploadDate: new Date("2024-01-13"),
    tags: ["mountain", "hiking", "nature", "adventure"],
  },
]);

// Filter options
const filterOptions = [
  { label: "All Photos", value: "all" },
  { label: "Recent", value: "recent" },
  { label: "Favorites", value: "favorites" },
  { label: "Landscapes", value: "landscape" },
  { label: "People", value: "people" },
];

// Computed properties
const filteredCatalogPhotos = computed(() => {
  let photos = catalogPhotos.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    photos = photos.filter(
      (photo) =>
        photo.name.toLowerCase().includes(query) ||
        photo.tags?.some((tag: string) => tag.toLowerCase().includes(query)),
    );
  }

  // Filter by selected filter
  if (selectedFilter.value && selectedFilter.value !== "all") {
    // Add filtering logic based on selectedFilter.value
  }

  return photos;
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
  fileInput.value?.click();
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    handleFiles(Array.from(target.files));
  }
};

const handleFiles = (files: File[]) => {
  files.forEach((file) => {
    if (file.type.startsWith("image/")) {
      const newPhoto = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        file: file,
      };
      uploadedPhotos.value.push(newPhoto);
    }
  });
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

/* Tabs Section */
.tabs-container {
  background-color: #1a1a1f;
  border-radius: 12px;
  overflow: hidden;
}

.hub-tabs :deep(.n-tabs-nav) {
  background-color: #1a1a1f;
  padding: 0;
}

.hub-tabs :deep(.n-tabs-tab) {
  padding: 16px 24px;
  font-weight: 500;
  color: #ffffff73;
}

.hub-tabs :deep(.n-tabs-tab--active) {
  color: #ffffffd1;
  background-color: #2c2c32;
}

.tab-content {
  padding: 32px;
  background-color: #1a1a1f;
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
  background-color: #16161a;
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

.choose-files-btn {
  margin-bottom: 24px;
}

.file-formats {
  color: #ffffff73;
  font-size: 14px;
}

/* Photos Section */
.photos-section {
  margin-top: 48px;
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

.photo-count {
  font-size: 14px;
  color: #ffffff73;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.photos-grid.list-view {
  grid-template-columns: 1fr;
}

.photo-card,
.catalog-photo-card {
  background-color: #2c2c32;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.photo-card:hover,
.catalog-photo-card:hover {
  transform: translateY(-2px);
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
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.photo-name {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-size,
.photo-date {
  font-size: 12px;
  color: #ffffff73;
}

.photo-status,
.photo-analysis {
  padding: 0 12px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.analysis-count {
  font-size: 12px;
  color: #ffffff73;
}

/* Processing Section */
.processing-section {
  min-height: 400px;
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

.progress-text {
  font-size: 12px;
  color: #ffffff73;
}

.processing-status {
  flex-shrink: 0;
}

/* Catalog Section */
.catalog-section {
  min-height: 400px;
}

.catalog-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
}

.filters-left {
  display: flex;
  gap: 12px;
  flex: 1;
}

.search-input {
  max-width: 300px;
}

.filter-select {
  width: 150px;
}

.filters-right {
  flex-shrink: 0;
}

/* Empty States */
.empty-photos-state,
.empty-processing-state,
.empty-catalog-state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
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

  .tab-content {
    padding: 24px 16px;
  }

  .upload-dropzone {
    padding: 48px 24px;
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .catalog-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-left {
    flex-direction: column;
  }

  .search-input {
    max-width: none;
  }

  .processing-item {
    flex-direction: column;
    text-align: center;
  }

  .processing-thumbnail {
    width: 120px;
    height: 120px;
  }
}
</style>
