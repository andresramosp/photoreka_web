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
            <!-- <img
              src="@/assets/logo_name_sub_curation_lab_blue.png"
              alt="Photoreka"
              class="mobile-preview-logo"
            /> -->
            <router-link to="/" class="logo-link" aria-label="Inicio">
              <AppLogo size="tiny" />
            </router-link>
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
            <n-button
              type="primary"
              size="medium"
              @click="openPhotoDialog"
              :loading="isProcessingFiles"
              :disabled="isProcessingFiles"
            >
              <template #icon>
                <n-icon>
                  <AddIcon />
                </n-icon>
              </template>
              {{ isProcessingFiles ? "Processing..." : "Add Photos to Start" }}
            </n-button>
          </div>
          <FrameVisualizer
            v-else
            ref="frameVisualizerRef"
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
              :class="{
                active: selectedFrame?.id === frame.id,
                [`frame-${frame.category}`]: true,
              }"
              :style="{
                '--frame-color': frame.color,
                '--frame-color-light': frame.color + '20',
              }"
              @click="selectFrame(frame)"
            >
              <div class="mobile-frame-icon">
                <!-- Show social media icon or category icon -->
                <div
                  class="mobile-icon-container"
                  v-if="frame.icon || getFrameIcon(frame)"
                >
                  <n-icon
                    v-if="frame.icon"
                    :size="12"
                    class="mobile-social-icon"
                    :component="getFrameIcon(frame)"
                  />
                  <n-icon
                    v-else
                    :size="10"
                    class="mobile-category-icon"
                    :component="getFrameIcon(frame)"
                  />
                </div>
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
          <div
            class="mobile-add-photo"
            @click="openPhotoDialog"
            :class="{ processing: isProcessingFiles }"
          >
            <n-icon :size="20">
              <AddIcon v-if="!isProcessingFiles" />
              <n-spin v-else :size="20" />
            </n-icon>
            <span>{{ isProcessingFiles ? "Processing..." : "Add" }}</span>
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

    <!-- Hidden file input for playground mode -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- Photo selection dialog -->
    <PhotosDialog
      v-if="!props.playgroundMode"
      v-model="showPhotoDialog"
      title="Select Photos"
      @add-photos="handlePhotosAdded"
    />

    <!-- Playground photo selection dialog (only shown when explicitly requested) -->
    <!-- This is now only used as fallback, normal flow goes directly to file input -->
    <PlaygroundPhotosDialog
      v-if="props.playgroundMode && showPhotoDialog"
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
import { useImageProcessing } from "@/composables/useImageProcessing.js";
import { NButton, NIcon, NSlider, NSpin } from "naive-ui";

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
import {
  LogoInstagram,
  LogoFacebook,
  LogoTwitter,
  LogoLinkedin,
} from "@vicons/ionicons5";
import {
  MoveOutline as MovieIcon,
  Print as PrintIcon,
  Camera as PhotoIcon,
} from "@vicons/ionicons5";
import AppLogo from "@/components/AppLogo.vue";

const photosStore = usePhotosStore();
const message = useMessage();
const { downloadFramedPhoto, downloadFramedPhotosZip, isDownloading } =
  useFramedPhotoDownload();
const { resizeWithStepDown, loadImage } = useImageProcessing();

// State
const selectedPhotos = ref([]);
const currentPhoto = ref(null);
const selectedPhotoIds = ref(new Set());
const selectedFrame = ref(null);
const marginValue = ref(20);
const frameColor = ref("#ffffff");
const showPhotoDialog = ref(false);
const fileInputRef = ref(null);
const isProcessingFiles = ref(false);
const frameVisualizerRef = ref(null);

// Curated frames for mobile (same as desktop with colors and icons)
const allFrames = ref([
  // Social Media frames
  {
    id: "instagram-square",
    ratio: "1:1",
    aspectRatio: "1/1",
    color: "#E4405F",
    category: "social",
    icon: "instagram",
  },
  {
    id: "instagram-story",
    ratio: "9:16",
    aspectRatio: "9/16",
    color: "#E4405F",
    category: "social",
    icon: "instagram",
  },
  {
    id: "facebook-post",
    ratio: "4:3",
    aspectRatio: "4/3",
    color: "#1877F2",
    category: "social",
    icon: "facebook",
  },
  {
    id: "twitter-post",
    ratio: "16:9",
    aspectRatio: "16/9",
    color: "#1DA1F2",
    category: "social",
    icon: "twitter",
  },
  {
    id: "linkedin-post",
    ratio: "1.91:1",
    aspectRatio: "1.91/1",
    color: "#0A66C2",
    category: "social",
    icon: "linkedin",
  },

  // General photography & cinema
  {
    id: "golden-3-2",
    ratio: "3:2",
    aspectRatio: "3/2",
    color: "#8B5CF6",
    category: "photo",
  },
  {
    id: "cinema-2-3",
    ratio: "2:3",
    aspectRatio: "2/3",
    color: "#8B5CF6",
    category: "photo",
  },
  {
    id: "portrait-3-4",
    ratio: "3:4",
    aspectRatio: "3/4",
    color: "#8B5CF6",
    category: "photo",
  },
  {
    id: "movie",
    ratio: "Movie",
    aspectRatio: "2.39/1",
    color: "#F59E0B",
    category: "cinema",
  },
  {
    id: "ultrawide",
    ratio: "21:9",
    aspectRatio: "21/9",
    color: "#F59E0B",
    category: "cinema",
  },

  // Print frames
  {
    id: "print-4x6",
    ratio: '4x6"',
    aspectRatio: "6/4",
    color: "#10B981",
    category: "print",
  },
  {
    id: "print-5x7",
    ratio: '5x7"',
    aspectRatio: "7/5",
    color: "#10B981",
    category: "print",
  },
  {
    id: "print-8x10",
    ratio: '8x10"',
    aspectRatio: "10/8",
    color: "#10B981",
    category: "print",
  },
  {
    id: "print-11x14",
    ratio: '11x14"',
    aspectRatio: "14/11",
    color: "#10B981",
    category: "print",
  },
  {
    id: "print-16x20",
    ratio: '16x20"',
    aspectRatio: "20/16",
    color: "#10B981",
    category: "print",
  },
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

// Get icon component for frame
const getFrameIcon = (frame) => {
  switch (frame.icon) {
    case "instagram":
      return LogoInstagram;
    case "facebook":
      return LogoFacebook;
    case "twitter":
      return LogoTwitter;
    case "linkedin":
      return LogoLinkedin;
    default:
      switch (frame.category) {
        case "cinema":
          return MovieIcon;
        case "print":
          return PrintIcon;
        case "photo":
          return PhotoIcon;
        default:
          return null;
      }
  }
};

// Methods
const openPhotoDialog = () => {
  if (props.playgroundMode) {
    // In playground mode, directly open file selector
    triggerFileSelect();
  } else {
    // In authenticated mode, show photo dialog
    showPhotoDialog.value = true;
  }
};

const triggerFileSelect = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files).filter((file) =>
    file.type.startsWith("image/")
  );

  if (files.length > 0) {
    await processLocalFiles(files);
  }

  // Reset input to allow selecting the same files again
  event.target.value = "";
};

const processLocalFiles = async (files) => {
  if (files.length === 0) return;

  isProcessingFiles.value = true;

  try {
    const processedPhotos = [];

    for (const file of files) {
      try {
        // Process image similar to PlaygroundPhotosDialog but using resizeWithStepDown
        const [resizedBlob, thumbnailBlob] = await Promise.all([
          resizeWithStepDown(file, 1500), // Main image
          resizeWithStepDown(file, 800), // Thumbnail
        ]);

        // Create preview URL from thumbnail
        const preview = URL.createObjectURL(thumbnailBlob);

        // Get dimensions from the resized image
        const dimensions = await getImageDimensions(preview);

        const photoObject = {
          id: Date.now() + Math.random(), // Simple ID generation
          thumbnailUrl: preview,
          name: file.name,
          file: resizedBlob, // Use resized image
          originalFile: file, // Keep reference to original
          dimensions: dimensions,
          tags: [],
          detectionAreas: [],
        };

        processedPhotos.push(photoObject);
      } catch (error) {
        console.error("Error processing file:", file.name, error);
        message.error(`Failed to process ${file.name}`);
      }
    }

    if (processedPhotos.length > 0) {
      // Add processed photos directly to the selection
      selectedPhotos.value.push(...processedPhotos);

      // Auto-select first photo if none selected
      if (selectedCount.value === 0 && processedPhotos.length > 0) {
        const firstPhoto = processedPhotos[0];
        currentPhoto.value = firstPhoto;
        selectedPhotoIds.value.add(firstPhoto.id);
      }

      // Auto-select first frame if none selected
      if (!selectedFrame.value) {
        selectedFrame.value = allFrames.value[0];
      }

      message.success(
        `Added ${processedPhotos.length} photo${
          processedPhotos.length > 1 ? "s" : ""
        }`
      );
    }
  } catch (error) {
    console.error("Error processing files:", error);
    message.error("Failed to process images");
  } finally {
    isProcessingFiles.value = false;
  }
};

// Get image dimensions function
const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
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
      props.playgroundMode,
      frameVisualizerRef.value
    );
  } else {
    await downloadFramedPhotosZip(
      photosToDownload,
      frameConfig,
      props.playgroundMode,
      frameVisualizerRef.value
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
  padding: 2px;
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
  position: relative;
  overflow: visible;
}

.mobile-frame-option::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--frame-color, var(--primary-color));
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
}

.mobile-frame-option:hover {
  border-color: var(--frame-color, var(--primary-color));
  transform: translateY(-1px);
  background: linear-gradient(
    135deg,
    var(--bg-body) 0%,
    var(--frame-color-light, var(--primary-color-light)) 100%
  );
  box-shadow: 0 2px 8px var(--frame-color-light, rgba(0, 0, 0, 0.1));
}

.mobile-frame-option:hover::before {
  opacity: 1;
}

.mobile-frame-option.active {
  border-color: var(--frame-color, var(--primary-color));
  background-color: var(--frame-color, var(--primary-color));
  color: white;
  transform: translateY(-1px);
}

.mobile-frame-option.active::before {
  opacity: 1;
  height: 100%;
  background: var(--frame-color, var(--primary-color));
  border-radius: var(--border-radius-md);
}

.mobile-frame-option.active .mobile-frame-shape {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.mobile-frame-option.active .mobile-frame-ratio {
  color: white;
  font-weight: 600;
}

.mobile-frame-option.active .mobile-social-icon,
.mobile-frame-option.active .mobile-category-icon {
  color: white;
}

.mobile-frame-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 28px;
  height: 28px;
  position: relative;
}

.mobile-icon-container {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: -6px;
  z-index: 2;
}

.mobile-social-icon {
  color: var(--frame-color, var(--primary-color));
  transition: all 0.2s ease;
  background: var(--bg-body);
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.mobile-category-icon {
  color: var(--frame-color, var(--text-tertiary));
  transition: all 0.2s ease;
  background: var(--bg-body);
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mobile-frame-shape {
  border: 1px solid var(--frame-color, var(--border-color));
  background-color: transparent;
  max-width: 20px;
  max-height: 20px;
  min-width: 8px;
  min-height: 8px;
  transition: all 0.2s ease;
  border-radius: 1px;
  margin-top: -2px;
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

.mobile-add-photo.processing {
  pointer-events: none;
  opacity: 0.7;
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
    flex: 0 0 45vh;
  }

  .mobile-photo-preview {
    height: calc(45vh - 60px);
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
