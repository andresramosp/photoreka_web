<template>
  <div class="tab-content">
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

        <!-- Grid Controls -->
        <div class="grid-controls grid-controls-base">
          <div class="results-info results-info-base">
            <span class="results-count results-count-base"
              >{{ catalogPhotos.length }} photos</span
            >
          </div>
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
        </div>

        <!-- Photo Grid -->
        <div
          class="photos-grid photo-grid-base"
          :class="`grid-cols-${gridColumns}`"
        >
          <PhotoCardInfo
            v-for="photo in catalogPhotos"
            :key="photo.id"
            :photo="{
              ...photo,
              size: parseFloat(photo.size) * 1024 * 1024, // Convert MB to bytes
            }"
            @info="showPhotoInfo"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { mockedPhotos, type CatalogPhoto } from "@/assets/mocked";
import PhotoCardInfo from "../PhotoCardInfo.vue";
import { BookInformation20Regular } from "@vicons/fluent";

// Grid columns state
const gridColumns = ref(4);

// Static catalog photos for demonstration
const catalogPhotos = ref<CatalogPhoto[]>(mockedPhotos);

// Photo selection functions
const showPhotoInfo = (photo: any) => {
  console.log("Show photo info:", photo);
  // Here you would implement the photo info modal/panel
};

// Grid columns function
const setGridColumns = (columns: number) => {
  gridColumns.value = columns;
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

/* Responsive */
@media (max-width: 1200px) {
  .photo-grid-base.grid-cols-6 {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1024px) {
  .photo-grid-base.grid-cols-5,
  .photo-grid-base.grid-cols-6 {
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
