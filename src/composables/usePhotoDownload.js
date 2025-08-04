// composables/usePhotoDownload.js
import { ref } from "vue";
import { api } from "@/utils/axios.js";
import { useMessage } from "naive-ui";

export function usePhotoDownload() {
  const message = useMessage();
  const isDownloading = ref(false);
  const downloadProgress = ref(0);

  // Download a single photo (now uses POST with 'urls' array in body)
  const downloadPhoto = async (photo) => {
    if (!photo) return;

    const url = photo.originalUrl || photo.url;
    const filename =
      photo.filename || photo.name || `photo-${photo.id || Date.now()}.jpg`;

    try {
      const apiUrl = `/download-photo`;
      const response = await api.post(
        apiUrl,
        { urls: [url] },
        { responseType: "blob" }
      );
      const blob = response.data;

      // Create a temporary link to download the file
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      message.success("Download completed");
    } catch (error) {
      message.error("Failed to download photo");
      console.error("Download photo failed:", error);
      throw error;
    }
  };

  // Download multiple photos as a zip
  const downloadPhotosZip = async (photos) => {
    if (!photos || photos.length === 0) return;
    isDownloading.value = true;
    try {
      const urls = photos
        .map((photo) => photo.originalUrl || photo.url)
        .filter(Boolean);
      if (urls.length === 0) throw new Error("No valid photo URLs");
      const apiUrl = `/download-photo`;
      const response = await api.post(
        apiUrl,
        { urls },
        { responseType: "blob" }
      );
      const blob = response.data;
      // Create a temporary link to download the zip file
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `photos-${Date.now()}.zip`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      message.success("Download ZIP completed");
    } catch (error) {
      message.error("Failed to download ZIP");
      console.error("Download ZIP failed:", error);
    } finally {
      isDownloading.value = false;
    }
  };

  return {
    downloadPhoto,
    downloadPhotosZip,
    isDownloading,
  };
}
