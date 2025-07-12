import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";

export const useSearchStore = defineStore("search", () => {
  // Estado global del search
  const activeSearchType = ref("semantic");
  const searchMode = ref("logical");
  const isSearching = ref(false);
  const isLoadingMore = ref(false);

  // Estado específico para cada tipo de búsqueda
  const searchStates = reactive({
    semantic: {
      query: "",
      results: [],
      iterationsRecord: {},
      iteration: 1,
      hasMoreIterations: false,
      maxPageAttempts: false,
      hasSearched: false,
    },
    tags: {
      includedTags: [],
      excludedTags: [],
      results: [],
      iterationsRecord: {},
      iteration: 1,
      hasMoreIterations: false,
      maxPageAttempts: false,
      hasSearched: false,
    },
    topological: {
      left: "",
      center: "",
      right: "",
      results: [],
      iterationsRecord: {},
      iteration: 1,
      hasMoreIterations: false,
      maxPageAttempts: false,
      hasSearched: false,
    },
  });

  // Computed para el estado actual
  const currentSearchState = computed(
    () => searchStates[activeSearchType.value]
  );

  // Computed para verificar si hay query
  const hasSearchQuery = computed(() => {
    const state = currentSearchState.value;
    switch (activeSearchType.value) {
      case "semantic":
        return state.query.trim().length > 0;
      case "tags":
        return state.includedTags.length > 0 || state.excludedTags.length > 0;
      case "topological":
        return (
          state.left.trim().length > 0 ||
          state.center.trim().length > 0 ||
          state.right.trim().length > 0
        );
      default:
        return false;
    }
  });

  // Computed para verificar si el tipo actual ha buscado
  const hasSearched = computed(() => currentSearchState.value.hasSearched);

  // Computed para verificar si hay resultados
  const hasResults = computed(() => searchResults.value.length > 0);
  const searchResults = computed(() => {
    const state = currentSearchState.value;
    const keys = Object.keys(state.iterationsRecord)
      .map(Number)
      .sort((a, b) => a - b);

    let all = [];
    for (let i = 0; i < state.iteration; i++) {
      const k = keys[i];
      if (k !== undefined && state.iterationsRecord[k]?.photos) {
        all.push(...state.iterationsRecord[k].photos);
      }
    }

    // Mostrar esqueletos si está cargando inicial
    if (isSearching.value) {
      return Array.from({ length: 12 }).map((_, i) => ({
        id: `skeleton-${i}`,
        isSkeleton: true,
        src: null,
      }));
    }

    // Esqueletos sólo en la primera iteración de "cargar más"
    if (isLoadingMore.value && state.iteration === 1) {
      return Array.from({ length: 12 }).map((_, i) => ({
        id: `skeleton-${i}`,
        isSkeleton: true,
        src: null,
      }));
    }

    return all;
  });

  // Actions
  function setSearchType(type) {
    if (["semantic", "tags", "topological"].includes(type)) {
      activeSearchType.value = type;
    }
  }

  function setSearchMode(mode) {
    searchMode.value = mode;
  }

  function updateSemanticQuery(query) {
    searchStates.semantic.query = query;
  }

  function updateTagsSearch(included, excluded) {
    searchStates.tags.includedTags = included;
    searchStates.tags.excludedTags = excluded;
  }

  function updateTopologicalSearch(left, center, right) {
    searchStates.topological.left = left;
    searchStates.topological.center = center;
    searchStates.topological.right = right;
  }

  function clearCurrentSearch() {
    const state = currentSearchState.value;

    // Limpiar solo el tipo de búsqueda actual
    switch (activeSearchType.value) {
      case "semantic":
        state.query = "";
        break;
      case "tags":
        state.includedTags = [];
        state.excludedTags = [];
        break;
      case "topological":
        state.left = "";
        state.center = "";
        state.right = "";
        break;
    }

    // Limpiar resultados y estado de paginación
    state.results = [];
    state.iterationsRecord = {};
    state.iteration = 1;
    state.hasMoreIterations = false;
    state.maxPageAttempts = false;
    state.hasSearched = false;
  }

  function clearAllSearches() {
    Object.keys(searchStates).forEach((type) => {
      const state = searchStates[type];
      if (type === "semantic") {
        state.query = "";
      } else if (type === "tags") {
        state.includedTags = [];
        state.excludedTags = [];
      } else if (type === "topological") {
        state.left = "";
        state.center = "";
        state.right = "";
      }

      state.results = [];
      state.iterationsRecord = {};
      state.iteration = 1;
      state.hasMoreIterations = false;
      state.maxPageAttempts = false;
      state.hasSearched = false;
    });
  }

  function setSearching(value) {
    isSearching.value = value;
  }

  function setLoadingMore(value) {
    isLoadingMore.value = value;
  }

  function resetCurrentIteration() {
    const state = currentSearchState.value;
    state.iteration = 1;
    state.iterationsRecord = {};
    state.hasMoreIterations = false;
    state.maxPageAttempts = false;
  }

  function updateSearchResults(data) {
    const state = currentSearchState.value;

    // Actualizar iterationsRecord con los nuevos resultados
    Object.entries(data.results).forEach(([iter, items]) => {
      state.iterationsRecord[iter] = {
        photos: items.map((i) => i.photo),
      };
    });

    state.hasMoreIterations = data.hasMore;
    state.iteration = data.iteration + 1;
    state.hasSearched = true;
  }

  function setMaxPageAttempts() {
    currentSearchState.value.maxPageAttempts = true;
  }

  function incrementIteration() {
    currentSearchState.value.iteration++;
  }

  return {
    // State
    activeSearchType,
    searchMode,
    isSearching,
    isLoadingMore,
    searchStates,

    // Computed
    currentSearchState,
    hasSearchQuery,
    searchResults,
    hasSearched,
    hasResults,

    // Actions
    setSearchType,
    setSearchMode,
    updateSemanticQuery,
    updateTagsSearch,
    updateTopologicalSearch,
    clearCurrentSearch,
    clearAllSearches,
    setSearching,
    setLoadingMore,
    resetCurrentIteration,
    updateSearchResults,
    setMaxPageAttempts,
    incrementIteration,
  };
});
