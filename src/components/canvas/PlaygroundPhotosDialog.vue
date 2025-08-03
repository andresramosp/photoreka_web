<template>
  <div v-if="modelValue" class="photos-dialog-backdrop" @click="closeDialog">
    <div class="photos-dialog-container" @click.stop>
      <div class="photos-dialog-header">
        <h2>Add Photos to Playground</h2>
        <button class="close-button" @click="closeDialog">×</button>
      </div>

      <div class="photos-dialog-content">
        <!-- Upload Area -->
        <div class="upload-section">
          <div
            class="upload-dropzone"
            :class="{
              'drag-over': isDragOver,
              'at-limit': isAtLimit,
            }"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <div class="upload-content">
              <div class="upload-icon">📸</div>
              <div class="upload-text">
                <div class="upload-title">
                  {{
                    isAtLimit
                      ? "Photo Limit Reached"
                      : "Drop photos here or click to browse"
                  }}
                </div>
                <div class="upload-subtitle">
                  {{
                    isAtLimit
                      ? `Maximum ${maxPhotos} photos allowed in playground`
                      : `${photoCount}/${maxPhotos} photos used`
                  }}
                </div>
              </div>
            </div>
          </div>

          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
            :disabled="isAtLimit"
          />
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="upload-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>
          <div class="progress-text">
            Uploading {{ uploadedCount }}/{{ totalFiles }} photos...
          </div>
        </div>

        <!-- Playground Info -->
        <div class="playground-info">
          <div class="info-card">
            <div class="info-icon">🎮</div>
            <div class="info-content">
              <div class="info-title">Playground Mode</div>
              <div class="info-description">
                Upload and arrange photos on the canvas.
                <strong>Sign up</strong> to unlock AI-powered photo expansion
                and save your work.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="photos-dialog-footer">
        <n-button @click="closeDialog">Cancel</n-button>
        <n-button
          type="primary"
          @click="addSelectedPhotos"
          :disabled="selectedFiles.length === 0 || isUploading"
        >
          Add {{ selectedFiles.length }} Photos
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { NButton } from "naive-ui";
import { usePlaygroundCanvasStore } from "@/stores/playgroundCanvas";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "photos-added"]);

const playgroundStore = usePlaygroundCanvasStore();

// Reactive state
const fileInput = ref(null);
const selectedFiles = ref([]);
const isDragOver = ref(false);
const isUploading = ref(false);
const uploadedCount = ref(0);
const totalFiles = ref(0);

// Computed properties
const photoCount = computed(() => playgroundStore.photoCount);
const maxPhotos = computed(() => playgroundStore.maxPhotos);
const isAtLimit = computed(() => playgroundStore.isAtLimit);
const canAddMore = computed(() => playgroundStore.canAddMore);

const uploadProgress = computed(() => {
  if (totalFiles.value === 0) return 0;
  return Math.round((uploadedCount.value / totalFiles.value) * 100);
});

// Methods
const closeDialog = () => {
  if (!isUploading.value) {
    // Reset state
    selectedFiles.value = [];
    isDragOver.value = false;
    uploadedCount.value = 0;
    totalFiles.value = 0;

    // Close dialog
    emit("update:modelValue", false);
  }
};

const triggerFileInput = () => {
  if (!isAtLimit.value && fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  processFiles(files);

  // Reset input
  event.target.value = "";
};

const handleDragOver = (event) => {
  if (!isAtLimit.value) {
    isDragOver.value = true;
  }
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = (event) => {
  isDragOver.value = false;

  if (isAtLimit.value) return;

  const files = Array.from(event.dataTransfer.files);
  processFiles(files);
};

const processFiles = (files) => {
  // Filtrar solo imágenes
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));

  if (imageFiles.length === 0) {
    return;
  }

  // Verificar límite
  const remainingSlots = maxPhotos.value - photoCount.value;
  if (remainingSlots <= 0) {
    return;
  }

  // Tomar solo las que caben
  const filesToAdd = imageFiles.slice(0, remainingSlots);
  selectedFiles.value = filesToAdd;
};

const addSelectedPhotos = async () => {
  if (selectedFiles.value.length === 0 || isUploading.value) return;

  isUploading.value = true;
  uploadedCount.value = 0;
  totalFiles.value = selectedFiles.value.length;

  try {
    await playgroundStore.addPhotos(selectedFiles.value);

    // Simular progreso para mejor UX
    for (let i = 1; i <= totalFiles.value; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      uploadedCount.value = i;
    }

    emit("photos-added");
    closeDialog();
  } catch (error) {
    console.error("Error adding photos:", error);
    alert(error.message || "Error adding photos");
  } finally {
    isUploading.value = false;
    uploadedCount.value = 0;
    totalFiles.value = 0;
    selectedFiles.value = [];
  }
};
</script>

<style scoped>
.photos-dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.photos-dialog-container {
  background: var(--bg-container, #2a2a2a);
  border-radius: 16px;
  width: 90vw;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

.photos-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

.photos-dialog-header h2 {
  margin: 0;
  color: var(--text-primary, #ffffff);
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--bg-surface, rgba(255, 255, 255, 0.1));
  color: var(--text-primary, #ffffff);
}

.photos-dialog-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.upload-section {
  margin-bottom: 24px;
}

.upload-dropzone {
  border: 2px dashed var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-surface, rgba(255, 255, 255, 0.02));
}

.upload-dropzone:hover:not(.at-limit) {
  border-color: var(--primary-color, #007bff);
  background: var(--bg-surface, rgba(0, 123, 255, 0.05));
}

.upload-dropzone.drag-over {
  border-color: var(--primary-color, #007bff);
  background: var(--bg-surface, rgba(0, 123, 255, 0.1));
  transform: scale(1.02);
}

.upload-dropzone.at-limit {
  border-color: var(--error-color, rgba(255, 0, 0, 0.5));
  background: var(--bg-surface, rgba(255, 0, 0, 0.05));
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 3rem;
  opacity: 0.7;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.upload-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

.upload-progress {
  margin-bottom: 24px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-surface, rgba(255, 255, 255, 0.1));
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color, #007bff);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

.playground-info {
  margin-bottom: 24px;
}

.info-card {
  background: var(--bg-surface, rgba(0, 123, 255, 0.1));
  border: 1px solid var(--primary-color, rgba(0, 123, 255, 0.3));
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
}

.info-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin-bottom: 8px;
}

.info-description {
  font-size: 0.9rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.8));
  line-height: 1.5;
}

.info-description strong {
  color: var(--primary-color, #007bff);
}

.photos-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

/* Responsive */
@media (max-width: 768px) {
  .photos-dialog-container {
    width: 95vw;
    max-height: 90vh;
    margin: 20px;
  }

  .photos-dialog-header,
  .photos-dialog-content,
  .photos-dialog-footer {
    padding: 16px;
  }

  .upload-dropzone {
    padding: 32px 16px;
  }

  .info-card {
    padding: 16px;
  }
}
</style>
