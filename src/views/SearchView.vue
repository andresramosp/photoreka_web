<template>
  <div class="search-container">
    <!-- Search Toolbar -->
    <div class="search-toolbar">
      <!-- Search Type and Mode Selector -->
      <div class="search-selector-section">
        <!-- Search Type -->
        <div class="selector-group">
          <div class="selector-label">Search Type:</div>
          <div class="type-pills">
            <div
              class="type-pill"
              :class="{ active: activeSearchType === 'natural' }"
              @click="setSearchType('natural')"
            >
              <n-icon size="14" class="type-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"
                  />
                </svg>
              </n-icon>
              Natural Language
            </div>
            <div
              class="type-pill"
              :class="{ active: activeSearchType === 'tags' }"
              @click="setSearchType('tags')"
            >
              <n-icon size="16" class="type-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M5.5 7A1.5 1.5 0 1 0 7 5.5A1.5 1.5 0 0 0 5.5 7zm6.5 4.5c0-.83-.67-1.5-1.5-1.5S9 10.67 9 11.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5zM12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22L12 18.77L5.82 22L7 14.14L2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </n-icon>
              Tags
            </div>
            <div
              class="type-pill"
              :class="{ active: activeSearchType === 'spatial' }"
              @click="setSearchType('spatial')"
            >
              <n-icon size="16" class="type-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-2V2h-2v2H9V2H7v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM19 20H5V9h14v11z"
                  />
                </svg>
              </n-icon>
              Spatial
            </div>
          </div>
        </div>

        <!-- Search Mode -->
        <div class="selector-group">
          <div class="selector-label">Search Mode:</div>
          <div class="mode-pills">
            <div
              class="mode-pill"
              :class="{ active: globalMode === 'strict' }"
              @click="globalMode = 'strict'"
            >
              <n-icon size="14" class="mode-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  />
                </svg>
              </n-icon>
              Strict
            </div>
            <div
              class="mode-pill"
              :class="{ active: globalMode === 'flexible' }"
              @click="globalMode = 'flexible'"
            >
              <n-icon size="16" class="mode-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22L12 18.77L5.82 22L7 14.14L2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </n-icon>
              Flexible
            </div>
          </div>
        </div>
      </div>

      <!-- Conditional Search Content -->
      <div class="search-content">
        <!-- Natural Language Search -->
        <div
          v-if="activeSearchType === 'natural'"
          key="natural-search"
          class="natural-search-section"
        >
          <div class="search-input-row">
            <n-input
              v-model:value="naturalQuery"
              type="textarea"
              placeholder="Describe what you're looking for... e.g., 'sunset photos with people on the beach' or 'close-up portraits with red background'"
              :autosize="{ minRows: 1, maxRows: 2 }"
              class="natural-input"
              @input="onSearchChange"
              :key="`natural-${activeSearchType}`"
            />
            <div class="search-actions-inline">
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
                class="clear-button icon-only"
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
              </n-button>
            </div>
          </div>
        </div>

        <!-- Tags Search -->
        <div
          v-else-if="activeSearchType === 'tags'"
          key="tags-search"
          class="tags-search-section"
        >
          <div class="tags-input-row">
            <div class="tags-row">
              <div class="tags-group">
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
                  :key="`include-${activeSearchType}`"
                />
              </div>
              <div class="tags-group">
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
                  :key="`exclude-${activeSearchType}`"
                />
              </div>
            </div>
            <div class="search-actions-inline">
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
                class="clear-button icon-only"
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
              </n-button>
            </div>
          </div>
        </div>

        <!-- Spatial Search -->
        <div
          v-else-if="activeSearchType === 'spatial'"
          key="spatial-search"
          class="spatial-search-section"
        >
          <div class="spatial-input-row">
            <div class="spatial-grid">
              <div class="spatial-area">
                <n-input
                  v-model:value="spatialLeft"
                  type="textarea"
                  placeholder="Left side objects..."
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  class="spatial-input"
                  @input="onSearchChange"
                  :key="`spatial-left-${activeSearchType}`"
                />
              </div>
              <div class="spatial-area">
                <n-input
                  v-model:value="spatialCenter"
                  type="textarea"
                  placeholder="Center objects..."
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  class="spatial-input center-input"
                  @input="onSearchChange"
                  :key="`spatial-center-${activeSearchType}`"
                />
              </div>
              <div class="spatial-area">
                <n-input
                  v-model:value="spatialRight"
                  type="textarea"
                  placeholder="Right side objects..."
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  class="spatial-input"
                  @input="onSearchChange"
                  :key="`spatial-right-${activeSearchType}`"
                />
              </div>
            </div>
            <div class="search-actions-inline">
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
                class="clear-button icon-only"
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
              </n-button>
            </div>
          </div>
        </div>
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
          <p class="inspiration-subtitle">
            Use AI-powered search to find exactly what you're looking for
          </p>

          <div class="search-examples">
            <h3 class="examples-title">Try something like...</h3>

            <!-- Carousel Container -->
            <div class="examples-carousel">
              <div class="carousel-container">
                <div
                  class="example-card carousel-item"
                  :class="{ sliding: isSliding }"
                  @click="handleExampleClick"
                >
                  <div class="example-text">{{ currentExampleText }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="isSearching" class="search-loading">
        <!-- Search Loading Message -->
        <div class="loading-message">
          <n-spin size="large" />
          <p class="loading-text">Searching through your photos...</p>
        </div>

        <!-- Skeleton Grid -->
        <div
          class="photo-grid photo-grid-base"
          :class="`grid-cols-${gridColumns}`"
        >
          <div
            v-for="n in skeletonCount"
            :key="`search-skeleton-${n}`"
            class="photo-skeleton"
          >
            <n-skeleton height="100%" />
          </div>
        </div>
      </div>

      <div v-else class="search-results">
        <!-- Grid Controls -->
        <div class="grid-controls grid-controls-base">
          <div class="results-info results-info-base">
            <span class="results-count results-count-base"
              >{{ searchResults.length }} photos found</span
            >
            <span class="results-query results-query-base">{{
              getCurrentQuery()
            }}</span>
          </div>
          <div class="grid-size-controls grid-size-controls-base">
            <span class="grid-label grid-label-base">Columns:</span>
            <n-button-group>
              <n-button
                v-for="size in [3, 4, 5, 6]"
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
          class="photo-grid photo-grid-base"
          :class="`grid-cols-${gridColumns}`"
        >
          <!-- Photo Cards -->
          <PhotoCard
            v-for="photo in searchResults"
            :key="photo.id"
            :photo="photo"
            :selected="selectedPhotos.includes(photo.id)"
            @select="togglePhotoSelection"
            @info="showPhotoInfo"
          />

          <!-- Skeleton Loading for Load More -->
          <template v-if="isLoadingMore">
            <div v-for="n in 4" :key="`skeleton-${n}`" class="photo-skeleton">
              <n-skeleton height="100%" />
            </div>
          </template>
        </div>

        <!-- Load More Button -->
        <div
          class="load-more-container"
          v-if="searchResults.length > 0 && hasMoreResults"
        >
          <n-button
            size="large"
            :loading="isLoadingMore"
            @click="loadMorePhotos"
            class="load-more-button"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                  />
                </svg>
              </n-icon>
            </template>
            Load More Photos
          </n-button>
        </div>

        <!-- Selection Info -->
        <div v-if="selectedPhotos.length > 0" class="selection-info">
          <span
            >{{ selectedPhotos.length }} photo{{
              selectedPhotos.length > 1 ? "s" : ""
            }}
            selected</span
          >
          <n-button size="small" @click="clearSelection"
            >Clear Selection</n-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import PhotoCard from "../components/PhotoCard.vue";

// Search state
const activeSearchType = ref<"natural" | "tags" | "spatial">("natural");
const globalMode = ref<"strict" | "flexible">("flexible");
const isSearching = ref(false);

// Photo grid state
const searchResults = ref<Photo[]>([]);
const selectedPhotos = ref<string[]>([]);
const gridColumns = ref(4);
const isLoadingMore = ref(false);
const hasMoreResults = ref(true);
const skeletonCount = computed(() => gridColumns.value * 2);

// Photo interface
interface Photo {
  id: string;
  url: string;
  title: string;
  rating: number;
  matchedTags?: string[];
  width?: number;
  height?: number;
}

// Example interfaces for carousel
interface NaturalExample {
  text: string;
  query: string;
}

interface TagExample {
  text: string;
  included: string[];
  excluded: string[];
}

interface SpatialExample {
  text: string;
  left: string;
  center: string;
  right: string;
}

// Mock photo data
const mockPhotos: Photo[] = [
  {
    id: "1",
    url: "https://images.pexels.com/photos/32669076/pexels-photo-32669076.jpeg",
    title: "Iceland Mountains",
    rating: 5,
    matchedTags: ["landscape", "mountains", "nature"],
    width: 6000,
    height: 3376,
  },
  {
    id: "2",
    url: "https://images.pexels.com/photos/32657569/pexels-photo-32657569.jpeg",
    title: "Sisters in Dresses",
    rating: 4,
    matchedTags: ["portrait", "people", "family"],
    width: 7107,
    height: 9600,
  },
  {
    id: "3",
    url: "https://images.pexels.com/photos/32666826/pexels-photo-32666826.jpeg",
    title: "Carballino España",
    rating: 3,
    matchedTags: ["street", "urban", "architecture"],
    width: 3648,
    height: 2432,
  },
  {
    id: "4",
    url: "https://images.pexels.com/photos/3117550/pexels-photo-3117550.jpeg",
    title: "Vintage Flowers",
    rating: 4,
    matchedTags: ["flowers", "vintage", "art"],
    width: 2016,
    height: 2016,
  },
  {
    id: "5",
    url: "https://images.pexels.com/photos/32675858/pexels-photo-32675858.jpeg",
    title: "Beach Sunset",
    rating: 5,
    matchedTags: ["sunset", "beach", "ocean"],
    width: 3888,
    height: 2592,
  },
  {
    id: "6",
    url: "https://images.pexels.com/photos/32617822/pexels-photo-32617822.jpeg",
    title: "City River View",
    rating: 4,
    matchedTags: ["city", "river", "sunset"],
    width: 2639,
    height: 3959,
  },
  {
    id: "7",
    url: "https://images.pexels.com/photos/983587/pexels-photo-983587.jpeg",
    title: "Italian Pasta",
    rating: 3,
    matchedTags: ["food", "pasta", "wine"],
    width: 2000,
    height: 2000,
  },
  {
    id: "8",
    url: "https://images.pexels.com/photos/32642185/pexels-photo-32642185.jpeg",
    title: "Scorpion Detail",
    rating: 2,
    matchedTags: ["wildlife", "macro", "animal"],
    width: 3560,
    height: 2608,
  },
];

// ResizeObserver error handling
let resizeObserverErrorHandler: ((event: ErrorEvent) => void) | null = null;

onMounted(() => {
  // Suppress ResizeObserver errors
  resizeObserverErrorHandler = (e: ErrorEvent) => {
    if (
      e.message.includes(
        "ResizeObserver loop completed with undelivered notifications",
      )
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };
  window.addEventListener("error", resizeObserverErrorHandler);

  // Start carousel rotation
  startCarousel();
});

onUnmounted(() => {
  if (resizeObserverErrorHandler) {
    window.removeEventListener("error", resizeObserverErrorHandler);
  }

  // Clean up carousel
  stopCarousel();
});

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

// Carousel state
const currentExampleIndex = ref(0);
const isSliding = ref(false);
let carouselInterval: number | null = null;

// Example data for carousel
const naturalExamples: NaturalExample[] = [
  {
    text: '"sunset photos with people on the beach"',
    query: "sunset photos with people on the beach",
  },
  {
    text: '"close-up portraits with red background"',
    query: "close-up portraits with red background",
  },
  {
    text: '"landscape photos with mountains and snow"',
    query: "landscape photos with mountains and snow",
  },
  {
    text: '"street photography with urban architecture"',
    query: "street photography with urban architecture",
  },
  {
    text: '"vintage flowers with warm lighting"',
    query: "vintage flowers with warm lighting",
  },
];

const tagExamples: TagExample[] = [
  {
    text: "Include: landscape, mountains • Exclude: people",
    included: ["landscape", "mountains"],
    excluded: ["people"],
  },
  {
    text: "Include: portrait, indoor • Exclude: black-white",
    included: ["portrait", "indoor"],
    excluded: ["black-white"],
  },
  {
    text: "Include: sunset, beach, outdoor",
    included: ["sunset", "beach", "outdoor"],
    excluded: [],
  },
  {
    text: "Include: vintage, color • Exclude: modern",
    included: ["vintage", "color"],
    excluded: ["modern"],
  },
];

const spatialExamples: SpatialExample[] = [
  {
    text: "Left: tree • Center: person • Right: building",
    left: "tree",
    center: "person",
    right: "building",
  },
  {
    text: "Left: mountains • Center: lake • Right: forest",
    left: "mountains",
    center: "lake",
    right: "forest",
  },
  {
    text: "Center: face",
    left: "",
    center: "face",
    right: "",
  },
  {
    text: "Left: sky • Right: ocean",
    left: "sky",
    center: "",
    right: "ocean",
  },
];

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

const getCurrentExamples = () => {
  switch (activeSearchType.value) {
    case "natural":
      return naturalExamples;
    case "tags":
      return tagExamples;
    case "spatial":
      return spatialExamples;
    default:
      return [];
  }
};

const currentExampleText = computed(() => {
  const examples = getCurrentExamples();
  if (examples.length === 0) return "";
  return examples[currentExampleIndex.value]?.text || "";
});

const currentExample = computed(() => {
  const examples = getCurrentExamples();
  if (examples.length === 0) return null;
  return examples[currentExampleIndex.value] || null;
});

// Debouncing for search type changes
let searchTypeTimeout: number | null = null;

// Carousel methods
const startCarousel = () => {
  stopCarousel(); // Clear any existing interval
  carouselInterval = window.setInterval(() => {
    rotateCarousel();
  }, 3500); // 3.5 seconds interval
};

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
};

const rotateCarousel = () => {
  const examples = getCurrentExamples();
  if (examples.length === 0) return;

  // Trigger slide out animation
  isSliding.value = true;

  // After slide out, change content and slide in
  setTimeout(() => {
    currentExampleIndex.value =
      (currentExampleIndex.value + 1) % examples.length;
    isSliding.value = false;
  }, 300); // Half of transition time
};

const resetCarouselIndex = () => {
  currentExampleIndex.value = 0;
};

// Methods
const setSearchType = (type: "natural" | "tags" | "spatial") => {
  // Clear any pending type change
  if (searchTypeTimeout) {
    clearTimeout(searchTypeTimeout);
  }

  // Debounce the search type change to prevent ResizeObserver issues
  searchTypeTimeout = window.setTimeout(async () => {
    activeSearchType.value = type;
    resetCarouselIndex(); // Reset carousel when switching search types
    await nextTick(); // Wait for DOM updates
    console.log("Search type changed to:", type);
    searchTypeTimeout = null;
  }, 50);
};

const onSearchTypeChange = (type: string) => {
  console.log("Search type changed to:", type);
};

const onSearchChange = () => {
  console.log("Search parameters changed");
};

const performSearch = async () => {
  if (!hasSearchQuery.value) return;

  isSearching.value = true;
  selectedPhotos.value = [];
  console.log("Performing search:", {
    type: activeSearchType.value,
    mode: globalMode.value,
    query: getCurrentQuery(),
  });

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate search results based on current search type
  const results = [...mockPhotos].sort(() => Math.random() - 0.5);
  searchResults.value = results.slice(0, Math.min(8, results.length));
  hasMoreResults.value = results.length > 8;

  isSearching.value = false;
};

const clearSearch = () => {
  naturalQuery.value = "";
  includedTags.value = [];
  excludedTags.value = [];
  spatialLeft.value = "";
  spatialCenter.value = "";
  spatialRight.value = "";
  searchResults.value = [];
  selectedPhotos.value = [];
  hasMoreResults.value = true;
};

// Photo grid functions
const setGridColumns = (columns: number) => {
  gridColumns.value = columns;
};

const togglePhotoSelection = (photoId: string) => {
  const index = selectedPhotos.value.indexOf(photoId);
  if (index > -1) {
    selectedPhotos.value.splice(index, 1);
  } else {
    selectedPhotos.value.push(photoId);
  }
};

const showPhotoInfo = (photo: Photo) => {
  console.log("Show photo info:", photo);
  // Here you would implement the photo info modal/panel
};

const loadMorePhotos = async () => {
  if (isLoadingMore.value || !hasMoreResults.value) return;

  isLoadingMore.value = true;

  // Simulate loading more photos
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Add more mock photos (shuffled)
  const morePhotos = [...mockPhotos]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .map((photo, index) => ({
      ...photo,
      id: `${photo.id}-${Date.now()}-${index}`, // Make unique IDs
    }));

  searchResults.value.push(...morePhotos);

  // Simulate end of results after 3 loads
  if (searchResults.value.length > 16) {
    hasMoreResults.value = false;
  }

  isLoadingMore.value = false;
};

const clearSelection = () => {
  selectedPhotos.value = [];
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

const handleExampleClick = () => {
  const example = currentExample.value;
  if (!example) return;

  clearSearch();

  if (activeSearchType.value === "natural") {
    const natExample = example as NaturalExample;
    naturalQuery.value = natExample.query;
  } else if (activeSearchType.value === "tags") {
    const tagExample = example as TagExample;
    includedTags.value = tagExample.included;
    excludedTags.value = tagExample.excluded;
  } else if (activeSearchType.value === "spatial") {
    const spatExample = example as SpatialExample;
    spatialLeft.value = spatExample.left;
    spatialCenter.value = spatExample.center;
    spatialRight.value = spatExample.right;
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
  /* max-width: 1200px; */
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

/* Combined Search Selector Section */
.search-selector-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #2c2c32;
  overflow: visible;
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: visible;
}

.selector-group:first-child {
  flex: 1 1 auto;
}

.selector-group:last-child {
  flex: 0 0 auto;
}

.selector-label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  white-space: nowrap;
}

/* Search Type Pills */
.type-pills {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  justify-content: flex-start;
  overflow: visible;
}

.type-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid #2c2c32;
  background-color: transparent;
  color: #ffffff73;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  justify-content: center;
  text-align: center;
  overflow: visible;
}

.type-pill:hover {
  border-color: #2563eb;
  color: #ffffffd1;
  transform: translateY(-1px);
}

.type-pill.active {
  background-color: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
}

.type-icon {
  flex-shrink: 0;
}

/* Search Mode Pills */
.mode-pills {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
  overflow: visible;
}

.mode-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #2c2c32;
  background-color: transparent;
  color: #ffffff73;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  justify-content: center;
  overflow: visible;
}

.mode-pill:hover {
  border-color: #2563eb;
  color: #ffffffd1;
}

.mode-pill.active {
  background-color: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

.mode-icon {
  flex-shrink: 0;
}

.search-content {
  padding-top: 12px;
}

/* Natural Language Search */
.natural-search-section {
  max-width: 100%;
}

.search-input-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.natural-input {
  font-size: 16px;
  flex: 1;
}

/* Tags Search */
.tags-search-section {
  width: 100%;
}

.tags-input-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.tags-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  flex: 1;
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

.spatial-input-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.spatial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  flex: 1;
}

.spatial-area {
  width: 100%;
}

.spatial-input {
  text-align: center;
  width: 100%;
}

.center-input {
  border-color: #2563eb;
}

/* Inline Search Actions */
.search-actions-inline {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-self: flex-start;
  flex-shrink: 0;
}

.search-button {
  min-width: 140px;
  height: 40px;
}

.clear-button {
  min-width: 100px;
  height: 40px;
}

.clear-button.icon-only {
  min-width: 40px;
  width: 40px;
  padding: 0;
}

/* Search Results Container */
.search-results-container {
  min-height: 400px;
}

/* Note: Grid controls and photo grid styles moved to global.scss */

/* Note: Photo skeleton styles moved to global.scss */

/* Load More */
.load-more-container {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.load-more-button {
  min-width: 200px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

/* Selection Info */
.selection-info {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #2563eb;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
  z-index: 100;
  font-weight: 500;
}

.selection-info span {
  font-size: 14px;
}

/* Search Inspiration */
.search-inspiration {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.inspiration-content {
  max-width: 600px;
  position: relative;
  z-index: 2;
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

.examples-carousel {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 8px 0;
}

.carousel-container {
  width: 100%;
  max-width: 500px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-item {
  width: 100%;
  opacity: 1;
  transform: translateX(0);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.carousel-item.sliding {
  opacity: 0;
  transform: translateX(-80px);
}

.example-card {
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.example-card:hover {
  border-color: #2563eb;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
}

.example-text {
  font-size: 14px;
  color: #ffffffd1;
  line-height: 1.4;
  text-align: center;
}

/* Search Loading */
.search-loading {
  min-height: 400px;
}

.loading-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
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

/* Medium screens - adjust spacing */
@media (max-width: 1024px) {
  .search-selector-section {
    gap: 16px;
  }

  .type-pill,
  .mode-pill {
    font-size: 11px;
    padding: 7px 8px;
    gap: 3px;
  }
}

/* Tablet responsive - stack vertically */
@media (max-width: 768px) {
  .search-toolbar {
    padding: 16px;
    margin-bottom: 24px;
  }

  .search-selector-section {
    flex-direction: column;
    gap: 16px;
  }

  .selector-group:first-child,
  .selector-group:last-child {
    flex: 1;
    width: 100%;
  }

  .type-pill,
  .mode-pill {
    font-size: 12px;
    padding: 8px 10px;
  }

  /* Note: Grid responsive styles moved to global.scss */

  .selection-info {
    bottom: 16px;
    left: 16px;
    right: 16px;
    transform: none;
    border-radius: 16px;
  }
}

/* Small mobile - compress further if needed */
@media (max-width: 480px) {
  .search-toolbar {
    padding: 12px;
    margin-bottom: 16px;
  }

  .type-pills {
    gap: 2px;
  }

  .mode-pills {
    gap: 2px;
  }

  .type-pill,
  .mode-pill {
    font-size: 10px;
    padding: 6px 6px;
    gap: 2px;
  }

  .type-icon,
  .mode-icon {
    width: 10px;
    height: 10px;
  }

  .search-input-row,
  .tags-input-row,
  .spatial-input-row {
    flex-direction: column;
    gap: 16px;
  }

  .tags-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .spatial-input-row {
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .spatial-grid {
    display: grid;
    grid-template-columns: 1fr !important;
    gap: 20px;
    width: 100% !important;
  }

  .spatial-area {
    width: 100% !important;
  }

  .spatial-input {
    text-align: left;
    width: 100% !important;
  }

  .spatial-search-section {
    width: 100% !important;
  }

  .spatial-search-section .spatial-input {
    width: 100% !important;
  }

  .spatial-search-section .spatial-input-row {
    width: 100% !important;
  }

  .spatial-search-section .spatial-grid {
    width: 100% !important;
  }

  .spatial-search-section .spatial-area {
    width: 100% !important;
  }

  .spatial-search-section .n-input {
    width: 100% !important;
  }

  .spatial-search-section :deep(.n-input) {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .spatial-search-section :deep(.n-input-wrapper) {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .spatial-search-section :deep(.n-input__input-el) {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .search-actions-inline {
    flex-direction: row;
    width: 100%;
  }

  .search-button {
    flex: 1;
  }

  .clear-button.icon-only {
    min-width: 40px;
    width: 40px;
    flex: none;
  }

  .inspiration-title {
    font-size: 24px;
  }

  .inspiration-subtitle {
    font-size: 16px;
  }

  .examples-carousel {
    padding: 12px 0;
  }

  .carousel-container {
    height: 70px;
  }

  .carousel-item.sliding {
    transform: translateX(-60px);
  }

  .example-card {
    padding: 12px;
    min-height: 40px;
  }

  .example-text {
    font-size: 13px;
  }

  /* Note: Photo grid mobile styles moved to global.scss */

  .load-more-container {
    margin: 24px 0;
  }

  .load-more-button {
    width: 100%;
    min-width: auto;
  }

  .selection-info {
    bottom: 12px;
    left: 12px;
    right: 12px;
    transform: none;
    padding: 10px 16px;
    font-size: 13px;
  }
}

/* Tablet Responsive */
@media (min-width: 768px) and (max-width: 1024px) {
  .search-input-row,
  .tags-input-row,
  .spatial-input-row {
    gap: 12px;
  }

  .spatial-grid {
    gap: 16px;
  }

  .tags-row {
    gap: 16px;
  }
}
</style>
