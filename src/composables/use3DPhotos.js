// composables/use3DPhotos.js
import { ref, computed } from "vue";
import { api } from "@/utils/axios";

export function use3DPhotos() {
  // Estado reactivo
  const photos3D = ref([]);
  const isLoading = ref(false);
  const currentChunk = ref("general"); // Chunk seleccionado
  const pagination = ref(null);
  const error = ref(null);
  const loadedPages = ref(0);
  const totalLoadedPhotos = ref(0);

  // Opciones de chunks disponibles
  const chunkOptions = [
    { value: "story", label: "Historia (Story)" },
    { value: "context", label: "Contexto (Context)" },
    { value: "visual_accents", label: "Acentos Visuales (Visual Accents)" },
    { value: "general", label: "General" },
  ];

  // Estado de carga
  const loadingProgress = computed(() => {
    if (!pagination.value || pagination.value.totalPages === 0) return 0;
    return Math.round((loadedPages.value / pagination.value.totalPages) * 100);
  });

  const isLoadingComplete = computed(() => {
    return pagination.value && loadedPages.value >= pagination.value.totalPages;
  });

  // Parámetros de paginación (ajustados para reducir bursts de thumbnails)
  const PAGE_SIZE = 5000; // antes 5000
  const MIN_DELAY_MS = 200; // pausa mínima entre páginas
  const MAX_DELAY_MS = 400; // pausa máxima entre páginas

  // Función para cargar una página específica
  const loadPhotosPage = async (chunkName, page = 1, limit = PAGE_SIZE) => {
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
    console.log("🚀 loadAllPhotos iniciado para chunk:", chunkName);

    // Actualizar currentChunk al principio
    currentChunk.value = chunkName;

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
          `📡 Cargando página ${currentPage} de chunk "${chunkName}"...`
        );

        const result = await loadPhotosPage(chunkName, currentPage, PAGE_SIZE);

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

        console.log(`📸 Añadiendo ${newPhotos.length} fotos a photos3D`);
        photos3D.value = [...photos3D.value, ...newPhotos];
        loadedPages.value = currentPage;
        totalLoadedPhotos.value += newPhotos.length;

        // Verificar si hay más páginas
        hasMorePages = currentPage < result.pagination.totalPages;
        currentPage++;

        // Pausa aleatoria para desincronizar y evitar picos (solo si hay más páginas)
        if (hasMorePages) {
          const delay = Math.round(
            MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
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
    console.log("🔄 changeChunk called:", {
      newChunk,
      currentChunk: currentChunk.value,
      willSkip: newChunk === currentChunk.value,
    });

    // Solo saltar si realmente es el mismo valor Y ya tenemos fotos cargadas
    if (newChunk === currentChunk.value && photos3D.value.length > 0) {
      console.log(
        "⏸️ Saltando cambio de chunk - mismo valor y datos ya cargados"
      );
      return;
    }

    console.log("🚀 Ejecutando loadAllPhotos para chunk:", newChunk);
    // No actualizar currentChunk.value aquí - déjalo que lo maneje loadAllPhotos
    await loadAllPhotos(newChunk);
    console.log("✅ loadAllPhotos completado para chunk:", newChunk);
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
