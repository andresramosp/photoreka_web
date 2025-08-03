import { defineStore } from "pinia";

const HORIZONTAL_PHOTO_WIDTH = 150 * 1.5;
const HORIZONTAL_PHOTO_HEIGHT = 100 * 1.5;
const VERTICAL_PHOTO_WIDTH = 100 * 1.5;
const VERTICAL_PHOTO_HEIGHT = 150 * 1.5;

// Generar ID único para fotos del playground
function generatePlaygroundId() {
  return `playground-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Devuelve una promesa con las dimensiones de la imagen
function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Crear foto simplificada para playground
async function createPlaygroundPhoto(
  file,
  basePosition = { x: 15, y: 15 },
  index = 0
) {
  // Crear URL temporal para el archivo
  const src = URL.createObjectURL(file);

  // Obtener dimensiones de la imagen
  let width = HORIZONTAL_PHOTO_WIDTH;
  let height = HORIZONTAL_PHOTO_HEIGHT;
  try {
    const dims = await getImageDimensions(src);
    if (dims.height > dims.width) {
      // Vertical
      width = VERTICAL_PHOTO_WIDTH;
      height = VERTICAL_PHOTO_HEIGHT;
    }
  } catch (e) {
    // Si falla, usar horizontal por defecto
  }

  return {
    id: generatePlaygroundId(),
    title: file.name,
    src: src,
    thumbnailUrl: src, // En playground usamos la misma imagen
    config: {
      x: basePosition.x + index * width * 0.1,
      y: basePosition.y + index * height * 0.1,
      width,
      height,
      opacity: 1,
      zIndex: index + 1,
    },
    image: null,
    selected: false,
    hovered: false,
    loading: false,
    inTrash: false,
    tags: [], // Sin tags en playground
    detectionAreas: [], // Sin detection areas en playground
    // Metadatos básicos
    status: "playground",
    isPlayground: true,
  };
}

export const usePlaygroundCanvasStore = defineStore("playgroundCanvas", {
  state: () => ({
    photos: [],
    discardedPhotos: [],
    currentZIndex: 1,
    maxPhotos: 15, // Límite para playground
  }),

  getters: {
    photoCount: (state) => state.photos.length,
    canAddMore: (state) => state.photos.length < state.maxPhotos,
    isAtLimit: (state) => state.photos.length >= state.maxPhotos,
  },

  actions: {
    async addPhotos(files) {
      const filesToAdd = Array.from(files);

      // Verificar límite
      if (this.photos.length + filesToAdd.length > this.maxPhotos) {
        const remainingSlots = this.maxPhotos - this.photos.length;
        if (remainingSlots <= 0) {
          throw new Error(
            `Maximum ${this.maxPhotos} photos allowed in playground mode`
          );
        }
        // Tomar solo las primeras fotos que caben
        filesToAdd.splice(remainingSlots);
      }

      for (let index = 0; index < filesToAdd.length; index++) {
        const file = filesToAdd[index];

        // Verificar que sea imagen
        if (!file.type.startsWith("image/")) {
          continue;
        }

        try {
          const createdPhoto = await createPlaygroundPhoto(
            file,
            {
              x: 50 + this.photos.length * 30,
              y: 50 + this.photos.length * 30,
            },
            this.currentZIndex + index
          );
          this.photos.push(createdPhoto);
        } catch (error) {
          console.error("Error creating playground photo:", error);
        }
      }

      this.currentZIndex += filesToAdd.length;
    },

    deletePhotos(photoIds) {
      const photosToRemove = this.photos.filter((p) => photoIds.includes(p.id));

      // Liberar URLs de objeto para evitar memory leaks
      photosToRemove.forEach((photo) => {
        if (photo.src && photo.src.startsWith("blob:")) {
          URL.revokeObjectURL(photo.src);
        }
      });

      this.photos = this.photos.filter(
        (p) => !photosToRemove.map((p) => p.id).includes(p.id)
      );
      this.discardedPhotos = this.discardedPhotos.concat(photosToRemove);
    },

    clearCanvas() {
      // Liberar todas las URLs de objeto
      this.photos.forEach((photo) => {
        if (photo.src && photo.src.startsWith("blob:")) {
          URL.revokeObjectURL(photo.src);
        }
      });

      this.discardedPhotos.forEach((photo) => {
        if (photo.src && photo.src.startsWith("blob:")) {
          URL.revokeObjectURL(photo.src);
        }
      });

      this.photos = [];
      this.discardedPhotos = [];
      this.currentZIndex = 1;
    },

    // Función mock para mostrar popup de expansión
    showExpansionTeaser() {
      // Esta función se llamará cuando el usuario trate de expandir
      console.log("Show expansion teaser modal");
      // TODO: Implementar modal con video
      return Promise.resolve([]);
    },
  },
});

// No hay opciones de expansión en playground, pero mantenemos compatibilidad
export const playgroundExpansionTypeOptions = [
  { label: "General", value: "embedding", disabled: true },
  { label: "Chromatic", value: "chromatic", disabled: true },
];
