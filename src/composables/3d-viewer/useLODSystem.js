import { ref } from "vue";
import * as THREE from "three";

// ===== Debug Flag (wrap noisy logs) =====
const DEBUG_3D = false;
function dlog(...args) {
  if (DEBUG_3D) console.log(...args);
}

// ===== Texture Size Configuration =====
// 🎯 ESTRATEGIA DE TEXTURAS:
// - Descarga: Imagen original COMPLETA sin redimensionar (guardada en __originalImageElement)
// - Material inicial: Textura 128px (MAIN_TEXTURE_SIZE) para optimizar memoria
// - LOD REDUCED: Textura 32px (128px * 0.25) creada desde imagen original
// - LOD FULL: Textura 128px (reutiliza __originalTexture)
// - LOD ULTRA_CLOSE: Textura 768px creada desde imagen original (máxima calidad)
const MAIN_TEXTURE_SIZE = 128; // Main texture resolution (px) - usado para vista normal
const ULTRA_TEXTURE_SIZE = 768; // Ultra high-res texture for close viewing (px)
const REDUCED_TEXTURE_FACTOR = 0.75; // Factor for reduced quality textures (32px)

// Advanced LOD (Level of Detail) System Configuration
const LOD_LEVELS = {
  ULTRA_CLOSE: 0, // Ultra high-res texture (768px) when very close
  FULL: 1, // Full texture quality (384px)
  REDUCED: 2, // Lower quality texture
  PLACEHOLDER: 3, // Solid color based on dominant photo color
  HIDDEN: 4, // Not rendered at all
};

// LOD distance thresholds (adjustable and reactive)
const LOD_DISTANCES = ref({
  ULTRA_CLOSE_TO_FULL: 15, // Switch to high-res textures when very close
  FULL_TO_REDUCED: 25, // Start reducing texture quality
  // REDUCED_TO_PLACEHOLDER: 130, // Replace with solid color
  PLACEHOLDER_TO_HIDDEN: 200, // Stop rendering completely
});

// Enable/disable LOD system
const useLODSystem = ref(true);

// Cache for dominant colors and reduced textures
const dominantColorCache = new Map();
const reducedTextureCache = new Map();
const placeholderMaterialCache = new Map();

/**
 * Helper function to resize textures aggressively for memory optimization
 */
const resizeTextureToMaxSize = (image, maxSize = MAIN_TEXTURE_SIZE) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { width, height } = image;

  // If already small enough, return original
  if (width <= maxSize && height <= maxSize) {
    return image;
  }

  // Calculate new dimensions maintaining aspect ratio
  const scale = Math.min(maxSize / width, maxSize / height);
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);

  // Use medium quality for better visual balance
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "medium";

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
};

/**
 * Safe texture configuration helper - optimized for memory
 */
const configureTextureSafely = (texture, isSmallTexture = false) => {
  try {
    // Configure texture parameters in the safest order
    if (texture) {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.magFilter = THREE.LinearFilter;
      // Disable mipmaps for small textures to save memory
      if (isSmallTexture) {
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
      } else {
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.generateMipmaps = true;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  } catch (error) {
    console.warn("⚠️ Error configuring texture parameters:", error);
    // Fallback to minimal safe configuration
    if (texture) {
      try {
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
      } catch (fallbackError) {
        console.error(
          "❌ Critical texture configuration error:",
          fallbackError
        );
      }
    }
  }
};

/**
 * Extract dominant color from image (fast approximation)
 */
const extractDominantColor = (imageElement) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Use small canvas for performance
  canvas.width = 32;
  canvas.height = 24;

  ctx.drawImage(imageElement, 0, 0, 32, 24);

  const imageData = ctx.getImageData(0, 0, 32, 24);
  const data = imageData.data;

  let r = 0,
    g = 0,
    b = 0;
  const pixelCount = data.length / 4;

  // Average color calculation (fast)
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  r = Math.floor(r / pixelCount);
  g = Math.floor(g / pixelCount);
  b = Math.floor(b / pixelCount);

  return (r << 16) | (g << 8) | b; // Return as hex color
};

/**
 * Create reduced quality texture (lower resolution) - Very aggressive compression
 */
const createReducedTexture = (originalTexture) => {
  if (!originalTexture || !originalTexture.image) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Enable low quality smoothing for aggressive compression
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "low";

  // Reduce to very small size for aggressive memory optimization
  const originalWidth = originalTexture.image.width || 256;
  const originalHeight = originalTexture.image.height || 192;

  canvas.width = Math.max(
    32,
    Math.floor(originalWidth * REDUCED_TEXTURE_FACTOR)
  );
  canvas.height = Math.max(
    24,
    Math.floor(originalHeight * REDUCED_TEXTURE_FACTOR)
  );

  ctx.drawImage(originalTexture.image, 0, 0, canvas.width, canvas.height);

  const reducedTexture = new THREE.CanvasTexture(canvas);
  // Configure as small texture (no mipmaps, optimized for memory)
  configureTextureSafely(reducedTexture, true);

  return reducedTexture;
};

/**
 * Create ultra high-res texture for very close viewing (768px)
 * 🔧 OPTIMIZADO: Reutiliza la imagen original ya descargada en lugar de descargar de nuevo
 */
const createUltraTexture = (photoObj, downloadedImagesCache) => {
  if (!photoObj || photoObj.__ultraTextureLoaded || photoObj.__ultraLoading)
    return null;

  photoObj.__ultraLoading = true;

  try {
    // 🎯 SOLUCIÓN: Usar la imagen original que ya descargamos, no descargar de nuevo
    const originalImage =
      photoObj.__originalImageElement || downloadedImagesCache.get(photoObj.id);

    if (!originalImage) {
      console.warn(
        "⚠️ No hay imagen original para crear textura ultra:",
        photoObj.id
      );
      photoObj.__ultraTextureLoaded = true;
      photoObj.__ultraLoading = false;
      return null;
    }

    // Crear textura de alta resolución desde la imagen ya descargada
    const resizedImage = resizeTextureToMaxSize(
      originalImage,
      ULTRA_TEXTURE_SIZE
    );
    const ultraTexture = new THREE.CanvasTexture(resizedImage);
    // Configure with full quality (mipmaps enabled)
    configureTextureSafely(ultraTexture, false);

    photoObj.__ultraTextureLoaded = true;
    photoObj.__ultraLoading = false;
    return ultraTexture;
  } catch (error) {
    console.warn("⚠️ Error creating ultra texture:", error);
    photoObj.__ultraTextureLoaded = true;
    photoObj.__ultraLoading = false;
    return null;
  }
};

/**
 * Determine LOD level based on distance
 */
const getLODLevel = (distance) => {
  if (!useLODSystem.value) return LOD_LEVELS.FULL;

  const distances = LOD_DISTANCES.value;

  if (distance > distances.PLACEHOLDER_TO_HIDDEN) {
    return LOD_LEVELS.HIDDEN;
    // } else if (distance > distances.REDUCED_TO_PLACEHOLDER) {
    //   return LOD_LEVELS.PLACEHOLDER;
  } else if (distance > distances.FULL_TO_REDUCED) {
    return LOD_LEVELS.REDUCED;
  } else if (distance > distances.ULTRA_CLOSE_TO_FULL) {
    return LOD_LEVELS.FULL;
  }

  return LOD_LEVELS.ULTRA_CLOSE;
};

/**
 * Sistema LOD corregido - MANTIENE los materiales originales siempre
 * 🎯 OPTIMIZADO: Usa distancias pre-calculadas y aplica a TODAS las fotos
 * (el LOD ES la optimización de performance, debe aplicarse siempre)
 */
const updatePhotoLOD = (
  photosWithDistances,
  retryFailedPhotoOnDemand,
  downloadedImagesCache
) => {
  if (!useLODSystem.value || photosWithDistances.length === 0) {
    return;
  }

  // 🎯 CRÍTICO: Aplicar LOD a TODAS las fotos visibles
  // El LOD es la optimización (reduce calidad de texturas lejanas)
  // Limitarlo sería contraproducente
  photosWithDistances.forEach(({ photo, distance }) => {
    if (!photo.material) return;

    const lodLevel = getLODLevel(distance);
    const currentLOD = photo.__currentLOD || LOD_LEVELS.FULL;

    // 🆕 CRÍTICO: Detectar fotos fallidas y activar retry bajo demanda en nivel REDUCED
    // Esto permite que las fotos que fallaron en la carga inicial se reintenten cuando
    // el usuario se acerca a ellas, pero a una distancia razonable (no ultra cercana)
    if (
      retryFailedPhotoOnDemand &&
      photo.__downloadError &&
      photo.__canRetryOnDemand &&
      (lodLevel === LOD_LEVELS.REDUCED ||
        lodLevel === LOD_LEVELS.FULL ||
        lodLevel === LOD_LEVELS.ULTRA_CLOSE)
    ) {
      // Intentar cargar la foto fallida bajo demanda
      retryFailedPhotoOnDemand(photo);
      // Continuar con la lógica normal mientras se carga
    }

    // Only update if LOD level changed
    if (lodLevel === currentLOD) {
      return;
    }

    photo.__currentLOD = lodLevel;

    // 🔧 SOLUCIÓN: NUNCA crear nuevos materiales, solo cambiar la textura del material existente
    // 📌 IMPORTANTE: Las texturas de diferentes resoluciones (ultra, reduced) se crean desde
    //    la imagen original ya descargada (__originalImageElement), NO se descarga de nuevo
    switch (lodLevel) {
      case LOD_LEVELS.ULTRA_CLOSE:
        // Cargar textura ultra alta resolución (768px) de forma lazy
        // ✅ Reutiliza la imagen original, no descarga de nuevo
        if (!photo.__ultraTexture && !photo.__ultraTextureLoaded) {
          const ultraTexture = createUltraTexture(photo, downloadedImagesCache);
          if (ultraTexture) {
            photo.__ultraTexture = ultraTexture;
            photo.material.map = ultraTexture;
            photo.material.needsUpdate = true;
            dlog(`🔍 LOD ULTRA_CLOSE aplicado para foto: ${photo.id}`);
          }
        } else if (
          photo.__ultraTexture &&
          photo.material.map !== photo.__ultraTexture
        ) {
          photo.material.map = photo.__ultraTexture;
          photo.material.needsUpdate = true;
          dlog(`🔍 LOD ULTRA_CLOSE restaurado para foto: ${photo.id}`);
        }
        // Asegurar visibilidad
        photo.__isLODHidden = false;
        break;

      case LOD_LEVELS.FULL:
        // Limpiar textura ultra si existía (gestión de memoria)
        if (photo.__ultraTexture) {
          photo.__ultraTexture.dispose?.();
          photo.__ultraTexture = null;
          photo.__ultraTextureLoaded = false;
        }

        // Restaurar textura original completa
        if (
          photo.__originalTexture &&
          photo.material.map !== photo.__originalTexture
        ) {
          photo.material.map = photo.__originalTexture;
          photo.material.needsUpdate = true;
          dlog(`📷 LOD FULL aplicado para foto: ${photo.id}`);
        }
        // Asegurar visibilidad
        photo.__isLODHidden = false;
        break;

      case LOD_LEVELS.REDUCED:
        // Limpiar textura ultra si existía (gestión de memoria)
        if (photo.__ultraTexture) {
          photo.__ultraTexture.dispose?.();
          photo.__ultraTexture = null;
          photo.__ultraTextureLoaded = false;
        }

        // Usar textura reducida (crear solo una vez)
        if (!photo.__reducedTexture && photo.__originalTexture) {
          photo.__reducedTexture = createReducedTexture(
            photo.__originalTexture
          );
        }

        // 🔧 CRÍTICO: Aplicar la textura reducida al material
        if (
          photo.__reducedTexture &&
          photo.material.map !== photo.__reducedTexture
        ) {
          photo.material.map = photo.__reducedTexture;
          photo.material.needsUpdate = true;
          dlog(`📉 LOD REDUCED aplicado para foto: ${photo.id}`);
        }
        // Asegurar visibilidad
        photo.__isLODHidden = false;
        break;

      case LOD_LEVELS.PLACEHOLDER:
        // Crear textura de color sólido (crear solo una vez)
        if (!photo.__placeholderTexture) {
          if (!photo.__dominantColor && photo.__originalTexture?.image) {
            photo.__dominantColor = extractDominantColor(
              photo.__originalTexture.image
            );
          }

          if (photo.__dominantColor) {
            // Crear una pequeña textura con el color predominante
            const canvas = document.createElement("canvas");
            canvas.width = 4;
            canvas.height = 4;
            const ctx = canvas.getContext("2d");
            const color = photo.__dominantColor;
            const r = (color >> 16) & 255;
            const g = (color >> 8) & 255;
            const b = color & 255;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, 0, 4, 4);

            photo.__placeholderTexture = new THREE.CanvasTexture(canvas);
            photo.__placeholderTexture.colorSpace = THREE.SRGBColorSpace;
          }
        }

        // Solo cambiar la textura, NO el material
        if (
          photo.__placeholderTexture &&
          photo.material.map !== photo.__placeholderTexture
        ) {
          photo.material.map = photo.__placeholderTexture;
          photo.material.needsUpdate = true;
        }
        // Asegurar visibilidad
        photo.__isLODHidden = false;
        break;

      case LOD_LEVELS.HIDDEN:
        // Marcar como oculta (se filtra en updateVisiblePhotos)
        photo.__isLODHidden = true;
        break;
    }

    // 🔧 CRÍTICO: Si salimos del estado HIDDEN, SIEMPRE restaurar visibilidad
    if (lodLevel !== LOD_LEVELS.HIDDEN) {
      photo.__isLODHidden = false;
    }
  });
};

/**
 * Helper function to preload dominant colors for visible photos
 */
const preloadDominantColors = async (visiblePhotos) => {
  if (!useLODSystem.value) return;

  const photosNeedingColors = visiblePhotos.filter(
    (photo) => photo.__originalTexture?.image && !photo.__dominantColor
  );

  photosNeedingColors.forEach((photo) => {
    if (photo.__originalTexture?.image) {
      photo.__dominantColor = extractDominantColor(
        photo.__originalTexture.image
      );
    }
  });
};

/**
 * 🔧 Función de depuración para diagnosticar problemas LOD
 */
const debugLODState = (visiblePhotos, totalPhotos) => {
  if (!useLODSystem.value) return;

  const stats = {
    total: visiblePhotos.length,
    full: 0,
    ultraClose: 0,
    reduced: 0,
    placeholder: 0,
    hidden: 0,
    withoutTexture: 0,
  };

  visiblePhotos.forEach((photo) => {
    if (!photo.__originalTexture) {
      stats.withoutTexture++;
      return;
    }

    const lod = photo.__currentLOD || LOD_LEVELS.FULL;
    switch (lod) {
      case LOD_LEVELS.ULTRA_CLOSE:
        stats.ultraClose++;
        break;
      case LOD_LEVELS.FULL:
        stats.full++;
        break;
      case LOD_LEVELS.REDUCED:
        stats.reduced++;
        break;
      case LOD_LEVELS.PLACEHOLDER:
        stats.placeholder++;
        break;
      case LOD_LEVELS.HIDDEN:
        stats.hidden++;
        break;
    }
  });

  // 🎯 Agregar estadísticas de rendimiento del frustum culling
  const visibleCount = visiblePhotos.length;
  const cullingEfficiency =
    totalPhotos > 0 ? ((1 - visibleCount / totalPhotos) * 100).toFixed(1) : 0;

  console.log("🔍 LOD Debug Stats:", {
    ...stats,
    frustumCulling: {
      total: totalPhotos,
      visible: visibleCount,
      culled: totalPhotos - visibleCount,
      efficiency: `${cullingEfficiency}%`,
    },
  });
  return stats;
};

/**
 * Composable para el sistema LOD
 */
export function useLODSystemComposable() {
  return {
    // Constants
    LOD_LEVELS,
    MAIN_TEXTURE_SIZE,
    ULTRA_TEXTURE_SIZE,
    REDUCED_TEXTURE_FACTOR,

    // Reactive state
    LOD_DISTANCES,
    useLODSystem,

    // Caches
    dominantColorCache,
    reducedTextureCache,
    placeholderMaterialCache,

    // Helper functions
    resizeTextureToMaxSize,
    configureTextureSafely,
    extractDominantColor,
    createReducedTexture,
    createUltraTexture,
    getLODLevel,

    // Main LOD functions
    updatePhotoLOD,
    preloadDominantColors,
    debugLODState,
  };
}
