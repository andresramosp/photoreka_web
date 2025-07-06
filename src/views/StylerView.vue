<template>
  <div ref="scrollContainer" class="styler-container view-container">
    <!-- Styler Toolbar -->
    <div class="styler-toolbar" :class="{ 'is-collapsed': isToolbarCollapsed }">
      <!-- Tab Navigation -->
      <div class="styler-tabs">
        <div class="tab-navigation">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'ranking' }"
            @click="setActiveTab('ranking')"
          >
            Ranking
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'explorer' }"
            @click="setActiveTab('explorer')"
          >
            Explorer
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content-container">
          <!-- Ranking Tab -->
          <RankingTab
            v-show="activeTab === 'ranking'"
            @search="performSearch"
            @clear="clearSearch"
          />

          <!-- Explorer Tab -->
          <ExplorerTab
            v-show="activeTab === 'explorer'"
            @search="performSearch"
            @clear="clearSearch"
          />
        </div>
      </div>
    </div>

    <!-- Search Results / Empty State -->
    <div class="search-results-container">
      <div v-if="!hasSearchQuery && !isSearching" class="search-inspiration">
        <div class="inspiration-content">
          <n-icon size="64" color="#6b7280" class="inspiration-icon">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14S14 11.99 14 9.5S11.99 5 9.5 5Z"
              />
            </svg>
          </n-icon>
          <h3 class="examples-title">Find your photos by style</h3>
        </div>
      </div>

      <div v-else-if="isSearching" class="search-loading">
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
            :key="`styler-skeleton-${n}`"
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
            :selected="photoStore.selectedPhotoIds.includes(photo.id)"
            @select="togglePhotoSelection"
            @info="showPhotoInfo"
          />

          <!-- Skeleton Loading for Load More -->
          <template v-if="isLoadingMore">
            <div
              v-for="n in pageSize"
              :key="`skeleton-${n}`"
              class="photo-skeleton"
            >
              <n-skeleton height="100%" />
            </div>
          </template>
        </div>

        <!-- Selection Info -->
        <div
          v-if="photoStore.selectedPhotoIds.length > 0 && selectInfoVisible"
          class="selection-info"
        >
          <n-button type="info" @click="moveToCanvas">
            Take to Canvas
          </n-button>
          <n-button type="info"> Create Collection </n-button>

          <span
            >{{ photoStore.selectedPhotoIds.length }} photo{{
              photoStore.selectedPhotoIds.length > 1 ? "s" : ""
            }}
          </span>
          <n-button type="secondary" @click="clearSelection">
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-button>
        </div>

        <!-- Load More Button -->
        <div class="load-more-container" v-if="hasMoreIterations">
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
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "StylerPage" });

import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from "vue";
import axios from "axios";
import { io } from "socket.io-client";

import PhotoCard from "@/components/photoCards/PhotoCard.vue";
import RankingTab from "@/components/styler/RankingTab.vue";
import ExplorerTab from "@/components/styler/ExplorerTab.vue";

import { usePhotosStore } from "@/stores/photos";
import { useCanvasStore } from "@/stores/canvas.js";
import { useRouter } from "vue-router";

const socket = import.meta.env.VITE_API_WS_URL
  ? io(import.meta.env.VITE_API_WS_URL)
  : null;

const photoStore = usePhotosStore();
const canvasStore = useCanvasStore();
const router = useRouter();

// State
const activeTab = ref("ranking");
const isToolbarCollapsed = ref(false);
const selectInfoVisible = ref(true);
const lastScrollY = ref(0);
const scrollContainer = ref(null);

// Search state
const isSearching = ref(false);
const isLoadingMore = ref(false);
const hasMoreIterations = ref(false);
const iteration = ref(1);
let iterationsRecord = reactive({});
const pageSize = ref(12);
const gridColumns = ref(6);

// Current search parameters
const currentSearchParams = ref({});

// Results
const searchResults = computed(() => {
  const keys = Object.keys(iterationsRecord)
    .map(Number)
    .sort((a, b) => a - b);
  let all = [];
  for (let i = 0; i < iteration.value; i++) {
    const k = keys[i];
    if (k !== undefined && iterationsRecord[k]?.photos) {
      all.push(...iterationsRecord[k].photos);
    }
  }
  return all;
});

const skeletonCount = computed(() => pageSize.value);

const hasSearchQuery = computed(() => {
  return Object.keys(currentSearchParams.value).length > 0;
});

// Functions
const setActiveTab = (tab) => {
  activeTab.value = tab;
  clearSearch();
};

const setGridColumns = (n) => {
  gridColumns.value = n;
};

const togglePhotoSelection = (id) => {
  photoStore.togglePhotoSelection(id);
};

const clearSelection = () => {
  photoStore.selectedPhotoIds = [];
};

const showPhotoInfo = (photo) => {
  // TODO: Implement photo info dialog
};

const moveToCanvas = async () => {
  await Promise.all(
    photoStore.selectedPhotoIds.map((id) => photoStore.fetchPhoto(id)),
  );
  const photosToAdd = photoStore.selectedPhotoIds
    .map((id) => photoStore.photos.find((p) => p.id == id))
    .filter(Boolean);

  photoStore.selectedPhotosRecord = {};
  canvasStore.addPhotos(photosToAdd);

  router.push("/canvas");
};

const clearSearch = () => {
  currentSearchParams.value = {};
  hasMoreIterations.value = false;
  iteration.value = 1;
  iterationsRecord = {};
  isToolbarCollapsed.value = false;
  lastScrollY.value = 0;
};

const performSearch = async (searchParams) => {
  clearSelection();
  currentSearchParams.value = searchParams;
  iteration.value = 1;
  Object.keys(iterationsRecord).forEach((k) => delete iterationsRecord[k]);
  isSearching.value = true;
  hasMoreIterations.value = false;

  await searchPhotos();
  isSearching.value = false;
};

const loadMorePhotos = async () => {
  isLoadingMore.value = true;
  await searchPhotos();
  isLoadingMore.value = false;
};

const searchPhotos = async () => {
  try {
    const options = {
      iteration: iteration.value,
      pageSize: pageSize.value,
      searchMode: "logical",
    };

    const payload = {
      ...currentSearchParams.value,
      options,
    };

    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/search/style`,
      payload,
    );
  } catch (err) {
    console.error("Error al buscar fotos por estilo:", err);
  }
};

// Scroll handling
const handleScroll = () => {
  if (!scrollContainer.value) return;

  const currentScrollY = scrollContainer.value.scrollTop;

  if (searchResults.value.length > 0 && !isSearching.value) {
    if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
      isToolbarCollapsed.value = true;
    } else if (currentScrollY < lastScrollY.value && currentScrollY < 500) {
      isToolbarCollapsed.value = false;
    }
  } else {
    isToolbarCollapsed.value = false;
  }

  lastScrollY.value = currentScrollY;
};

const scrollToLast = () => {
  nextTick(() => {
    const el = scrollContainer.value;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  });
};

onMounted(() => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener("scroll", handleScroll, {
        passive: true,
      });
    }
  });

  if (socket) {
    socket.on("styleMatches", (data) => {
      Object.entries(data.results).forEach(([iter, items]) => {
        iterationsRecord[iter] = {
          photos: items.map((i) => i.photo),
        };
      });
      hasMoreIterations.value = data.hasMore;
      iteration.value = data.iteration + 1;
      setTimeout(() => {
        scrollToLast();
      }, 0);
    });
  }
});

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener("scroll", handleScroll);
  }
  if (socket) {
    socket.off("styleMatches");
  }
});
</script>

<style scoped>
.styler-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Styler Toolbar */
.styler-toolbar {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.styler-toolbar.is-collapsed {
  transform: translateY(-120%);
}

/* Styler Tabs */
.styler-tabs {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  background-color: transparent;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.tab-button {
  flex: 1;
  max-width: 200px;
  padding: 12px 24px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
}

.tab-button:hover {
  border-color: var(--primary-color);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.tab-button.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
}

/* Tab Content Container */
.tab-content-container {
  min-height: 120px;
}

/* Search Results Container */
.search-results-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  min-height: 0;
}

/* Search Inspiration */
.search-inspiration {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 1;
  padding: var(--spacing-2xl) 0;
}

.inspiration-content {
  max-width: 600px;
  position: relative;
  z-index: 2;
}

.inspiration-icon {
  margin-bottom: var(--spacing-lg);
}

.examples-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0;
  text-align: center;
}

/* Search Loading */
.search-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
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

/* Search Results */
.search-results {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Grid Controls */
.grid-controls.grid-controls-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 0;
}

.results-info.results-info-base {
  flex: 1;
}

.results-count.results-count-base {
  font-size: 16px;
  font-weight: 500;
  color: #ffffffd1;
}

.grid-size-controls.grid-size-controls-base {
  display: flex;
  align-items: center;
  gap: 12px;
}

.grid-label.grid-label-base {
  font-size: 14px;
  color: #ffffff73;
  font-weight: 500;
}

/* Photo Grid */
.photo-grid.photo-grid-base {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.photo-grid.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.photo-grid.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.photo-grid.grid-cols-5 {
  grid-template-columns: repeat(5, 1fr);
}

.photo-grid.grid-cols-6 {
  grid-template-columns: repeat(6, 1fr);
}

.photo-skeleton {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

/* Selection Info */
.selection-info {
  position: fixed;
  bottom: 30px;
  right: 41px;
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

/* Load More */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.load-more-button {
  min-width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .styler-toolbar {
    padding: 16px;
  }

  .tab-navigation {
    gap: 4px;
  }

  .tab-button {
    font-size: 12px;
    padding: 10px 16px;
  }

  .photo-grid.grid-cols-3,
  .photo-grid.grid-cols-4,
  .photo-grid.grid-cols-5,
  .photo-grid.grid-cols-6 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-controls.grid-controls-base {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .selection-info {
    bottom: 16px;
    left: 16px;
    right: 16px;
    transform: none;
    border-radius: 16px;
  }
}

@media (max-width: 480px) {
  .styler-toolbar {
    padding: 12px;
  }

  .tab-navigation {
    flex-direction: column;
    gap: 8px;
  }

  .tab-button {
    max-width: none;
    font-size: 11px;
    padding: 8px 12px;
  }

  .photo-grid.grid-cols-3,
  .photo-grid.grid-cols-4,
  .photo-grid.grid-cols-5,
  .photo-grid.grid-cols-6 {
    grid-template-columns: 1fr;
  }
}
</style>
