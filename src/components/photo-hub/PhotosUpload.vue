<template>
  <div class="tab-content">
    <DuplicatePhotosDialog
      v-model="showDuplicatesDialog"
      :duplicates="selectedDuplicates"
    />
    <n-modal
      v-model:show="showAnalyzeDialog"
      preset="confirm"
      title="Confirm analysis"
      :closable="false"
      @close="closeAnalyzeDialog"
    >
      <div style="margin-bottom: 18px">
        <span>
          You are about to process all your synced photos. Once started, it
          cannot be reversed.
        </span>
      </div>
      <div
        style="
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        <n-checkbox size="large" v-model:checked="fastMode">
          Fast mode
        </n-checkbox>
        <n-tooltip trigger="hover" placement="top">
          <template #trigger>
            <n-icon size="12" class="info-icon">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                />
              </svg>
            </n-icon>
          </template>
          Fast mode is designed for uploading photos that you want to use
          immediately and has a limit of 10% of your total storage space. If you
          have a lot of photos, it's recommended to use normal mode.
        </n-tooltip>
      </div>
      <div style="display: flex; gap: 14px; justify-content: flex-end">
        <n-button tertiary @click="closeAnalyzeDialog">Cancel</n-button>
        <n-button type="primary" @click="confirmAnalyze"
          >Start analysis</n-button
        >
      </div>
    </n-modal>
    <div
      v-if="isUploading && !isCheckingDuplicates"
      class="upload-progress-section"
    >
      <div class="progress-header">
        <h3 class="progress-title">Synchronizing Photos</h3>
        <span class="progress-count"
          >{{ uploadedCount }}/{{ totalFiles }} photos</span
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
    <!-- Upload Progress Section -->
    <div class="photo-hub-header">
      <n-icon :color="`var(--warning-color)`" size="18">
        <BookInformation20Regular />
      </n-icon>
      <h3 class="photo-hub-title">
        Entry point for photos into the platform. Preprocessed photos have
        limited use in the tools. Process them to unlock their use in other
        tools.
      </h3>
    </div>
    <!-- Full Upload Dasdaopzone (show when no photos) -->
    <div v-if="allPhotos.length === 0" class="upload-section">
      <div class="upload-dropzone">
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
          <h3 class="dropzone-title">
            {{
              singleViewMode
                ? "Your Workspace is empty"
                : "Your Prep Area is empty"
            }}
          </h3>
          <p class="dropzone-subtitle">
            Drag and drop your images, or click to browse
          </p>

          <div class="upload-buttons">
            <n-button
              type="primary"
              size="large"
              class="upload-btn"
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
            <n-button type="default" size="large" class="google-photos-btn">
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

    <!-- Compact Upload Section -->
    <div v-else class="header-buttons compact-upload-section">
      <div class="">
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
            Local Files
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
      <div style="display: flex; gap: 15px">
        <div style="display: flex; gap: 15px; align-items: center"></div>
      </div>
    </div>

    <!-- Uploaded Photos -->
    <div v-if="allPhotos.length > 0" class="uploaded-photos-section">
      <div class="grid-controls grid-controls-base">
        <div class="controls-left">
          <div class="results-info results-info-base">
            <span class="results-count results-count-base">
              {{ filteredPhotos.length }}
              photos
            </span>
          </div>
          <!-- Action buttons (show when photos are selected) -->
          <div v-if="selectedPhotoIds.length > 0" class="action-buttons">
            <n-button
              type="error"
              size="small"
              @click="handleDeleteMultiple"
              :disabled="selectedPhotoIds.length === 0"
            >
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3H9M7 6h10v13H7V6Z"
                    />
                  </svg>
                </n-icon>
              </template>
              Delete ({{ selectedPhotoIds.length }})
            </n-button>
            <n-button
              type="info"
              size="small"
              @click="handleAddToCollection"
              :disabled="selectedPhotoIds.length === 0"
            >
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M17 14H19V17H22V19H19V22H17V19H14V17H17V14M12 18H6V16H12V18M12 14H6V12H12V14M16 10H6V8H16V10M20 6H4C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H13.35C13.13 21.37 13 20.7 13 20C13 16.69 15.69 14 19 14C19.34 14 19.67 14.03 20 14.08V8C20 6.9 19.1 6 18 6H20Z"
                    />
                  </svg>
                </n-icon>
              </template>
              Add to Collection ({{ selectedPhotoIds.length }})
            </n-button>
          </div>
        </div>

        <div class="controls-right">
          <div
            class="filter-controls"
            style="display: flex; align-items: center; gap: 12px"
          >
            <n-checkbox v-model:checked="filterDuplicates" size="large">
              Filter duplicates
            </n-checkbox>
            <template v-if="props.singleViewMode">
              <n-radio-group
                v-model:value="singleViewFilter"
                size="small"
                style="margin-left: 12px"
              >
                <n-radio-button value="all">All</n-radio-button>
                <n-radio-button value="preprocessed"
                  >Preprocessed</n-radio-button
                >
                <!-- <n-radio-button value="processing">Processing</n-radio-button> -->
                <n-radio-button value="processed">Processed</n-radio-button>
              </n-radio-group>
            </template>
          </div>
          <div class="grid-size-controls grid-size-controls-base">
            <span class="grid-label grid-label-base">Columns:</span>
            <n-button-group>
              <n-button
                v-for="size in [4, 6, 8]"
                :key="size"
                :type="gridColumns === size ? 'primary' : 'default'"
                size="small"
                @click="gridColumns = size"
              >
                {{ size }}
              </n-button>
            </n-button-group>
          </div>
          <!-- Select All button (always visible) -->
          <n-button type="default" size="small" @click="handleSelectAll">
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
                  />
                </svg>
              </n-icon>
            </template>
            {{ allSelected ? "Deselect All" : "Select All" }}
          </n-button>
        </div>
      </div>

      <div
        class="photos-grid photo-grid-base"
        :class="`grid-cols-${gridColumns}`"
      >
        <PhotoCardHub
          v-for="photo in filteredPhotos"
          :key="photo.id"
          :photo="photo"
          :selected="selectedPhotosRecord[photo.id]"
          @select="togglePhotoSelection"
          @delete="deletePhoto"
          @show-duplicates="showDuplicates"
          :show-delete="true"
          :show-name="true"
          :show-footer="true"
          :showDuplicate="true"
          :is-uploading="isUploading"
        />
      </div>
    </div>

    <!-- Hidden Input -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      style="display: none"
      @change="uploadLocalFiles"
    />

    <!-- Floating Process Photos Button -->
    <FloatingProcessPhotosButton
      :should-show="shouldShowProcessButton"
      :disabled="isProcessButtonDisabled"
      @click="openAnalyzeDialog"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { usePhotosStore } from "@/stores/photos.js";
import pLimit from "p-limit";
import pica from "pica";
import { BookInformation20Regular } from "@vicons/fluent";
import PhotoCardHub from "../photoCards/PhotoCardHub.vue";
import DuplicatePhotosDialog from "../DuplicatePhotosDialog.vue";
import FloatingProcessPhotosButton from "../FloatingProcessPhotosButton.vue";
import {
  NModal,
  NCheckbox,
  NTooltip,
  NRadioGroup,
  NRadioButton,
} from "naive-ui";
import { ImagesOutline } from "@vicons/ionicons5";
import { InProgress } from "@vicons/carbon";
import api from "@/utils/axios";

const props = defineProps({
  singleViewMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["on-analyze"]);
const photosStore = usePhotosStore();

// Computed for floating button
const shouldShowProcessButton = computed(() => {
  return allPhotos.value.length > 0;
});

const isProcessButtonDisabled = computed(() => {
  return (
    isUploading.value ||
    prepAreaPhotos.value.length === 0 ||
    prepAreaPhotos.value.filter((p) => p.isCheckingDuplicates).length > 0
  );
});

const isUploading = ref(false);
const gridColumns = ref(8);
const fileInput = ref(null);
const filterDuplicates = ref(false);
const showDuplicatesDialog = ref(false);
const selectedDuplicates = ref([]);

const uploadedCount = ref(0);
const totalFiles = ref(0);

const isFirstTimeUpload = computed(() => photosStore.allPhotos.length === 0);

const fastModeOverride = ref(null);

const fastMode = computed({
  get() {
    // Si hay un override manual, usarlo
    if (fastModeOverride.value !== null) {
      return fastModeOverride.value;
    }
    // Si es la primera vez subiendo fotos, no activar fast mode automáticamente
    if (isFirstTimeUpload.value) {
      return false;
    }
    // Si hay menos de 8 fotos subidas, activar fast mode automáticamente
    return prepAreaPhotos.value.length < 8;
  },
  set(value) {
    // Para casos donde se necesite override manual
    fastModeOverride.value = value;
  },
});
const showAnalyzeDialog = ref(false);

// Filtro de visualización para singleViewMode (radio)
// Valores: 'all', 'processed', 'processing', 'preprocessed'
const singleViewFilter = ref("all");

// En el check 'preprocessed' queremos ver todas las usables en las tools, por lo que entran
// las que están en proceso y por tanto preprocessed
const preprocessed = computed(() => [
  ...photosStore.prepAreaPhotos,
  ...photosStore.processingPhotos,
]);
const prepAreaPhotos = computed(() => photosStore.prepAreaPhotos);

const processedPhotos = computed(() => photosStore.processedPhotos);
const processingPhotos = computed(() => photosStore.processingPhotos);
const allPhotos = computed(() => photosStore.allPhotos);

const filteredPhotos = computed(() => {
  if (props.singleViewMode) {
    let base = [];
    if (singleViewFilter.value === "all") {
      base = allPhotos.value;
    } else if (singleViewFilter.value === "processed") {
      base = processedPhotos.value;
    } else if (singleViewFilter.value === "processing") {
      base = processingPhotos.value;
    } else if (singleViewFilter.value === "preprocessed") {
      base = preprocessed.value;
    }
    return filterDuplicates.value
      ? base.filter((photo) => photo.isDuplicate)
      : base;
  } else {
    // Modo normal: solo preprocesadas
    return filterDuplicates.value
      ? prepAreaPhotos.value.filter((photo) => photo.isDuplicate)
      : prepAreaPhotos.value;
  }
});

// Selection state
const selectedPhotosRecord = computed(() => photosStore.selectedPhotosRecord);
const selectedPhotoIds = computed(() => photosStore.selectedPhotoIds);

// Check if all photos are selected
const allSelected = computed(() => {
  return (
    filteredPhotos.value.length > 0 &&
    filteredPhotos.value.every((photo) => selectedPhotosRecord.value[photo.id])
  );
});

const picaInstance = pica();
const limit = pLimit(10);

const overallProgress = computed(() => {
  if (totalFiles.value === 0) return 0;
  return (uploadedCount.value / totalFiles.value) * 100;
});

const triggerFileInput = () => {
  if (!isUploading.value) fileInput.value?.click();
};

async function uploadLocalFiles(event) {
  const selectedLocalFiles = Array.from(event.target.files);
  if (selectedLocalFiles.length === 0) return;

  isUploading.value = true;
  totalFiles.value = selectedLocalFiles.length;
  uploadedCount.value = 0;

  const photosToUpload = [];

  try {
    await Promise.all(
      selectedLocalFiles.map((file) =>
        limit(() =>
          processAndUploadFile(file).then((photo) => {
            if (photo) photosToUpload.push(photo);
          }),
        ),
      ),
    );

    isUploading.value = false;

    // Set photos to checking duplicates state
    const photoIds = photosToUpload.map((p) => p.id);
    photoIds.forEach((id) => {
      photosStore.updatePhoto(id, { isCheckingDuplicates: true });
    });

    // Check duplicates and restore normal state
    await api.post(`/api/analyzer`, {
      userId: "1234",
      packageId: "preprocess",
      mode: "adding",
      sync: true,
    });

    await photosStore.getOrFetch(true);
    await photosStore.checkDuplicates(photoIds);

    // Remove checking duplicates flag
    photoIds.forEach((id) => {
      photosStore.updatePhoto(id, { isCheckingDuplicates: false });
    });
  } catch (error) {
    console.error("❌ Error en la subida:", error);
  } finally {
    isUploading.value = false;
    event.target.value = "";
  }
}

async function processAndUploadFile(file) {
  const [resizedBlob, thumbnailBlob] = await Promise.all([
    resizeImage(file, 1500),
    resizeImage(file, 800),
  ]);

  // Usar el api global de axios para la petición interna
  const response = await api.post("/api/catalog/uploadLocal", {
    fileType: resizedBlob.type,
    originalName: file.name,
  });

  const { uploadUrl, thumbnailUploadUrl, photo } = response.data;

  await Promise.all([
    fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": resizedBlob.type },
      body: resizedBlob,
    }),
    fetch(thumbnailUploadUrl, {
      method: "PUT",
      headers: { "Content-Type": thumbnailBlob.type },
      body: thumbnailBlob,
    }),
  ]);

  photo.status = "uploaded";
  photo.isDuplicate = false;
  photosStore.photos.unshift(photo);
  uploadedCount.value++;

  return photo;
}

async function resizeImage(file, targetWidth) {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const scale = targetWidth / img.width;
  canvas.width = targetWidth;
  canvas.height = img.height * scale;

  await picaInstance.resize(img, canvas);
  const blob = await picaInstance.toBlob(canvas, "image/jpeg", 0.9);
  return blob;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const deletePhoto = async (photoId) => {
  await photosStore.deletePhotos([photoId]);
  // photosStore.checkDuplicates(photo.duplicates); // solo si lanzamos uno inicial
};

const showDuplicates = (duplicates) => {
  selectedDuplicates.value = duplicates;
  showDuplicatesDialog.value = true;
};

const togglePhotoSelection = (photoId) => {
  photosStore.togglePhotoSelection(photoId);
};

// Select/Deselect all photos
const handleSelectAll = () => {
  const shouldDeselectAll = allSelected.value;
  filteredPhotos.value.forEach((photo) => {
    if (shouldDeselectAll) {
      // Deselect all
      photosStore.selectedPhotosRecord[photo.id] = false;
    } else {
      // Select all
      photosStore.selectedPhotosRecord[photo.id] = true;
    }
  });
};

// Action handlers (empty for now as requested)
const handleDeleteMultiple = () => {
  photosStore.deletePhotos(selectedPhotoIds.value);
};

const handleAddToCollection = () => {
  console.log("Add to collection action for photos:", selectedPhotoIds.value);
  // TODO: Implement add to collection functionality
};

const openAnalyzeDialog = () => {
  showAnalyzeDialog.value = true;
};

const closeAnalyzeDialog = () => {
  showAnalyzeDialog.value = false;
};

const confirmAnalyze = () => {
  showAnalyzeDialog.value = false;
  emit("on-analyze", { fastMode: fastMode.value });
};

onMounted(() => {
  photosStore.checkDuplicates();
});
</script>

<style scoped>
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

.compact-upload-btn {
  min-width: 120px;
}

.compact-google-photos-btn {
  min-width: 160px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.grid-controls-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.results-info-base {
  display: flex;
  align-items: center;
  gap: 12px;
}

.results-count-base {
  font-size: 16px;
  font-weight: 500;
  color: #ffffffd1;
}

.grid-size-controls-base {
  display: flex;
  align-items: center;
  gap: 12px;
}

.grid-label-base {
  font-size: 14px;
  color: #ffffff73;
  font-weight: 500;
}

/* Photo Grid */
.photo-grid-base {
  display: grid;
  gap: 20px;
}

.photo-grid-base.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.photo-grid-base.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.photo-grid-base.grid-cols-5 {
  grid-template-columns: repeat(5, 1fr);
}

.photo-grid-base.grid-cols-6 {
  grid-template-columns: repeat(6, 1fr);
}

.photo-grid-base.grid-cols-8 {
  grid-template-columns: repeat(8, 1fr);
}

.filter-controls {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  /* background-color: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid #2c2c32; */
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

/* Responsive */
@media (max-width: 1200px) {
  .photo-grid-base.grid-cols-8 {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 1024px) {
  .photo-grid-base.grid-cols-6,
  .photo-grid-base.grid-cols-8 {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-controls-base {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .controls-left,
  .controls-right {
    width: 100%;
    justify-content: space-between;
  }

  .action-buttons {
    flex-wrap: wrap;
    gap: 6px;
  }

  .photo-grid-base.grid-cols-3,
  .photo-grid-base.grid-cols-4,
  .photo-grid-base.grid-cols-5,
  .photo-grid-base.grid-cols-6,
  .photo-grid-base.grid-cols-8 {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .photo-grid-base.grid-cols-3,
  .photo-grid-base.grid-cols-4,
  .photo-grid-base.grid-cols-5,
  .photo-grid-base.grid-cols-6,
  .photo-grid-base.grid-cols-8 {
    grid-template-columns: 1fr;
  }
}
</style>
