// composables/useTextureCache.js
import { ref } from "vue";
import * as THREE from "three";

const DB_NAME = "PhotorekaTextureCache";
const DB_VERSION = 2; // Incrementado para migración a ImageData
const STORE_NAME = "textures";

export function useTextureCache(options = {}) {
  const {
    maxCacheSize = 5000, // Aumentado de 500 a 2000
    expiryDays = 30, // Aumentado de 7 a 30 días
    compressionQuality = 0.8,
  } = options;

  // Estado reactivo
  const cacheStats = ref({
    hits: 0,
    misses: 0,
    evictions: 0,
    dbSize: 0,
    isReady: false,
  });

  let textureDB = null;

  // Inicializar IndexedDB
  const initDB = async () => {
    if (textureDB) return textureDB;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        textureDB = request.result;
        cacheStats.value.isReady = true;
        updateCacheSize();
        resolve(textureDB);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "url" });
          store.createIndex("timestamp", "timestamp");
        }

        // Migración de v1 (Blob) a v2 (ImageData)
        if (oldVersion < 2) {
          console.warn(
            "⚠️ MIGRACIÓN: Limpiando caché v1 → v2. Esto causará re-descarga inicial de texturas."
          );
          const transaction = event.target.transaction;
          const store = transaction.objectStore(STORE_NAME);

          // Contar elementos antes de limpiar
          const countRequest = store.count();
          countRequest.onsuccess = () => {
            console.log(`📊 Elementos en caché v1: ${countRequest.result}`);
          };

          // Limpiar datos antiguos para evitar problemas de compatibilidad
          store.clear();
          console.log(
            "🗑️ Caché v1 limpiado. Las texturas se re-cachearán automáticamente."
          );
        }
      };
    });
  };

  // Actualizar contador de tamaño de caché
  const updateCacheSize = async () => {
    if (!textureDB) return;

    try {
      const transaction = textureDB.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        cacheStats.value.dbSize = countRequest.result;
      };
    } catch (error) {
      console.warn("Error updating cache size:", error);
    }
  };

  // Limpiar texturas expiradas
  const cleanExpiredTextures = async () => {
    if (!textureDB) return;

    try {
      const transaction = textureDB.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("timestamp");

      const expiryTime = Date.now() - expiryDays * 24 * 60 * 60 * 1000;
      const request = index.openCursor(IDBKeyRange.upperBound(expiryTime));

      let deletedCount = 0;
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            console.log(
              `Limpiadas ${deletedCount} texturas expiradas del caché`
            );
            updateCacheSize();
          }
        }
      };
    } catch (error) {
      console.warn("Error cleaning expired textures:", error);
    }
  };

  // Función auxiliar para convertir Image a ImageData
  const imageToImageData = (img) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  // Función auxiliar para convertir ImageData a THREE.CanvasTexture (SÍNCRONA)
  const imageDataToTexture = (imageData, width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // Verificar si una textura está disponible en caché (sin cargarla)
  const isTextureCached = async (url) => {
    if (!textureDB) await initDB();

    return new Promise((resolve) => {
      try {
        const transaction = textureDB.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(url);

        request.onsuccess = () => {
          const result = request.result;
          const isCached =
            result &&
            Date.now() - result.timestamp < expiryDays * 24 * 60 * 60 * 1000;
          resolve(isCached);
        };

        request.onerror = () => {
          resolve(false);
        };
      } catch (error) {
        console.warn("Error checking cached texture:", error);
        resolve(false);
      }
    });
  };

  // Obtener textura del caché (asíncrona - para compatibilidad)
  const getCachedTexture = async (url) => {
    if (!textureDB) await initDB();

    return new Promise((resolve) => {
      try {
        const transaction = textureDB.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(url);

        request.onsuccess = () => {
          const result = request.result;
          console.log(
            "🔍 getCachedTexture: Resultado de IndexedDB para",
            url,
            result ? "ENCONTRADO" : "NO ENCONTRADO"
          );

          if (
            result &&
            Date.now() - result.timestamp < expiryDays * 24 * 60 * 60 * 1000
          ) {
            console.log(
              "✅ getCachedTexture: Textura válida encontrada para",
              url
            );
            // Nuevo formato: ImageData (síncrono)
            if (result.imageData && result.width && result.height) {
              try {
                const texture = imageDataToTexture(
                  result.imageData,
                  result.width,
                  result.height
                );
                cacheStats.value.hits++;
                console.log(
                  "✅ getCachedTexture: Textura convertida exitosamente para",
                  url
                );
                resolve(texture);
                return;
              } catch (e) {
                console.warn("Error converting ImageData to texture:", e);
              }
            }

            // Formato legacy: Blob (asíncrono) - para compatibilidad con datos existentes
            if (result.imageBlob) {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                const texture = new THREE.CanvasTexture(canvas);
                texture.colorSpace = THREE.SRGBColorSpace;
                cacheStats.value.hits++;
                resolve(texture);

                // Limpiar URL temporal
                URL.revokeObjectURL(img.src);
              };
              img.onerror = () => {
                cacheStats.value.misses++;
                resolve(null);
              };
              img.src = URL.createObjectURL(result.imageBlob);
              return;
            }

            // Sin formato válido
            cacheStats.value.misses++;
            resolve(null);
          } else {
            // Texture expirada o no existe
            if (result) {
              console.log(
                "⏰ getCachedTexture: Textura expirada, eliminando:",
                url
              );
              // Eliminar entrada expirada
              const deleteTransaction = textureDB.transaction(
                [STORE_NAME],
                "readwrite"
              );
              const deleteStore = deleteTransaction.objectStore(STORE_NAME);
              deleteStore.delete(url);
            } else {
              console.log("❌ getCachedTexture: No existe en caché:", url);
            }
            cacheStats.value.misses++;
            resolve(null);
          }
        };

        request.onerror = () => {
          cacheStats.value.misses++;
          resolve(null);
        };
      } catch (error) {
        console.warn("Error getting cached texture:", error);
        cacheStats.value.misses++;
        resolve(null);
      }
    });
  };

  // ✨ NUEVA: Obtener textura del caché SÍNCRONAMENTE (solo ImageData)
  const getCachedTextureSync = async (url) => {
    if (!textureDB) await initDB();

    return new Promise((resolve) => {
      try {
        const transaction = textureDB.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(url);

        request.onsuccess = () => {
          const result = request.result;
          if (
            result &&
            Date.now() - result.timestamp < expiryDays * 24 * 60 * 60 * 1000 &&
            result.imageData &&
            result.width &&
            result.height
          ) {
            try {
              // Conversión síncrona instantánea
              const texture = imageDataToTexture(
                result.imageData,
                result.width,
                result.height
              );
              cacheStats.value.hits++;
              resolve(texture);
            } catch (e) {
              console.warn("Error converting cached ImageData to texture:", e);
              cacheStats.value.misses++;
              resolve(null);
            }
          } else {
            cacheStats.value.misses++;
            resolve(null);
          }
        };

        request.onerror = () => {
          cacheStats.value.misses++;
          resolve(null);
        };
      } catch (error) {
        console.warn("Error getting cached texture sync:", error);
        cacheStats.value.misses++;
        resolve(null);
      }
    });
  };

  // 🚀 NUEVA: Cargar múltiples texturas de IndexedDB de una vez
  const loadMultipleCachedTextures = async (urls) => {
    if (!textureDB) await initDB();
    if (!urls.length) return new Map();

    return new Promise((resolve) => {
      const results = new Map();
      const transaction = textureDB.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);

      let completed = 0;
      const total = urls.length;

      urls.forEach((url) => {
        const request = store.get(url);

        request.onsuccess = () => {
          const result = request.result;

          if (
            result &&
            Date.now() - result.timestamp < expiryDays * 24 * 60 * 60 * 1000 &&
            result.imageData &&
            result.width &&
            result.height
          ) {
            try {
              // Conversión instantánea
              const texture = imageDataToTexture(
                result.imageData,
                result.width,
                result.height
              );
              results.set(url, texture);
              cacheStats.value.hits++;
            } catch (e) {
              console.warn(`Error converting cached texture ${url}:`, e);
              cacheStats.value.misses++;
            }
          } else {
            cacheStats.value.misses++;
          }

          completed++;
          if (completed === total) {
            resolve(results);
          }
        };

        request.onerror = () => {
          cacheStats.value.misses++;
          completed++;
          if (completed === total) {
            resolve(results);
          }
        };
      });
    });
  };

  // Evictar texturas más antiguas (elimina 10% del caché cuando se supera el límite)
  const evictOldestTextures = async () => {
    if (!textureDB) return;

    try {
      const transaction = textureDB.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("timestamp");

      // Eliminar 10% de las texturas más antiguas para evitar evicción constante
      const toDelete = Math.max(1, Math.floor(maxCacheSize * 0.1));
      let deletedCount = 0;

      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && deletedCount < toDelete) {
          cursor.delete();
          deletedCount++;
          cacheStats.value.evictions++;
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            console.log(
              `🗑️ Evictadas ${deletedCount} texturas del caché (límite alcanzado)`
            );
            updateCacheSize();
          }
        }
      };
    } catch (error) {
      console.warn("Error evicting oldest textures:", error);
    }
  };

  // Guardar textura en caché (nuevo formato ImageData)
  const setCachedTexture = async (url, imageBlob) => {
    if (!textureDB) await initDB();

    try {
      // Verificar si necesitamos hacer espacio
      if (cacheStats.value.dbSize >= maxCacheSize) {
        console.log(
          `📊 Caché lleno (${cacheStats.value.dbSize}/${maxCacheSize}), evictando texturas antiguas...`
        );
        await evictOldestTextures();
      }

      // Convertir blob a ImageData para almacenamiento síncrono
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = (e) => {
          console.error(`❌ Error loading image for caching: ${url}`, e);
          reject(e);
        };
        img.src = URL.createObjectURL(imageBlob);
      });

      const imageData = imageToImageData(img);
      URL.revokeObjectURL(img.src);

      const transaction = textureDB.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const textureData = {
        url: url,
        imageData: imageData,
        width: img.width,
        height: img.height,
        timestamp: Date.now(),
      };

      const putRequest = store.put(textureData);
      putRequest.onsuccess = () => {
        console.log(
          `✅ Textura guardada en caché: ${url} (${img.width}x${img.height})`
        );
        updateCacheSize();
      };
      putRequest.onerror = (e) => {
        console.error(`❌ Error guardando textura en caché: ${url}`, e);
      };
    } catch (error) {
      console.error(`❌ Error setting cached texture: ${url}`, error);
    }
  };

  // 🚀 Nuevo helper: guardar textura usando una Image ya decodificada (evita doble decode)
  const setCachedTextureFromImage = async (url, img) => {
    if (!textureDB) await initDB();
    try {
      if (cacheStats.value.dbSize >= maxCacheSize) {
        await evictOldestTextures();
      }
      const imageData = imageToImageData(img);
      const transaction = textureDB.transaction([STORE_NAME], "readwrite");
      transaction.objectStore(STORE_NAME).put({
        url,
        imageData,
        width: img.width,
        height: img.height,
        timestamp: Date.now(),
      });
      updateCacheSize();
    } catch (e) {
      console.warn("Error setCachedTextureFromImage:", url, e);
    }
  };

  // Cargar textura con caché (función principal)
  const loadTexture = async (url) => {
    // Intentar obtener de caché primero
    console.log("🔍 loadTexture: Intentando obtener de caché:", url);
    let texture = await getCachedTexture(url);
    if (texture) return texture;

    console.log("❌ loadTexture: No encontrado en caché, descargando:", url);
    try {
      const response = await fetch(url, { mode: "cors", credentials: "omit" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      // Guardar usando la misma Image (sin doble decode)
      setCachedTextureFromImage(url, img);
      URL.revokeObjectURL(img.src);
      return texture;
    } catch (error) {
      console.warn("Error loading texture:", url, error);
      throw error;
    }
  };

  // Limpiar caché completo (función de mantenimiento)
  const clearCache = async () => {
    if (!textureDB) return;

    try {
      const transaction = textureDB.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.clear();

      cacheStats.value.dbSize = 0;
      cacheStats.value.hits = 0;
      cacheStats.value.misses = 0;
      cacheStats.value.evictions = 0;

      console.log("Caché de texturas limpiado completamente");
    } catch (error) {
      console.warn("Error clearing cache:", error);
    }
  };

  // Obtener información del caché
  const getCacheInfo = async () => {
    if (!textureDB) return null;

    try {
      const transaction = textureDB.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const entries = request.result;

          // Calcular tamaño estimado basado en ImageData
          const totalSize = entries.reduce((sum, entry) => {
            if (entry.imageData && entry.width && entry.height) {
              // ImageData: 4 bytes por píxel (RGBA)
              return sum + entry.width * entry.height * 4;
            } else if (entry.imageBlob) {
              // Formato legacy
              return sum + entry.imageBlob.size;
            }
            return sum;
          }, 0);

          resolve({
            count: entries.length,
            totalSizeBytes: totalSize,
            totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
            oldestEntry:
              entries.length > 0
                ? Math.min(...entries.map((e) => e.timestamp))
                : null,
            newestEntry:
              entries.length > 0
                ? Math.max(...entries.map((e) => e.timestamp))
                : null,
            // Info adicional de formato
            formatBreakdown: {
              imageData: entries.filter((e) => e.imageData).length,
              legacy: entries.filter((e) => e.imageBlob).length,
            },
          });
        };
      });
    } catch (error) {
      console.warn("Error getting cache info:", error);
      return null;
    }
  };

  // Inicializar al usar el composable
  const initialize = async () => {
    try {
      await initDB();
      // Limpiar texturas expiradas en background
      setTimeout(() => cleanExpiredTextures(), 1000);
    } catch (error) {
      console.error("Error initializing texture cache:", error);
    }
  };

  return {
    // Estado reactivo
    cacheStats,

    // Funciones principales
    loadTexture,
    setCachedTextureFromImage, // export helper por si se usa externamente
    initialize,

    // Funciones de verificación y acceso
    isTextureCached,
    getCachedTexture,
    getCachedTextureSync, // ✨ Nueva función síncrona
    loadMultipleCachedTextures, // 🚀 Nueva función múltiple

    // Funciones de mantenimiento
    cleanExpiredTextures,
    clearCache,
    getCacheInfo,

    // Configuración
    maxCacheSize,
    expiryDays,
  };
}
