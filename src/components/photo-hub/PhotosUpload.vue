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

    <!-- Full Upload Dropzone (show when no photos) -->
    <div v-if="uploadedPhotos.length === 0" class="upload-section">
      <div
        class="upload-dropzone"
        :class="{ 'drag-over': isDragOver }"
        @dragenter.prevent="handleDragEnter"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
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
      <div style="display: flex; gap: 15px">
        <n-button
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
        </n-button>
        <n-button
          type="info"
          size="medium"
          class="analyze-btn"
          @click="emit('on-analyze')"
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
          Analyze Photos
        </n-button>
      </div>
    </div>

    <!-- Uploaded Photos -->
    <div v-if="uploadedPhotos.length > 0" class="uploaded-photos-section">
      <div class="grid-controls grid-controls-base">
        <div class="results-info results-info-base">
          <span class="results-count results-count-base">
            {{ uploadedPhotos.filter((p) => !p.isUploading).length }}/{{
              uploadedPhotos.length
            }}
            photos
            <span v-if="isUploading">
              ({{ uploadedPhotos.filter((p) => p.isUploading).length }}
              uploading)
            </span>
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
                @click="gridColumns = size"
              >
                {{ size }}
              </n-button>
            </n-button-group>
          </div>
        </div>
      </div>

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
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import PhotoCardInfo from "../PhotoCardInfo.vue";

const emit = defineEmits(["on-analyze"]);

interface Photo {
  id: string;
  name: string;
  size: number;
  url?: string;
  file: File;
  isUploading?: boolean;
}

// Photo selection state
const selectedPhotos = ref<string[]>([]);

const isUploading = ref(false);
const uploadedPhotos = ref<Photo[]>([]);
const gridColumns = ref(4);
const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement>();

const handleDragEnter = () => (isDragOver.value = true);
const handleDragOver = () => (isDragOver.value = true);
const handleDragLeave = () => (isDragOver.value = false);

const uploadedCount = ref(0);
const totalFiles = ref(0);

const overallProgress = computed(() => {
  if (totalFiles.value === 0) return 0;
  return (uploadedCount.value / totalFiles.value) * 100;
});

const triggerFileInput = () => {
  console.log("entra");
  if (!isUploading.value) fileInput.value?.click();
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) handleFiles(Array.from(target.files));
  target.value = "";
};

const handleDrop = (e: DragEvent) => {
  isDragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files) handleFiles(Array.from(files));
};

const handleFiles = async (files: File[]) => {
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));
  if (imageFiles.length === 0) return;

  isUploading.value = true;
  totalFiles.value = imageFiles.length;
  uploadedCount.value = 0;

  const newPhotos: Photo[] = imageFiles.map((file) => ({
    id: `photo-${Date.now()}-${Math.random()}`,
    name: file.name,
    size: file.size,
    file,
    isUploading: true,
  }));

  uploadedPhotos.value.push(...newPhotos);

  for (let i = 0; i < newPhotos.length; i++) {
    const delay = Math.random() * 2000 + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const index = uploadedPhotos.value.findIndex(
      (p) => p.id === newPhotos[i].id
    );
    if (index !== -1) {
      uploadedPhotos.value[index] = {
        ...newPhotos[i],
        url: URL.createObjectURL(newPhotos[i].file),
        isUploading: false,
      };
    }
    uploadedCount.value++;
  }

  isUploading.value = false;
};

const togglePhotoSelection = (photoId: string) => {
  const index = selectedPhotos.value.indexOf(photoId);
  if (index > -1) {
    selectedPhotos.value.splice(index, 1);
  } else {
    selectedPhotos.value.push(photoId);
  }
};
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

/* Compact Upload Section */
.compact-upload-section {
  margin-bottom: 0px;
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

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-buttons {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: space-between;
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
