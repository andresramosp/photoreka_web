// composables/use3DPhotos.js
import { ref, computed } from "vue";
import { api } from "@/utils/axios";

export function use3DPhotos() {
  // Estado reactivo
  const photos3D = ref([]);
  const isLoading = ref(false);
  const currentChunk = ref("story"); // Chunk seleccionado
  const pagination = ref(null);
  const error = ref(null);
  const loadedPages = ref(0);
  const totalLoadedPhotos = ref(0);

  // Opciones de chunks disponibles
  const chunkOptions = [
    { value: "story", label: "Historia (Story)" },
    { value: "context", label: "Contexto (Context)" },
    { value: "visual_accents", label: "Acentos Visuales (Visual Accents)" },
    { value: null, label: "General" },
  ];

  // Estado de carga
  const loadingProgress = computed(() => {
    if (!pagination.value || pagination.value.totalPages === 0) return 0;
    return Math.round((loadedPages.value / pagination.value.totalPages) * 100);
  });

  const isLoadingComplete = computed(() => {
    return pagination.value && loadedPages.value >= pagination.value.totalPages;
  });

  // Función para cargar una página específica
  const loadPhotosPage = async (chunkName, page = 1, limit = 50) => {
    try {
      const response = await api.post("/api/3d/photos", {
        chunkName,
        page,
        limit,
      });

      return {
        photos: response.data.photos || [],
        pagination: response.data.pagination,
      };
    } catch (err) {
      console.error(`Error loading 3D photos page ${page}:`, err);
      throw new Error(`Error cargando página ${page}: ${err.message}`);
    }
  };

  // Función para cargar todas las fotos progresivamente
  const loadAllPhotos = async (chunkName) => {
    isLoading.value = true;
    error.value = null;
    photos3D.value = [];
    loadedPages.value = 0;
    totalLoadedPhotos.value = 0;
    pagination.value = null;

    try {
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        console.log(
          `Cargando página ${currentPage} de chunk "${chunkName}"...`
        );

        const result = await loadPhotosPage(chunkName, currentPage, 250);

        // Actualizar paginación con info de la primera respuesta
        if (!pagination.value) {
          pagination.value = result.pagination;
        }

        // Agregar fotos nuevas manteniendo el array inmutable
        const newPhotos = result.photos.map((photo) => ({
          ...photo,
          // Asegurar que las coordenadas están disponibles
          position: photo.coordinates || [0, 0, 0],
        }));

        photos3D.value = [...photos3D.value, ...newPhotos];
        loadedPages.value = currentPage;
        totalLoadedPhotos.value += newPhotos.length;

        // Verificar si hay más páginas
        hasMorePages = currentPage < result.pagination.totalPages;
        currentPage++;

        // Pequeña pausa entre requests para no sobrecargar
        if (hasMorePages) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(
        `Carga completa: ${totalLoadedPhotos.value} fotos de ${pagination.value.total}`
      );
    } catch (err) {
      error.value = err.message;
      console.error("Error en loadAllPhotos:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Función para cambiar de chunk
  const changeChunk = async (newChunk) => {
    if (newChunk === currentChunk.value) return;

    currentChunk.value = newChunk;
    await loadAllPhotos(newChunk);
  };

  // Función para reiniciar
  const reset = () => {
    photos3D.value = [];
    pagination.value = null;
    error.value = null;
    loadedPages.value = 0;
    totalLoadedPhotos.value = 0;
  };

  return {
    // Estado
    photos3D,
    isLoading,
    currentChunk,
    pagination,
    error,
    loadedPages,
    totalLoadedPhotos,

    // Computadas
    chunkOptions,
    loadingProgress,
    isLoadingComplete,

    // Métodos
    loadAllPhotos,
    changeChunk,
    reset,
  };
}
