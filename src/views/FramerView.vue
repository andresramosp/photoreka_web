<template>
  <!-- Use mobile component on small screens -->
  <FramerViewMobile v-if="isMobileView" :playground-mode="isPlaygroundMode" />

  <!-- Desktop/tablet layout -->
  <div v-else class="framer-container view-container">
    <!-- Welcome state (only in non-playground mode) -->
    <div v-if="!hasSelectedPhotos && !isPlaygroundMode" class="empty-state">
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
    <div v-if="hasSelectedPhotos || isPlaygroundMode" class="framer-interface">
      <!-- Main content area -->
      <div class="framer-content">
        <!-- Left sidebar with frame options -->
        <div class="frame-sidebar">
          <div class="sidebar-header">
            <!-- Logo for playground mode -->
            <div v-if="isPlaygroundMode" class="logo-container">
              <img
                src="@/assets/logo_name_sub_curation_lab_blue.png"
                alt="Photoreka"
                class="app-logo"
              />
            </div>
            <!-- Title for authenticated mode -->
            <h3 v-else>Frame Styles</h3>
          </div>

          <!-- Frame styles title (smaller, closer to options) -->
          <div v-if="isPlaygroundMode" class="frame-styles-title">
            <h4>Frame Styles</h4>
          </div>

          <div class="frame-options-grid">
            <!-- Aspect ratio options -->
            <div
              v-for="frame in allFrames"
              :key="frame.id"
              class="frame-option"
              :class="{ active: selectedFrame?.id === frame.id }"
              @click="selectFrame(frame)"
            >
              <div class="frame-icon">
                <div
                  class="frame-shape"
                  :style="{ aspectRatio: frame.aspectRatio }"
                ></div>
              </div>
              <span class="frame-ratio">{{ frame.ratio }}</span>
            </div>
          </div>

          <!-- Frame controls -->
          <div class="frame-controls" v-if="selectedFrame">
            <div class="controls-header">
              <h4>Frame Settings</h4>
            </div>

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

        <!-- Center preview area -->
        <div
          class="preview-area"
          :class="{ 'playground-mode': isPlaygroundMode }"
        >
          <div class="preview-container">
            <div class="preview-header">
              <!-- Logo for playground mode -->

              <!-- Title for authenticated mode -->
              <h3>Preview</h3>
              <div class="preview-controls" v-if="selectedCount > 0">
                <n-button
                  @click="downloadPhotos"
                  type="primary"
                  :loading="isDownloading"
                  :disabled="isDownloading"
                >
                  <template #icon>
                    <n-icon>
                      <DownloadIcon />
                    </n-icon>
                  </template>
                  Download{{
                    selectedCount > 0
                      ? ` (${selectedCount})`
                      : ` All (${selectedPhotos.length})`
                  }}
                </n-button>
              </div>
            </div>

            <div class="photo-preview" :class="{ 'has-photo': !!previewPhoto }">
              <div class="preview-wrapper">
                <template v-if="previewPhoto">
                  <FrameVisualizer
                    :photo-url="previewPhotoUrl"
                    :photo-alt="
                      previewPhoto?.file_name ||
                      previewPhoto?.name ||
                      'Selected photo'
                    "
                    :aspect-ratio="selectedFrame?.aspectRatio || '1/1'"
                    :frame-color="frameColor"
                    :margin="marginValue"
                    max-width="95%"
                    max-height="95%"
                    @image-load="onImageLoad"
                    @image-error="onImageError"
                  />
                  <!-- Photo count indicator -->
                  <div v-if="selectedCount > 1" class="photo-count-indicator">
                    <span>{{ selectedCount }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="no-photo-preview">
                    <n-button
                      type="primary"
                      size="large"
                      @click="openPhotoDialog"
                    >
                      <template #icon>
                        <n-icon>
                          <AddIcon />
                        </n-icon>
                      </template>
                      Add Photos to Start
                    </n-button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Right sidebar with photo selection (desktop only) -->
        <div class="photo-sidebar desktop-only">
          <div class="sidebar-header">
            <h4>Selected Photos</h4>
            <div class="strip-actions">
              <span class="photo-count"
                >{{ selectedPhotos.length }} photos</span
              >
              <n-button
                @click="clearAllPhotos"
                quaternary
                type="error"
                size="small"
              >
                <template #icon>
                  <n-icon>
                    <TrashIcon />
                  </n-icon>
                </template>
                Clear All
              </n-button>
            </div>
          </div>
          <div class="photo-grid">
            <!-- Add more photos button -->
            <div class="add-photo-card" @click="openPhotoDialog">
              <div class="add-photo-card-content">
                <n-icon :size="32" color="var(--primary-color)">
                  <AddIcon />
                </n-icon>
                <span class="add-photo-card-text">Add Photos</span>
              </div>
            </div>

            <!-- Photo thumbnails -->
            <PhotoCard
              v-for="photo in selectedPhotos"
              :key="photo.id"
              :photo="photo"
              :selected="selectedPhotoIds.has(photo.id)"
              mode="selection"
              :show-stars="false"
              :show-tags="false"
              :show-return-button="false"
              @select="selectPhoto"
              @move-to-curation="removePhoto"
              class="framer-photo-card"
            />
          </div>
        </div>
      </div>

      <!-- Bottom photo strip (mobile only) -->
      <div class="photo-strip mobile-only">
        <div class="strip-header">
          <h4>Selected Photos</h4>
          <div class="strip-actions">
            <span class="photo-count">{{ selectedPhotos.length }} photos</span>
            <n-button
              @click="clearAllPhotos"
              quaternary
              type="error"
              size="small"
            >
              <template #icon>
                <n-icon>
                  <TrashIcon />
                </n-icon>
              </template>
              Clear All
            </n-button>
          </div>
        </div>
        <div class="photo-thumbnails">
          <!-- Add more photos button -->
          <div class="add-photo-card mobile-add" @click="openPhotoDialog">
            <div class="add-photo-card-content">
              <n-icon :size="24" color="var(--primary-color)">
                <AddIcon />
              </n-icon>
              <span class="add-photo-card-text">Add</span>
            </div>
          </div>

          <!-- Photo thumbnails -->
          <PhotoCard
            v-for="photo in selectedPhotos"
            :key="photo.id"
            :photo="photo"
            :selected="selectedPhotoIds.has(photo.id)"
            mode="selection"
            :show-stars="false"
            :show-tags="false"
            :show-return-button="false"
            @select="selectPhoto"
            @move-to-curation="removePhoto"
            class="framer-photo-card mobile-card"
          />
        </div>
      </div>
    </div>

    <!-- Photo selection dialog -->
    <PhotosDialog
      v-if="!isPlaygroundMode"
      v-model="showPhotoDialog"
      title="Select Photos for Framing"
      @add-photos="handlePhotosAdded"
    />

    <!-- Playground photo selection dialog -->
    <PlaygroundPhotosDialog
      v-else
      v-model="showPhotoDialog"
      @add-photos="handlePlaygroundPhotosAdded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { usePhotosStore } from "@/stores/photos.js";
import { useMessage } from "naive-ui";
import PhotoCard from "@/components/photoCards/PhotoCard.vue";
import PhotosDialog from "@/components/PhotosDialog.vue";
import PlaygroundPhotosDialog from "@/components/PlaygroundPhotosDialog.vue";
import FrameVisualizer from "@/components/FrameVisualizer.vue";
import FramerViewMobile from "@/views/FramerViewMobile.vue";
import { useFramedPhotoDownload } from "@/composables/useFramedPhotoDownload.js";
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

const route = useRoute();
const photosStore = usePhotosStore();
const message = useMessage();
const { downloadFramedPhoto, downloadFramedPhotosZip, isDownloading } =
  useFramedPhotoDownload();

// Playground mode detection
const isPlaygroundMode = computed(() => route.meta?.playground === true);

// State
const selectedPhotos = ref([]);
const currentPhoto = ref(null);
const selectedPhotoIds = ref(new Set());
const selectedFrame = ref(null);
const marginValue = ref(20);
const frameColor = ref("#ffffff");
const showPhotoDialog = ref(false);

// Mobile detection
const windowWidth = ref(window.innerWidth);
const isMobileView = computed(() => windowWidth.value <= 768);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

// All frame options combined for the grid layout
const allFrames = ref([
  // Row 1
  { id: "square", ratio: "1:1", aspectRatio: "1/1" },
  { id: "portrait-3-4", ratio: "3:4", aspectRatio: "3/4" },
  { id: "landscape-4-3", ratio: "4:3", aspectRatio: "4/3" },

  // Row 2
  { id: "widescreen", ratio: "16:9", aspectRatio: "16/9" },
  { id: "instagram-story", ratio: "9:16", aspectRatio: "9/16" },
  { id: "cinema-2-3", ratio: "2:3", aspectRatio: "2/3" },

  // Row 3
  { id: "golden-3-2", ratio: "3:2", aspectRatio: "3/2" },
  { id: "movie", ratio: "Movie", aspectRatio: "2.39/1" },

  // Social Media frames
  { id: "instagram-square", ratio: "Instagram", aspectRatio: "1/1" },
  { id: "facebook-post", ratio: "Facebook", aspectRatio: "4/3" },
  { id: "twitter-post", ratio: "Twitter", aspectRatio: "16/9" },
  { id: "linkedin-post", ratio: "LinkedIn", aspectRatio: "1.91/1" },

  // Print frames
  { id: "print-4x6", ratio: '4x6"', aspectRatio: "6/4" },
  { id: "print-5x7", ratio: '5x7"', aspectRatio: "7/5" },
  { id: "print-8x10", ratio: '8x10"', aspectRatio: "10/8" },
  { id: "print-11x14", ratio: '11x14"', aspectRatio: "14/11" },
  { id: "print-16x20", ratio: '16x20"', aspectRatio: "20/16" },
  { id: "ultrawide", ratio: "21:9", aspectRatio: "21/9" },
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
const selectedCount = computed(() => selectedPhotoIds.value.size);
const previewPhoto = computed(() => {
  // Only show photo if there are actually selected photos
  if (selectedCount.value === 0) {
    return null;
  }

  // Show the first selected photo from the multi-selection
  const firstSelectedId = Array.from(selectedPhotoIds.value)[0];
  if (firstSelectedId) {
    return selectedPhotos.value.find((p) => p.id === firstSelectedId);
  }

  return null;
});

// Get the correct photo URL based on mode (playground vs authenticated)
const previewPhotoUrl = computed(() => {
  if (!previewPhoto.value) return null;

  // In playground mode, use thumbnailUrl (which is the blob URL from local files)
  if (isPlaygroundMode.value) {
    return previewPhoto.value.thumbnailUrl;
  }

  // In authenticated mode, use originalUrl
  return previewPhoto.value.originalUrl;
});

// Methods
const openPhotoDialog = () => {
  showPhotoDialog.value = true;
};

const handlePhotosAdded = (photoIds) => {
  // Get the full photo objects from the store using the IDs
  const photoObjects = photoIds
    .map((id) => photosStore.photos.find((photo) => photo.id === id))
    .filter(Boolean); // Remove any undefined values

  // Add the photo objects to our selection
  selectedPhotos.value.push(...photoObjects);

  // Auto-select the first photo if no photos are currently selected
  if (selectedCount.value === 0 && photoObjects.length > 0) {
    const firstPhoto = photoObjects[0];
    currentPhoto.value = firstPhoto;
    selectedPhotoIds.value.add(firstPhoto.id);
  }

  if (!selectedFrame.value) {
    selectedFrame.value = allFrames.value[0]; // Default to 1:1
  }
  message.success(
    `Added ${photoObjects.length} photo${
      photoObjects.length > 1 ? "s" : ""
    } to framer`
  );
};

const handlePlaygroundPhotosAdded = (photoObjects) => {
  // For playground mode, we receive photo objects directly from PlaygroundPhotosDialog
  selectedPhotos.value.push(...photoObjects);

  // Auto-select the first photo if no photos are currently selected
  if (selectedCount.value === 0 && photoObjects.length > 0) {
    const firstPhoto = photoObjects[0];
    currentPhoto.value = firstPhoto;
    selectedPhotoIds.value.add(firstPhoto.id);
  }

  if (!selectedFrame.value) {
    selectedFrame.value = allFrames.value[0]; // Default to 1:1
  }
  message.success(
    `Added ${photoObjects.length} photo${
      photoObjects.length > 1 ? "s" : ""
    } to framer`
  );
};

const selectPhoto = (photoId) => {
  const photo = selectedPhotos.value.find((p) => p.id === photoId);
  if (photo) {
    currentPhoto.value = photo;

    // Toggle multi-selection
    if (selectedPhotoIds.value.has(photoId)) {
      selectedPhotoIds.value.delete(photoId);
    } else {
      selectedPhotoIds.value.add(photoId);
    }
  }
};

const removePhoto = (photoId) => {
  const index = selectedPhotos.value.findIndex((p) => p.id === photoId);
  if (index > -1) {
    selectedPhotos.value.splice(index, 1);
    selectedPhotoIds.value.delete(photoId);

    // If we removed the current photo, update currentPhoto
    if (currentPhoto.value?.id === photoId) {
      // If there are still selected photos, pick the first one
      if (selectedCount.value > 0) {
        const firstSelectedId = Array.from(selectedPhotoIds.value)[0];
        currentPhoto.value = selectedPhotos.value.find(
          (p) => p.id === firstSelectedId
        );
      } else {
        // If no photos selected, try the first available photo or null
        currentPhoto.value =
          selectedPhotos.value.length > 0 ? selectedPhotos.value[0] : null;
      }
    }
  }
};

const clearAllPhotos = () => {
  selectedPhotos.value = [];
  currentPhoto.value = null;
  selectedFrame.value = null;
  selectedPhotoIds.value.clear();
};

const selectFrame = (frame) => {
  selectedFrame.value = frame;
};

const downloadPhotos = async () => {
  // Determine which photos to download
  const photosToDownload =
    selectedCount.value > 0
      ? selectedPhotos.value.filter((p) => selectedPhotoIds.value.has(p.id))
      : selectedPhotos.value;

  if (photosToDownload.length === 0 || !selectedFrame.value) return;

  const frameConfig = {
    aspectRatio: selectedFrame.value.aspectRatio,
    ratio: selectedFrame.value.ratio,
    frameColor: frameColor.value,
    margin: marginValue.value,
  };

  if (photosToDownload.length === 1) {
    // Download single photo with frame
    await downloadFramedPhoto(
      photosToDownload[0],
      frameConfig,
      isPlaygroundMode.value
    );
  } else {
    // Download multiple photos as ZIP
    await downloadFramedPhotosZip(
      photosToDownload,
      frameConfig,
      isPlaygroundMode.value
    );
  }
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
  // Ensure photos are loaded (only in authenticated mode)
  if (!isPlaygroundMode.value && photosStore.photos?.length === 0) {
    await photosStore.getOrFetch(false);
  }

  // Add window resize listener for mobile detection
  window.addEventListener("resize", updateWindowWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWindowWidth);
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
  height: calc(100vh - 80px);
}

.framer-content {
  display: flex;
  flex: 1;
  gap: var(--spacing-xl);
  overflow: hidden;
}

/* Frame Sidebar */
.frame-sidebar {
  width: 330px;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-header h3 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.logo-container {
  display: flex;
  justify-content: center;
}

.app-logo {
  max-height: 50px;
  width: auto;
  object-fit: contain;
}

.frame-styles-title {
  margin-bottom: var(--spacing-md);
}

.frame-styles-title h4 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
}

.frame-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin-top: 0; /* Reduced margin since title is now above */
  overflow-y: auto;
  padding-right: var(--spacing-xs);
}

/* Frame Controls */
.frame-controls {
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.controls-header {
  margin-bottom: var(--spacing-md);
}

.controls-header h4 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
}

.frame-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
  background-color: var(--bg-body);
  cursor: pointer;
  transition: all 0.2s ease;
  aspect-ratio: 1;
  justify-content: center;
}

.frame-option:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.frame-option.active {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
  color: white;
}

.frame-option.active .frame-shape {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.frame-option.active .frame-ratio {
  color: white;
}

.frame-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.frame-shape {
  border: 2px solid var(--border-color);
  background-color: transparent;
  max-width: 40px;
  max-height: 40px;
  min-width: 16px;
  min-height: 16px;
  transition: all 0.2s ease;
}

.frame-ratio {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  transition: all 0.2s ease;
}

/* Frame Controls */
.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
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
  gap: var(--spacing-sm);
}

.margin-slider {
  flex: 1;
}

.slider-value {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  min-width: 50px;
  text-align: right;
  font-weight: 500;
}

.color-options {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.color-option {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.color-option.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
  transform: scale(1.05);
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

/* Solo aplica el max-height si NO es playground */
.preview-area:not(.playground-mode) {
  max-height: 87vh;
}

.preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.preview-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.preview-logo-container {
  display: flex;
  align-items: center;
}

.preview-logo {
  max-height: 32px;
  width: auto;
  object-fit: contain;
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
  position: relative;
  overflow: hidden;
}

/* Background with checkered pattern when photo is present */
/* Background with checkered pattern always visible in preview */
.photo-preview .preview-wrapper {
  background: linear-gradient(45deg, #f8fafc 25%, transparent 25%),
    linear-gradient(-45deg, #f8fafc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f8fafc 75%),
    linear-gradient(-45deg, transparent 75%, #f8fafc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.no-photo-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  /* Eliminar background-color para que se vea el patrón de fondo */
}

.preview-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.photo-count-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

/* Photo Sidebar (Desktop) */
.photo-sidebar {
  width: 280px;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex-shrink: 0;
}

.photo-sidebar .sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.photo-sidebar .sidebar-header h4 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.photo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.photo-grid .add-photo-container {
  width: 100%;
  height: 100px;
  aspect-ratio: 1;
}

/* Add photo card that matches PhotoCard style */
.add-photo-card {
  background-color: var(--bg-tertiary);
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px; /* Match typical PhotoCard height */
}

.add-photo-card:hover {
  border-color: var(--primary-color);
  background-color: var(--primary-color-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.add-photo-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.add-photo-card-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
  font-weight: 500;
}

.add-photo-card.mobile-add {
  min-height: 120px; /* Match PhotoCard height in mobile */
  width: 120px; /* Match PhotoCard width in mobile */
  flex-shrink: 0;
}

/* Responsive visibility classes */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* Photo Strip (Mobile) */
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

.strip-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
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

.photo-sidebar::-webkit-scrollbar {
  width: 6px;
}

.photo-sidebar::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
}

.photo-sidebar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--border-radius-sm);
}

.photo-sidebar::-webkit-scrollbar-thumb:hover {
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

  .photo-sidebar {
    order: 3;
    width: 100%;
  }

  /* Switch to mobile layout */
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }
}

@media (max-width: 768px) {
  .framer-container {
    padding: var(--spacing-lg);
  }

  .frame-options-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
  }

  .preview-controls {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .photo-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Compact frame controls for mobile */
  .frame-controls {
    padding: var(--spacing-sm);
  }

  .color-options {
    justify-content: center;
  }

  .color-option {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 480px) {
  .frame-options-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .photo-thumbnails {
    gap: var(--spacing-xs);
  }

  .photo-grid {
    grid-template-columns: 1fr 1fr;
  }

  /* Even more compact controls for small screens */
  .frame-controls {
    padding: var(--spacing-xs);
  }

  .controls-header h4 {
    font-size: var(--font-size-sm);
  }

  .slider-container {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xs);
  }

  .slider-value {
    text-align: center;
    min-width: auto;
  }
}
</style>
