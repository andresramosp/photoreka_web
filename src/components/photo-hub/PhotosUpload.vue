<template>
  <div class="tab-content">
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
    <!-- Upload Progress Section -->
    <div class="photo-hub-header">
      <n-icon :color="`var(--warning-color)`" size="18">
        <BookInformation20Regular />
      </n-icon>
      <h3 class="photo-hub-title">
        This is where you upload your photos. You can store them until you want
        to run the analysis.
      </h3>
    </div>
    <!-- Full Upload Dasdaopzone (show when no photos) -->
    <div v-if="uploadedPhotos.length === 0" class="upload-section">
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
          <h3 class="dropzone-title">Your upload storage is empty</h3>
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
        <!-- <n-button
          type="default"
          size="medium"
          class="analyze-btn"
          @click="() => {}"
          :disabled="uploadedPhotos.filter((p) => !p.isUploading).length === 0"
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
          Check duplicates
        </n-button> -->
        <n-button
          type="info"
          size="medium"
          class="analyze-btn"
          @click="emit('on-analyze')"
          :disabled="
            isUploading ||
            uploadedPhotos.filter((p) => p.isCheckingDuplicates).length > 0
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

    <!-- Uploaded Photos -->
    <div v-if="uploadedPhotos.length > 0" class="uploaded-photos-section">
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
              @click="handleDelete"
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
          <div class="filter-controls">
            <n-checkbox v-model:checked="filterDuplicates" size="large">
              Filter duplicates
            </n-checkbox>
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
          :show-footer="true"
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { usePhotosStore } from "@/stores/photos.js";
import pLimit from "p-limit";
import pica from "pica";
import { BookInformation20Regular } from "@vicons/fluent";
import PhotoCardHub from "../photoCards/PhotoCardHub.vue";

const emit = defineEmits(["on-analyze"]);

const photosStore = usePhotosStore();

const isUploading = ref(false);
const gridColumns = ref(8);
const fileInput = ref(null);
const filterDuplicates = ref(false);

const uploadedCount = ref(0);
const totalFiles = ref(0);

const uploadedPhotos = computed(() => photosStore.uploadedPhotos);

const filteredPhotos = computed(() => {
  if (!filterDuplicates.value) {
    return uploadedPhotos.value;
  }
  return uploadedPhotos.value.filter((photo) => photo.isDuplicate);
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

  const uploadedPhotos = [];

  try {
    await Promise.all(
      selectedLocalFiles.map((file) =>
        limit(() =>
          processAndUploadFile(file).then((photo) => {
            if (photo) uploadedPhotos.push(photo);
          }),
        ),
      ),
    );

    // Set photos to checking duplicates state
    const photoIds = uploadedPhotos.map((p) => p.id);
    photoIds.forEach((id) => {
      photosStore.updatePhoto(id, { isCheckingDuplicates: true });
    });

    // Check duplicates and restore normal state
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

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/catalog/uploadLocal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileType: resizedBlob.type,
        originalName: file.name,
      }),
    },
  );

  if (!res.ok) throw new Error("Error obteniendo URLs firmadas");
  const { uploadUrl, thumbnailUploadUrl, photo } = await res.json();

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
  await photosStore.deletePhoto(photoId);
  // photosStore.checkDuplicates(photo.duplicates); // solo si lanzamos uno inicial
};

const togglePhotoSelection = (photoId) => {
  photosStore.togglePhotoSelection(photoId);
};

// Select/Deselect all photos
const handleSelectAll = () => {
  filteredPhotos.value.forEach((photo) => {
    if (allSelected.value) {
      // Deselect all
      photosStore.selectedPhotosRecord[photo.id] = false;
    } else {
      // Select all
      photosStore.selectedPhotosRecord[photo.id] = true;
    }
  });
};

// Action handlers (empty for now as requested)
const handleDelete = () => {
  console.log("Delete action for photos:", selectedPhotoIds.value);
  // TODO: Implement delete functionality
};

const handleAddToCollection = () => {
  console.log("Add to collection action for photos:", selectedPhotoIds.value);
  // TODO: Implement add to collection functionality
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
</style>
