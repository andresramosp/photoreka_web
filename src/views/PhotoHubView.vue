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

    <!-- Custom Tabs Section -->
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
          :class="{ active: activeTab === 'analyzed' }"
          @click="activeTab = 'analyzed'"
        >
          Catalog
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content-container">
        <!-- Tab 1: Upload - Only upload area and drag & drop -->
        <div v-show="activeTab === 'upload'" class="tab-content">
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
                    type="primary"
                    ghost
                    size="large"
                    class="upload-btn google-photos-btn"
                  >
                    <template #icon>
                      <n-icon>
                        <svg viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M12.5 8.5L8 13h3v4h3v-4h3l-4.5-4.5zM12 4C9.8 4 7.8 4.9 6.3 6.3C4.9 7.8 4 9.8 4 12s.9 4.2 2.3 5.7C7.8 19.1 9.8 20 12 20s4.2-.9 5.7-2.3C19.1 16.2 20 14.2 20 12s-.9-4.2-2.3-5.7C16.2 4.9 14.2 4 12 4z"
                          />
                          <circle cx="12" cy="12" r="2" fill="#4285f4" />
                          <circle cx="18" cy="9" r="1.5" fill="#ea4335" />
                          <circle cx="6" cy="15" r="1.5" fill="#34a853" />
                          <circle cx="15" cy="18" r="1.5" fill="#fbbc05" />
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
        </div>

        <!-- Tab 2: Processing - Only photos being processed -->
        <div v-show="activeTab === 'processing'" class="tab-content">
          <div class="processing-section">
            <!-- Processing Queue -->
            <div v-if="processingPhotos.length > 0" class="processing-queue">
              <div class="section-header">
                <h3 class="section-title">AI Analysis in Progress</h3>
                <span class="photo-count"
                  >{{ processingPhotos.length }} photo{{
                    processingPhotos.length !== 1 ? "s" : ""
                  }}
                  being analyzed</span
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
                    <n-tag size="small" type="info">Analyzing</n-tag>
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
                <h3 class="empty-state-title">No photos being analyzed</h3>
                <p class="empty-state-description">
                  Upload photos in the Upload tab to see the AI analysis process
                  here
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Analyzed - Only completed photos -->
        <div v-show="activeTab === 'analyzed'" class="tab-content">
          <div class="catalog-section">
            <!-- Catalog Filters -->
            <div v-if="catalogPhotos.length > 0" class="catalog-filters">
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

            <!-- Analyzed Photos Grid -->
            <div v-if="catalogPhotos.length > 0" class="catalog-photos">
              <div class="section-header">
                <h3 class="section-title">Analyzed Photos</h3>
                <span class="photo-count"
                  >{{ catalogPhotos.length }} photo{{
                    catalogPhotos.length !== 1 ? "s" : ""
                  }}
                  analyzed</span
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
                    <n-tag size="small" type="success">✓ Analyzed</n-tag>
                    <span class="analysis-count"
                      >{{ photo.tags?.length || 0 }} tags found</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty Analyzed State -->
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
                <h3 class="empty-state-title">No analyzed photos yet</h3>
                <p class="empty-state-description">
                  Once photos finish processing, they will appear here with AI
                  insights
                </p>
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
import { ref, computed, nextTick } from "vue";

// Reactive state
const activeTab = ref("upload");
const isDragOver = ref(false);
const searchQuery = ref("");
const selectedFilter = ref(null);
const viewMode = ref("grid");
const fileInput = ref<HTMLInputElement>();

// Mock data - In real app, this would come from API/store
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
        progress: 0,
        stage: "Starting analysis...",
      };
      // Add to processing queue immediately after upload
      processingPhotos.value.push(newPhoto);
      // Auto-switch to Analyzing tab
      activeTab.value = "analyzing";
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

/* Custom Tab Navigation */
.tab-navigation {
  display: flex;
  background-color: #1a1a1f;
  padding: 8px;
  gap: 4px;
}

.tab-button {
  flex: 1;
  padding: 12px 24px;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  color: #ffffff73;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.tab-button:hover {
  background-color: #2c2c32;
  color: #ffffff99;
}

.tab-button.active {
  background-color: #2c2c32;
  color: #ffffffd1;
}

/* Tab Content Container */
.tab-content-container {
  background-color: #1a1a1f;
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
  border-color: #4285f4 !important;
  color: #4285f4 !important;
}

.google-photos-btn:hover {
  background-color: rgba(66, 133, 244, 0.1) !important;
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
