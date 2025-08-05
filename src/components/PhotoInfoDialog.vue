<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :style="{ maxWidth: '90vw', width: '1000px', maxHeight: '90vh' }"
  >
    <template #header>
      <div class="dialog-header">
        <h3 class="photo-name">
          {{ selectedPhoto?.originalFileName || "Untitled" }}
        </h3>
        <div class="header-actions">
          <n-button
            size="small"
            @click="copyNameToClipboard"
            title="Copy name to clipboard"
          >
            <template #icon>
              <n-icon>
                <CopyIcon />
              </n-icon>
            </template>
          </n-button>
          <n-button
            size="small"
            @click="handleDownloadPhoto"
            title="Download photo"
          >
            <template #icon>
              <n-icon>
                <DownloadIcon />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </template>

    <div class="dialog-content">
      <!-- Large Photo Display -->
      <div class="photo-display">
        <img
          :src="
            selectedPhoto?.originalUrl ||
            selectedPhoto?.url ||
            selectedPhoto?.thumbnailUrl
          "
          :alt="selectedPhoto?.filename || selectedPhoto?.name || 'Photo'"
          class="main-photo"
          @error="handleImageError"
        />
      </div>
      <!-- Accordion Sections -->
      <div class="info-sections">
        <n-collapse :default-expanded-names="['metadata']">
          <!-- Tags Section -->

          <n-collapse-item title="Insights" name="descriptions">
            <template #header-extra>
              <n-icon>
                <DocumentTextIcon />
              </n-icon>
            </template>
            <div class="descriptions-section">
              <div class="custom-description-section">
                <div
                  v-if="!photoInsight && !isGeneratingInsight"
                  class="generate-section"
                >
                  <n-button
                    type="primary"
                    size="medium"
                    @click="getInsight"
                    block
                  >
                    <template #icon>
                      <n-icon>
                        <SparklesIcon />
                      </n-icon>
                    </template>
                    Get a insight
                  </n-button>
                </div>
                <div v-else-if="isGeneratingInsight" class="generating-section">
                  <n-spin size="medium" />
                  <p class="generating-text">Reviewing the image...</p>
                </div>
                <div v-else class="description-display">
                  <div class="description-content">
                    <p>{{ photoInsight }}</p>
                  </div>
                  <div
                    style="display: flex; justify-content: center; width: 100%"
                  >
                    <n-button
                      size="small"
                      @click="showNextInsight"
                      :loading="isGeneratingInsight"
                      class="regenerate-btn"
                      v-if="hasMoreInsights"
                    >
                      <template #icon>
                        <n-icon>
                          <RefreshIcon />
                        </n-icon>
                      </template>
                      Load more insights
                    </n-button>
                  </div>
                </div>
              </div>
            </div>
          </n-collapse-item>

          <n-collapse-item title="Tags" name="tags">
            <template #header-extra>
              <n-icon>
                <TagIcon />
              </n-icon>
            </template>
            <div class="tags-section">
              <div class="existing-tags" v-if="photoTags.length > 0">
                <div class="tags-list">
                  <n-tag
                    v-for="tag in photoTags.filter(
                      (tag) => tag.group !== 'misc'
                    )"
                    :key="tag.id || tag.name"
                    closable
                    type="info"
                    :bordered="false"
                    @close="removeTag(tag)"
                    class="photo-tag"
                  >
                    {{ tag.name || tag }}
                  </n-tag>
                </div>
              </div>
              <div class="add-tag-section">
                <n-input-group>
                  <n-input
                    v-model:value="newTagName"
                    placeholder="Add a new tag..."
                    @keydown.enter="addTag"
                    :disabled="isAddingTag"
                  />
                  <n-button
                    type="primary"
                    @click="addTag"
                    :loading="isAddingTag"
                    :disabled="!newTagName.trim()"
                  >
                    Add
                  </n-button>
                </n-input-group>
              </div>
            </div>
          </n-collapse-item>

          <!-- Descriptions Section -->
          <!-- <n-collapse-item title="Descriptions" name="descriptions">
            <template #header-extra>
              <n-icon>
                <DocumentTextIcon />
              </n-icon>
            </template>
            <div class="descriptions-section">
              <div v-if="selectedPhoto?.descriptions" class="ai-descriptions">
                <div class="description-item">
                  <h5 class="description-label">Story</h5>
                  <div class="description-content">
                    <p>{{ selectedPhoto.descriptions.story }}</p>
                  </div>
                </div>

                <div class="description-item">
                  <h5 class="description-label">Context</h5>
                  <div class="description-content">
                    <p>{{ selectedPhoto.descriptions.context }}</p>
                  </div>
                </div>

                <div class="description-item">
                  <h5 class="description-label">Visual Accents</h5>
                  <div class="description-content">
                    <p>{{ selectedPhoto.descriptions.visual_accents }}</p>
                  </div>
                </div>
              </div>
            </div>
          </n-collapse-item> -->

          <!-- Notes Section -->
          <n-collapse-item title="Notes" name="notes">
            <template #header-extra>
              <n-icon>
                <EditIcon />
              </n-icon>
            </template>
            <div class="notes-section">
              <n-input
                v-model:value="photoNotes"
                type="textarea"
                placeholder="Add your personal notes about this photo..."
                :autosize="{ minRows: 3, maxRows: 8 }"
                @blur="saveNotes"
              />
              <div class="notes-actions">
                <n-button
                  size="small"
                  type="primary"
                  @click="saveNotes"
                  :loading="isSavingNotes"
                >
                  Save Notes
                </n-button>
              </div>
            </div>
          </n-collapse-item>
        </n-collapse>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import {
  NModal,
  NIcon,
  NButton,
  NCollapse,
  NCollapseItem,
  NTag,
  NInput,
  NInputGroup,
  NSpin,
  useMessage,
} from "naive-ui";

// Icons from @vicons
import {
  CopyOutline as CopyIcon,
  DownloadOutline as DownloadIcon,
  InformationCircleOutline as InfoIcon,
  PricetagOutline as TagIcon,
  DocumentTextOutline as DocumentTextIcon,
  SparklesOutline as SparklesIcon,
  RefreshOutline as RefreshIcon,
  CreateOutline as EditIcon,
} from "@vicons/ionicons5";

import { api } from "@/utils/axios.js";
import { usePhotoDownload } from "@/composables/usePhotoDownload.js";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  selectedPhoto: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const message = useMessage();
const { downloadPhoto } = usePhotoDownload();

// Reactive state
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const photoTags = ref([]);
const newTagName = ref("");
const isAddingTag = ref(false);
const photoInsight = ref("");
const isGeneratingInsight = ref(false);
const photoNotes = ref("");
const isSavingNotes = ref(false);

// Watch for photo changes and reset data
watch(
  () => props.selectedPhoto,
  (newPhoto) => {
    if (newPhoto) {
      // Initialize tags from photo data
      photoTags.value = newPhoto.tags ? [...newPhoto.tags] : [];

      // Initialize description and notes if they exist
      photoInsight.value = newPhoto.description || "";
      photoNotes.value = newPhoto.notes || "";

      // Add mock metadata if missing
      if (!newPhoto.created_at) {
        newPhoto.created_at = new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
        ).toISOString();
      }
      if (!newPhoto.size) {
        newPhoto.size = Math.floor(Math.random() * 8000000) + 1500000; // 1.5-8MB
      }
      if (!newPhoto.width || !newPhoto.height) {
        newPhoto.width = 3000 + Math.floor(Math.random() * 3000);
        newPhoto.height = 2000 + Math.floor(Math.random() * 2000);
      }
      if (!newPhoto.location) {
        const locations = [
          "San Francisco, CA",
          "New York, NY",
          "London, UK",
          "Tokyo, Japan",
          "Barcelona, Spain",
          "Sydney, Australia",
        ];
        newPhoto.location =
          Math.random() > 0.3
            ? locations[Math.floor(Math.random() * locations.length)]
            : null;
      }
      if (!newPhoto.camera) {
        const cameras = [
          "Canon EOS R5",
          "Sony A7R IV",
          "Nikon Z9",
          "Fujifilm X-T5",
          "Canon EOS R6 Mark II",
        ];
        newPhoto.camera = cameras[Math.floor(Math.random() * cameras.length)];
      }
      if (!newPhoto.lens) {
        const lenses = [
          "RF 24-70mm f/2.8L IS USM",
          "FE 85mm f/1.4 GM",
          "NIKKOR Z 50mm f/1.2 S",
          "XF 35mm f/1.4 R",
          "RF 16-35mm f/2.8L IS USM",
        ];
        newPhoto.lens = lenses[Math.floor(Math.random() * lenses.length)];
      }
      if (!newPhoto.focalLength) {
        newPhoto.focalLength = 24 + Math.floor(Math.random() * 176); // 24-200mm
      }
      if (!newPhoto.aperture) {
        newPhoto.aperture = (1.4 + Math.random() * 4).toFixed(1); // f/1.4 - f/5.4
      }
      if (!newPhoto.shutterSpeed) {
        const speeds = [
          "1/15",
          "1/30",
          "1/60",
          "1/125",
          "1/250",
          "1/500",
          "1/1000",
          "1/2000",
        ];
        newPhoto.shutterSpeed =
          speeds[Math.floor(Math.random() * speeds.length)];
      }
      if (!newPhoto.iso) {
        const isos = [100, 200, 400, 800, 1600, 3200, 6400];
        newPhoto.iso = isos[Math.floor(Math.random() * isos.length)];
      }
    }
  },
  { immediate: true }
);

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "Unknown";

  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const handleImageError = (event) => {
  console.warn("Failed to load original image, falling back to thumbnail");
  // Could implement fallback logic here
};

const copyNameToClipboard = async () => {
  const name = props.selectedPhoto?.originalFileName || "Untitled";

  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(name);
      message.success("Photo name copied to clipboard");
    } else {
      // Fallback for environments where clipboard API is not available
      fallbackCopyTextToClipboard(name);
    }
  } catch (error) {
    console.warn("Clipboard API failed, trying fallback method:", error);
    fallbackCopyTextToClipboard(name);
  }
};

const fallbackCopyTextToClipboard = (text) => {
  try {
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    // Try to copy using the old execCommand method
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      message.success("Photo name copied to clipboard");
    } else {
      message.warning(
        "Unable to copy automatically. Please copy manually: " + text
      );
    }
  } catch (err) {
    console.warn("All copy methods failed:", err);
    message.warning("Copy not supported. Photo name: " + text);
  }
};

const handleDownloadPhoto = () => {
  downloadPhoto(props.selectedPhoto);
};

// Tags management
const addTag = async () => {
  const tagName = newTagName.value.trim();
  if (!tagName) return;

  // Check if tag already exists
  if (photoTags.value.some((tag) => (tag.name || tag) === tagName)) {
    message.warning("Tag already exists");
    return;
  }

  isAddingTag.value = true;

  try {
    // Create new tag object
    const newTag = {
      id: Date.now(), // Temporary ID, would be replaced by backend
      name: tagName,
    };

    photoTags.value.push(newTag);
    newTagName.value = "";

    // Here you would typically save to backend
    // await saveTagsToPhoto(props.selectedPhoto.id, photoTags.value)

    message.success("Tag added successfully");
  } catch (error) {
    photoTags.value.pop(); // Remove the tag if save failed
    message.error("Failed to add tag");
    console.error("Add tag failed:", error);
  } finally {
    isAddingTag.value = false;
  }
};

const removeTag = async (tagToRemove) => {
  const index = photoTags.value.findIndex(
    (tag) =>
      (tag.id && tag.id === tagToRemove.id) ||
      (tag.name || tag) === (tagToRemove.name || tagToRemove)
  );

  if (index === -1) return;

  try {
    photoTags.value.splice(index, 1);

    // Here you would typically save to backend
    // await saveTagsToPhoto(props.selectedPhoto.id, photoTags.value)

    message.success("Tag removed successfully");
  } catch (error) {
    // Restore the tag if removal failed
    photoTags.value.splice(index, 0, tagToRemove);
    message.error("Failed to remove tag");
    console.error("Remove tag failed:", error);
  }
};

// Description generation
const allPhotoInsights = ref([]);
const currentInsightIndex = ref(0);
const hasMoreInsights = computed(
  () =>
    allPhotoInsights.value.length > 0 &&
    currentInsightIndex.value < allPhotoInsights.value.length - 1
);

const getInsight = async () => {
  isGeneratingInsight.value = true;
  try {
    if (!props.selectedPhoto?.id) {
      throw new Error("No photo id available");
    }
    const { data } = await api.get(
      `/api/catalog/photoInsight/${props.selectedPhoto.id}`
    );
    if (data && Array.isArray(data.insights) && data.insights.length > 0) {
      allPhotoInsights.value = data.insights;
      currentInsightIndex.value = 0;
      photoInsight.value = data.insights[0];
    } else {
      allPhotoInsights.value = [];
      currentInsightIndex.value = 0;
      photoInsight.value = "No insights found for this photo.";
      message.warning("No insights found");
    }
  } catch (error) {
    message.error("Failed to generate description");
    photoInsight.value = "Failed to generate description.";
    allPhotoInsights.value = [];
    currentInsightIndex.value = 0;
    console.error("Generate description failed:", error);
  } finally {
    isGeneratingInsight.value = false;
  }
};

const showNextInsight = () => {
  if (hasMoreInsights.value) {
    isGeneratingInsight.value = true;
    setTimeout(() => {
      currentInsightIndex.value++;
      photoInsight.value = allPhotoInsights.value[currentInsightIndex.value];
      isGeneratingInsight.value = false;
    }, 1500);
  }
};

// Notes management
const saveNotes = async () => {
  isSavingNotes.value = true;

  try {
    // Here you would typically save to backend
    // await saveNotesToPhoto(props.selectedPhoto.id, photoNotes.value)

    message.success("Notes saved successfully");
  } catch (error) {
    message.error("Failed to save notes");
    console.error("Save notes failed:", error);
  } finally {
    isSavingNotes.value = false;
  }
};

// Handle ResizeObserver errors gracefully
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    if (e.message && e.message.includes("ResizeObserver loop limit exceeded")) {
      e.stopImmediatePropagation();
    }
  });
}
</script>

<style scoped>
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.photo-name {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
}

.photo-display {
  width: 100%;
  height: 400px;
  min-height: 400px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--spacing-md);
  flex-shrink: 0;
}

.main-photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  background-color: transparent;
}

.info-sections {
  flex: 1;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-xs);
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.metadata-item .label {
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.metadata-item .value {
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.tags-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.photo-tag {
  margin: 0;
  /* background-color: var(--secondary-color) !important;
  color: var(--text-primary) !important; */
}

.add-tag-section {
  max-width: 300px;
}

.descriptions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.section-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: var(--spacing-sm);
}

.ai-descriptions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.description-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.description-label {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.custom-description-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.generate-section {
  text-align: center;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 2px dashed var(--border-color);
}

.generating-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
}

.generating-text {
  margin: 0;
  color: var(--text-secondary);
}

.description-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.description-content {
  padding: var(--spacing-lg);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}

.description-content p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-primary);
}

.regenerate-btn {
  align-self: flex-start;
}

.notes-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.notes-actions {
  display: flex;
  justify-content: flex-end;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dialog-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .photo-name {
    text-align: center;
    white-space: normal;
  }

  .header-actions {
    justify-content: center;
  }

  .metadata-grid {
    grid-template-columns: 1fr;
  }

  .metadata-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .add-tag-section {
    max-width: 100%;
  }
}
</style>
