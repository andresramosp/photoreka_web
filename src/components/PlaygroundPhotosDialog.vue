<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :style="{ maxWidth: '90vw', width: '900px', maxHeight: '90vh' }"
    :on-mask-click="close"
    :closable="false"
    :bordered="false"
  >
    <template #icon>
      <n-icon size="24"> <ImagesOutline /> </n-icon>
    </template>
    <template #header>
      <div class="modal-header">
        <h2>Add Photos to Canvas</h2>
        <!-- <div class="header-logo">
          <img :src="logoName" alt="Photoreka" class="logo-brand-image" />
        </div> -->
      </div>
    </template>

    <div class="modal-content">
      <!-- Upload Area - only show when no files selected -->
      <div
        v-if="selectedFiles.length === 0"
        class="upload-area"
        :class="{ 'drag-over': isDragOver }"
        @click="triggerFileSelect"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <div class="upload-icon">
          <n-icon size="48" color="var(--primary-color)">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
              />
              <path fill="currentColor" d="M12,11L16,15H13V19H11V15H8L12,11Z" />
            </svg>
          </n-icon>
        </div>
        <h3>Drop photos here or click to select</h3>
        <p>Supports JPG, PNG, WebP files</p>
        <n-button type="primary" ghost> Choose Files </n-button>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      />

      <!-- Selected Files Preview -->
      <div v-if="selectedFiles.length > 0" class="selected-files">
        <div class="selected-files-header">
          <h4>Selected Photos ({{ selectedFiles.length }})</h4>
          <n-button
            @click="triggerFileSelect"
            type="primary"
            ghost
            size="small"
          >
            Add More
          </n-button>
        </div>
        <div class="files-grid">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="file-item"
          >
            <img :src="file.preview" :alt="file.name" class="file-preview" />
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <n-button
                @click="removeFile(index)"
                size="small"
                type="error"
                text
                class="remove-btn"
              >
                ✕
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #action>
      <div class="modal-actions">
        <n-button @click="closeModal" quaternary> Cancel </n-button>
        <n-button
          type="primary"
          @click="addPhotos"
          :disabled="selectedFiles.length === 0"
          :loading="isProcessing"
        >
          Add {{ selectedFiles.length }} Photo{{
            selectedFiles.length !== 1 ? "s" : ""
          }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, computed } from "vue";
import { NModal, NButton, NIcon } from "naive-ui";
import { ImagesOutline } from "@vicons/ionicons5";
import logoName from "@/assets/logo_name_sub_curation_lab_blue.png";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "add-photos"]);

const fileInputRef = ref(null);
const selectedFiles = ref([]);
const isDragOver = ref(false);
const isProcessing = ref(false);

const show = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
    if (!value) {
      // Clear files when modal closes
      selectedFiles.value = [];
    }
  },
});

const triggerFileSelect = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  processFiles(files);
};

const handleDrop = (event) => {
  isDragOver.value = false;
  const files = Array.from(event.dataTransfer.files).filter((file) =>
    file.type.startsWith("image/")
  );
  processFiles(files);
};

const processFiles = (files) => {
  files.forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedFiles.value.push({
          file,
          name: file.name,
          preview: e.target.result,
          id: Date.now() + Math.random(), // Simple ID generation
        });
      };
      reader.readAsDataURL(file);
    }
  });
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const addPhotos = async () => {
  if (selectedFiles.value.length === 0) return;

  isProcessing.value = true;

  try {
    // Convert files to photo objects compatible with canvas store
    const photos = selectedFiles.value.map((fileObj) => ({
      id: fileObj.id,
      thumbnailUrl: fileObj.preview, // This is what createPhoto expects
      name: fileObj.name,
      file: fileObj.file,
      // The canvas store will handle creating proper config, dimensions, etc.
      tags: [],
      detectionAreas: [],
    }));

    emit("add-photos", photos);
    show.value = false;
  } catch (error) {
    console.error("Error processing photos:", error);
  } finally {
    isProcessing.value = false;
  }
};

const closeModal = () => {
  show.value = false;
};
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.modal-header h2 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.header-logo {
  flex-shrink: 0;
}

.logo-brand-image {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.modal-header p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9rem;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-surface);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--primary-color);
  background: var(--bg-container);
}

.upload-icon {
  margin-bottom: 1rem;
}

.upload-area h3 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.upload-area p {
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.selected-files h4 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.selected-files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.file-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-surface);
}

.file-preview {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.file-info {
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 0.5rem;
}

.remove-btn {
  padding: 0.25rem;
  min-width: auto !important;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 480px) {
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
