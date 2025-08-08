<template>
  <div class="photos-grid-container">
    <!-- Grid Controls -->
    <div class="grid-controls grid-controls-base">
      <div class="controls-left">
        <div class="results-info results-info-base">
          <span class="results-count results-count-base"
            >{{ displayedPhotos.length }} photos</span
          >
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
          </n-button>
          <n-button
            type="info"
            size="small"
            @click="handleDownloadMultiple"
            :disabled="selectedPhotoIds.length === 0 || isDownloading"
            :loading="isDownloading"
          >
            <template #icon>
              <n-icon> <CloudDownloadOutline /> </n-icon>
            </template>
            Download
          </n-button>
          <n-button
            v-if="!props.collectionId && displayAddToCollection"
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
            Collection
          </n-button>

          <n-button
            type="info"
            size="small"
            @click="moveToCanvas"
            :disabled="selectedPhotoIds.length === 0"
          >
            <template #icon>
              <n-icon>
                <Workspace />
              </n-icon>
            </template>
            Take to Canvas
          </n-button>
        </div>
      </div>

      <div class="controls-right">
        <div class="filter-controls" v-if="!props.collectionId">
          <div class="filter-duplicates-container">
            <n-button
              :type="filterDuplicates ? 'primary' : 'default'"
              size="small"
              @click="handleFilterDuplicatesChange(!filterDuplicates)"
              :disabled="isCheckingDuplicates"
              :loading="isCheckingDuplicates"
            >
              <template #icon v-if="!isCheckingDuplicates">
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
                    />
                  </svg>
                </n-icon>
              </template>
              Filter duplicates
            </n-button>
          </div>
        </div>
        <div class="grid-size-controls grid-size-controls-base">
          <span class="grid-label grid-label-base">Columns:</span>
          <n-button-group>
            <n-button
              v-for="size in [4, 6, 8, 10]"
              :key="size"
              :type="gridColumns === size ? 'primary' : 'default'"
              size="small"
              @click="setGridColumns(size)"
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

    <!-- Photo Grid -->
    <div
      class="photos-grid photo-grid-base"
      :class="`grid-cols-${gridColumns}`"
    >
      <PhotoCardHub
        v-for="photo in displayedPhotos"
        :key="photo.id"
        :photo="photo"
        :selected="selectedPhotosRecord[photo.id]"
        @info="showPhotoInfo"
        @select="togglePhotoSelection"
        @show-duplicates="showDuplicates"
        :show-delete="true"
        :show-name="true"
        :show-footer="false"
        :showDuplicate="true"
      />
    </div>

    <!-- Dialogs -->
    <PhotoInfoDialog
      v-model="showPhotoInfoDialog"
      :selected-photo="selectedDialogPhoto"
    />
    <DuplicatePhotosDialog
      v-model="showDuplicatesDialog"
      :duplicates="selectedDuplicatesData"
    />

    <!-- Collection Modal -->
    <CollectionModal
      :show="showCollectionModal"
      :photo-count="selectedPhotoIds.length"
      :photo-ids="selectedPhotoIds"
      @add-to-collection="handleCollectionAdded"
      @cancel="handleCollectionModalCancel"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import {
  NButton,
  NButtonGroup,
  NIcon,
  NCheckbox,
  NSpin,
  useMessage,
} from "naive-ui";
import { CloudDownloadOutline } from "@vicons/ionicons5";
import { Workspace } from "@vicons/carbon";
import { useRouter } from "vue-router";
import PhotoCardHub from "./photoCards/PhotoCardHub.vue";
import PhotoInfoDialog from "./PhotoInfoDialog.vue";
import DuplicatePhotosDialog from "./DuplicatePhotosDialog.vue";
import CollectionModal from "./CollectionModal.vue";
import { usePhotosStore } from "@/stores/photos.js";
import { useCanvasStore } from "@/stores/canvas.js";
import { useCollectionsStore } from "@/stores/collections.js";
import { usePhotoDownload } from "@/composables/usePhotoDownload.js";
import { useLocalPhotoSelection } from "@/composables/useLocalPhotoSelection.js";

const emit = defineEmits(["refreshCollection", "selection-change"]);
const props = defineProps({
  photos: {
    type: Array,
    default: () => [],
  },
  collectionId: {
    type: [String, Number, null],
    default: null,
  },
  displayAddToCollection: {
    type: Boolean,
    default: true,
  },
});

const message = useMessage();
const router = useRouter();
const photosStore = usePhotosStore();
const canvasStore = useCanvasStore();
const collectionsStore = useCollectionsStore();
const { downloadPhotosZip, isDownloading } = usePhotoDownload();
const {
  selectedPhotosRecord,
  selectedPhotoIds,
  togglePhotoSelection,
  selectAllPhotos,
  deselectAllPhotos,
  clearAllSelections,
} = useLocalPhotoSelection();

// Grid columns state
const gridColumns = ref(8);
const filterDuplicates = ref(false);
const isCheckingDuplicates = ref(false);

// Dialog states
const showPhotoInfoDialog = ref(false);
const selectedDialogPhoto = ref();
const showDuplicatesDialog = ref(false);
const selectedDuplicatesData = ref([]);
const showCollectionModal = ref(false);

// Watch for selection changes and emit to parent
watch(
  selectedPhotoIds,
  (newSelection) => {
    emit("selection-change", {
      selectedCount: newSelection.length,
      selectedIds: [...newSelection],
    });
  },
  { immediate: true, deep: true }
);

// Grid functions
const setGridColumns = (columns) => {
  gridColumns.value = columns;
};

// Handle filter duplicates change
const handleFilterDuplicatesChange = async (checked) => {
  if (!checked) {
    // Si se desmarca, solo desactivar el filtro sin hacer llamada
    filterDuplicates.value = false;
    return;
  }

  // Si ya se verificaron duplicados, activar filtro inmediatamente
  if (photosStore.duplicatesChecked) {
    filterDuplicates.value = true;
    return;
  }

  // Si se marca y no se han verificado duplicados, hacer check
  isCheckingDuplicates.value = true;
  try {
    await photosStore.checkDuplicates();
    filterDuplicates.value = true;
  } catch (error) {
    console.error("Error checking duplicates:", error);
    message.error("Error checking for duplicates");
  } finally {
    isCheckingDuplicates.value = false;
  }
};

// Function to group duplicates (same as WorkspacePhotos)
function groupDuplicates(photos) {
  const groupMap = new Map();
  const added = new Set();
  photos.forEach((photo) => {
    if (!photo.isDuplicate) return;
    const groupIds = [photo.id, ...(photo.duplicates || [])].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
    const groupKey = groupIds.join("-");
    if (!groupMap.has(groupKey)) groupMap.set(groupKey, []);
    groupMap.get(groupKey).push(photo);
  });

  const result = [];
  photos.forEach((photo) => {
    if (!photo.isDuplicate) return;
    const groupIds = [photo.id, ...(photo.duplicates || [])].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
    const groupKey = groupIds.join("-");
    if (groupMap.has(groupKey) && !added.has(groupKey)) {
      result.push(...groupMap.get(groupKey));
      added.add(groupKey);
    }
  });
  return result;
}

// Filter photos based on duplicates filter
const displayedPhotos = computed(() => {
  if (!filterDuplicates.value) {
    return props.photos;
  }
  return groupDuplicates(props.photos.filter((photo) => photo.isDuplicate));
});

// Check if all photos are selected
const allSelected = computed(() => {
  return (
    displayedPhotos.value.length > 0 &&
    displayedPhotos.value.every((photo) => selectedPhotosRecord.value[photo.id])
  );
});

// Selection functions
const handleSelectAll = () => {
  const shouldDeselectAll = allSelected.value;
  const photoIds = displayedPhotos.value.map((photo) => photo.id);

  if (shouldDeselectAll) {
    deselectAllPhotos(photoIds);
  } else {
    selectAllPhotos(photoIds);
  }
};

// Photo actions
const showPhotoInfo = async (photo) => {
  const fullPhoto = await photosStore.fetchPhoto(photo.id);
  selectedDialogPhoto.value = fullPhoto;
  showPhotoInfoDialog.value = true;
};

const showDuplicates = (duplicates) => {
  selectedDuplicatesData.value = duplicates;
  showDuplicatesDialog.value = true;
};

// Batch actions
const handleDeleteMultiple = async () => {
  if (props.collectionId) {
    try {
      await collectionsStore.removePhotosFromCollection(
        props.collectionId,
        selectedPhotoIds.value
      );
      // Recargar la ruta actual para refrescar la colección (sin reload completo)
      emit("refreshCollection");
    } catch (e) {
      message.error("Error removing photos from collection");
    }
  } else {
    await photosStore.deletePhotos(selectedPhotoIds.value);
  }
  clearAllSelections();
};

const handleAddToCollection = () => {
  if (selectedPhotoIds.value.length > 0) {
    showCollectionModal.value = true;
  }
};

const handleCollectionAdded = (data) => {
  // Clear selections after successfully adding to collection
  clearAllSelections();
  // Optionally emit an event to refresh the collection if we're viewing one
  if (props.collectionId) {
    emit("refreshCollection");
  }
};

const handleCollectionModalCancel = () => {
  showCollectionModal.value = false;
};

const handleDownloadMultiple = async () => {
  try {
    const photosToDownload = selectedPhotoIds.value
      .map((id) => photosStore.photos.find((p) => p.id == id))
      .filter(Boolean);

    await downloadPhotosZip(photosToDownload);
  } catch (error) {
    console.error("Download multiple photos failed:", error);
  }
};

const moveToCanvas = async () => {
  await Promise.all(
    selectedPhotoIds.value.map((id) => photosStore.fetchPhoto(id))
  );
  const photosToAdd = selectedPhotoIds.value
    .map((id) => photosStore.photos.find((p) => p.id == id))
    .filter(Boolean);

  clearAllSelections();
  canvasStore.addPhotos(photosToAdd);

  router.push("/canvas");
};
</script>

<style scoped>
.photos-grid-container {
  width: 100%;
}

/* Grid Controls */
.grid-controls-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

.filter-duplicates-container {
  display: flex;
  align-items: center;
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

.photo-grid-base.grid-cols-10 {
  grid-template-columns: repeat(10, 1fr);
}

/* Responsive */
@media (max-width: 1200px) {
  .photo-grid-base.grid-cols-6,
  .photo-grid-base.grid-cols-8 {
    grid-template-columns: repeat(5, 1fr);
  }
  .photo-grid-base.grid-cols-10 {
    grid-template-columns: repeat(7, 1fr);
  }
}

@media (max-width: 1024px) {
  .photo-grid-base.grid-cols-5,
  .photo-grid-base.grid-cols-6,
  .photo-grid-base.grid-cols-8,
  .photo-grid-base.grid-cols-10 {
    grid-template-columns: repeat(4, 1fr);
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

  .grid-size-controls-base {
    width: 100%;
    justify-content: space-between;
  }

  .photo-grid-base.grid-cols-3,
  .photo-grid-base.grid-cols-4,
  .photo-grid-base.grid-cols-5,
  .photo-grid-base.grid-cols-6,
  .photo-grid-base.grid-cols-8,
  .photo-grid-base.grid-cols-10 {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .photo-grid-base.grid-cols-3,
  .photo-grid-base.grid-cols-4,
  .photo-grid-base.grid-cols-5,
  .photo-grid-base.grid-cols-6,
  .photo-grid-base.grid-cols-8,
  .photo-grid-base.grid-cols-10 {
    grid-template-columns: 1fr;
  }
}
</style>
