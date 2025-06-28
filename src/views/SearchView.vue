<template>
  <div ref="scrollContainer" class="search-container view-container">
    <!-- Search Toolbar -->
    <div class="search-toolbar" :class="{ 'is-collapsed': isToolbarCollapsed }">
      <!-- Search Type and Mode Selector -->
      <div
        class="search-selector-section"
        :class="{ 'hidden-collapsed': isToolbarCollapsed }"
      >
        <!-- Search Type -->
        <div class="selector-group">
          <div class="selector-label">Search Type:</div>
          <div class="type-pills">
            <div
              class="type-pill"
              :class="{ active: activeSearchType === 'semantic' }"
              @click="setSearchType('semantic')"
            >
              <n-icon size="14" class="type-icon">
                <DocumentOutline />
              </n-icon>
              Natural Language
            </div>
            <div
              class="type-pill"
              :class="{ active: activeSearchType === 'tags' }"
              @click="setSearchType('tags')"
            >
              <n-icon size="16" class="type-icon">
                <TagOutlined />
              </n-icon>
              Tags
            </div>
            <div
              class="type-pill"
              :class="{ active: activeSearchType === 'topological' }"
              @click="setSearchType('topological')"
            >
              <n-icon size="16" class="type-icon">
                <MapOutline />
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
              :class="{ active: searchMode === 'logical' }"
              @click="searchMode = 'logical'"
            >
              <n-icon size="14" class="mode-icon">
                <CheckOutlined />
              </n-icon>
              Strict
            </div>
            <div
              class="mode-pill"
              :class="{ active: searchMode === 'flexible' }"
              @click="searchMode = 'flexible'"
            >
              <n-icon size="16" class="mode-icon">
                <PencilOutline />
              </n-icon>
              Flexible
            </div>
          </div>
        </div>
      </div>

      <!-- Conditional Search Content -->
      <div class="search-content">
        <!-- Semantic Language Search -->
        <div
          v-if="activeSearchType === 'semantic'"
          key="semantic-search"
          class="semantic-search-section"
        >
          <div class="search-input-row">
            <n-input
              v-model:value="semanticQuery"
              type="textarea"
              placeholder="Describe what you're looking for... e.g., 'sunset photos with people on the beach' or 'close-up portraits with red background'"
              :autosize="{ minRows: 1, maxRows: 2 }"
              class="semantic-input"
              @input="onSearchChange"
              :key="`semantic-${activeSearchType}`"
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
                  ref="tagIncSelect"
                  v-model:value="includedTags"
                  multiple
                  filterable
                  clearable
                  tag
                  placeholder="Add tags to include..."
                  :options="includedTagSuggestionsFormatted"
                  :clear-filter-after-select="true"
                  :max-tag-count="5"
                  class="tags-select include-tags"
                  @search="onSearchInputIncluded"
                  @update:value="handleTagSelected"
                >
                  <template #empty>
                    <div style="padding: 8px; color: #888">
                      Start typing to search tags...
                    </div>
                  </template></n-select
                >
              </div>
              <div class="tags-group">
                <n-select
                  ref="tagExcSelect"
                  v-model:value="excludedTags"
                  multiple
                  filterable
                  clearable
                  tag
                  placeholder="Add tags to exclude..."
                  :options="excludedTagSuggestionsFormatted"
                  :max-tag-count="5"
                  class="tags-select exclude-tags"
                  @search="onSearchInputExcluded"
                  @update:value="handleTagSelected"
                >
                  <template #empty>
                    <div style="padding: 8px; color: #888">
                      Start typing to search tags...
                    </div>
                  </template></n-select
                >
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

        <!-- Topological Search -->
        <div
          v-else-if="activeSearchType === 'topological'"
          key="topological-search"
          class="topological-search-section"
        >
          <div class="topological-input-row">
            <div class="topological-grid">
              <div class="topological-area">
                <n-input
                  v-model:value="topological.left"
                  type="textarea"
                  placeholder="Left side objects..."
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  class="topological-input"
                  @input="onSearchChange"
                  :key="`topological-left-${activeSearchType}`"
                />
              </div>
              <div class="topological-area">
                <n-input
                  v-model:value="topological.center"
                  type="textarea"
                  placeholder="Center objects..."
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  class="topological-input center-input"
                  @input="onSearchChange"
                  :key="`topological-center-${activeSearchType}`"
                />
              </div>
              <div class="topological-area">
                <n-input
                  v-model:value="topological.right"
                  type="textarea"
                  placeholder="Right side objects..."
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  class="topological-input"
                  @input="onSearchChange"
                  :key="`topological-right-${activeSearchType}`"
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
          <n-icon size="64" color="#6b7280" class="inspiration-icon">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14S14 11.99 14 9.5S11.99 5 9.5 5Z"
              />
            </svg>
          </n-icon>

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
            <div
              v-for="n in pageSize"
              :key="`skeleton-${n}`"
              class="photo-skeleton"
            >
              <n-skeleton height="100%" />
            </div>
          </template>
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

<script setup>
// Nombre del componente
defineOptions({ name: "SearchPage" });

// Imports básicos
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from "vue";
import axios from "axios";
import { io } from "socket.io-client";

// Componentes e íconos
import PhotoCard from "@/components/PhotoCard.vue";

// Composable de tags y ejemplos
import { useSearchTags } from "@/composables/useSearchTags";
import queryExamples from "@/assets/query_examples.json";
import { DocumentOutline, MapOutline, PencilOutline } from "@vicons/ionicons5";
import { CheckOutlined, TagOutlined } from "@vicons/antd";

// Conexión real-time para resultados incrementales
const socket = io(import.meta.env.VITE_API_WS_URL);

// Estado del toolbar colapsable
const isToolbarCollapsed = ref(false);
const lastScrollY = ref(0);
const scrollThreshold = 50;

// Estado de búsqueda
const activeSearchType = ref("semantic"); // 'semantic' | 'tags' | 'topological'
const searchMode = ref("logical"); // 'logical' | 'flexible'

// Semantic language
const semanticQuery = ref("");

// Tags
const {
  includedTags,
  excludedTags,
  includedTagSuggestions,
  excludedTagSuggestions,
  onSearchInputIncluded,
  onSearchInputExcluded,
} = useSearchTags();

// Topological (izquierda, centro, derecha)
const topological = reactive({ left: "", center: "", right: "" });

// Control de carga y paginación
const isSearching = ref(false);
const isLoadingMore = ref(false);
const maxPageAttempts = ref(false);
const hasMoreIterations = ref(false);
const iteration = ref(1);
let iterationsRecord = reactive({});
const pageSize = ref(12);

const warmedUp = ref(false);

const warmingMessages = [
  "Warming up the engines...",
  "Preparing the stage...",
  "Just a few seconds more...",
  "Aligning the neurons...",
  "Summoning the muses...",
];
const warmingMessage = ref(warmingMessages[0]);
let warmingInterval = null;

const scrollContainer = ref(null);

const includedTagSuggestionsFormatted = computed(() =>
  includedTagSuggestions.value.map((tagName) => ({
    label: tagName,
    value: tagName,
  })),
);

const excludedTagSuggestionsFormatted = computed(() =>
  excludedTagSuggestions.value.map((tagName) => ({
    label: tagName,
    value: tagName,
  })),
);

const tagIncSelect = ref(null);
const tagExcSelect = ref(null);

function handleTagSelected() {
  tagIncSelect.value.blur();
  tagExcSelect.value.blur();
}

// Resultados consolidados
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
  // Mostrar esqueletos si está cargando inicial
  if (isSearching.value) {
    return Array.from({ length: pageSize.value }).map((_, i) => ({
      id: `skeleton-${i}`,
      isSkeleton: true,
      src: null,
    }));
  }
  // Esqueletos sólo en la primera iteración de "cargar más"
  if (isLoadingMore.value && iteration.value === 1) {
    return Array.from({ length: pageSize.value }).map((_, i) => ({
      id: `skeleton-${i}`,
      isSkeleton: true,
      src: null,
    }));
  }
  return all;
});

// Helpers
const skeletonCount = computed(() => pageSize.value);

// Función para manejar el scroll del toolbar
function handleScroll() {
  if (!scrollContainer.value) return;

  const currentScrollY = scrollContainer.value.scrollTop;
  const scrollDirection = currentScrollY > lastScrollY.value ? "down" : "up";
  const scrollDistance = Math.abs(currentScrollY - lastScrollY.value);

  // Solo aplicar lógica si hay resultados visibles
  if (searchResults.value.length > 0 && !isSearching.value) {
    if (
      scrollDirection === "down" &&
      scrollDistance > scrollThreshold &&
      currentScrollY > 100
    ) {
      isToolbarCollapsed.value = true;
    } else if (scrollDirection === "up" && scrollDistance > scrollThreshold) {
      isToolbarCollapsed.value = false;
    }
  } else {
    // Resetear estado cuando no hay resultados
    isToolbarCollapsed.value = false;
  }

  lastScrollY.value = currentScrollY;
}

// Habilitar/deshabilitar botón de búsqueda
const hasSearchQuery = computed(() => {
  if (activeSearchType.value === "semantic")
    return semanticQuery.value.trim().length > 0;
  if (activeSearchType.value === "tags")
    return includedTags.value.length > 0 || excludedTags.value.length > 0;
  if (activeSearchType.value === "topological")
    return (
      topological.left.trim().length > 0 ||
      topological.center.trim().length > 0 ||
      topological.right.trim().length > 0
    );
  return false;
});

// Columnas del grid y paginación
const gridColumns = ref(6);

function setGridColumns(n) {
  gridColumns.value = n;
}

// Selección de fotos
const selectedPhotos = ref([]);
function togglePhotoSelection(id) {
  const idx = selectedPhotos.value.indexOf(id);
  if (idx >= 0) selectedPhotos.value.splice(idx, 1);
  else selectedPhotos.value.push(id);
}
function clearSelection() {
  selectedPhotos.value = [];
}

// Cambio de tipo de búsqueda
function setSearchType(type) {
  activeSearchType.value = type;
  clearSearch();
}
watch(activeSearchType, clearSearch);

// Limpia inputs de búsqueda
function clearSearch() {
  semanticQuery.value = "";
  includedTags.value = [];
  excludedTags.value = [];
  topological.left = "";
  topological.center = "";
  topological.right = "";
  hasMoreIterations.value = false;
  iteration.value = 1;
  iterationsRecord = {};
  hasMoreIterations.value = false;

  // Resetear estado del toolbar
  isToolbarCollapsed.value = false;
  lastScrollY.value = 0;
}

// Ejecución de búsqueda
async function performSearch() {
  clearSelection();
  iteration.value = 1;
  Object.keys(iterationsRecord).forEach((k) => delete iterationsRecord[k]);
  maxPageAttempts.value = false;
  isSearching.value = true;
  hasMoreIterations.value = false;

  await searchPhotos();
  isSearching.value = false;
}

// Cargar más resultados
async function loadMorePhotos() {
  isLoadingMore.value = true;
  await searchPhotos();
  isLoadingMore.value = false;
}

// Llamada a la API
async function searchPhotos() {
  try {
    const options = {
      iteration: iteration.value,
      pageSize: pageSize.value,
      searchMode: "low_precision", //searchMode.value,
    };
    let payload;
    if (activeSearchType.value === "semantic") {
      payload = { description: semanticQuery.value, options };
    } else if (activeSearchType.value === "tags") {
      payload = {
        included: includedTags.value,
        excluded: excludedTags.value,
        options,
      };
    } else {
      payload = {
        left: topological.left,
        center: topological.center,
        right: topological.right,
        options,
      };
    }
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/search/${
        activeSearchType.value
      }`,
      payload,
    );
  } catch (err) {
    console.error("Error al buscar fotos:", err);
  }
}

async function ensureWarmUp() {
  let i = 0;
  warmingInterval = setInterval(() => {
    i = (i + 1) % warmingMessages.length;
    warmingMessage.value = warmingMessages[i];
  }, 5000);

  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/search/warmUp`,
  );
  warmedUp.value = data.result;

  if (data.result && warmingInterval) {
    clearInterval(warmingInterval);
    warmingInterval = null;
  }
}

function scrollToLast() {
  nextTick(() => {
    const el = scrollContainer.value;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  });
}

// Manejo de respuestas en tiempo real
onMounted(() => {
  ensureWarmUp();

  // Añadir scroll listener
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener("scroll", handleScroll, {
      passive: true,
    });
  }

  socket.on("matches", (data) => {
    Object.entries(data.results).forEach(([iter, items]) => {
      iterationsRecord[iter] = {
        photos: items.map((i) => i.photo),
      };
    });
    debugger;
    hasMoreIterations.value = data.hasMore;
    iteration.value = data.iteration + 1;
    setTimeout(() => {
      scrollToLast();
    }, 0);
    () => {};
  });
  socket.on("maxPageAttempts", () => {
    maxPageAttempts.value = true;
  });
});

onUnmounted(() => {
  // Remover scroll listener
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener("scroll", handleScroll);
  }

  socket.off("matches");
  socket.off("maxPageAttempts");
});

// Carousel de ejemplos
const examples = queryExamples.logical || [];
const exampleIndex = ref(0);
const currentExampleText = computed(() => examples[exampleIndex.value] || "");
const isSliding = ref(false);
let exampleInterval;
function handleExampleClick() {
  semanticQuery.value = currentExampleText.value;
  performSearch();
}
onMounted(() => {
  exampleInterval = setInterval(() => {
    isSliding.value = true;
    setTimeout(() => (isSliding.value = false), 300);
    exampleIndex.value = (exampleIndex.value + 1) % examples.length;
  }, 5000);
});
onUnmounted(() => {
  clearInterval(exampleInterval);
});
</script>

<style scoped>
.search-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

/* Search Toolbar */
.search-toolbar {
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 16px;
  padding: 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: translateY(0);
  opacity: 1;
}

.search-toolbar.is-collapsed {
  padding: 12px 24px;
  transform: translateY(-8px);
}

/* Combined Search Selector Section */
.search-selector-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #2c2c32;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 1;
  max-height: 200px;
  transform: translateY(0);
}

.search-selector-section.hidden-collapsed {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
  padding-bottom: 0;
  transform: translateY(-10px);
  border-bottom-color: transparent;
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
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.search-toolbar.is-collapsed .search-content {
  padding-top: 0;
}

/* Semantic Language Search */
.semantic-search-section {
  max-width: 100%;
}

.search-input-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.semantic-input {
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

/* Topological Search */
.topological-search-section {
  width: 100%;
}

.topological-input-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.topological-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  flex: 1;
}

.topological-area {
  width: 100%;
}

.topological-input {
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
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  min-height: 0;
}

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
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 1;
  padding: var(--spacing-2xl) 0; /* Add padding instead of min-height */
}

.inspiration-content {
  max-width: 600px;
  position: relative;
  z-index: 2;
}

.inspiration-icon {
  margin-bottom: var(--spacing-lg); /* 16px instead of 24px */
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
  margin: 0 0 0 0;
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
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0;
}

.example-card:hover .example-text {
  color: #2563eb;
  transform: scale(1.02);
}

.example-text {
  font-size: 16px;
  color: #ffffff73;
  line-height: 1.4;
  text-align: center;
  font-style: italic;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

.results-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 12px;
  padding: 40px;
  min-height: 200px;
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
  }

  .search-toolbar.is-collapsed {
    padding: 12px 16px;
    margin-bottom: 12px;
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

  .search-toolbar.is-collapsed {
    padding: 8px 12px;
    margin-bottom: 8px;
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
  .topological-input-row {
    flex-direction: column;
    gap: 16px;
  }

  .tags-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .topological-input-row {
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .topological-grid {
    display: grid;
    grid-template-columns: 1fr !important;
    gap: 20px;
    width: 100% !important;
  }

  .topological-area {
    width: 100% !important;
  }

  .topological-input {
    text-align: left;
    width: 100% !important;
  }

  .topological-search-section {
    width: 100% !important;
  }

  .topological-search-section .topological-input {
    width: 100% !important;
  }

  .topological-search-section .topological-input-row {
    width: 100% !important;
  }

  .topological-search-section .topological-grid {
    width: 100% !important;
  }

  .topological-search-section .topological-area {
    width: 100% !important;
  }

  .topological-search-section .n-input {
    width: 100% !important;
  }

  .topological-search-section :deep(.n-input) {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .topological-search-section :deep(.n-input-wrapper) {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .topological-search-section :deep(.n-input__input-el) {
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
    min-height: 40px;
    padding: 0;
  }

  .example-text {
    font-size: 14px;
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
  .topological-input-row {
    gap: 12px;
  }

  .topological-grid {
    gap: 16px;
  }

  .tags-row {
    gap: 16px;
  }
}
</style>
