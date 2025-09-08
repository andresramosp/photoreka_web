<template>
  <div class="photos-grid-container">
    <!-- Photos Grid Controls -->
    <PhotosGridControls
      v-if="!props.hiddeControls"
      @filters-change="handleFiltersChange"
      @sorting-change="handleSortingChange"
      @sort-order-change="handleSortOrderChange"
      @criteria-change="handleCriteriaChange"
      @genre-change="handleGenreChange"
      @sorting-type-change="handleSortingTypeChange"
      @custom-weights-change="handleCustomWeightsChange"
    />

    <!-- Grid Controls -->
    <div class="grid-controls grid-controls-base">
      <div class="controls-left">
        <div class="results-info results-info-base">
          <span class="results-count results-count-base">
            {{ displayedPhotos.length }}{{ hasMorePhotos ? "+" : "" }} of
            {{ filteredAndSortedPhotos.length }} photos
          </span>
        </div>

        <!-- Action buttons (show when photos are selected) -->
        <div v-if="selectedPhotoIds.length > 0" class="action-buttons">
          <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
              <n-button
                type="error"
                size="small"
                @click="handleDeleteMultiple"
                :disabled="selectedPhotoIds.length === 0"
                :loading="isDeletingPhotos"
              >
                <template #icon v-if="!isDeletingPhotos">
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
            </template>
            <span>Delete selected photos</span>
          </n-tooltip>
          <n-button
            type="info"
            size="small"
            @click="handleDownloadMultiple"
            :disabled="selectedPhotoIds.length === 0 || isDownloading"
            :loading="isDownloading"
          >
            <n-tooltip placement="bottom" trigger="hover">
              <template #trigger>
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
                </n-button>
              </template>
              <span>Download selected photos</span>
            </n-tooltip>
          </n-button>
          <n-button
            v-if="!props.collectionId && displayAddToCollection"
            type="info"
            size="small"
            @click="handleAddToCollection"
            :disabled="selectedPhotoIds.length === 0"
          >
            <n-tooltip placement="bottom" trigger="hover">
              <template #trigger>
                <n-button
                  v-if="!props.collectionId && displayAddToCollection"
                  type="info"
                  size="small"
                  @click="handleAddToCollection"
                  :disabled="selectedPhotoIds.length === 0"
                >
                  <template #icon>
                    <n-icon>
                      <AlbumsOutline />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              <span>Add selected photos to a collection</span>
            </n-tooltip>
          </n-button>

          <n-button
            type="info"
            size="small"
            @click="openToolSelector"
            :disabled="selectedPhotoIds.length === 0"
          >
            <n-tooltip placement="bottom" trigger="hover">
              <template #trigger>
                <n-button
                  type="info"
                  size="small"
                  @click="openToolSelector"
                  :disabled="selectedPhotoIds.length === 0"
                >
                  <template #icon>
                    <n-icon> <MagicWand /> </n-icon>
                  </template>
                </n-button>
              </template>
              <span>Aplicar una herramienta a las fotos seleccionadas</span>
            </n-tooltip>
          </n-button>
        </div>
        <div class="duplicates-controls-container">
          <!-- Review Duplicates Button -->
          <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
              <n-button
                type="warning"
                size="small"
                @click="handleReviewDuplicates"
                :disabled="duplicatesReviewed"
                :loading="isCheckingDuplicates"
              >
                <template #icon v-if="!isCheckingDuplicates">
                  <n-icon>
                    <DuplicateOutline />
                  </n-icon>
                </template>
                {{ "Find duplicates" }}
              </n-button>
            </template>
            <span>Review duplicate photos in your selection</span>
          </n-tooltip>

          <!-- Filter Duplicates Checkbox (only show if duplicates were reviewed and found) -->
          <div
            v-if="duplicatesReviewed && hasDuplicates"
            class="filter-duplicates-checkbox"
          >
            <n-checkbox
              :checked="filterDuplicates"
              @update:checked="handleFilterDuplicatesChange"
              size="small"
            >
              Filter duplicates
            </n-checkbox>
          </div>
        </div>
      </div>

      <div class="controls-right">
        <div class="filter-controls" v-if="!props.collectionId"></div>
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
        :artistic-score="getPhotoArtisticScore(photo)"
      />
    </div>

    <!-- Loading indicator for infinite scroll -->
    <div v-if="hasMorePhotos && isLoadingMore" class="loading-more-container">
      <n-spin size="medium">
        <template #description>Loading more photos...</template>
      </n-spin>
    </div>

    <!-- End of results indicator -->
    <div
      v-else-if="
        !hasMorePhotos && filteredAndSortedPhotos.length > PHOTOS_PER_PAGE
      "
      class="end-of-results"
    >
      <span>You've reached the end of your photos</span>
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

    <!-- Photo Tool Selector Modal -->
    <PhotoToolSelector
      :show="showToolSelector"
      :photo-count="selectedPhotoIds.length"
      :tools="availableTools"
      :is-processing="isProcessingTool"
      @tool-selected="handleToolSelected"
      @close="closeToolSelector"
    />

    <!-- Delete Confirmation Modal -->
    <n-modal
      v-model:show="showDeleteConfirmDialog"
      preset="dialog"
      title="Confirmar eliminación"
    >
      <template #header>
        <div style="font-size: 18px; font-weight: 600">
          Confirmar eliminación
        </div>
      </template>
      <div style="padding: 16px 0">
        <p style="margin-bottom: 16px; font-size: 16px">
          Are you sure you want to delete
          <strong>{{ selectedPhotoIds.length }}</strong>
          {{ selectedPhotoIds.length === 1 ? "foto" : "fotos" }}?
        </p>
        <p style="color: #d03050; font-size: 14px; margin: 0">
          This action cannot be undone.
        </p>
      </div>
      <template #action>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <n-button @click="showDeleteConfirmDialog = false">
            Cancelar
          </n-button>
          <n-button type="error" @click="confirmDeletePhotos">
            Eliminar
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import {
  NButton,
  NButtonGroup,
  NIcon,
  NSpin,
  NCheckbox,
  NModal,
  NCard,
  useMessage,
  NTooltip,
} from "naive-ui";
import {
  AlbumsOutline,
  CloudDownloadOutline,
  DuplicateOutline,
  EyeOutline,
  RepeatOutline,
  WarningOutline,
} from "@vicons/ionicons5";
import { useRouter } from "vue-router";
import PhotoCardHub from "./photoCards/PhotoCardHub.vue";
import PhotoInfoDialog from "./PhotoInfoDialog.vue";
import DuplicatePhotosDialog from "./DuplicatePhotosDialog.vue";
import CollectionModal from "./CollectionModal.vue";
import PhotosGridControls from "./PhotosGridControls.vue";
import PhotoToolSelector from "./PhotoToolSelector.vue";
import { usePhotosStore } from "@/stores/photos.js";
import { useCollectionsStore } from "@/stores/collections.js";
import { usePhotoDownload } from "@/composables/usePhotoDownload.js";
import { usePhotoUpload } from "@/composables/usePhotoUpload.js";
import { useLocalPhotoSelection } from "@/composables/useLocalPhotoSelection.js";
import { useArtisticScores } from "@/composables/useArtisticScores.js";
import { usePhotoToolSelection } from "@/composables/usePhotoToolSelection.js";
import { MagicWand } from "@vicons/carbon";

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
  hiddeControls: {
    type: Boolean,
    default: false,
  },
});

const message = useMessage();
const router = useRouter();
const photosStore = usePhotosStore();
const collectionsStore = useCollectionsStore();
const { downloadPhotosZip, isDownloading } = usePhotoDownload();
const { preprocessPhotos } = usePhotoUpload();
const {
  selectedPhotosRecord,
  selectedPhotoIds,
  togglePhotoSelection,
  selectAllPhotos,
  deselectAllPhotos,
  clearAllSelections,
} = useLocalPhotoSelection();

const {
  isProcessing: isProcessingTool,
  showToolSelector,
  availableTools,
  takeToTool,
  openToolSelector,
  closeToolSelector,
} = usePhotoToolSelection();

// Grid columns state
const gridColumns = ref(8);
const filterDuplicates = ref(false);
const isCheckingDuplicates = ref(false);
const duplicatesReviewed = ref(false);
const hasDuplicates = ref(false);

// Infinite scroll state
const PHOTOS_PER_PAGE = 50; // Número de fotos a cargar por página
const currentPage = ref(1);
const isLoadingMore = ref(false);

// State for filters and sorting (managed by PhotosGridControls)
const selectedFilters = ref({});
const sortingType = ref("none"); // 'none', 'criteria' or 'genre'
const selectedCriteria = ref([]);
const selectedGenre = ref("street");
const customWeights = ref({});
const sortOrder = ref("desc"); // 'asc', 'desc'

// Derived state for backward compatibility
const sortByQuality = computed(() => {
  if (sortingType.value === "none") {
    return false; // No sorting when "none" is selected
  } else if (sortingType.value === "criteria") {
    return selectedCriteria.value.length > 0;
  } else if (sortingType.value === "genre") {
    return true;
  }
  return false;
});

// Get dynamic criteria from useArtisticScores
const { artisticScores, formatCriterionName, calculateArtisticScore } =
  useArtisticScores();
const availableCriteria = [];
Object.values(artisticScores).forEach((group) => {
  group.criteria.forEach((criterion) => {
    availableCriteria.push({
      value: criterion.value,
      label: criterion.label,
    });
  });
});

// Initialize with no criteria selected (matching PhotosGridControls starting with "none")
selectedCriteria.value = [];

// Function to calculate artistic score for a single photo
const getPhotoArtisticScore = (photo) => {
  if (!sortByQuality.value || !photo.descriptions?.artistic_scores) {
    return null;
  }

  if (sortingType.value === "criteria") {
    // Criteria-based sorting
    if (selectedCriteria.value.length === 0) {
      return null;
    }

    // Create custom weights object from selected criteria
    const customWeights = {};
    selectedCriteria.value.forEach((criterion) => {
      customWeights[criterion] = 1.0; // Equal weight for all selected criteria
    });

    const scoreResult = calculateArtisticScore(
      photo.descriptions.artistic_scores,
      "custom",
      customWeights
    );

    return scoreResult.average;
  } else if (sortingType.value === "genre") {
    // Genre-based sorting
    if (selectedGenre.value === "custom") {
      // Use custom weights
      const scoreResult = calculateArtisticScore(
        photo.descriptions.artistic_scores,
        "custom",
        customWeights.value
      );
      return scoreResult.average;
    } else {
      // Use genre preset
      const scoreResult = calculateArtisticScore(
        photo.descriptions.artistic_scores,
        selectedGenre.value
      );
      return scoreResult.average;
    }
  }

  return null;
};

// Dialog states
const showPhotoInfoDialog = ref(false);
const selectedDialogPhoto = ref();
const showDuplicatesDialog = ref(false);
const selectedDuplicatesData = ref([]);
const showCollectionModal = ref(false);
const showDeleteConfirmDialog = ref(false);
const isDeletingPhotos = ref(false);

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

// Watch for photos changes to reset duplicate review state
watch(
  () => props.photos.length,
  (newLength, oldLength) => {
    // Reset duplicate review state when photos are added
    if (newLength > (oldLength || 0)) {
      duplicatesReviewed.value = false;
      hasDuplicates.value = false;
      filterDuplicates.value = false;
    }
  }
);

// Grid functions
const setGridColumns = (columns) => {
  gridColumns.value = columns;
};

// Sorting functions
const toggleSortByQuality = () => {
  sortByQuality.value = !sortByQuality.value;
  if (!sortByQuality.value) {
    // Reset to all criteria when disabled
    selectedCriteria.value = availableCriteria.map((c) => c.value);
  }
};

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
};

// Handler functions for PhotosGridControls events
const handleFiltersChange = (newFilters) => {
  selectedFilters.value = newFilters;
};

const handleSortingChange = (isActive) => {
  // This now receives whether sorting is active, but we use computed sortByQuality
  // No direct action needed as sortByQuality is computed from sortingType and criteria
};

const handleSortOrderChange = (newSortOrder) => {
  sortOrder.value = newSortOrder;
};

const handleCriteriaChange = (newCriteria) => {
  selectedCriteria.value = newCriteria;
};

const handleGenreChange = (newGenre) => {
  selectedGenre.value = newGenre;
};

const handleSortingTypeChange = (newType) => {
  sortingType.value = newType;
};

const handleCustomWeightsChange = (newWeights) => {
  customWeights.value = newWeights;
};

// Handle review duplicates (preprocess and check)
const handleReviewDuplicates = async () => {
  isCheckingDuplicates.value = true;
  try {
    // First, get all photo IDs that need preprocessing
    const photoIds = props.photos.map((photo) => photo.id);

    // Call preprocessPhotos first (this is idempotent if already processed)
    await preprocessPhotos(photoIds);

    // Then check for duplicates
    await photosStore.checkDuplicates(photoIds);

    // Count how many duplicates we found
    const duplicatesCount = props.photos.filter(
      (photo) => photo.isDuplicate
    ).length;

    duplicatesReviewed.value = true;
    hasDuplicates.value = duplicatesCount > 0;

    if (duplicatesCount > 0) {
      message.info(
        `Found ${duplicatesCount} duplicate photos. Use the filter checkbox to view them.`
      );
    } else {
      message.success("No duplicate photos found.");
    }
  } catch (error) {
    console.error("Error reviewing duplicates:", error);
    message.error("Error reviewing duplicates");
  } finally {
    isCheckingDuplicates.value = false;
  }
};

// Handle filter duplicates change (just toggle the filter)
const handleFilterDuplicatesChange = (checked) => {
  filterDuplicates.value = checked;
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

// Filter and sort ALL photos (without pagination limit)
const filteredAndSortedPhotos = computed(() => {
  let filtered = props.photos;

  // Apply visual aspects filters
  const hasActiveFilters = Object.values(selectedFilters.value).some(
    (filters) => filters.length > 0
  );

  if (hasActiveFilters) {
    filtered = filtered.filter((photo) => {
      // Check if photo has visualAspects property
      if (!photo.descriptions.visual_aspects) {
        return false;
      }

      // Apply AND logic: photo must match ALL selected filters
      return Object.entries(selectedFilters.value).every(
        ([category, selectedValues]) => {
          // If no filters selected for this category, it passes
          if (selectedValues.length === 0) {
            return true;
          }

          // Check if photo has this visual aspect category
          const photoAspects = photo.descriptions.visual_aspects[category];
          if (!photoAspects || !Array.isArray(photoAspects)) {
            return false;
          }

          // Photo must have at least one of the selected values in this category
          return selectedValues.some((selectedValue) =>
            photoAspects.includes(selectedValue)
          );
        }
      );
    });
  }

  // Apply duplicates filter
  if (filterDuplicates.value) {
    filtered = groupDuplicates(filtered.filter((photo) => photo.isDuplicate));
  }

  // Apply sorting by artistic score
  // Explicitly reference all sorting-related reactive variables to ensure reactivity
  const currentSortByQuality = sortByQuality.value;
  const currentSortOrder = sortOrder.value;
  const currentSortingType = sortingType.value;
  const currentSelectedCriteria = selectedCriteria.value;
  const currentSelectedGenre = selectedGenre.value;
  const currentCustomWeights = customWeights.value;

  if (currentSortByQuality) {
    filtered = [...filtered].sort((a, b) => {
      const scoreA = getPhotoArtisticScore(a);
      const scoreB = getPhotoArtisticScore(b);

      // Handle null scores (photos without scores go to the end)
      if (scoreA === null && scoreB === null) return 0;
      if (scoreA === null) return 1;
      if (scoreB === null) return -1;

      if (currentSortOrder === "desc") {
        return scoreB - scoreA;
      } else {
        return scoreA - scoreB;
      }
    });
  }

  return filtered;
});

// Display only the photos for the current pages (with infinite scroll)
const displayedPhotos = computed(() => {
  const totalPhotosToShow = currentPage.value * PHOTOS_PER_PAGE;
  const result = filteredAndSortedPhotos.value.slice(0, totalPhotosToShow);

  return result;
});

// Check if all photos are selected
const allSelected = computed(() => {
  return (
    displayedPhotos.value.length > 0 &&
    displayedPhotos.value.every((photo) => selectedPhotosRecord.value[photo.id])
  );
});

// Computed to check if there are more photos to load
const hasMorePhotos = computed(() => {
  return displayedPhotos.value.length < filteredAndSortedPhotos.value.length;
});

const handleScroll = (e) => {
  if (isLoadingMore.value || !hasMorePhotos.value) return;

  const container = document.querySelector(".view-container");
  if (!container) return;

  const scrollPosition = container.scrollTop + container.clientHeight;
  const documentHeight = container.scrollHeight;
  const threshold = 1000; // Load more when 1000px from bottom

  if (scrollPosition >= documentHeight - threshold) {
    loadMorePhotos();
  }
};

const loadMorePhotos = async () => {
  if (isLoadingMore.value || !hasMorePhotos.value) return;

  isLoadingMore.value = true;

  // Simulate a small delay to avoid too rapid loading
  await new Promise((resolve) => setTimeout(resolve, 200));

  currentPage.value += 1;
  isLoadingMore.value = false;
};

// Reset pagination when filters or sorting changes
const resetPagination = () => {
  currentPage.value = 1;
  isLoadingMore.value = false;
};

// Watch for filter/sort changes to reset pagination
watch(
  [
    selectedFilters,
    sortingType,
    selectedCriteria,
    selectedGenre,
    customWeights,
    sortOrder,
    filterDuplicates,
  ],
  () => {
    resetPagination();
  },
  { deep: true }
);

// Watch for props.photos changes to reset pagination
watch(
  () => props.photos.length,
  (newLength, oldLength) => {
    resetPagination();
  }
);

// Lifecycle hooks for scroll listener
onMounted(() => {
  nextTick(() => {
    const container = document.querySelector(".view-container");

    if (container === document.documentElement) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    // Debug initial state
  });
});

onUnmounted(() => {
  const container = document.querySelector(".view-container");
  if (container === document.documentElement) {
    window.removeEventListener("scroll", handleScroll);
  } else if (container && container.removeEventListener) {
    container.removeEventListener("scroll", handleScroll);
  }
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
  // Solo mostrar modal de confirmación si NO es una colección
  if (!props.collectionId) {
    showDeleteConfirmDialog.value = true;
    return;
  }

  // Para colecciones, eliminar directamente (comportamiento actual)
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
  clearAllSelections();
};

const confirmDeletePhotos = async () => {
  showDeleteConfirmDialog.value = false;
  isDeletingPhotos.value = true;

  try {
    await photosStore.deletePhotos(selectedPhotoIds.value);
    clearAllSelections();
  } catch (error) {
    message.error("Error eliminando las fotos");
    console.error("Error deleting photos:", error);
  } finally {
    isDeletingPhotos.value = false;
  }
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

const handleToolSelected = async (toolId) => {
  await takeToTool(toolId, selectedPhotoIds.value, clearAllSelections);
  closeToolSelector();
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

.duplicates-controls-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-duplicates-checkbox {
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

/* Loading and end of results indicators */
.loading-more-container,
.end-of-results {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  margin-top: 20px;
}

.end-of-results {
  color: #ffffff73;
  font-size: 14px;
  opacity: 0.7;
}

.loading-more-container {
  color: #ffffffd1;
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
