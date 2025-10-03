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
// - Material inicial: Textura 128px (REDUCED_TEXTURE_SIZE) para optimizar memoria
// - LOD REDUCED: Textura 128px creada desde imagen original (fotos lejanas)
// - LOD ULTRA: Textura 768px creada desde imagen original (fotos cercanas - máxima calidad)
const ULTRA_TEXTURE_SIZE = 768; // Ultra high-res texture for close viewing (px)
const REDUCED_TEXTURE_SIZE = 56; // Reduced texture resolution (px)

// LOD (Level of Detail) System - 2 niveles
const LOD_LEVELS = {
  ULTRA: 0, // Ultra high-res texture (768px) when close
  REDUCED: 1, // Reduced texture (128px) when far
};

// LOD distance threshold (adjustable and reactive)
const LOD_DISTANCES = ref({
  ULTRA_TO_REDUCED: 20, // Switch between ultra and reduced quality
});

// Enable/disable LOD system
const useLODSystem = ref(true);

// Cache for reduced textures
const reducedTextureCache = new Map();

/**
 * Helper function to resize textures aggressively for memory optimization
 */
const resizeTextureToMaxSize = (image, maxSize = REDUCED_TEXTURE_SIZE) => {
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
 * Create reduced quality texture (lower resolution) - Very aggressive compression
 */
const createReducedTexture = (originalTexture) => {
  if (!originalTexture || !originalTexture.image) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Enable low quality smoothing for aggressive compression
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "low";

  // Reduce to fixed size for memory optimization
  const originalWidth = originalTexture.image.width || 256;
  const originalHeight = originalTexture.image.height || 192;

  // Calculate dimensions maintaining aspect ratio
  const scale = Math.min(
    REDUCED_TEXTURE_SIZE / originalWidth,
    REDUCED_TEXTURE_SIZE / originalHeight
  );
  canvas.width = Math.floor(originalWidth * scale);
  canvas.height = Math.floor(originalHeight * scale);

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
  if (!useLODSystem.value) return LOD_LEVELS.REDUCED;

  const distances = LOD_DISTANCES.value;

  if (distance > distances.ULTRA_TO_REDUCED) {
    return LOD_LEVELS.REDUCED;
  }

  return LOD_LEVELS.ULTRA;
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
    const currentLOD = photo.__currentLOD || LOD_LEVELS.REDUCED;

    // 🆕 CRÍTICO: Detectar fotos fallidas y activar retry bajo demanda
    // Esto permite que las fotos que fallaron en la carga inicial se reintenten cuando
    // el usuario se acerca a ellas
    if (
      retryFailedPhotoOnDemand &&
      photo.__downloadError &&
      photo.__canRetryOnDemand
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
      case LOD_LEVELS.ULTRA:
        // Cargar textura ultra alta resolución (768px) de forma lazy
        // ✅ Reutiliza la imagen original, no descarga de nuevo
        if (!photo.__ultraTexture && !photo.__ultraTextureLoaded) {
          const ultraTexture = createUltraTexture(photo, downloadedImagesCache);
          if (ultraTexture) {
            photo.__ultraTexture = ultraTexture;
            photo.material.map = ultraTexture;
            photo.material.needsUpdate = true;
            dlog(`🔍 LOD ULTRA aplicado para foto: ${photo.id}`);
          }
        } else if (
          photo.__ultraTexture &&
          photo.material.map !== photo.__ultraTexture
        ) {
          photo.material.map = photo.__ultraTexture;
          photo.material.needsUpdate = true;
          dlog(`🔍 LOD ULTRA restaurado para foto: ${photo.id}`);
        }
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
        break;
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
    ultra: 0,
    reduced: 0,
    withoutTexture: 0,
  };

  visiblePhotos.forEach((photo) => {
    if (!photo.__originalTexture) {
      stats.withoutTexture++;
      return;
    }

    const lod = photo.__currentLOD || LOD_LEVELS.REDUCED;
    switch (lod) {
      case LOD_LEVELS.ULTRA:
        stats.ultra++;
        break;
      case LOD_LEVELS.REDUCED:
        stats.reduced++;
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
    ULTRA_TEXTURE_SIZE,
    REDUCED_TEXTURE_SIZE,

    // Reactive state
    LOD_DISTANCES,
    useLODSystem,

    // Caches
    reducedTextureCache,

    // Helper functions
    resizeTextureToMaxSize,
    configureTextureSafely,
    createReducedTexture,
    createUltraTexture,
    getLODLevel,

    // Main LOD functions
    updatePhotoLOD,
    debugLODState,
  };
}
