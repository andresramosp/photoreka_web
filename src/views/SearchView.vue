<template>
  <div class="search-container">
    <!-- Search Toolbar -->
    <div class="search-toolbar">
      <!-- Search Mode Selector -->
      <div class="search-mode-section">
        <div class="mode-label">Search Mode:</div>
        <n-radio-group v-model:value="globalMode" class="mode-selector">
          <n-radio-button value="strict" class="mode-option">
            <n-icon size="16" class="mode-icon">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                />
              </svg>
            </n-icon>
            Strict
          </n-radio-button>
          <n-radio-button value="flexible" class="mode-option">
            <n-icon size="16" class="mode-icon">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22L12 18.77L5.82 22L7 14.14L2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </n-icon>
            Flexible
          </n-radio-button>
        </n-radio-group>
      </div>

      <!-- Search Type Tabs -->
      <n-tabs
        v-model:value="activeSearchType"
        type="segment"
        class="search-tabs"
        @update:value="onSearchTypeChange"
      >
        <n-tab-pane name="natural" tab="Natural Language">
          <div class="search-content">
            <div class="natural-search-section">
              <n-input
                v-model:value="naturalQuery"
                type="textarea"
                placeholder="Describe what you're looking for... e.g., 'sunset photos with people on the beach' or 'close-up portraits with red background'"
                :autosize="{ minRows: 2, maxRows: 4 }"
                class="natural-input"
                @input="onSearchChange"
              />
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="tags" tab="Tags">
          <div class="search-content">
            <div class="tags-search-section">
              <div class="tags-row">
                <div class="tags-group">
                  <label class="tags-label">
                    <n-icon size="16" color="#22c55e">
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                        />
                      </svg>
                    </n-icon>
                    Include Tags
                  </label>
                  <n-select
                    v-model:value="includedTags"
                    multiple
                    filterable
                    tag
                    placeholder="Add tags to include..."
                    :options="availableTags"
                    :max-tag-count="5"
                    class="tags-select include-tags"
                    @update:value="onSearchChange"
                  />
                </div>
                <div class="tags-group">
                  <label class="tags-label">
                    <n-icon size="16" color="#ef4444">
                      <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 13H5v-2h14v2z" />
                      </svg>
                    </n-icon>
                    Exclude Tags
                  </label>
                  <n-select
                    v-model:value="excludedTags"
                    multiple
                    filterable
                    tag
                    placeholder="Add tags to exclude..."
                    :options="availableTags"
                    :max-tag-count="5"
                    class="tags-select exclude-tags"
                    @update:value="onSearchChange"
                  />
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="spatial" tab="Spatial">
          <div class="search-content">
            <div class="spatial-search-section">
              <div class="spatial-grid">
                <div class="spatial-area">
                  <label class="spatial-label">Left Side</label>
                  <n-input
                    v-model:value="spatialLeft"
                    type="textarea"
                    placeholder="Objects on the left side..."
                    :autosize="{ minRows: 3, maxRows: 5 }"
                    class="spatial-input"
                    @input="onSearchChange"
                  />
                </div>
                <div class="spatial-area">
                  <label class="spatial-label">Center</label>
                  <n-input
                    v-model:value="spatialCenter"
                    type="textarea"
                    placeholder="Objects in the center..."
                    :autosize="{ minRows: 3, maxRows: 5 }"
                    class="spatial-input center-input"
                    @input="onSearchChange"
                  />
                </div>
                <div class="spatial-area">
                  <label class="spatial-label">Right Side</label>
                  <n-input
                    v-model:value="spatialRight"
                    type="textarea"
                    placeholder="Objects on the right side..."
                    :autosize="{ minRows: 3, maxRows: 5 }"
                    class="spatial-input"
                    @input="onSearchChange"
                  />
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>

      <!-- Search Actions -->
      <div class="search-actions">
        <n-button
          type="primary"
          :loading="isSearching"
          :disabled="!hasSearchQuery"
          @click="performSearch"
          class="search-button"
        >
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                />
              </svg>
            </n-icon>
          </template>
          Search Photos
        </n-button>
        <n-button
          secondary
          @click="clearSearch"
          :disabled="!hasSearchQuery"
          class="clear-button"
        >
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
                />
              </svg>
            </n-icon>
          </template>
          Clear
        </n-button>
      </div>
    </div>

    <!-- Search Results / Empty State -->
    <div class="search-results-container">
      <div v-if="!hasSearchQuery && !isSearching" class="search-inspiration">
        <div class="inspiration-content">
          <n-icon size="80" color="#6b7280" class="inspiration-icon">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14S14 11.99 14 9.5S11.99 5 9.5 5Z"
              />
            </svg>
          </n-icon>
          <h2 class="inspiration-title">Discover your photos</h2>
          <p class="inspiration-subtitle">
            Use AI-powered search to find exactly what you're looking for
          </p>

          <div class="search-examples">
            <h3 class="examples-title">Try something like...</h3>
            <div class="examples-grid">
              <div
                class="example-card"
                @click="
                  setExampleSearch(
                    'natural',
                    'sunset photos with people on the beach',
                  )
                "
              >
                <div class="example-type">Natural Language</div>
                <div class="example-text">
                  "sunset photos with people on the beach"
                </div>
              </div>
              <div
                class="example-card"
                @click="
                  setExampleSearch(
                    'tags',
                    null,
                    ['landscape', 'mountains'],
                    ['people'],
                  )
                "
              >
                <div class="example-type">Tags</div>
                <div class="example-text">
                  Include: landscape, mountains • Exclude: people
                </div>
              </div>
              <div
                class="example-card"
                @click="
                  setExampleSearch(
                    'spatial',
                    null,
                    null,
                    null,
                    'tree',
                    'person',
                    'building',
                  )
                "
              >
                <div class="example-type">Spatial</div>
                <div class="example-text">
                  Left: tree • Center: person • Right: building
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="isSearching" class="search-loading">
        <n-spin size="large" />
        <p class="loading-text">Searching through your photos...</p>
      </div>

      <div v-else class="search-results">
        <!-- Photo grid will be implemented here later -->
        <div class="results-placeholder">
          <p class="results-text">Photo grid will be displayed here</p>
          <p class="results-query">Query: {{ getCurrentQuery() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// Search state
const activeSearchType = ref<"natural" | "tags" | "spatial">("natural");
const globalMode = ref<"strict" | "flexible">("flexible");
const isSearching = ref(false);

// Natural language search
const naturalQuery = ref("");

// Tags search
const includedTags = ref<string[]>([]);
const excludedTags = ref<string[]>([]);
const availableTags = [
  { label: "landscape", value: "landscape" },
  { label: "portrait", value: "portrait" },
  { label: "nature", value: "nature" },
  { label: "people", value: "people" },
  { label: "sunset", value: "sunset" },
  { label: "mountains", value: "mountains" },
  { label: "beach", value: "beach" },
  { label: "city", value: "city" },
  { label: "street", value: "street" },
  { label: "indoor", value: "indoor" },
  { label: "outdoor", value: "outdoor" },
  { label: "black-white", value: "black-white" },
  { label: "color", value: "color" },
  { label: "vintage", value: "vintage" },
  { label: "modern", value: "modern" },
];

// Spatial search
const spatialLeft = ref("");
const spatialCenter = ref("");
const spatialRight = ref("");

// Computed properties
const hasSearchQuery = computed(() => {
  switch (activeSearchType.value) {
    case "natural":
      return naturalQuery.value.trim().length > 0;
    case "tags":
      return includedTags.value.length > 0 || excludedTags.value.length > 0;
    case "spatial":
      return (
        spatialLeft.value.trim().length > 0 ||
        spatialCenter.value.trim().length > 0 ||
        spatialRight.value.trim().length > 0
      );
    default:
      return false;
  }
});

// Methods
const onSearchTypeChange = (type: string) => {
  console.log("Search type changed to:", type);
};

const onSearchChange = () => {
  console.log("Search parameters changed");
};

const performSearch = async () => {
  if (!hasSearchQuery.value) return;

  isSearching.value = true;
  console.log("Performing search:", {
    type: activeSearchType.value,
    mode: globalMode.value,
    query: getCurrentQuery(),
  });

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000));
  isSearching.value = false;
};

const clearSearch = () => {
  naturalQuery.value = "";
  includedTags.value = [];
  excludedTags.value = [];
  spatialLeft.value = "";
  spatialCenter.value = "";
  spatialRight.value = "";
};

const getCurrentQuery = () => {
  switch (activeSearchType.value) {
    case "natural":
      return naturalQuery.value;
    case "tags":
      const included =
        includedTags.value.length > 0
          ? `Include: ${includedTags.value.join(", ")}`
          : "";
      const excluded =
        excludedTags.value.length > 0
          ? `Exclude: ${excludedTags.value.join(", ")}`
          : "";
      return [included, excluded].filter(Boolean).join(" • ");
    case "spatial":
      const parts = [];
      if (spatialLeft.value) parts.push(`Left: ${spatialLeft.value}`);
      if (spatialCenter.value) parts.push(`Center: ${spatialCenter.value}`);
      if (spatialRight.value) parts.push(`Right: ${spatialRight.value}`);
      return parts.join(" • ");
    default:
      return "";
  }
};

const setExampleSearch = (
  type: "natural" | "tags" | "spatial",
  natural?: string,
  included?: string[],
  excluded?: string[],
  left?: string,
  center?: string,
  right?: string,
) => {
  clearSearch();
  activeSearchType.value = type;

  if (type === "natural" && natural) {
    naturalQuery.value = natural;
  } else if (type === "tags") {
    if (included) includedTags.value = included;
    if (excluded) excludedTags.value = excluded;
  } else if (type === "spatial") {
    if (left) spatialLeft.value = left;
    if (center) spatialCenter.value = center;
    if (right) spatialRight.value = right;
  }
};
</script>

<style scoped>
.search-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Search Toolbar */
.search-toolbar {
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.search-mode-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #2c2c32;
}

.mode-label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  white-space: nowrap;
}

.mode-selector {
  flex: 1;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-icon {
  margin-right: 4px;
}

/* Search Tabs */
.search-tabs {
  margin-bottom: 24px;
}

.search-content {
  padding-top: 20px;
}

/* Natural Language Search */
.natural-search-section {
  max-width: 100%;
}

.natural-input {
  font-size: 16px;
}

/* Tags Search */
.tags-search-section {
  width: 100%;
}

.tags-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.tags-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
}

.tags-select {
  min-height: 40px;
}

/* Spatial Search */
.spatial-search-section {
  width: 100%;
}

.spatial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.spatial-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spatial-label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  text-align: center;
}

.spatial-input {
  text-align: center;
}

.center-input {
  border-color: #2563eb;
}

/* Search Actions */
.search-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #2c2c32;
}

.search-button {
  min-width: 140px;
}

.clear-button {
  min-width: 100px;
}

/* Search Results Container */
.search-results-container {
  min-height: 400px;
}

/* Search Inspiration */
.search-inspiration {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  text-align: center;
}

.inspiration-content {
  max-width: 600px;
}

.inspiration-icon {
  margin-bottom: 24px;
}

.inspiration-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffffd1;
  margin: 0 0 12px 0;
}

.inspiration-subtitle {
  font-size: 18px;
  color: #ffffff73;
  margin: 0 0 40px 0;
}

.search-examples {
  text-align: left;
}

.examples-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0 0 20px 0;
  text-align: center;
}

.examples-grid {
  display: grid;
  gap: 16px;
}

.example-card {
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.example-card:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.example-type {
  font-size: 12px;
  font-weight: 500;
  color: #2563eb;
  margin-bottom: 8px;
}

.example-text {
  font-size: 14px;
  color: #ffffffd1;
  line-height: 1.4;
}

/* Search Loading */
.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.loading-text {
  font-size: 16px;
  color: #ffffff73;
  margin: 0;
}

/* Search Results Placeholder */
.search-results {
  min-height: 400px;
}

.results-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 12px;
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 12px;
  padding: 40px;
}

.results-text {
  font-size: 18px;
  color: #ffffffd1;
  margin: 0;
}

.results-query {
  font-size: 14px;
  color: #ffffff73;
  margin: 0;
  text-align: center;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-toolbar {
    padding: 16px;
    margin-bottom: 24px;
  }

  .search-mode-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .mode-selector {
    width: 100%;
  }

  .tags-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .spatial-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .spatial-label {
    text-align: left;
  }

  .spatial-input {
    text-align: left;
  }

  .search-actions {
    flex-direction: column;
  }

  .search-button,
  .clear-button {
    width: 100%;
  }

  .inspiration-title {
    font-size: 24px;
  }

  .inspiration-subtitle {
    font-size: 16px;
  }

  .examples-grid {
    gap: 12px;
  }
}

/* Tablet Responsive */
@media (min-width: 768px) and (max-width: 1024px) {
  .spatial-grid {
    gap: 16px;
  }

  .tags-row {
    gap: 16px;
  }
}
</style>
