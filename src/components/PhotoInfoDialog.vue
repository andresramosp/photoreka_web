<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    style="width: 90%; max-width: 800px"
  >
    <template #header>
      <div class="dialog-header">
        <h3 class="photo-name">
          {{ selectedPhoto?.filename || selectedPhoto?.name || "Untitled" }}
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
          <n-button size="small" @click="downloadPhoto" title="Download photo">
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
          <!-- Metadata Section -->
          <n-collapse-item title="Metadata" name="metadata">
            <template #header-extra>
              <n-icon>
                <InfoIcon />
              </n-icon>
            </template>
            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="label">Date Taken:</span>
                <span class="value">{{
                  selectedPhoto?.created_at
                    ? formatDate(selectedPhoto.created_at)
                    : "Unknown"
                }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">File Size:</span>
                <span class="value">{{
                  selectedPhoto?.size
                    ? formatFileSize(selectedPhoto.size)
                    : "Unknown"
                }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Dimensions:</span>
                <span class="value">{{
                  selectedPhoto?.width && selectedPhoto?.height
                    ? `${selectedPhoto.width} × ${selectedPhoto.height}px`
                    : "Unknown"
                }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Location:</span>
                <span class="value">{{
                  selectedPhoto?.location || "Unknown"
                }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Camera:</span>
                <span class="value">{{
                  selectedPhoto?.camera || "Unknown"
                }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Lens:</span>
                <span class="value">{{
                  selectedPhoto?.lens || "Unknown"
                }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Focal Length:</span>
                <span class="value">{{
                  selectedPhoto?.focalLength
                    ? `${selectedPhoto.focalLength}mm`
                    : "Unknown"
                }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Aperture:</span>
                <span class="value">{{
                  selectedPhoto?.aperture
                    ? `f/${selectedPhoto.aperture}`
                    : "Unknown"
                }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Shutter Speed:</span>
                <span class="value">{{
                  selectedPhoto?.shutterSpeed
                    ? `${selectedPhoto.shutterSpeed}`
                    : "Unknown"
                }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">ISO:</span>
                <span class="value">{{ selectedPhoto?.iso || "Unknown" }}</span>
              </div>
            </div>
          </n-collapse-item>

          <!-- Tags Section -->
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
                    v-for="tag in photoTags"
                    :key="tag.id || tag.name"
                    closable
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
          <n-collapse-item title="Descriptions" name="descriptions">
            <template #header-extra>
              <n-icon>
                <DocumentTextIcon />
              </n-icon>
            </template>
            <div class="descriptions-section">
              <div
                v-if="!photoDescription && !isGeneratingDescription"
                class="generate-section"
              >
                <n-button
                  type="primary"
                  size="large"
                  @click="generateDescription"
                  block
                >
                  <template #icon>
                    <n-icon>
                      <SparklesIcon />
                    </n-icon>
                  </template>
                  Generate Description
                </n-button>
              </div>
              <div
                v-else-if="isGeneratingDescription"
                class="generating-section"
              >
                <n-spin size="medium" />
                <p class="generating-text">Generating AI description...</p>
              </div>
              <div v-else class="description-display">
                <div class="description-content">
                  <p>{{ photoDescription }}</p>
                </div>
                <n-button
                  size="small"
                  @click="regenerateDescription"
                  :loading="isGeneratingDescription"
                  class="regenerate-btn"
                >
                  <template #icon>
                    <n-icon>
                      <RefreshIcon />
                    </n-icon>
                  </template>
                  Regenerate
                </n-button>
              </div>
            </div>
          </n-collapse-item>

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

// Reactive state
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const photoTags = ref([]);
const newTagName = ref("");
const isAddingTag = ref(false);
const photoDescription = ref("");
const isGeneratingDescription = ref(false);
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
      photoDescription.value = newPhoto.description || "";
      photoNotes.value = newPhoto.notes || "";
    }
  },
  { immediate: true },
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
  const name =
    props.selectedPhoto?.filename || props.selectedPhoto?.name || "Untitled";

  try {
    await navigator.clipboard.writeText(name);
    message.success("Photo name copied to clipboard");
  } catch (error) {
    message.error("Failed to copy to clipboard");
    console.error("Copy failed:", error);
  }
};

const downloadPhoto = () => {
  const photo = props.selectedPhoto;
  if (!photo) return;

  const url = photo.originalUrl || photo.url || photo.thumbnailUrl;
  const filename =
    photo.filename || photo.name || `photo-${photo.id || Date.now()}.jpg`;

  // Create temporary download link
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  message.success("Download started");
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
      (tag.name || tag) === (tagToRemove.name || tagToRemove),
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
const generateDescription = async () => {
  isGeneratingDescription.value = true;

  try {
    // Simulate API call for description generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a realistic mock description
    const descriptions = [
      "This captivating image showcases excellent composition with balanced lighting and compelling subject matter. The depth of field creates a beautiful bokeh effect that draws attention to the main subject while maintaining visual interest throughout the frame.",
      "A stunning photograph that demonstrates masterful use of natural lighting and thoughtful framing. The color palette harmoniously blends warm and cool tones, creating a visually pleasing and emotionally engaging image.",
      "This remarkable shot captures a perfect moment with exceptional clarity and artistic vision. The photographer's attention to detail is evident in the careful consideration of elements, resulting in a well-balanced and impactful composition.",
      "An outstanding example of photographic artistry, featuring dynamic composition and expert handling of light and shadow. The image tells a compelling visual story that resonates with viewers and showcases technical proficiency.",
      "This beautifully crafted photograph exhibits excellent timing and composition skills. The interplay of light, color, and form creates a captivating visual narrative that demonstrates both technical expertise and creative vision.",
    ];

    photoDescription.value =
      descriptions[Math.floor(Math.random() * descriptions.length)];

    // Here you would typically call your AI service
    // photoDescription.value = await generateAIDescription(props.selectedPhoto)

    message.success("Description generated successfully");
  } catch (error) {
    message.error("Failed to generate description");
    console.error("Generate description failed:", error);
  } finally {
    isGeneratingDescription.value = false;
  }
};

const regenerateDescription = () => {
  photoDescription.value = "";
  nextTick(() => {
    generateDescription();
  });
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
  gap: var(--spacing-lg);
}

.photo-display {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 400px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.main-photo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.info-sections {
  flex: 1;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
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
}

.add-tag-section {
  max-width: 300px;
}

.descriptions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.generate-section {
  text-align: center;
  padding: var(--spacing-xl);
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
