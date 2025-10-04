// composables/use3DPhotos.js
import { ref, computed } from "vue";
import { api } from "@/utils/axios";

export function use3DPhotos() {
  // Estado reactivo
  const photos3D = ref([]);
  const isLoadingPositions = ref(false);
  const currentChunk = ref("general"); // Chunk seleccionado
  const error = ref(null);

  // Opciones de chunks disponibles
  const chunkOptions = [
    { value: "general", label: "General" },
    { value: "story", label: "Narrative" },
    { value: "context", label: "Context" },
    { value: "visual_accents", label: "Visual Accents" },
  ];

  // Función para cargar todas las fotos de una vez
  const loadPhotos = async (chunkName) => {
    try {
      const response = await api.post("/api/3d/photos", {
        chunkName,
        includeVisualAspects: true, // Solicitar información de aspectos visuales
      });

      return response.data.photos || [];
    } catch (err) {
      console.error(`Error loading 3D photos:`, err);
      throw new Error(`Error cargando fotos: ${err.message}`);
    }
  };

  // Función simplificada para cargar todas las fotos
  const loadAllPhotos = async (chunkName, reuseExisting = false) => {
    console.log("🚀 loadAllPhotos iniciado para chunk:", chunkName, {
      reuseExisting,
    });

    // Actualizar currentChunk al principio
    currentChunk.value = chunkName;

    isLoadingPositions.value = true;
    error.value = null;

    try {
      const photos = await loadPhotos(chunkName);

      if (reuseExisting && photos3D.value.length > 0) {
        // Modo reutilización: actualizar solo las coordenadas de las fotos existentes
        console.log(
          `♻️ Actualizando coordenadas de ${photos.length} fotos existentes`
        );

        // Crear un mapa de ID -> nuevas coordenadas
        const coordsMap = new Map();
        photos.forEach((photo) => {
          coordsMap.set(photo.id, photo.coordinates || [0, 0, 0]);
        });

        // Actualizar las fotos existentes con las nuevas coordenadas
        photos3D.value = photos3D.value.map((existingPhoto) => {
          const newCoords = coordsMap.get(existingPhoto.id);
          if (newCoords) {
            return {
              ...existingPhoto,
              position: newCoords,
              coordinates: newCoords,
            };
          }
          return existingPhoto;
        });
      } else {
        // Modo normal: reemplazar todas las fotos
        const processedPhotos = photos.map((photo) => ({
          ...photo,
          // Asegurar que las coordenadas están disponibles
          position: photo.coordinates || [0, 0, 0],
        }));

        console.log(`📸 Cargadas ${processedPhotos.length} fotos`);
        photos3D.value = processedPhotos;
      }

      console.log(`Carga completa: ${photos3D.value.length} fotos`);
    } catch (err) {
      error.value = err.message;
      console.error("Error en loadAllPhotos:", err);
    } finally {
      isLoadingPositions.value = false;
    }
  };

  // Función para cambiar de chunk (optimizada para reutilización)
  const changeChunk = async (newChunk) => {
    console.log("🔄 changeChunk called:", {
      newChunk,
      currentChunk: currentChunk.value,
      hasExistingPhotos: photos3D.value.length > 0,
      willSkip: newChunk === currentChunk.value,
    });

    // Solo saltar si realmente es el mismo valor Y ya tenemos fotos cargadas
    if (newChunk === currentChunk.value && photos3D.value.length > 0) {
      console.log(
        "⏸️ Saltando cambio de chunk - mismo valor y datos ya cargados"
      );
      return;
    }

    // Decidir si reutilizar fotos existentes
    const shouldReuseExisting = photos3D.value.length > 0;

    console.log("🚀 Ejecutando loadAllPhotos para chunk:", newChunk, {
      reuseExisting: shouldReuseExisting,
    });

    await loadAllPhotos(newChunk, shouldReuseExisting);
    console.log("✅ changeChunk completado para chunk:", newChunk);
  };

  // Función para reiniciar
  const reset = () => {
    photos3D.value = [];
    error.value = null;
  };

  return {
    // Estado
    photos3D,
    isLoadingPositions,
    currentChunk,
    error,

    // Opciones
    chunkOptions,

    // Métodos
    loadAllPhotos,
    changeChunk,
    reset,
  };
}
