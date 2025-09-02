import { ref } from "vue";
import { useMessage } from "naive-ui";
import { api } from "@/utils/axios.js";
import JSZip from "jszip";

export function useFramedPhotoDownload() {
  const message = useMessage();
  const isDownloading = ref(false);

  // Create a framed photo canvas from a downloaded image blob
  const createFramedPhotoCanvas = async (imageBlob, frameConfig) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Parse aspect ratio
          const [widthRatio, heightRatio] = frameConfig.aspectRatio
            .split("/")
            .map(Number);
          const aspectRatio = widthRatio / heightRatio;

          // Calculate dimensions - use high resolution for better quality
          const baseWidth = 1200;
          let canvasWidth, canvasHeight;

          if (aspectRatio >= 1) {
            // Landscape or square
            canvasWidth = baseWidth;
            canvasHeight = baseWidth / aspectRatio;
          } else {
            // Portrait
            canvasHeight = baseWidth;
            canvasWidth = baseWidth * aspectRatio;
          }

          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          // Fill frame background
          ctx.fillStyle = frameConfig.frameColor || "#ffffff";
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Calculate photo area (with margin)
          const marginPx = frameConfig.margin || 20;
          const photoX = marginPx;
          const photoY = marginPx;
          const photoWidth = canvasWidth - marginPx * 2;
          const photoHeight = canvasHeight - marginPx * 2;

          // Calculate how to fit the image in the photo area
          const imgAspectRatio = img.width / img.height;
          const photoAspectRatio = photoWidth / photoHeight;

          let drawWidth, drawHeight, drawX, drawY;

          if (imgAspectRatio > photoAspectRatio) {
            // Image is wider than photo area - fit by width
            drawWidth = photoWidth;
            drawHeight = photoWidth / imgAspectRatio;
            drawX = photoX;
            drawY = photoY + (photoHeight - drawHeight) / 2;
          } else {
            // Image is taller than photo area - fit by height
            drawHeight = photoHeight;
            drawWidth = photoHeight * imgAspectRatio;
            drawX = photoX + (photoWidth - drawWidth) / 2;
            drawY = photoY;
          }

          // Draw the image
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

          // Clean up the blob URL
          URL.revokeObjectURL(img.src);

          resolve(canvas);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      // Create object URL from blob
      const imageUrl = URL.createObjectURL(imageBlob);
      img.src = imageUrl;
    });
  };

  // Download single framed photo
  const downloadFramedPhoto = async (
    photo,
    frameConfig,
    isPlayground = false
  ) => {
    if (!photo || !frameConfig) return;

    isDownloading.value = true;

    try {
      let originalImageBlob;

      if (isPlayground) {
        // In playground mode, use the local file blob directly
        originalImageBlob = photo.file; // This is the resized blob from PlaygroundPhotosDialog
      } else {
        // In authenticated mode, download from API
        const apiUrl = `/download-photo`;
        const response = await api.post(
          apiUrl,
          { ids: [photo.id] },
          { responseType: "blob" }
        );
        originalImageBlob = response.data;
      }

      // Create framed version
      const canvas = await createFramedPhotoCanvas(
        originalImageBlob,
        frameConfig
      );

      // Convert canvas to blob
      const framedBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      // Create download link for framed photo
      const blobUrl = URL.createObjectURL(framedBlob);
      const link = document.createElement("a");
      link.href = blobUrl;

      // Generate filename
      const originalName = isPlayground
        ? photo.name || `photo-${photo.id}`
        : photo.originalFileName || photo.file_name || `photo-${photo.id}`;
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
      const frameRatio =
        frameConfig.ratio || frameConfig.aspectRatio.replace("/", "-");
      link.download = `${nameWithoutExt}_framed_${frameRatio}.jpg`;

      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      message.success("Framed photo downloaded successfully");
    } catch (error) {
      console.error("Error downloading framed photo:", error);
      message.error("Failed to download framed photo");
    } finally {
      isDownloading.value = false;
    }
  };

  // Download multiple framed photos as ZIP
  const downloadFramedPhotosZip = async (
    photos,
    frameConfig,
    isPlayground = false
  ) => {
    if (!photos || photos.length === 0 || !frameConfig) return;

    isDownloading.value = true;

    try {
      const zip = new JSZip();

      // Process photos in batches to avoid overwhelming the API (or process all at once in playground)
      const batchSize = isPlayground ? photos.length : 5; // No need to batch local files
      for (let i = 0; i < photos.length; i += batchSize) {
        const batch = photos.slice(i, i + batchSize);
        const batchPromises = [];

        for (const photo of batch) {
          const promise = (async () => {
            try {
              let originalImageBlob;

              if (isPlayground) {
                // In playground mode, use the local file blob directly
                originalImageBlob = photo.file; // This is the resized blob from PlaygroundPhotosDialog
              } else {
                // In authenticated mode, download from API
                const apiUrl = `/download-photo`;
                const response = await api.post(
                  apiUrl,
                  { ids: [photo.id] },
                  { responseType: "blob" }
                );
                originalImageBlob = response.data;
              }

              // Create framed version
              const canvas = await createFramedPhotoCanvas(
                originalImageBlob,
                frameConfig
              );

              // Convert to blob
              const framedBlob = await new Promise((resolve) => {
                canvas.toBlob(resolve, "image/jpeg", 0.9);
              });

              // Add to ZIP
              const originalName = isPlayground
                ? photo.name || `photo-${photo.id}`
                : photo.originalFileName ||
                  photo.file_name ||
                  `photo-${photo.id}`;
              const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
              const frameRatio =
                frameConfig.ratio || frameConfig.aspectRatio.replace("/", "-");
              const filename = `${nameWithoutExt}_framed_${frameRatio}.jpg`;

              zip.file(filename, framedBlob);
            } catch (error) {
              console.error(`Error processing photo ${photo.id}:`, error);
              // Continue with other photos even if one fails
            }
          })();

          batchPromises.push(promise);
        }

        // Wait for current batch to complete
        await Promise.all(batchPromises);
      }

      // Generate ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download ZIP
      const blobUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `framed_photos_${
        frameConfig.ratio || "custom"
      }_${Date.now()}.zip`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      message.success(`Successfully downloaded ${photos.length} framed photos`);
    } catch (error) {
      console.error("Error downloading framed photos ZIP:", error);
      message.error("Failed to download framed photos ZIP");
    } finally {
      isDownloading.value = false;
    }
  };

  return {
    downloadFramedPhoto,
    downloadFramedPhotosZip,
    isDownloading,
  };
}
