<template>
  <div class="framer-mobile-container">
    <!-- Main mobile framer interface -->
    <div class="framer-mobile-interface">
      <!-- Preview area at top -->
      <div class="mobile-preview-area">
        <div class="preview-header">
          <!-- Logo for playground mode -->
          <div
            v-if="props.playgroundMode"
            class="mobile-preview-logo-container"
          >
            <img
              src="@/assets/logo_name_sub_curation_lab_blue.png"
              alt="Photoreka"
              class="mobile-preview-logo"
            />
          </div>
          <!-- Title for authenticated mode -->
          <h3 v-else>Preview</h3>
          <n-button
            @click="downloadPhotos"
            type="primary"
            size="small"
            :loading="isDownloading"
            :disabled="isDownloading"
          >
            <template #icon>
              <n-icon>
                <DownloadIcon />
              </n-icon>
            </template>
            Download ({{ selectedCount || selectedPhotos.length }})
          </n-button>
        </div>

        <div
          class="mobile-photo-preview"
          :class="{ 'has-photo': !!previewPhoto }"
        >
          <div v-if="!previewPhoto" class="no-photo-preview">
            <n-button type="primary" size="medium" @click="openPhotoDialog">
              <template #icon>
                <n-icon>
                  <AddIcon />
                </n-icon>
              </template>
              Add Photos to Start
            </n-button>
          </div>
          <FrameVisualizer
            v-else
            :photo-url="previewPhotoUrl"
            :photo-alt="
              previewPhoto?.file_name || previewPhoto?.name || 'Selected photo'
            "
            :aspect-ratio="selectedFrame?.aspectRatio || '1/1'"
            :frame-color="frameColor"
            :margin="marginValue"
            max-width="100%"
            max-height="100%"
            @image-load="onImageLoad"
            @image-error="onImageError"
          />
          <!-- Photo count indicator -->
          <div v-if="selectedCount > 1" class="photo-count-indicator">
            {{ selectedCount }}
          </div>
        </div>
      </div>

      <!-- Frame styles section -->
      <div class="mobile-frame-section">
        <div class="section-header">
          <!-- Logo for playground mode -->
          <!-- <div v-if="props.playgroundMode" class="mobile-frame-logo-container">
            <img
              src="@/assets/logo_name_sub_curation_lab_blue.png"
              alt="Photoreka"
              class="mobile-frame-logo"
            />
          </div> -->
          <!-- Title for authenticated mode -->
          <h4>Frame Styles</h4>
        </div>

        <!-- Frame styles title (smaller, closer to options) for playground mode -->
        <div v-if="props.playgroundMode" class="mobile-frame-styles-title">
          <h5>Frame Styles</h5>
        </div>

        <div class="frame-styles-scroll">
          <div class="frame-styles-grid">
            <div
              v-for="frame in allFrames"
              :key="frame.id"
              class="mobile-frame-option"
              :class="{ active: selectedFrame?.id === frame.id }"
              @click="selectFrame(frame)"
            >
              <div class="mobile-frame-icon">
                <div
                  class="mobile-frame-shape"
                  :style="{ aspectRatio: frame.aspectRatio }"
                ></div>
              </div>
              <span class="mobile-frame-ratio">{{ frame.ratio }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Frame controls section -->
      <div class="mobile-controls-section" v-if="selectedFrame">
        <div class="mobile-controls">
          <div class="control-row">
            <label class="control-label">Margin</label>
            <div class="mobile-slider-container">
              <n-slider
                v-model:value="marginValue"
                :min="0"
                :max="200"
                :step="5"
                class="mobile-margin-slider"
              />
              <span class="mobile-slider-value">{{ marginValue }}px</span>
            </div>
          </div>

          <div class="control-row">
            <div class="mobile-color-options">
              <div
                v-for="color in frameColors"
                :key="color.value"
                class="mobile-color-option"
                :class="{ active: frameColor === color.value }"
                :style="{ backgroundColor: color.value }"
                @click="frameColor = color.value"
                :title="color.name"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected photos section at bottom -->
      <div class="mobile-photos-section">
        <div class="section-header">
          <h4>Photos</h4>
          <div class="photos-actions">
            <span class="photo-count">{{ selectedPhotos.length }}</span>
            <n-button
              @click="clearAllPhotos"
              quaternary
              type="error"
              size="tiny"
            >
              <template #icon>
                <n-icon>
                  <TrashIcon />
                </n-icon>
              </template>
            </n-button>
          </div>
        </div>

        <div class="mobile-photos-scroll">
          <!-- Add more photos button -->
          <div class="mobile-add-photo" @click="openPhotoDialog">
            <n-icon :size="20">
              <AddIcon />
            </n-icon>
            <span>Add</span>
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
            class="mobile-photo-card"
          />
        </div>
      </div>
    </div>

    <!-- Photo selection dialog -->
    <PhotosDialog
      v-if="!props.playgroundMode"
      v-model="showPhotoDialog"
      title="Select Photos"
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
import { ref, computed, onMounted } from "vue";
import { usePhotosStore } from "@/stores/photos.js";
import { useMessage } from "naive-ui";
import PhotoCard from "@/components/photoCards/PhotoCard.vue";
import PhotosDialog from "@/components/PhotosDialog.vue";
import PlaygroundPhotosDialog from "@/components/PlaygroundPhotosDialog.vue";
import FrameVisualizer from "@/components/FrameVisualizer.vue";
import { useFramedPhotoDownload } from "@/composables/useFramedPhotoDownload.js";
import { NButton, NIcon, NSlider } from "naive-ui";

// Props
const props = defineProps({
  playgroundMode: {
    type: Boolean,
    default: false,
  },
});

// Icons
import {
  AddOutline as AddIcon,
  DownloadOutline as DownloadIcon,
  TrashOutline as TrashIcon,
} from "@vicons/ionicons5";

const photosStore = usePhotosStore();
const message = useMessage();
const { downloadFramedPhoto, downloadFramedPhotosZip, isDownloading } =
  useFramedPhotoDownload();

// State
const selectedPhotos = ref([]);
const currentPhoto = ref(null);
const selectedPhotoIds = ref(new Set());
const selectedFrame = ref(null);
const marginValue = ref(20);
const frameColor = ref("#ffffff");
const showPhotoDialog = ref(false);

// Curated frames for mobile (fewer options, better organized)
const allFrames = ref([
  // Most common ratios first
  { id: "square", ratio: "1:1", aspectRatio: "1/1" },
  { id: "portrait-3-4", ratio: "3:4", aspectRatio: "3/4" },
  { id: "landscape-4-3", ratio: "4:3", aspectRatio: "4/3" },
  { id: "widescreen", ratio: "16:9", aspectRatio: "16/9" },
  { id: "instagram-story", ratio: "9:16", aspectRatio: "9/16" },
  { id: "golden-3-2", ratio: "3:2", aspectRatio: "3/2" },

  // Social Media
  { id: "instagram-square", ratio: "IG", aspectRatio: "1/1" },
  { id: "facebook-post", ratio: "FB", aspectRatio: "4/3" },
  { id: "twitter-post", ratio: "X", aspectRatio: "16/9" },

  // Print formats
  { id: "print-4x6", ratio: '4x6"', aspectRatio: "6/4" },
  { id: "print-5x7", ratio: '5x7"', aspectRatio: "7/5" },
  { id: "print-8x10", ratio: '8x10"', aspectRatio: "10/8" },
]);

const frameColors = ref([
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#6b7280" },
  { name: "Cream", value: "#fef7ed" },
  { name: "Beige", value: "#f5f5dc" },
]);

// Computed
const selectedCount = computed(() => selectedPhotoIds.value.size);
const previewPhoto = computed(() => {
  if (selectedCount.value === 0) {
    return null;
  }

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
  if (props.playgroundMode) {
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
  const photoObjects = photoIds
    .map((id) => photosStore.photos.find((photo) => photo.id === id))
    .filter(Boolean);

  selectedPhotos.value.push(...photoObjects);

  if (selectedCount.value === 0 && photoObjects.length > 0) {
    const firstPhoto = photoObjects[0];
    currentPhoto.value = firstPhoto;
    selectedPhotoIds.value.add(firstPhoto.id);
  }

  if (!selectedFrame.value) {
    selectedFrame.value = allFrames.value[0];
  }

  message.success(
    `Added ${photoObjects.length} photo${photoObjects.length > 1 ? "s" : ""}`
  );
};

const handlePlaygroundPhotosAdded = (photoObjects) => {
  // For playground mode, we receive photo objects directly from PlaygroundPhotosDialog
  selectedPhotos.value.push(...photoObjects);

  if (selectedCount.value === 0 && photoObjects.length > 0) {
    const firstPhoto = photoObjects[0];
    currentPhoto.value = firstPhoto;
    selectedPhotoIds.value.add(firstPhoto.id);
  }

  if (!selectedFrame.value) {
    selectedFrame.value = allFrames.value[0];
  }

  message.success(
    `Added ${photoObjects.length} photo${photoObjects.length > 1 ? "s" : ""}`
  );
};

const selectPhoto = (photoId) => {
  const photo = selectedPhotos.value.find((p) => p.id === photoId);
  if (photo) {
    currentPhoto.value = photo;

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

    if (currentPhoto.value?.id === photoId) {
      if (selectedCount.value > 0) {
        const firstSelectedId = Array.from(selectedPhotoIds.value)[0];
        currentPhoto.value = selectedPhotos.value.find(
          (p) => p.id === firstSelectedId
        );
      } else {
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
    await downloadFramedPhoto(
      photosToDownload[0],
      frameConfig,
      props.playgroundMode
    );
  } else {
    await downloadFramedPhotosZip(
      photosToDownload,
      frameConfig,
      props.playgroundMode
    );
  }
};

const onImageLoad = () => {
  // Image loaded successfully
};

const onImageError = () => {
  message.error("Failed to load image");
};

onMounted(async () => {
  // Only load photos from store in authenticated mode
  if (!props.playgroundMode && photosStore.photos?.length === 0) {
    await photosStore.getOrFetch(false);
  }
});
</script>

<style scoped>
.framer-mobile-container {
  padding: var(--spacing-md);
  background-color: var(--bg-body);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Main Mobile Interface */
.framer-mobile-interface {
  display: flex;
  flex-direction: column;
  height: 100vh;
  gap: var(--spacing-sm);
  overflow: hidden;
}

/* Mobile Preview Area */
.mobile-preview-area {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  flex: 0 0 40vh; /* Slightly smaller height */
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.preview-header h3 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.mobile-preview-logo-container {
  display: flex;
  align-items: center;
}

.mobile-preview-logo {
  max-height: 28px;
  width: auto;
  object-fit: contain;
}

.mobile-photo-preview {
  height: calc(40vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: var(--spacing-xs);
  /* Better centering for mobile */
  overflow: hidden;
  box-sizing: border-box;
}

/* Background with checkered pattern only when photo is present */
.mobile-photo-preview {
  background: linear-gradient(45deg, #f8fafc 25%, transparent 25%),
    linear-gradient(-45deg, #f8fafc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f8fafc 75%),
    linear-gradient(-45deg, transparent 75%, #f8fafc 75%);
  background-size: 15px 15px;
  background-position: 0 0, 0 7px, 7px -7px, -7px 0px;
}

.no-photo-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  /* Sin background-color para mostrar el patrón */
}

.photo-count-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

/* Frame Styles Section */
.mobile-frame-section {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  flex: 0 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.section-header h4 {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.mobile-frame-logo-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.mobile-frame-logo {
  max-height: 32px;
  width: auto;
  object-fit: contain;
}

.mobile-frame-styles-title {
  padding: 0 var(--spacing-md) var(--spacing-xs) var(--spacing-md);
  background-color: var(--bg-secondary);
}

.mobile-frame-styles-title h5 {
  margin: 0;
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--text-secondary);
}

.frame-styles-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding: var(--spacing-md);
  -webkit-overflow-scrolling: touch;
}

.frame-styles-grid {
  display: flex;
  gap: var(--spacing-sm);
  min-width: max-content;
}

.mobile-frame-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  border: 2px solid var(--border-color);
  background-color: var(--bg-body);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  flex-shrink: 0;
}

.mobile-frame-option:hover {
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.mobile-frame-option.active {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
  color: white;
}

.mobile-frame-option.active .mobile-frame-shape {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.mobile-frame-option.active .mobile-frame-ratio {
  color: white;
}

.mobile-frame-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.mobile-frame-shape {
  border: 1px solid var(--border-color);
  background-color: transparent;
  max-width: 24px;
  max-height: 24px;
  min-width: 8px;
  min-height: 8px;
  transition: all 0.2s ease;
}

.mobile-frame-ratio {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  transition: all 0.2s ease;
  line-height: 1;
}

/* Mobile Controls Section */
.mobile-controls-section {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  flex: 0 0 auto;
}

.mobile-controls {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.control-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  min-width: 60px;
}

.mobile-slider-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.mobile-margin-slider {
  flex: 1;
}

.mobile-slider-value {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
  font-weight: 500;
}

.mobile-color-options {
  display: flex;
  gap: var(--spacing-xs);
}

.mobile-color-option {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mobile-color-option:hover {
  transform: scale(1.05);
}

.mobile-color-option.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color-light);
  transform: scale(1.1);
}

/* Mobile Photos Section */
.mobile-photos-section {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.photos-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.photo-count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.mobile-photos-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.mobile-add-photo {
  background-color: var(--bg-tertiary);
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  gap: var(--spacing-xs);
}

.mobile-add-photo:hover {
  border-color: var(--primary-color);
  background-color: var(--primary-color-light);
}

.mobile-add-photo span {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 500;
}

.mobile-photo-card {
  width: 80px !important;
  min-width: 80px !important;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.mobile-photo-card:hover {
  transform: translateY(-1px);
}

/* Custom scrollbars for mobile */
.frame-styles-scroll::-webkit-scrollbar,
.mobile-photos-scroll::-webkit-scrollbar {
  height: 4px;
}

.frame-styles-scroll::-webkit-scrollbar-track,
.mobile-photos-scroll::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
}

.frame-styles-scroll::-webkit-scrollbar-thumb,
.mobile-photos-scroll::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--border-radius-sm);
}

.frame-styles-scroll::-webkit-scrollbar-thumb:hover,
.mobile-photos-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--border-color-hover);
}

/* Small screen adjustments */
@media (max-width: 400px) {
  .framer-mobile-container {
    padding: var(--spacing-sm);
  }

  .mobile-preview-area {
    flex: 0 0 35vh;
  }

  .mobile-photo-preview {
    height: calc(35vh - 60px);
  }

  .mobile-frame-option {
    min-width: 50px;
    padding: var(--spacing-xs);
  }

  .mobile-frame-icon {
    width: 24px;
    height: 24px;
  }

  .mobile-frame-shape {
    max-width: 20px;
    max-height: 20px;
  }

  .mobile-frame-ratio {
    font-size: 9px;
  }

  .mobile-photo-card,
  .mobile-add-photo {
    width: 70px !important;
    min-width: 70px !important;
  }

  .control-row {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .control-label {
    min-width: auto;
    text-align: left;
  }

  .mobile-slider-container {
    justify-content: space-between;
  }
}

/* Extra small screens */
@media (max-width: 320px) {
  .mobile-preview-area {
    flex: 0 0 30vh;
  }

  .mobile-photo-preview {
    height: calc(30vh - 60px);
  }

  .mobile-photo-card,
  .mobile-add-photo {
    width: 60px !important;
    min-width: 60px !important;
  }

  .mobile-frame-option {
    min-width: 45px;
  }

  .mobile-color-option {
    width: 20px;
    height: 20px;
  }
}
</style>
