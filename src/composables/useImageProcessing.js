// composables/useImageProcessing.js
import { ref } from "vue";
import pica from "pica";

export function useImageProcessing() {
  const picaInstance = pica();

  async function resizeImage(file, targetWidth, maxSizeBytes = 512000) {
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

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
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
            "Content-Length": blob.size.toString(),
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
    resizeImage,
    loadImage,
    uploadToR2WithRetry,
  };
}
