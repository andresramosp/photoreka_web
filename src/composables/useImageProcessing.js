// composables/useImageProcessing.js
//
// Este composable maneja el redimensionamiento de imágenes con fallback automático:
// 1. Intenta usar PICA para máxima calidad (algoritmos Lanczos/bicubic)
// 2. Si falla por protección de fingerprinting, usa step-down nativo de alta calidad
// 3. Maneja automáticamente la compresión para controlar el tamaño de archivo
//
import { ref } from "vue";
import pica from "pica";

export function useImageProcessing() {
  const picaInstance = pica();

  async function resizeImage(file, targetWidth, maxSizeBytes = 512000) {
    try {
      // Intentar usar pica primero para máxima calidad
      return await resizeWithPica(file, targetWidth, maxSizeBytes);
    } catch (error) {
      // Detectar errores específicos de protección de fingerprinting o canvas
      console.warn(
        "⚠️ Pica failed due to browser restrictions, using step-down fallback:",
        error.message
      );
      return await resizeWithStepDown(file, targetWidth, maxSizeBytes);
      // Re-lanzar otros errores
    }
  }

  // Función original con pica
  async function resizeWithPica(file, targetWidth, maxSizeBytes = 512000) {
    // 0.5MB = 512000 bytes
    const img = await loadImage(file);
    const canvas = document.createElement("canvas");
    const scale = targetWidth / img.width;
    canvas.width = targetWidth;
    canvas.height = img.height * scale;

    await picaInstance.resize(img, canvas);

    // Si maxSizeBytes es null, usar calidad fija como antes
    if (!maxSizeBytes) {
      const blob = await picaInstance.toBlob(canvas, "image/jpeg", 0.9);
      return blob;
    }

    // Compresión iterativa para no superar el tamaño máximo
    let quality = 0.9;
    let blob;
    let attempts = 0;
    const maxAttempts = 10;
    const qualityDecrement = 0.1;

    do {
      blob = await picaInstance.toBlob(canvas, "image/jpeg", quality);

      if (blob.size <= maxSizeBytes || attempts >= maxAttempts) {
        break;
      }

      quality = Math.max(0.1, quality - qualityDecrement);
      attempts++;
    } while (quality > 0.1);

    return blob;
  }

  // Fallback con step-down resize para alta calidad sin pica
  async function resizeWithStepDown(file, targetWidth, maxSizeBytes = 512000) {
    const img = await loadImage(file);
    const targetHeight = Math.round((img.height * targetWidth) / img.width);

    let currentCanvas = document.createElement("canvas");
    let currentCtx = currentCanvas.getContext("2d");

    // Configurar para máxima calidad
    currentCtx.imageSmoothingEnabled = true;
    currentCtx.imageSmoothingQuality = "high";

    let currentWidth = img.width;
    let currentHeight = img.height;

    // Dibujar imagen original en el canvas inicial
    currentCanvas.width = currentWidth;
    currentCanvas.height = currentHeight;
    currentCtx.drawImage(img, 0, 0);

    // Step-down: reducir en pasos del 50% hasta estar cerca del objetivo
    while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
      const stepWidth = Math.max(targetWidth, Math.floor(currentWidth * 0.5));
      const stepHeight = Math.max(
        targetHeight,
        Math.floor(currentHeight * 0.5)
      );

      const stepCanvas = document.createElement("canvas");
      const stepCtx = stepCanvas.getContext("2d");
      stepCanvas.width = stepWidth;
      stepCanvas.height = stepHeight;

      stepCtx.imageSmoothingEnabled = true;
      stepCtx.imageSmoothingQuality = "high";
      stepCtx.drawImage(currentCanvas, 0, 0, stepWidth, stepHeight);

      // Limpiar canvas anterior para liberar memoria
      currentCanvas.width = 1;
      currentCanvas.height = 1;

      currentCanvas = stepCanvas;
      currentCtx = stepCtx;
      currentWidth = stepWidth;
      currentHeight = stepHeight;
    }

    // Paso final al tamaño exacto objetivo
    const finalCanvas = document.createElement("canvas");
    const finalCtx = finalCanvas.getContext("2d");
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = "high";
    finalCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

    // Limpiar canvas intermedio
    currentCanvas.width = 1;
    currentCanvas.height = 1;

    // Manejar compresión con control de tamaño
    if (!maxSizeBytes) {
      return new Promise((resolve) => {
        finalCanvas.toBlob(resolve, "image/jpeg", 0.9);
      });
    }

    // Compresión iterativa para controlar el tamaño
    let quality = 0.9;
    let blob;
    let attempts = 0;
    const maxAttempts = 10;
    const qualityDecrement = 0.1;

    do {
      blob = await new Promise((resolve) => {
        finalCanvas.toBlob(resolve, "image/jpeg", quality);
      });

      if (blob.size <= maxSizeBytes || attempts >= maxAttempts) {
        break;
      }

      quality = Math.max(0.1, quality - qualityDecrement);
      attempts++;
    } while (quality > 0.1);

    return blob;
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      let blobUrl = null;

      img.onload = () => {
        // Limpiar el blob URL después de cargar para liberar memoria
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
        resolve(img);
      };

      img.onerror = (error) => {
        // Limpiar el blob URL en caso de error
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
        console.error("❌ Error loading image:", error);
        reject(new Error(`Failed to load image: ${file.name}`));
      };

      try {
        blobUrl = URL.createObjectURL(file);
        img.src = blobUrl;
      } catch (error) {
        console.error("❌ Error creating object URL:", error);
        reject(
          new Error(`Failed to create object URL for image: ${file.name}`)
        );
      }
    });
  }

  // Nueva función para subir a R2 con retry y validación
  async function uploadToR2WithRetry(
    url,
    blob,
    fileName,
    type,
    maxRetries = 3
  ) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `🔄 Uploading ${type} for ${fileName} (attempt ${attempt}/${maxRetries})`
        );

        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": blob.type,
            // Removido Content-Length: algunos navegadores (Safari iOS) no lo permiten
            // y puede causar errores. El navegador lo calcula automáticamente.
          },
          body: blob,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Verificar que la respuesta sea exitosa
        if (response.status >= 200 && response.status < 300) {
          console.log(`✅ Successfully uploaded ${type} for ${fileName}`);
          return response;
        } else {
          throw new Error(`Unexpected status code: ${response.status}`);
        }
      } catch (error) {
        console.error(
          `❌ Upload attempt ${attempt} failed for ${type} of ${fileName}:`,
          error
        );

        // Log específico para problemas de compatibilidad
        if (
          error.name === "TypeError" &&
          error.message.includes("Failed to fetch")
        ) {
          console.warn("🚨 Network/CORS issue detected");
        }

        if (attempt === maxRetries) {
          throw new Error(
            `Failed to upload ${type} for ${fileName} after ${maxRetries} attempts: ${error.message}`
          );
        }

        // Esperar antes del siguiente intento (backoff exponencial)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    resizeImage, // Función principal con fallback automático
    resizeWithPica, // Función específica con pica (para casos avanzados)
    resizeWithStepDown, // Función fallback de alta calidad
    loadImage,
    uploadToR2WithRetry,
  };
}
