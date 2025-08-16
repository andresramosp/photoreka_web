import { ref, computed, watch } from "vue";
import { useCanvasStore } from "@/stores/canvas";

// Clave para localStorage
const CANVAS_STORAGE_KEY = "photoreka_canvas_data";
const CANVAS_LIST_KEY = "photoreka_canvas_list";

export function useCanvasPersistence() {
  const canvasStore = useCanvasStore();

  // Estado para controlar si hay cambios sin guardar
  const hasUnsavedChanges = ref(false);
  const lastSavedState = ref(null);

  // Flag para evitar detección de cambios durante la carga
  const isLoading = ref(false);

  // Computed para el estado de guardado
  const isSaved = computed(() => !hasUnsavedChanges.value);

  /**
   * Serializa el estado actual del canvas para guardado
   */
  const serializeCanvas = () => {
    return {
      id: "current", // Por ahora solo un canvas, pero preparado para múltiples
      name: "Current Canvas",
      timestamp: new Date().toISOString(),
      data: {
        photos: canvasStore.photos.map((photo) => ({
          // Guardar datos esenciales de la foto
          id: photo.id,
          src: photo.src,
          thumbnailUrl: photo.thumbnailUrl,
          config: { ...photo.config },
          tags: photo.tags,
          status: photo.status,
          detectionAreas: photo.detectionAreas,
          // No guardamos estados temporales como selected, hovered, loading, etc.
        })),
        discardedPhotos: canvasStore.discardedPhotos.map((photo) => ({
          id: photo.id,
          src: photo.src,
          thumbnailUrl: photo.thumbnailUrl,
          config: { ...photo.config },
          tags: photo.tags,
          status: photo.status,
          detectionAreas: photo.detectionAreas,
        })),
        currentZIndex: canvasStore.currentZIndex,
        basicMode: canvasStore.basicMode,
      },
    };
  };

  /**
   * Deserializa y restaura el estado del canvas
   */
  const deserializeCanvas = async (canvasData) => {
    if (!canvasData || !canvasData.data) return false;

    isLoading.value = true;

    try {
      const { data } = canvasData;

      // Restaurar fotos principales
      if (data.photos && Array.isArray(data.photos)) {
        const photosToRestore = data.photos.map((photo) => ({
          ...photo,
          // Restaurar estados temporales en su valor por defecto
          selected: false,
          hovered: false,
          showButton: false,
          loading: false,
          image: null,
          isNew: false,
          inTrash: false,
        }));

        // Usar el método del store pero sin auto-fit y sin efectos
        canvasStore.photos = photosToRestore;
      }

      // Restaurar fotos descartadas
      if (data.discardedPhotos && Array.isArray(data.discardedPhotos)) {
        canvasStore.discardedPhotos = data.discardedPhotos.map((photo) => ({
          ...photo,
          selected: false,
          hovered: false,
          showButton: false,
          loading: false,
          image: null,
          isNew: false,
          inTrash: false,
        }));
      }

      // Restaurar otros estados
      if (typeof data.currentZIndex === "number") {
        canvasStore.currentZIndex = data.currentZIndex;
      }

      // Actualizar basicMode basado en las fotos restauradas
      canvasStore.updateBasicMode();

      // Actualizar el último estado guardado
      lastSavedState.value = JSON.stringify(serializeCanvas());
      hasUnsavedChanges.value = false;

      return true;
    } catch (error) {
      console.error("Error deserializing canvas:", error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Guarda el canvas actual en localStorage
   */
  const saveCanvas = () => {
    try {
      const canvasData = serializeCanvas();

      // Guardar canvas actual
      localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(canvasData));

      // Actualizar lista de canvas (preparado para múltiples canvas en el futuro)
      const canvasList = getCanvasList();
      const existingIndex = canvasList.findIndex((c) => c.id === canvasData.id);

      if (existingIndex >= 0) {
        canvasList[existingIndex] = {
          id: canvasData.id,
          name: canvasData.name,
          timestamp: canvasData.timestamp,
        };
      } else {
        canvasList.push({
          id: canvasData.id,
          name: canvasData.name,
          timestamp: canvasData.timestamp,
        });
      }

      localStorage.setItem(CANVAS_LIST_KEY, JSON.stringify(canvasList));

      // Actualizar estado
      lastSavedState.value = JSON.stringify(canvasData);
      hasUnsavedChanges.value = false;

      return true;
    } catch (error) {
      console.error("Error saving canvas:", error);
      return false;
    }
  };

  /**
   * Carga el canvas guardado desde localStorage
   */
  const loadCanvas = async () => {
    try {
      const savedData = localStorage.getItem(CANVAS_STORAGE_KEY);
      if (!savedData) return false;

      const canvasData = JSON.parse(savedData);
      return await deserializeCanvas(canvasData);
    } catch (error) {
      console.error("Error loading canvas:", error);
      return false;
    }
  };

  /**
   * Borra el canvas actual del localStorage
   */
  const clearSavedCanvas = () => {
    try {
      localStorage.removeItem(CANVAS_STORAGE_KEY);

      // Actualizar lista de canvas
      const canvasList = getCanvasList();
      const updatedList = canvasList.filter((c) => c.id !== "current");
      localStorage.setItem(CANVAS_LIST_KEY, JSON.stringify(updatedList));

      // Resetear estado
      lastSavedState.value = null;
      hasUnsavedChanges.value = false;

      return true;
    } catch (error) {
      console.error("Error clearing saved canvas:", error);
      return false;
    }
  };

  /**
   * Obtiene la lista de canvas disponibles (preparado para futuro)
   */
  const getCanvasList = () => {
    try {
      const list = localStorage.getItem(CANVAS_LIST_KEY);
      return list ? JSON.parse(list) : [];
    } catch (error) {
      console.error("Error getting canvas list:", error);
      return [];
    }
  };

  /**
   * Verifica si hay un canvas guardado
   */
  const hasSavedCanvas = () => {
    return localStorage.getItem(CANVAS_STORAGE_KEY) !== null;
  };

  /**
   * Compara el estado actual con el último guardado para detectar cambios
   */
  const detectChanges = () => {
    if (isLoading.value) return; // No detectar cambios durante la carga

    try {
      const currentState = JSON.stringify(serializeCanvas());
      const hasChanges = lastSavedState.value !== currentState;
      hasUnsavedChanges.value = hasChanges;
    } catch (error) {
      console.error("Error detecting changes:", error);
    }
  };

  /**
   * Inicializa el watcher para detectar cambios automáticamente
   */
  const initializeChangeDetection = () => {
    // Watch para cambios en las fotos
    watch(
      () => [
        canvasStore.photos.length,
        canvasStore.photos.map((p) => ({
          id: p.id,
          config: { ...p.config },
          // Solo incluir propiedades que afecten el estado guardado
        })),
        canvasStore.discardedPhotos.length,
        canvasStore.currentZIndex,
      ],
      detectChanges,
      { deep: true }
    );

    // Watch específico para cambios en configuración de fotos (posición, tamaño, etc.)
    watch(
      () =>
        canvasStore.photos.map((p) => ({
          x: p.config.x,
          y: p.config.y,
          width: p.config.width,
          height: p.config.height,
          zIndex: p.config.zIndex,
        })),
      detectChanges,
      { deep: true }
    );

    // Watch para cambios en fotos descartadas
    watch(() => canvasStore.discardedPhotos.map((p) => p.id), detectChanges, {
      deep: true,
    });
  };

  /**
   * Marca el canvas como guardado (útil para sincronizar con API en el futuro)
   */
  const markAsSaved = () => {
    lastSavedState.value = JSON.stringify(serializeCanvas());
    hasUnsavedChanges.value = false;
  };

  return {
    // Estado
    hasUnsavedChanges,
    isSaved,

    // Acciones principales
    saveCanvas,
    loadCanvas,
    clearSavedCanvas,

    // Utilidades
    hasSavedCanvas,
    getCanvasList,
    markAsSaved,
    initializeChangeDetection,

    // Para uso interno/futuro
    serializeCanvas,
    deserializeCanvas,
  };
}
