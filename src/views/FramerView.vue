<template>
  <div class="framer-container view-container">
    <!-- Welcome state -->
    <div v-if="!hasSelectedPhotos" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <n-icon :size="48">
            <SquareOutline />
          </n-icon>
        </div>
        <h2 class="empty-title">Create Beautiful Frames</h2>
        <p class="empty-description">
          Transform your photos with professional frames. Perfect for social
          media, prints, and presentations.
        </p>

        <div class="instructions-list">
          <div class="instruction-item">
            <n-icon :size="20">
              <ImageIcon />
            </n-icon>
            <span>Add photos from your catalog to get started</span>
          </div>
          <div class="instruction-item">
            <n-icon :size="20">
              <GridIcon />
            </n-icon>
            <span>Choose from various frame styles and aspect ratios</span>
          </div>
          <div class="instruction-item">
            <n-icon :size="20">
              <SpeedometerIcon />
            </n-icon>
            <span>Adjust margins and spacing with precision controls</span>
          </div>
          <div class="instruction-item">
            <n-icon :size="20">
              <DownloadIcon />
            </n-icon>
            <span>Download individually or process in batches</span>
          </div>
        </div>

        <div class="report-actions">
          <n-button
            type="primary"
            size="large"
            class="generate-button"
            @click="openPhotoDialog"
          >
            <template #icon>
              <n-icon>
                <AddIcon />
              </n-icon>
            </template>
            Add Photos
          </n-button>
        </div>
      </div>
    </div>

    <!-- Main framer interface -->
    <div v-else class="framer-interface">
      <!-- Header -->
      <div class="framer-header">
        <div class="header-left">
          <h1 class="framer-title">
            <n-icon :size="28" class="title-icon">
              <SquareOutline />
            </n-icon>
            Framer
          </h1>
          <p class="framer-subtitle">
            {{ selectedPhotos.length }} photo{{
              selectedPhotos.length > 1 ? "s" : ""
            }}
            selected
          </p>
        </div>
        <div class="header-actions">
          <n-button @click="openPhotoDialog" quaternary>
            <template #icon>
              <n-icon>
                <AddIcon />
              </n-icon>
            </template>
            Add More Photos
          </n-button>
          <n-button @click="clearAllPhotos" quaternary type="error">
            <template #icon>
              <n-icon>
                <TrashIcon />
              </n-icon>
            </template>
            Clear All
          </n-button>
        </div>
      </div>

      <!-- Main content area -->
      <div class="framer-content">
        <!-- Left sidebar with frame options -->
        <div class="frame-sidebar">
          <div class="sidebar-header">
            <h3>Frame Styles</h3>
          </div>

          <div class="frame-categories">
            <div class="frame-category">
              <h4>Social Media</h4>
              <div class="frame-options">
                <div
                  v-for="frame in socialMediaFrames"
                  :key="frame.id"
                  class="frame-option"
                  :class="{ active: selectedFrame?.id === frame.id }"
                  @click="selectFrame(frame)"
                >
                  <div
                    class="frame-preview"
                    :style="{ aspectRatio: frame.aspectRatio }"
                  >
                    <div class="frame-inner"></div>
                  </div>
                  <span class="frame-label">{{ frame.name }}</span>
                </div>
              </div>
            </div>

            <div class="frame-category">
              <h4>Standard</h4>
              <div class="frame-options">
                <div
                  v-for="frame in standardFrames"
                  :key="frame.id"
                  class="frame-option"
                  :class="{ active: selectedFrame?.id === frame.id }"
                  @click="selectFrame(frame)"
                >
                  <div
                    class="frame-preview"
                    :style="{ aspectRatio: frame.aspectRatio }"
                  >
                    <div class="frame-inner"></div>
                  </div>
                  <span class="frame-label">{{ frame.name }}</span>
                </div>
              </div>
            </div>

            <div class="frame-category">
              <h4>Print</h4>
              <div class="frame-options">
                <div
                  v-for="frame in printFrames"
                  :key="frame.id"
                  class="frame-option"
                  :class="{ active: selectedFrame?.id === frame.id }"
                  @click="selectFrame(frame)"
                >
                  <div
                    class="frame-preview"
                    :style="{ aspectRatio: frame.aspectRatio }"
                  >
                    <div class="frame-inner"></div>
                  </div>
                  <span class="frame-label">{{ frame.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Center preview area -->
        <div class="preview-area">
          <div class="preview-container">
            <div class="preview-header">
              <h3>Preview</h3>
              <div class="preview-controls">
                <n-button @click="downloadCurrent" type="primary" ghost>
                  <template #icon>
                    <n-icon>
                      <DownloadIcon />
                    </n-icon>
                  </template>
                  Download
                </n-button>
                <n-button @click="downloadAll" type="primary">
                  <template #icon>
                    <n-icon>
                      <DownloadIcon />
                    </n-icon>
                  </template>
                  Download All ({{ selectedPhotos.length }})
                </n-button>
              </div>
            </div>

            <div class="photo-preview">
              <div v-if="currentPhoto" class="preview-wrapper">
                <div
                  class="framed-photo"
                  :style="{
                    aspectRatio: selectedFrame?.aspectRatio || '1/1',
                    padding: `${marginValue}px`,
                    backgroundColor: frameColor,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                    borderRadius: '4px',
                  }"
                >
                  <img
                    :src="currentPhoto.url_medium || currentPhoto.path_thumb"
                    :alt="currentPhoto.file_name || currentPhoto.name"
                    class="photo-image"
                    @load="onImageLoad"
                    @error="onImageError"
                  />
                </div>
              </div>
              <div v-else class="no-photo-selected">
                <n-icon :size="64" color="#ddd">
                  <ImageIcon />
                </n-icon>
                <p>Select a photo from the strip below to preview</p>
              </div>
            </div>

            <!-- Margin controls -->
            <div class="margin-controls" v-if="selectedFrame">
              <div class="control-group">
                <label class="control-label">Margin Size</label>
                <div class="slider-container">
                  <n-slider
                    v-model:value="marginValue"
                    :min="0"
                    :max="200"
                    :step="5"
                    class="margin-slider"
                  />
                  <span class="slider-value">{{ marginValue }}px</span>
                </div>
              </div>

              <div class="control-group">
                <label class="control-label">Frame Color</label>
                <div class="color-options">
                  <div
                    v-for="color in frameColors"
                    :key="color.value"
                    class="color-option"
                    :class="{ active: frameColor === color.value }"
                    :style="{ backgroundColor: color.value }"
                    @click="frameColor = color.value"
                    :title="color.name"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom photo strip -->
      <div class="photo-strip">
        <div class="strip-header">
          <h4>Selected Photos</h4>
          <span class="photo-count">{{ selectedPhotos.length }} photos</span>
        </div>
        <div class="photo-thumbnails">
          <div
            v-for="photo in selectedPhotos"
            :key="photo.id"
            class="photo-thumbnail-wrapper"
            :class="{ active: currentPhoto?.id === photo.id }"
            @click="selectPhoto(photo)"
          >
            <div class="thumbnail-container">
              <img
                :src="photo.url_small || photo.path_thumb"
                :alt="photo.file_name || photo.name"
                class="thumbnail-image"
              />
              <div
                class="thumbnail-overlay"
                v-if="currentPhoto?.id === photo.id"
              >
                <n-icon :size="16" color="white">
                  <CheckIcon />
                </n-icon>
              </div>
            </div>
            <n-button
              quaternary
              size="tiny"
              type="error"
              class="remove-button"
              @click.stop="removePhoto(photo.id)"
            >
              <template #icon>
                <n-icon size="12">
                  <CloseIcon />
                </n-icon>
              </template>
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo selection dialog -->
    <PhotosDialog
      v-model="showPhotoDialog"
      title="Select Photos for Framing"
      @add-photos="handlePhotosAdded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { usePhotosStore } from "@/stores/photos.js";
import { useMessage } from "naive-ui";
import PhotoCard from "@/components/photoCards/PhotoCard.vue";
import PhotosDialog from "@/components/PhotosDialog.vue";
import { NButton, NIcon, NSlider } from "naive-ui";

// Icons
import {
  SquareOutline,
  ImageOutline as ImageIcon,
  GridOutline as GridIcon,
  SpeedometerOutline as SpeedometerIcon,
  AddOutline as AddIcon,
  DownloadOutline as DownloadIcon,
  TrashOutline as TrashIcon,
  CloseOutline as CloseIcon,
  CheckmarkOutline as CheckIcon,
} from "@vicons/ionicons5";

const photosStore = usePhotosStore();
const message = useMessage();

// State
const selectedPhotos = ref([]);
const currentPhoto = ref(null);
const selectedFrame = ref(null);
const marginValue = ref(20);
const frameColor = ref("#ffffff");
const showPhotoDialog = ref(false);

// Frame presets
const socialMediaFrames = ref([
  { id: "instagram-square", name: "Instagram Square", aspectRatio: "1/1" },
  { id: "instagram-story", name: "Instagram Story", aspectRatio: "9/16" },
  { id: "facebook-post", name: "Facebook Post", aspectRatio: "4/3" },
  { id: "twitter-post", name: "Twitter Post", aspectRatio: "16/9" },
  { id: "linkedin-post", name: "LinkedIn Post", aspectRatio: "1.91/1" },
]);

const standardFrames = ref([
  { id: "square", name: "Square", aspectRatio: "1/1" },
  { id: "landscape", name: "Landscape", aspectRatio: "4/3" },
  { id: "portrait", name: "Portrait", aspectRatio: "3/4" },
  { id: "widescreen", name: "Widescreen", aspectRatio: "16/9" },
  { id: "ultrawide", name: "Ultrawide", aspectRatio: "21/9" },
]);

const printFrames = ref([
  { id: "print-4x6", name: '4x6"', aspectRatio: "6/4" },
  { id: "print-5x7", name: '5x7"', aspectRatio: "7/5" },
  { id: "print-8x10", name: '8x10"', aspectRatio: "10/8" },
  { id: "print-11x14", name: '11x14"', aspectRatio: "14/11" },
  { id: "print-16x20", name: '16x20"', aspectRatio: "20/16" },
]);

const frameColors = ref([
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#6b7280" },
  { name: "Warm Gray", value: "#a8a29e" },
  { name: "Cream", value: "#fef7ed" },
  { name: "Beige", value: "#f5f5dc" },
]);

// Computed
const hasSelectedPhotos = computed(() => selectedPhotos.value.length > 0);

// Methods
const openPhotoDialog = () => {
  showPhotoDialog.value = true;
};

const handlePhotosAdded = (photos) => {
  selectedPhotos.value.push(...photos);
  if (!currentPhoto.value && photos.length > 0) {
    currentPhoto.value = photos[0];
  }
  if (!selectedFrame.value) {
    selectedFrame.value = socialMediaFrames.value[0]; // Default to Instagram Square
  }
  message.success(
    `Added ${photos.length} photo${photos.length > 1 ? "s" : ""} to framer`
  );
};

const selectPhoto = (photo) => {
  currentPhoto.value = photo;
};

const removePhoto = (photoId) => {
  const index = selectedPhotos.value.findIndex((p) => p.id === photoId);
  if (index > -1) {
    selectedPhotos.value.splice(index, 1);

    // If we removed the current photo, select another one
    if (currentPhoto.value?.id === photoId) {
      currentPhoto.value =
        selectedPhotos.value.length > 0 ? selectedPhotos.value[0] : null;
    }
  }
};

const clearAllPhotos = () => {
  selectedPhotos.value = [];
  currentPhoto.value = null;
  selectedFrame.value = null;
};

const selectFrame = (frame) => {
  selectedFrame.value = frame;
};

const downloadCurrent = async () => {
  if (!currentPhoto.value || !selectedFrame.value) return;

  message.info("Download functionality coming soon...");
  // TODO: Implement download logic
};

const downloadAll = async () => {
  if (selectedPhotos.value.length === 0 || !selectedFrame.value) return;

  message.info("Batch download functionality coming soon...");
  // TODO: Implement batch download logic
};

// Image handling functions
const onImageLoad = () => {
  // Image loaded successfully
};

const onImageError = () => {
  message.error("Failed to load image");
};

// Initialize
onMounted(async () => {
  // Ensure photos are loaded
  if (photosStore.photos?.length === 0) {
    await photosStore.getOrFetch(false);
  }
});
</script>

<style scoped>
.framer-container {
  padding: var(--spacing-2xl) var(--spacing-2xl) var(--spacing-4xl)
    var(--spacing-2xl);
  margin: 0 auto;
  background-color: var(--bg-body);
  min-height: 90vh;
}

/* Empty State Styles */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  text-align: center;
}

.empty-content {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-md);
}

.empty-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.empty-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.instructions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  margin: var(--spacing-lg) 0;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.instruction-item:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color-hover);
}

.instruction-item n-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.instruction-item span {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.report-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.generate-button {
  min-width: 150px;
}

/* Main Framer Interface */
.framer-interface {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.framer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.framer-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.title-icon {
  color: var(--primary-color);
}

.framer-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.framer-content {
  display: flex;
  flex: 1;
  gap: var(--spacing-xl);
  overflow: hidden;
}

/* Frame Sidebar */
.frame-sidebar {
  width: 280px;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-header h3 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.frame-categories {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.frame-category h4 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.frame-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.frame-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  border: 2px solid transparent;
  background-color: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.frame-option:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-color-hover);
}

.frame-option.active {
  border-color: var(--primary-color);
  background-color: var(--primary-color-light);
}

.frame-preview {
  width: 100%;
  max-width: 60px;
  background-color: var(--bg-body);
  border-radius: var(--border-radius-sm);
  padding: 4px;
  border: 1px solid var(--border-color);
}

.frame-inner {
  width: 100%;
  height: 100%;
  background-color: var(--bg-secondary);
  border-radius: 2px;
}

.frame-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.2;
}

/* Preview Area */
.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.preview-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.preview-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.photo-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background: linear-gradient(45deg, #f8fafc 25%, transparent 25%),
    linear-gradient(-45deg, #f8fafc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f8fafc 75%),
    linear-gradient(-45deg, transparent 75%, #f8fafc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.preview-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.framed-photo {
  max-width: 80%;
  max-height: 80%;
  transition: all 0.3s ease;
  position: relative;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  display: block;
}

.no-photo-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-tertiary);
}

.margin-controls {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.margin-slider {
  flex: 1;
}

.slider-value {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  min-width: 60px;
  text-align: right;
}

.color-options {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
}

/* Photo Strip */
.photo-strip {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-lg);
}

.strip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.strip-header h4 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
}

.photo-count {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.photo-thumbnails {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.photo-thumbnail-wrapper {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.photo-thumbnail-wrapper:hover {
  transform: translateY(-2px);
}

.photo-thumbnail-wrapper.active {
  transform: translateY(-2px);
}

.thumbnail-container {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 3px solid transparent;
  transition: all 0.2s ease;
}

.photo-thumbnail-wrapper.active .thumbnail-container {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumbnail-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: var(--primary-color);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: var(--error-color) !important;
  border: 2px solid white;
  z-index: 10;
}

/* Scrollbar styling */
.photo-thumbnails::-webkit-scrollbar {
  height: 6px;
}

.photo-thumbnails::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
}

.photo-thumbnails::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--border-radius-sm);
}

.photo-thumbnails::-webkit-scrollbar-thumb:hover {
  background: var(--border-color-hover);
}

.frame-sidebar::-webkit-scrollbar {
  width: 6px;
}

.frame-sidebar::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
}

.frame-sidebar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--border-radius-sm);
}

.frame-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--border-color-hover);
}

/* Mobile Responsiveness */
@media (max-width: 1024px) {
  .framer-content {
    flex-direction: column;
  }

  .frame-sidebar {
    width: 100%;
    order: 2;
  }

  .preview-area {
    order: 1;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .framer-container {
    padding: var(--spacing-lg);
  }

  .framer-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .header-actions {
    justify-content: stretch;
  }

  .frame-options {
    grid-template-columns: repeat(3, 1fr);
  }

  .preview-controls {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .frame-options {
    grid-template-columns: 1fr 1fr;
  }

  .photo-thumbnails {
    gap: var(--spacing-xs);
  }
}
</style>
