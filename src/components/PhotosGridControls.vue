<template>
  <div class="photos-grid-controls">
    <!-- Visual Aspects Filters Section -->
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
              :placeholder="`${
                aspectGroup.label.charAt(0).toUpperCase() +
                aspectGroup.label.slice(1)
              }`"
              :options="aspectGroup.children"
              :max-tag-count="2"
              clearable
              filterable
              class="filter-select"
              size="small"
              @update:value="handleFilterChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Quality Sorting Section -->
    <div class="sorting-section">
      <div class="sorting-header" @click="toggleSortingPanel">
        <div class="sorting-header-left">
          <n-icon
            size="16"
            class="sorting-toggle-icon"
            :class="{ expanded: isSortingPanelExpanded }"
          >
            <ChevronRight20Regular />
          </n-icon>
          <h4 class="sorting-title">Quality Sorting</h4>

          <!-- Sort Order Icon (small and discrete) -->
          <n-button
            v-if="hasActiveSorting"
            text
            size="tiny"
            @click.stop="toggleSortOrder"
            class="sort-order-icon"
            :title="
              sortOrder === 'desc'
                ? 'Best First (click for Worst First)'
                : 'Worst First (click for Best First)'
            "
          >
            <n-icon size="18">
              <svg viewBox="0 0 24 24" style="width: 18px; height: 18px">
                <!-- Desc (Best First) - Sort descending icon -->
                <path
                  v-if="sortOrder === 'desc'"
                  d="M19,17H22L18,21L14,17H17V3H19V17M2,17V19H12V17H2M6,5V7H12V5H6M2,11V13H9V11H2Z"
                  fill="currentColor"
                />
                <!-- Asc (Worst First) - Sort ascending icon -->
                <path
                  v-else
                  d="M19,7H22L18,3L14,7H17V21H19V7M2,17V19H12V17H2M6,5V7H12V5H6M2,11V13H9V11H2Z"
                  fill="currentColor"
                />
              </svg>
            </n-icon>
          </n-button>

          <span
            v-if="hasActiveSorting && !isSortingPanelExpanded"
            class="active-sorting-badge"
          >
            Active
          </span>
        </div>
        <n-button
          v-if="hasActiveSorting && isSortingPanelExpanded"
          quaternary
          size="small"
          @click.stop="clearSorting"
          class="clear-sorting-btn"
        >
          Clear sorting
        </n-button>
      </div>

      <div v-show="isSortingPanelExpanded" class="sorting-content">
        <div class="sorting-controls">
          <!-- Sorting Type Selection -->
          <div class="sorting-type-selection">
            <n-radio-group
              v-model:value="sortingType"
              @update:value="handleSortingTypeChange"
            >
              <!-- <n-radio value="none" class="sorting-radio"> None </n-radio> -->
              <n-radio value="criteria" class="sorting-radio">
                Included Criteria
              </n-radio>
              <n-radio value="genre" class="sorting-radio">
                Genre Presets
              </n-radio>
            </n-radio-group>
          </div>

          <!-- Criteria-based Sorting -->
          <div v-if="sortingType === 'criteria'" class="criteria-selection">
            <n-select
              v-model:value="selectedCriteria"
              multiple
              :options="availableCriteria"
              placeholder="Select criteria"
              size="small"
              style="width: 430px"
              :show-arrow="true"
              :render-tag="renderCriterionTag"
              @update:value="handleCriteriaChange"
            />
          </div>

          <!-- Genre-based Sorting -->
          <div v-if="sortingType === 'genre'" class="genre-selection">
            <div class="genre-buttons">
              <n-button
                :type="selectedGenre === 'street' ? 'primary' : 'default'"
                size="small"
                @click="handleGenreSelect('street')"
                class="genre-button"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" style="width: 14px; height: 14px">
                      <path
                        d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"
                      />
                    </svg>
                  </n-icon>
                </template>
                Street
              </n-button>
              <n-button
                :type="selectedGenre === 'documentary' ? 'primary' : 'default'"
                size="small"
                @click="handleGenreSelect('documentary')"
                class="genre-button"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" style="width: 14px; height: 14px">
                      <path
                        d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                      />
                    </svg>
                  </n-icon>
                </template>
                Documentary
              </n-button>
              <n-button
                :type="selectedGenre === 'abstract' ? 'primary' : 'default'"
                size="small"
                @click="handleGenreSelect('abstract')"
                class="genre-button"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" style="width: 14px; height: 14px">
                      <path
                        d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
                      />
                    </svg>
                  </n-icon>
                </template>
                Artistic
              </n-button>
              <n-button
                :type="selectedGenre === 'custom' ? 'primary' : 'default'"
                size="small"
                @click="handleGenreSelect('custom')"
                class="genre-button custom-button"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" style="width: 14px; height: 14px">
                      <path
                        d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
                      />
                    </svg>
                  </n-icon>
                </template>
                Custom
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Weights Modal -->
    <n-modal
      v-model:show="showCustomWeightsModal"
      preset="card"
      title="Custom Preset Configuration"
      :style="{ maxWidth: '90vw', width: '600px' }"
    >
      <CustomArtisticWeights
        v-model="customWeights"
        :format-criterion-name="formatCriterionName"
      />
      <template #footer>
        <div style="display: flex; justify-content: space-between; width: 100%">
          <n-button @click="resetCustomWeights"> Reset to Default </n-button>
          <div style="display: flex; gap: 8px">
            <n-button @click="showCustomWeightsModal = false">
              Cancel
            </n-button>
            <n-button type="primary" @click="saveCustomWeights">
              Apply Custom Preset
            </n-button>
          </div>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { computed, ref, watch, h } from "vue";
import { visualAspectsOptions } from "@/stores/searchStore.js";
import { useArtisticScores } from "@/composables/useArtisticScores.js";
import CustomArtisticWeights from "./CustomArtisticWeights.vue";
import {
  NButton,
  NSelect,
  NIcon,
  NRadioGroup,
  NRadio,
  NModal,
  NTag,
} from "naive-ui";
import { ChevronRight20Regular } from "@vicons/fluent";

const emit = defineEmits([
  "filters-change",
  "sorting-change",
  "sort-order-change",
  "criteria-change",
  "genre-change",
  "sorting-type-change",
  "custom-weights-change",
]);

// Visual Aspects Filters
const selectedFilters = ref({});
const isFiltersPanelExpanded = ref(false);

// Quality Sorting
const sortingType = ref("criteria"); // 'criteria' or 'genre'
const selectedCriteria = ref([]); // Start empty (no sorting initially)
const selectedGenre = ref("street");
const sortOrder = ref("desc"); // 'asc', 'desc'
const isSortingPanelExpanded = ref(false);

// Get dynamic criteria from useArtisticScores
const { artisticScores, genrePresets, formatCriterionName } =
  useArtisticScores();

// Create grouped criteria options for n-select
const availableCriteria = Object.entries(artisticScores).map(
  ([groupKey, group]) => ({
    type: "group",
    label: group.label,
    key: groupKey,
    children: group.criteria.map((criterion) => ({
      value: criterion.value,
      label: criterion.label,
      group: groupKey, // Add group information for styling
    })),
  })
);

// Helper function to get group for a criterion
const getCriterionGroup = (criterionValue) => {
  for (const [groupKey, group] of Object.entries(artisticScores)) {
    if (group.criteria.some((c) => c.value === criterionValue)) {
      return groupKey;
    }
  }
  return null;
};

// Custom weights modal
const showCustomWeightsModal = ref(false);
const customWeights = ref({});

// Initialize custom weights with default values (1.0 for all criteria)
const initializeCustomWeights = () => {
  const weights = {};
  Object.values(artisticScores).forEach((group) => {
    group.criteria.forEach((criterion) => {
      weights[criterion.value] = 1.0;
    });
  });
  return weights;
};

customWeights.value = initializeCustomWeights();

// Function to render criterion tags with group-specific colors
const renderCriterionTag = ({ option, handleClose }) => {
  const group = getCriterionGroup(option.value);
  const tagColor = group.color; // Blue for fundamentals, amber for bonus

  return h(
    NTag,
    {
      style: {
        backgroundColor: tagColor + "20", // Add transparency
        borderColor: tagColor,
        color: tagColor,
      },
      closable: true,
      onClose: (e) => {
        e.stopPropagation();
        handleClose();
      },
    },
    {
      default: () => option.label,
    }
  );
};

// Genre options for the select (no longer needed but keeping for compatibility)
const genreOptions = [
  { value: "street", label: "Street" },
  { value: "documentary", label: "Documentary" },
  { value: "abstract", label: "Abstract" },
];

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

// Computed for checking if sorting is active
const hasActiveSorting = computed(() => {
  if (sortingType.value === "none") {
    return false; // No sorting when "none" is selected
  } else if (sortingType.value === "criteria") {
    return selectedCriteria.value.length > 0;
  } else if (sortingType.value === "genre") {
    return true; // Genre sorting is always active when selected
  }
  return false;
});

// Functions
const toggleFiltersPanel = () => {
  isFiltersPanelExpanded.value = !isFiltersPanelExpanded.value;
};

const toggleSortingPanel = () => {
  isSortingPanelExpanded.value = !isSortingPanelExpanded.value;
};

const clearAllFilters = () => {
  Object.keys(selectedFilters.value).forEach((key) => {
    selectedFilters.value[key] = [];
  });
};

const handleSortingTypeChange = () => {
  // Reset criteria when switching modes
  if (sortingType.value === "none") {
    selectedCriteria.value = []; // Clear criteria when none is selected
  } else if (sortingType.value === "genre") {
    selectedCriteria.value = []; // Clear criteria when switching to genre mode
  } else if (sortingType.value === "criteria") {
    // Keep current criteria or start empty - don't force default criteria
    // This allows the user to start with "no sorting" until they add criteria
  }
  emit("sorting-type-change", sortingType.value);
};

const handleGenreChange = () => {
  emit("genre-change", selectedGenre.value);
};

const handleGenreSelect = (genre) => {
  if (genre === "custom") {
    // Open custom weights modal
    showCustomWeightsModal.value = true;
  } else {
    selectedGenre.value = genre;
    handleGenreChange();
  }
};

const resetCustomWeights = () => {
  customWeights.value = initializeCustomWeights();
};

const saveCustomWeights = () => {
  selectedGenre.value = "custom";
  showCustomWeightsModal.value = false;

  // Emit custom weights to parent
  emit("custom-weights-change", customWeights.value);
  handleGenreChange();
};

const clearSorting = () => {
  sortingType.value = "none";
  selectedCriteria.value = [];
};

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
};

const handleFilterChange = () => {
  emit("filters-change", selectedFilters.value);
};

const handleCriteriaChange = () => {
  emit("criteria-change", selectedCriteria.value);
};

// Watchers to emit changes
watch(
  sortingType,
  (newValue) => {
    emit("sorting-type-change", newValue);
  },
  { immediate: true }
);

watch(
  sortOrder,
  (newValue) => {
    emit("sort-order-change", newValue);
  },
  { immediate: true }
);

watch(
  selectedGenre,
  (newGenre) => {
    emit("genre-change", newGenre);
  },
  { immediate: true }
);

// Combined watcher for overall sorting state
watch(
  [sortingType, selectedCriteria, selectedGenre],
  () => {
    emit("sorting-change", hasActiveSorting.value);
  },
  { immediate: true }
); // Emitir inmediatamente al montar

// Emitir estado inicial de filtros y criterios
watch(
  selectedFilters,
  (newFilters) => {
    emit("filters-change", newFilters);
  },
  { immediate: true, deep: true }
);

watch(
  selectedCriteria,
  (newCriteria) => {
    emit("criteria-change", newCriteria);
  },
  { immediate: true }
);
</script>

<style scoped>
.photos-grid-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

/* Visual Aspects Filters Styles */
.filters-section {
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
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.filter-select {
  width: 100%;
}

/* Quality Sorting Styles */
.sorting-section {
  background-color: #1a1a1f;
  border-radius: 8px;
  border: 1px solid #2c2c32;
  overflow: hidden;
}

.sorting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sorting-header:hover {
  background-color: #202025;
}

.sorting-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sorting-toggle-icon {
  color: #ffffff73;
  transition: transform 0.2s ease;
}

.sorting-toggle-icon.expanded {
  transform: rotate(90deg);
}

.sorting-title {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  margin: 0;
}

.sort-order-icon {
  color: #ffffff73;
  transition: all 0.2s ease;
  margin-left: 8px;
  opacity: 0.7;
}

.sort-order-icon:hover {
  color: #8b5cf6;
  opacity: 1;
  transform: scale(1.1);
}

.active-sorting-badge {
  background-color: #10b981;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.clear-sorting-btn {
  color: #10b981;
}

.sorting-content {
  border-top: 1px solid #2c2c32;
  padding: 16px;
}

.sorting-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sorting-type-selection {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sorting-radio {
  color: #ffffffd1;
}

.criteria-selection {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.genre-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.genre-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-button {
  min-width: 90px;
  transition: all 0.2s ease;
}

.genre-button:hover {
  transform: translateY(-1px);
}

.custom-button {
  border: 2px dashed #2c2c32 !important;
}

.criteria-label,
.genre-label {
  font-size: 14px;
  color: #ffffff73;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .criteria-selection,
  .genre-selection {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .genre-buttons {
    width: 100%;
    justify-content: center;
  }

  .genre-button {
    flex: 1;
    min-width: 80px;
  }

  .sorting-type-selection {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .filters-header,
  .sorting-header {
    padding: 10px 12px;
  }

  .filters-content,
  .sorting-content {
    padding: 12px;
  }
}
</style>
