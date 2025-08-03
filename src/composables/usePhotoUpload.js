// composables/usePhotoUpload.js
import { ref, computed } from "vue";
import { usePhotosStore } from "@/stores/photos.js";
import { useImageProcessing } from "./useImageProcessing.js";
import { api_analyzer, api } from "@/utils/axios";
import { useMessage } from "naive-ui";
import pLimit from "p-limit";

export function usePhotoUpload() {
  const photosStore = usePhotosStore();
  const { resizeImage, uploadToR2WithRetry } = useImageProcessing();
  const message = useMessage();
  const limit = pLimit(10);

  // Estado compartido de upload
  const isUploading = ref(false);
  const uploadedCount = ref(0);
  const totalFiles = ref(0);
  const pendingPhotos = ref([]); // Array temporal para fotos subidas pero no mostradas

  const overallProgress = computed(() => {
    if (totalFiles.value === 0) return 0;
    return (uploadedCount.value / totalFiles.value) * 100;
  });

  // Función principal para procesar cualquier tipo de fuente de foto
  async function processPhotoSource(
    source,
    type = "local",
    originalName = null
  ) {
    let file;
    let fileName;

    if (type === "google") {
      // Para Google Photos, source es { url, token, name }
      // file = await downloadGooglePhoto(source.url, source.token);
      // fileName = source.name;
    } else {
      // Para archivos locales, source es un File object
      file = source;
      fileName = file.name;
    }

    // A partir de aquí, flujo idéntico para ambos tipos
    const [resizedBlob, thumbnailBlob] = await Promise.all([
      resizeImage(file, 1500, 512000),
      resizeImage(file, 800),
    ]);

    // Llamar al endpoint unificado
    const endpoint = "/api/catalog/uploadPhoto";
    const payload = {
      fileType: resizedBlob.type,
      originalName: fileName,
      source: type === "google" ? "google" : "local",
    };

    const response = await api.post(endpoint, payload);
    const { uploadUrl, thumbnailUploadUrl, photo } = response.data;

    // Subir ambas imágenes con manejo de errores y retry
    const uploadResults = await Promise.allSettled([
      uploadToR2WithRetry(uploadUrl, resizedBlob, fileName, "main"),
      uploadToR2WithRetry(
        thumbnailUploadUrl,
        thumbnailBlob,
        fileName,
        "thumbnail"
      ),
    ]);

    // Verificar que ambas subidas fueron exitosas
    const failedUploads = uploadResults.filter(
      (result) => result.status === "rejected"
    );
    if (failedUploads.length > 0) {
      console.error(`❌ Failed uploads for ${fileName}:`, failedUploads);
      throw new Error(
        `Failed to upload ${failedUploads.length} of 2 files for ${fileName}`
      );
    }

    photo.status = "uploaded";
    photo.isDuplicate = false;

    if (photosStore.showUploadProgress === false) {
      pendingPhotos.value.push(photo);
    } else {
      photosStore.photos.unshift(photo);
    }

    uploadedCount.value++;
    return photo;
  }

  // Flujo común de post-procesamiento
  async function handlePostUpload(photosToUpload) {
    // Solo proceder si tenemos fotos exitosas
    if (photosToUpload.length === 0) {
      message.error("No photos were uploaded successfully.");
      return false;
    }

    // Añadir fotos pendientes al store si es necesario
    if (photosStore.showUploadProgress === false) {
      pendingPhotos.value.forEach((photo) => {
        photosStore.photos.unshift(photo);
      });
      pendingPhotos.value = [];
    }

    // Set photos to checking duplicates state
    const photoIds = photosToUpload.map((p) => p.id);
    photoIds.forEach((id) => {
      photosStore.updatePhoto(id, { isCheckingDuplicates: true });
    });

    // Check duplicates and restore normal state
    try {
      await api_analyzer.post(`/api/analyzer`, {
        packageId: "preprocess",
        mode: "adding",
      });
    } catch (error) {
      // Si falla la llamada, borrar las fotos y mostrar notificación
      await photosStore.deletePhotos(photoIds);
      message.error(
        "There was an error processing the photos. Please try again later."
      );
      return false;
    }

    await photosStore.checkDuplicates(photoIds);

    // Remove checking duplicates flag
    photoIds.forEach((id) => {
      photosStore.updatePhoto(id, {
        isCheckingDuplicates: false,
        status: "preprocessed",
      });
    });

    return true;
  }

  // Función principal para manejar el upload con progreso y errores
  async function handleUploadFlow(sources, type = "local") {
    if (sources.length === 0) return;

    isUploading.value = true;
    totalFiles.value = sources.length;
    uploadedCount.value = 0;

    const photosToUpload = [];
    const failedUploads = [];

    try {
      // Ambos tipos usan el mismo flujo individual con pLimit
      const uploadPromises = sources.map((source) =>
        limit(() =>
          processPhotoSource(source, type)
            .then((photo) => {
              if (photo) photosToUpload.push(photo);
            })
            .catch((error) => {
              const fileName = type === "google" ? source.name : source.name;
              console.error(`❌ Failed to upload ${fileName}:`, error);
              failedUploads.push({ file: fileName, error: error.message });
              uploadedCount.value++;
            })
        )
      );

      await Promise.all(uploadPromises);

      // Mostrar resumen de la subida
      if (failedUploads.length > 0) {
        console.warn(
          `⚠️ Upload completed with ${failedUploads.length} failures:`,
          failedUploads
        );
        message.warning(
          `${photosToUpload.length} photos uploaded successfully. ${failedUploads.length} photos failed to upload.`
        );
      } else {
        console.log(
          `✅ All ${photosToUpload.length} photos uploaded successfully`
        );
      }

      // Post-procesamiento común
      await handlePostUpload(photosToUpload);
    } catch (error) {
      console.error("❌ Error en la subida:", error);
      message.error("An unexpected error occurred during upload.");
    } finally {
      isUploading.value = false;
    }
  }

  return {
    // Estado
    isUploading,
    uploadedCount,
    totalFiles,
    overallProgress,

    // Funciones
    handleUploadFlow,
    processPhotoSource,
    handlePostUpload,
  };
}
