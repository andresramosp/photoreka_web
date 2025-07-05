<template>
  <div class="tab-content">
    <PhotoInfoDialog
      v-model="showPhotoInfoDialog"
      :selected-photo="selectedDialogPhoto"
    />

    <div class="catalog-section">
      <!-- Static Example Photos -->
      <div class="catalog-photos">
        <!-- Catalog Title -->
        <div class="photo-hub-header">
          <n-icon :color="`var(--warning-color)`" size="18">
            <BookInformation20Regular />
          </n-icon>
          <h3 class="photo-hub-title">
            Here's your catalog with all the photos processed and ready to be
            used in the tools. You can edit and delete them.
          </h3>
        </div>

        <div class="header-buttons compact-upload-section">
          <div class=""></div>
          <div style="display: flex; gap: 15px">
            <n-button
              type="default"
              size="medium"
              class="analyze-btn"
              @click="
                () => {
                  photosStore.checkDuplicates();
                }
              "
              :disabled="
                catalogPhotos.filter((p) => !p.isUploading).length === 0
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
              Check duplicates
            </n-button>
          </div>
        </div>

        <!-- Grid Controls -->
        <div class="grid-controls grid-controls-base">
          <div class="controls-left">
            <div class="results-info results-info-base">
              <span class="results-count results-count-base"
                >{{ catalogPhotos.length }} photos</span
              >
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
            <div class="grid-size-controls grid-size-controls-base">
              <span class="grid-label grid-label-base">Columns:</span>
              <n-button-group>
                <n-button
                  v-for="size in [4, 6, 8]"
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
            v-for="photo in catalogPhotos"
            :key="photo.id"
            :photo="{
              ...photo,
              size: parseFloat(photo.size) * 1024 * 1024, // Convert MB to bytes
            }"
            :selected="selectedPhotosRecord[photo.id]"
            @info="showPhotoInfo"
            @delete="deletePhoto"
            @select="togglePhotoSelection"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { usePhotosStore } from "@/stores/photos.js";

import { BookInformation20Regular } from "@vicons/fluent";
import PhotoInfoDialog from "../PhotoInfoDialog.vue";
import PhotoCardHub from "../photoCards/PhotoCardHub.vue";

const photosStore = usePhotosStore();

// Grid columns state
const gridColumns = ref(8);

const showPhotoInfoDialog = ref(false);
const selectedDialogPhoto = ref();

// Static catalog photos for demonstration
const catalogPhotos = computed(() => photosStore.catalogPhotos);

// Selection state
const selectedPhotosRecord = computed(() => photosStore.selectedPhotosRecord);
const selectedPhotoIds = computed(() => photosStore.selectedPhotoIds);

// Check if all photos are selected
const allSelected = computed(() => {
  return (
    catalogPhotos.value.length > 0 &&
    catalogPhotos.value.every((photo) => selectedPhotosRecord.value[photo.id])
  );
});

// Photo selection functions
const showPhotoInfo = async (photo) => {
  const fullPhoto = await photosStore.fetchPhoto(photo.id);
  selectedDialogPhoto.value = fullPhoto;
  showPhotoInfoDialog.value = true;
};

const deletePhoto = async (photoId) => {
  await photosStore.deletePhoto(photoId);
  // photosStore.checkDuplicates(photo.duplicates); // solo si lanzamos uno inicial
};

// Grid columns function
const setGridColumns = (columns) => {
  gridColumns.value = columns;
};

// Photo selection functions
const togglePhotoSelection = (photoId) => {
  photosStore.togglePhotoSelection(photoId);
};

// Select/Deselect all photos
const handleSelectAll = () => {
  catalogPhotos.value.forEach((photo) => {
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
</script>

<style scoped>
.tab-content {
  padding: var(--spacing-3xl);
  background-color: var(--bg-container);
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

/* Responsive */
@media (max-width: 1200px) {
  .photo-grid-base.grid-cols-6,
  .photo-grid-base.grid-cols-8 {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1024px) {
  .photo-grid-base.grid-cols-5,
  .photo-grid-base.grid-cols-6,
  .photo-grid-base.grid-cols-8 {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .tab-content {
    padding: 16px;
  }

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
  .photo-grid-base.grid-cols-6 {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .photo-grid-base.grid-cols-3,
  .photo-grid-base.grid-cols-4,
  .photo-grid-base.grid-cols-5,
  .photo-grid-base.grid-cols-6 {
    grid-template-columns: 1fr;
  }
}
</style>
