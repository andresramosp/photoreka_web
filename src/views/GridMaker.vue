<template>
  <div class="grid-maker-container view-container">
    <!-- Header -->
    <div class="grid-maker-header">
      <h1 class="page-title">Grid Maker</h1>
      <p class="page-subtitle">
        Create custom photo grids with automatic spacing and intelligent filling
      </p>
    </div>

    <!-- Grid Size Selector -->
    <div v-if="!gridCreated" class="grid-selector-section">
      <h2 class="section-title">Choose Grid Size</h2>
      <div class="grid-selector">
        <div class="selector-info">
          <span class="selector-label"
            >{{ hoveredRows || 1 }} × {{ hoveredCols || 1 }}</span
          >
          <span class="selector-description">
            {{ (hoveredRows || 1) * (hoveredCols || 1) }} photos
          </span>
        </div>

        <!-- Interactive Grid Selector -->
        <div class="grid-preview" @mouseleave="resetHover">
          <div v-for="row in maxRows" :key="'row-' + row" class="grid-row">
            <div
              v-for="col in maxCols"
              :key="'cell-' + row + '-' + col"
              class="grid-cell"
              :class="{
                active: row <= hoveredRows && col <= hoveredCols,
                selected: row <= selectedRows && col <= selectedCols,
              }"
              @mouseenter="updateHover(row, col)"
              @click="selectGrid(row, col)"
            ></div>
          </div>
        </div>

        <div class="grid-actions">
          <n-button
            type="primary"
            :disabled="!selectedRows || !selectedCols"
            @click="createGrid"
          >
            Create {{ selectedRows }}×{{ selectedCols }} Grid
          </n-button>
        </div>
      </div>
    </div>

    <!-- Grid Management -->
    <div v-if="gridCreated" class="grid-management-section">
      <!-- Controls -->
      <div class="grid-controls">
        <div class="control-group">
          <n-button @click="resetGrid" secondary>
            <template #icon>
              <n-icon><RefreshOutline /></n-icon>
            </template>
            New Grid
          </n-button>

          <div class="grid-info">
            <span class="grid-size"
              >{{ selectedRows }}×{{ selectedCols }} Grid</span
            >
            <span class="photos-count">
              {{ filledCells }} / {{ totalCells }} photos
            </span>
          </div>
        </div>

        <div class="control-group">
          <n-select
            v-model:value="fillType"
            :options="fillTypeOptions"
            placeholder="Fill type"
            style="width: 180px"
          />

          <n-button
            type="primary"
            :disabled="!hasEmptyCells"
            :loading="isGenerating"
            @click="fillGaps"
          >
            <template #icon>
              <n-icon><BulbOutline /></n-icon>
            </template>
            Fill Gaps
          </n-button>
        </div>
      </div>

      <!-- Photo Grid -->
      <div class="photo-grid-container">
        <div class="photo-grid" :style="gridStyle">
          <div
            v-for="(cell, index) in gridCells"
            :key="'grid-cell-' + index"
            class="photo-cell"
            :class="{
              'has-photo': cell.photo,
              'is-generating': cell.isGenerating,
            }"
          >
            <!-- Empty Cell with Add Button -->
            <div v-if="!cell.photo && !cell.isGenerating" class="empty-cell">
              <n-button
                circle
                size="large"
                class="add-photo-btn"
                @click="openPhotoSelector(index)"
              >
                <template #icon>
                  <n-icon size="24">
                    <AddOutline />
                  </n-icon>
                </template>
              </n-button>
              <span class="cell-label">Add Photo</span>
            </div>

            <!-- Generating Skeleton -->
            <div v-else-if="cell.isGenerating" class="generating-cell">
              <n-skeleton height="100%" />
              <div class="generating-overlay">
                <n-spin size="medium" />
                <span class="generating-text">Generating...</span>
              </div>
            </div>

            <!-- Photo Cell -->
            <div v-else class="filled-cell">
              <img
                :src="cell.photo.url"
                :alt="cell.photo.title"
                class="cell-photo"
              />
              <div class="cell-overlay">
                <n-button
                  circle
                  size="small"
                  class="remove-photo-btn"
                  @click="removePhoto(index)"
                >
                  <template #icon>
                    <n-icon><CloseOutline /></n-icon>
                  </template>
                </n-button>
                <n-button
                  circle
                  size="small"
                  class="replace-photo-btn"
                  @click="openPhotoSelector(index)"
                >
                  <template #icon>
                    <n-icon><SwapHorizontalOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid Actions -->
      <div class="grid-actions-bottom">
        <n-button @click="exportGrid" type="primary">
          <template #icon>
            <n-icon><DownloadOutline /></n-icon>
          </template>
          Export Grid
        </n-button>

        <n-button @click="saveTemplate">
          <template #icon>
            <n-icon><BookmarkOutline /></n-icon>
          </template>
          Save as Template
        </n-button>
      </div>
    </div>

    <!-- Photo Selection Dialog -->
    <PhotosDialog
      v-model="showPhotoDialog"
      :is-trash="false"
      :single-selection="true"
      title="Select Photo for Grid"
      @add-photos="handlePhotoSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useMessage } from "naive-ui";
import PhotosDialog from "@/components/canvas/PhotosDialog.vue";

// Import icons
import {
  RefreshOutline,
  BulbOutline,
  AddOutline,
  CloseOutline,
  SwapHorizontalOutline,
  DownloadOutline,
  BookmarkOutline,
} from "@vicons/ionicons5";

// Grid configuration
const maxRows = 8;
const maxCols = 8;

// State
const message = useMessage();
const gridCreated = ref(false);
const selectedRows = ref(0);
const selectedCols = ref(0);
const hoveredRows = ref(0);
const hoveredCols = ref(0);
const showPhotoDialog = ref(false);
const selectedCellIndex = ref<number | null>(null);
const isGenerating = ref(false);
const fillType = ref<string>("general");

// Fill type options
const fillTypeOptions = [
  { label: "General", value: "general" },
  { label: "By Color", value: "color" },
  { label: "By Context", value: "context" },
];

// Grid cells data
const gridCells = ref<
  Array<{
    photo: any | null;
    isGenerating: boolean;
  }>
>([]);

// Mock photos for generation
const mockPhotos = [
  {
    id: "mock-1",
    url: "https://picsum.photos/400/400?random=1",
    title: "Generated Photo 1",
    thumbnailUrl: "https://picsum.photos/200/200?random=1",
  },
  {
    id: "mock-2",
    url: "https://picsum.photos/400/400?random=2",
    title: "Generated Photo 2",
    thumbnailUrl: "https://picsum.photos/200/200?random=2",
  },
  {
    id: "mock-3",
    url: "https://picsum.photos/400/400?random=3",
    title: "Generated Photo 3",
    thumbnailUrl: "https://picsum.photos/200/200?random=3",
  },
  {
    id: "mock-4",
    url: "https://picsum.photos/400/400?random=4",
    title: "Generated Photo 4",
    thumbnailUrl: "https://picsum.photos/200/200?random=4",
  },
  {
    id: "mock-5",
    url: "https://picsum.photos/400/400?random=5",
    title: "Generated Photo 5",
    thumbnailUrl: "https://picsum.photos/200/200?random=5",
  },
  {
    id: "mock-6",
    url: "https://picsum.photos/400/400?random=6",
    title: "Generated Photo 6",
    thumbnailUrl: "https://picsum.photos/200/200?random=6",
  },
];

// Computed properties
const totalCells = computed(() => selectedRows.value * selectedCols.value);

const filledCells = computed(
  () => gridCells.value.filter((cell) => cell.photo !== null).length
);

const hasEmptyCells = computed(() =>
  gridCells.value.some((cell) => !cell.photo && !cell.isGenerating)
);

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${selectedCols.value}, 1fr)`,
  gridTemplateRows: `repeat(${selectedRows.value}, 1fr)`,
}));

// Methods
const updateHover = (row: number, col: number) => {
  hoveredRows.value = row;
  hoveredCols.value = col;
};

const resetHover = () => {
  hoveredRows.value = 0;
  hoveredCols.value = 0;
};

const selectGrid = (rows: number, cols: number) => {
  selectedRows.value = rows;
  selectedCols.value = cols;
};

const createGrid = () => {
  gridCreated.value = true;

  // Initialize grid cells
  gridCells.value = Array(totalCells.value)
    .fill(null)
    .map(() => ({
      photo: null,
      isGenerating: false,
    }));

  message.success(`Created ${selectedRows.value}×${selectedCols.value} grid`);
};

const resetGrid = () => {
  gridCreated.value = false;
  selectedRows.value = 0;
  selectedCols.value = 0;
  hoveredRows.value = 0;
  hoveredCols.value = 0;
  gridCells.value = [];
  message.info("Grid reset");
};

const openPhotoSelector = (cellIndex: number) => {
  selectedCellIndex.value = cellIndex;
  showPhotoDialog.value = true;
};

const handlePhotoSelection = (photoIds: string[]) => {
  if (photoIds.length > 0 && selectedCellIndex.value !== null) {
    // Mock photo data - in real app this would come from the photos store
    const mockPhoto = {
      id: photoIds[0],
      url: `https://picsum.photos/400/400?random=${Date.now()}`,
      title: `Photo ${photoIds[0]}`,
      thumbnailUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
    };

    gridCells.value[selectedCellIndex.value].photo = mockPhoto;
    message.success("Photo added to grid");
  }

  showPhotoDialog.value = false;
  selectedCellIndex.value = null;
};

const removePhoto = (cellIndex: number) => {
  gridCells.value[cellIndex].photo = null;
  message.info("Photo removed from grid");
};

const fillGaps = async () => {
  isGenerating.value = true;

  // Find empty cells
  const emptyCellIndices = gridCells.value
    .map((cell, index) => (!cell.photo && !cell.isGenerating ? index : -1))
    .filter((index) => index !== -1);

  if (emptyCellIndices.length === 0) {
    message.warning("No empty cells to fill");
    isGenerating.value = false;
    return;
  }

  message.info(
    `Generating ${emptyCellIndices.length} photos using ${fillType.value} mode...`
  );

  // Set cells to generating state
  emptyCellIndices.forEach((index) => {
    gridCells.value[index].isGenerating = true;
  });

  // Simulate generation with staggered delays
  for (let i = 0; i < emptyCellIndices.length; i++) {
    const cellIndex = emptyCellIndices[i];

    // Random delay between 1-3 seconds
    const delay = 1000 + Math.random() * 2000;

    setTimeout(() => {
      // Get random mock photo
      const randomPhoto =
        mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
      const generatedPhoto = {
        ...randomPhoto,
        id: `generated-${Date.now()}-${cellIndex}`,
        url: `https://picsum.photos/400/400?random=${Date.now()}-${cellIndex}`,
        thumbnailUrl: `https://picsum.photos/200/200?random=${Date.now()}-${cellIndex}`,
      };

      gridCells.value[cellIndex].photo = generatedPhoto;
      gridCells.value[cellIndex].isGenerating = false;

      // Check if all cells are done generating
      if (i === emptyCellIndices.length - 1) {
        isGenerating.value = false;
        message.success("All gaps filled successfully!");
      }
    }, delay);
  }
};

const exportGrid = () => {
  if (filledCells.value === 0) {
    message.warning("Add some photos to the grid before exporting");
    return;
  }

  // Simulate export process
  message.loading("Preparing grid for export...", {
    duration: 2000,
    onAfterLeave: () => {
      message.success("Grid exported successfully!");
    },
  });
};

const saveTemplate = () => {
  if (filledCells.value === 0) {
    message.warning("Add some photos to create a template");
    return;
  }

  // Simulate save process
  message.loading("Saving grid template...", {
    duration: 1500,
    onAfterLeave: () => {
      message.success("Template saved to your library!");
    },
  });
};
</script>

<style scoped>
.grid-maker-container {
  padding: var(--spacing-2xl);

  margin: 0 auto;
}

.grid-maker-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

/* Grid Selector */
.grid-selector-section {
  margin-bottom: var(--spacing-3xl);
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xl) 0;
  text-align: center;
}

.grid-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.selector-info {
  text-align: center;
}

.selector-label {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
}

.selector-description {
  font-size: 14px;
  color: var(--text-secondary);
}

.grid-preview {
  display: grid;
  grid-template-rows: repeat(8, 24px);
  gap: 2px;
  padding: var(--spacing-lg);
  background-color: var(--bg-surface);
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(8, 24px);
  gap: 2px;
}

.grid-cell {
  width: 24px;
  height: 24px;
  background-color: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.grid-cell:hover,
.grid-cell.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.grid-cell.selected {
  background-color: var(--primary-color-pressed);
  border-color: var(--primary-color-pressed);
}

.grid-actions {
  display: flex;
  justify-content: center;
}

/* Grid Management */
.grid-management-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.grid-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-surface);
  border-radius: var(--border-radius-lg);
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.grid-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.grid-size {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.photos-count {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Photo Grid */
.photo-grid-container {
  background-color: var(--bg-surface);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-2xl);
}

.photo-grid {
  display: grid;
  gap: var(--spacing-md);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.photo-cell {
  aspect-ratio: 1;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  position: relative;
  background-color: var(--bg-container);
  border: 2px solid var(--border-color);
  transition: all 0.3s ease;
}

.photo-cell:hover {
  border-color: var(--primary-color);
}

/* Empty Cell */
.empty-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
}

.add-photo-btn {
  background-color: var(--bg-container) !important;
  border: 2px dashed var(--border-color) !important;
  transition: all 0.3s ease;
}

.add-photo-btn:hover {
  border-color: var(--primary-color) !important;
  background-color: var(--primary-color-hover) !important;
}

.cell-label {
  font-size: 12px;
  font-weight: 500;
}

/* Generating Cell */
.generating-cell {
  position: relative;
  height: 100%;
}

.generating-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  z-index: 2;
}

.generating-text {
  font-size: 12px;
  color: white;
  font-weight: 500;
}

/* Filled Cell */
.filled-cell {
  position: relative;
  height: 100%;
}

.cell-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cell-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-cell:hover .cell-overlay {
  opacity: 1;
}

.remove-photo-btn,
.replace-photo-btn {
  background-color: rgba(0, 0, 0, 0.7) !important;
  border: none !important;
  color: white !important;
}

/* Bottom Actions */
.grid-actions-bottom {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

/* Responsive */
@media (max-width: 768px) {
  .grid-maker-container {
    padding: var(--spacing-lg);
  }

  .grid-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group {
    justify-content: center;
  }

  .photo-grid-container {
    padding: var(--spacing-lg);
  }

  .grid-preview {
    padding: var(--spacing-md);
  }

  .grid-cell {
    width: 20px;
    height: 20px;
  }

  .grid-row {
    grid-template-columns: repeat(8, 20px);
  }

  .grid-preview {
    grid-template-rows: repeat(8, 20px);
  }
}
</style>
