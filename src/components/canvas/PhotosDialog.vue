<template>
  <n-modal
    v-model:show="dialog"
    preset="dialog"
    :style="{ maxWidth: '90vw', width: '1200px', maxHeight: '90vh' }"
    :on-mask-click="close"
    :closable="false"
    :bordered="false"
  >
    <template #header>
      <div class="dialog-header">
        <h2 class="dialog-title">
          {{ isTrash ? "Restore Photos" : "Add Photos to Canvas" }}
        </h2>
      </div>
    </template>

    <div class="dialog-content">
      <!-- Search and Stats Bar -->
      <div class="stats-bar">
        <div class="search-section">
          <n-select
            v-model:value="selectedTags"
            multiple
            filterable
            placeholder="Filter by tags..."
            :options="tagOptions"
            size="small"
            clearable
            :max-tag-count="3"
            class="tag-search"
          />
        </div>
        <div class="stats-section">
          <div class="stats-info">
            <span class="stats-text">
              {{ photos.length }} {{ photos.length === 1 ? "photo" : "photos" }}
              available
              <span v-if="selectedIds.length > 0" class="selected-count">
                • {{ selectedIds.length }} selected
              </span>
            </span>
          </div>
          <div class="stats-actions">
            <n-button
              v-if="selectedIds.length > 0"
              text
              type="primary"
              @click="selectAll"
            >
              Select All
            </n-button>
            <n-button
              v-if="selectedIds.length > 0"
              text
              type="warning"
              @click="clearSelection"
            >
              Clear Selection
            </n-button>
          </div>
        </div>
      </div>

      <!-- Photos Grid -->
      <div v-if="photos.length > 0" class="photos-grid">
        <PhotoCard
          v-for="photo in photos"
          :key="photo.id"
          :photo="photo"
          :selected="selectedIds.includes(photo.id)"
          mode="default"
          @select="toggleSelection"
          @info="showPhotoInfo"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-state-content">
          <n-icon size="64" class="empty-state-icon">
            <svg v-if="isTrash" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
              />
            </svg>
            <svg v-else viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M9,2V8H7V2H9M17,2V8H15V2H17M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
              />
            </svg>
          </n-icon>
          <h3 class="empty-state-title">
            {{ isTrash ? "No deleted photos" : "No photos available" }}
          </h3>
          <p class="empty-state-description">
            {{
              isTrash
                ? "All photos are currently on the canvas or in your collection."
                : "Either all photos are already on the canvas or you haven't uploaded any photos yet."
            }}
          </p>
        </div>
      </div>
    </div>

    <template #action>
      <div class="dialog-actions">
        <n-button @click="close">Cancel</n-button>
        <n-button
          type="primary"
          :disabled="selectedIds.length === 0"
          @click="confirmSelection"
          :loading="isSubmitting"
        >
          <template #icon>
            <n-icon>
              <svg v-if="isTrash" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M7,13H17V11H7"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                />
              </svg>
            </n-icon>
          </template>
          {{
            isTrash
              ? `Restore ${selectedIds.length} ${
                  selectedIds.length === 1 ? "Photo" : "Photos"
                }`
              : `Add ${selectedIds.length} ${
                  selectedIds.length === 1 ? "Photo" : "Photos"
                } to Canvas`
          }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { usePhotosStore } from "@/stores/photos";
import { useCanvasStore } from "@/stores/canvas";
import PhotoCard from "@/components/PhotoCard.vue";
import { NModal, NButton, NIcon, NSelect } from "naive-ui";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  isTrash: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "add-photos"]);

// Reactive dialog state
const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Stores
const photosStore = usePhotosStore();
const canvasStore = useCanvasStore();

// Component state
const selectedIds = ref([]);
const isSubmitting = ref(false);
const selectedTags = ref([]);

// Tag options for search (mock data)
const tagOptions = [
  { label: "landscape", value: "landscape" },
  { label: "portrait", value: "portrait" },
  { label: "nature", value: "nature" },
  { label: "architecture", value: "architecture" },
  { label: "people", value: "people" },
  { label: "animals", value: "animals" },
  { label: "food", value: "food" },
  { label: "travel", value: "travel" },
  { label: "street", value: "street" },
  { label: "black & white", value: "black_white" },
  { label: "macro", value: "macro" },
  { label: "sunset", value: "sunset" },
  { label: "urban", value: "urban" },
  { label: "vintage", value: "vintage" },
  { label: "minimalist", value: "minimalist" },
];

// Computed photos based on mode
const photos = computed(() => {
  if (props.isTrash) {
    // Return discarded photos that can be restored
    return canvasStore.discardedPhotos
      .map((dp) => photosStore.photos.find((p) => p.id === dp.id))
      .filter(Boolean);
  } else {
    // Return photos that are not on canvas and not discarded
    return photosStore.photos.filter(
      (p) =>
        !canvasStore.photos.find((photo) => photo.id === p.id) &&
        !canvasStore.discardedPhotos.find((photo) => photo.id === p.id),
    );
  }
});

// Selection methods
function toggleSelection(photoId) {
  if (selectedIds.value.includes(photoId)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== photoId);
  } else {
    selectedIds.value.push(photoId);
  }
}

function selectAll() {
  selectedIds.value = photos.value.map((p) => p.id);
}

function clearSelection() {
  selectedIds.value = [];
}

function showPhotoInfo(photo) {
  // TODO: Implement photo info modal
  console.log("Show photo info:", photo);
}

// Main actions
async function confirmSelection() {
  if (selectedIds.value.length === 0) return;

  isSubmitting.value = true;
  try {
    if (props.isTrash) {
      // Remove from discarded photos (restore)
      canvasStore.discardedPhotos = canvasStore.discardedPhotos.filter(
        (dp) => !selectedIds.value.includes(dp.id),
      );
    }

    // Emit add-photos event with selected photo IDs
    emit("add-photos", selectedIds.value);
    close();
  } catch (error) {
    console.error("Error adding photos:", error);
  } finally {
    isSubmitting.value = false;
  }
}

function close() {
  selectedIds.value = [];
  emit("update:modelValue", false);
}

// Watch for dialog open/close to fetch photos
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      selectedIds.value = [];
      // Ensure photos are loaded
      photosStore.getOrFetch();
    }
  },
);

// Fetch photos on mount
onMounted(() => {
  photosStore.getOrFetch();
});
</script>

<style scoped>
/* Dialog Header */
.dialog-header {
  text-align: center;
}

.dialog-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

/* Dialog Content */
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-height: 60vh;
  overflow: hidden;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.stats-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.stats-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.selected-count {
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
}

.stats-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Photos Grid */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-lg);
  overflow-y: auto;
  padding: var(--spacing-sm);
  max-height: calc(60vh - 80px);
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.empty-state-content {
  max-width: 400px;
}

.empty-state-icon {
  margin-bottom: var(--spacing-lg);
  color: var(--icon-tertiary);
}

.empty-state-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.empty-state-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

/* Dialog Actions */
.dialog-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-md);
  }
}

@media (max-width: 768px) {
  .dialog-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .header-content {
    width: 100%;
  }

  .stats-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .stats-actions {
    align-self: stretch;
    justify-content: space-between;
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--spacing-sm);
  }

  .dialog-actions {
    flex-direction: column-reverse;
  }
}

@media (max-width: 480px) {
  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .header-content {
    gap: var(--spacing-md);
  }

  .dialog-title {
    font-size: var(--font-size-lg);
  }

  .dialog-subtitle {
    font-size: var(--font-size-sm);
  }
}

/* Scrollbar styling for photos grid */
.photos-grid {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.photos-grid::-webkit-scrollbar {
  width: 6px;
}

.photos-grid::-webkit-scrollbar-track {
  background: transparent;
}

.photos-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xs);
}

.photos-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
