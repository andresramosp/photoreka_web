<template>
  <div class="tab-content">
    <!-- Empty State (when no photos) -->
    <div v-if="processedPhotos.length == 0" class="empty-state-section">
      <div class="photo-hub-header">
        <n-icon :color="`var(--warning-color)`" size="18">
          <BookInformation20Regular />
        </n-icon>
        <h3 class="photo-hub-title">
          Here's your catalog with all the photos processed and ready to be used
          in the all the tools.
        </h3>
      </div>
      <div class="empty-state-container">
        <div class="empty-state-content">
          <div class="empty-state-icon">
            <n-icon size="48" color="#8b5cf6">
              <BookInformation20Regular />
            </n-icon>
          </div>
          <h3 class="empty-state-title">Your workspace is empty</h3>
          <!-- <p class="empty-state-description">
            To add photos, follow these steps:
          </p> -->
          <div class="empty-state-steps">
            <div class="step-item">
              1. Go to
              <button class="tab-link" @click="navigateToTab('upload')">
                Lightbox
              </button>
            </div>
            <div class="step-item">
              2. Upload or sync your photos from any platform
            </div>
            <div class="step-item">
              3. Click Analyze Photos and follow the process evolution in the
              <button class="tab-link" @click="navigateToTab('processing')">
                Processing
              </button>
              tab
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Catalog with Photos -->
    <div v-else class="catalog-section">
      <div class="catalog-photos">
        <!-- Catalog Title -->
        <div class="photo-hub-header">
          <n-icon :color="`var(--warning-color)`" size="18">
            <BookInformation20Regular />
          </n-icon>
          <h3 class="photo-hub-title">
            Here's your catalog with all the photos processed and ready to be
            used in the tools.
          </h3>
        </div>

        <!-- Visual Aspects Filters -->
        <div class="filters-section">
          <div class="filters-header" @click="toggleFiltersPanel">
            <div class="filters-header-left">
              <n-icon
                size="16"
                class="filters-toggle-icon"
                :class="{ expanded: isFiltersPanelExpanded }"
              >
                <ChevronRight20Regular />
              </n-icon>
              <h4 class="filters-title">Visual Aspects Filters</h4>
              <span
                v-if="hasActiveFilters && !isFiltersPanelExpanded"
                class="active-filters-badge"
              >
                {{ totalActiveFilters }}
              </span>
            </div>
            <n-button
              v-if="hasActiveFilters && isFiltersPanelExpanded"
              quaternary
              size="small"
              @click.stop="clearAllFilters"
              class="clear-filters-btn"
            >
              Clear all filters
            </n-button>
          </div>

          <div v-show="isFiltersPanelExpanded" class="filters-content">
            <div class="filters-grid">
              <div
                v-for="aspectGroup in visualAspectsOptions"
                :key="aspectGroup.key"
                class="filter-group"
              >
                <n-select
                  v-model:value="selectedFilters[aspectGroup.key]"
                  multiple
                  :placeholder="`Select ${aspectGroup.label.toLowerCase()}`"
                  :options="aspectGroup.children"
                  :max-tag-count="2"
                  clearable
                  filterable
                  class="filter-select"
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Results Info -->

        <!-- Photos Grid Component -->
        <PhotosGrid :photos="filteredPhotos" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { usePhotosStore } from "@/stores/photos.js";
import { visualAspectsOptions } from "@/stores/searchStore.js";
import { NButton, NSelect, NIcon } from "naive-ui";

import {
  BookInformation20Regular,
  ChevronRight20Regular,
} from "@vicons/fluent";
import PhotosGrid from "../PhotosGrid.vue";
import { useRouter } from "vue-router";

const emit = defineEmits(["navigate-to-tab"]);

const photosStore = usePhotosStore();
const router = useRouter();

// Static catalog photos for demonstration
const processedPhotos = computed(() => photosStore.processedPhotos);

// Local state for filters
const selectedFilters = ref({});
const isFiltersPanelExpanded = ref(false);

// Initialize selectedFilters with empty arrays for each category
visualAspectsOptions.forEach((group) => {
  selectedFilters.value[group.key] = [];
});

// Computed for checking if there are active filters
const hasActiveFilters = computed(() => {
  return Object.values(selectedFilters.value).some(
    (filters) => filters.length > 0
  );
});

// Computed for total count of active filters
const totalActiveFilters = computed(() => {
  return Object.values(selectedFilters.value).reduce(
    (total, filters) => total + filters.length,
    0
  );
});

// Function to toggle filters panel
const toggleFiltersPanel = () => {
  isFiltersPanelExpanded.value = !isFiltersPanelExpanded.value;
};

// Function to get selected count for a specific group
const getSelectedCountForGroup = (groupKey) => {
  return selectedFilters.value[groupKey]?.length || 0;
};

// Function to clear all filters
const clearAllFilters = () => {
  Object.keys(selectedFilters.value).forEach((key) => {
    selectedFilters.value[key] = [];
  });
};

// Computed for filtered photos with AND logic
const filteredPhotos = computed(() => {
  if (!hasActiveFilters.value) {
    return processedPhotos.value;
  }

  return processedPhotos.value.filter((photo) => {
    // Check if photo has visualAspects property
    if (!photo.visualAspects) {
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
        const photoAspects = photo.visualAspects[category];
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
});

// Navigation function for empty state
const navigateToTab = (tabName) => {
  emit("navigate-to-tab", tabName);
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
  .photo-grid-base.grid-cols-6,
  .photo-grid-base.grid-cols-8,
  .photo-grid-base.grid-cols-10 {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  /* Filters responsive */
  .filters-section {
    margin-bottom: 16px;
  }

  .filters-header {
    padding: 10px 12px;
  }

  .filters-header-left {
    gap: 6px;
  }

  .filters-title {
    font-size: 13px;
  }

  .filters-content {
    padding: 12px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .results-info {
    margin-bottom: 12px;
    padding: 6px 10px;
  }

  .results-count {
    font-size: 12px;
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

/* Empty State Styles */
.empty-state-section {
  display: flex;
  /* justify-content: center; */
  min-height: 500px;
  /* padding: 64px 32px; */
  flex-direction: column;
}

.empty-state-container {
  border: 2px dashed #2c2c32;
  border-radius: 16px;
  padding: 64px 32px;
  text-align: center;
  background-color: #1a1a1f;
  transition: all 0.3s ease;
}

.empty-state-content {
  max-width: 550px;
  margin: 0 auto;
}

.empty-state-icon {
  margin-bottom: 24px;
}

.empty-state-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0 0 8px 0;
}

.empty-state-description {
  font-size: 16px;
  color: #ffffffd1;
  margin: 0 0 16px 0;
}

.empty-state-steps {
  display: flex;
  justify-content: center;
}

.steps-list {
  font-size: 14px;
  color: #ffffff73;
  line-height: 1.6;
  padding-left: 20px;
  text-align: left;
}

.steps-list li {
  margin-bottom: 8px;
}

.tab-link:hover {
  color: #a78bfa;
}

.empty-state-steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.step-item {
  text-align: center;
  color: #ffffff73;
}

/* Visual Aspects Filters Styles */
.filters-section {
  margin-bottom: 24px;
  background-color: #1a1a1f;
  border-radius: 8px;
  border: 1px solid #2c2c32;
  overflow: hidden;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.filters-header:hover {
  background-color: #202025;
}

.filters-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filters-toggle-icon {
  color: #ffffff73;
  transition: transform 0.2s ease;
}

.filters-toggle-icon.expanded {
  transform: rotate(90deg);
}

.filters-title {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  margin: 0;
}

.active-filters-badge {
  background-color: #8b5cf6;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.clear-filters-btn {
  color: #8b5cf6;
}

.filters-content {
  border-top: 1px solid #2c2c32;
  padding: 16px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.filter-select {
  width: 100%;
}

.results-info {
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 6px;
  text-align: center;
}

.results-count {
  font-size: 13px;
  font-weight: 500;
  color: #8b5cf6;
}
</style>
