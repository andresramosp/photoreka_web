// stores/photos.js

// Umbral mínimo de fotos requeridas para desbloquear funcionalidades
export const MIN_PHOTOS_THRESHOLD = 100;

import { defineStore } from "pinia";
import { api } from "@/utils/axios";

export const usePhotosStore = defineStore("photos", {
  // Exponer el umbral como propiedad estática
  state: () => ({
    photos: [],
    isLoading: false,
    selectedPhotosRecord: {},
    catalogSingleView: false, // Nuevo modo single view
    showUploadProgress: false, // Controla si se muestra el progreso de subida especial
  }),

  getters: {
    // Getter para selección global - solo para PhotoHub (PhotosCatalog y PhotosUpload)
    selectedPhotoIds: (state) =>
      Object.keys(state.selectedPhotosRecord)
        .filter((photoId) => !!state.selectedPhotosRecord[photoId])
        .map(Number),

    lightboxPhotos: (state) =>
      state.photos.filter(
        (p) =>
          p.status == "uploaded" ||
          p.status == "preprocessing" ||
          p.status == "preprocessed"
        // p.status == "processing"
      ),

    workspacePhotos: (state) =>
      state.photos.filter(
        (p) => p.status == "processing" || p.status == "processed"
      ),

    uploadedPhotos: (state) =>
      state.photos.filter((p) => p.status == "uploaded"),

    preProcessingPhotos: (state) =>
      state.photos.filter((p) => p.status == "preprocessing"),

    preprocessedPhotos: (state) =>
      state.photos.filter((p) => p.status == "preprocessed"),

    processingPhotos: (state) =>
      state.photos.filter((p) => p.status == "processing"),

    processedPhotos: (state) =>
      state.photos.filter((p) => p.status == "processed"),

    // Todas las fotos que son preprocesadas o procesadas
    allPhotos: (state) => state.photos,

    appAccessMode: (state) => {
      // Count processed photos
      const processedCount = state.photos.filter(
        (photo) => photo.status === "processed"
      ).length;

      // App is unlocked when user has 100+ processed photos
      if (processedCount >= MIN_PHOTOS_THRESHOLD) {
        return "full";
      }

      // Otherwise blocked (eliminates partial state)
      return "blocked";
    },

    // New getter: determines if process button should be enabled/disabled
    processButtonState: (state) => {
      const processedCount = state.photos.filter(
        (photo) => photo.status === "processed"
      ).length;
      const preprocessedCount = state.photos.filter(
        (photo) => photo.status === "preprocessed"
      ).length;
      const processingCount = state.photos.filter(
        (photo) => photo.status === "processing"
      ).length;

      // If there are photos currently processing, show processing state
      if (processingCount > 0) {
        return "processing";
      }

      // If app is already unlocked (≥100 processed photos), always enabled

      if (processedCount >= MIN_PHOTOS_THRESHOLD) {
        return "enabled";
      }

      // If app is still locked, need threshold preprocessed photos to enable button
      if (preprocessedCount >= MIN_PHOTOS_THRESHOLD) {
        return "enabled";
      }

      return "disabled";
    },

    // New getter: progress toward unlocking process button (0-100%)
    processButtonProgress: (state) => {
      const processedCount = state.photos.filter(
        (photo) => photo.status === "processed"
      ).length;

      // If app is already unlocked, always 100% progress
      if (processedCount >= MIN_PHOTOS_THRESHOLD) {
        return 100;
      }

      // Calculate progress based on preprocessed + processed photos toward threshold
      const preprocessedCount = state.photos.filter(
        (photo) => photo.status === "preprocessed"
      ).length;

      const totalProgressPhotos = preprocessedCount + processedCount;

      return Math.min((totalProgressPhotos / MIN_PHOTOS_THRESHOLD) * 100, 100);
    },
  },

  actions: {
    async getOrFetch(force) {
      if (force || (this.photos.length === 0 && !this.isLoading)) {
        this.isLoading = true;
        try {
          const response = await api.get(`/api/catalog`);

          const photos = response.data.photos.map((photo) => ({
            ...photo,
            isDuplicate: false,
          }));

          this.photos = photos.map((photo) => ({ ...photo }));
        } catch (error) {
          console.warn("API not available, using mock data:", error.message);
        } finally {
          this.isLoading = false;
        }
      }
      return this.photos;
    },

    addPhotos(newPhotos) {
      const newPhotoIds = newPhotos.map((p) => p.id);
      this.photos = [
        ...this.photos.filter((p) => !newPhotoIds.includes(p.id)),
        ...newPhotos.map((photo) => ({ ...photo })),
      ];
    },

    updatePhoto(photoId, delta) {
      const photo = this.photos.find((p) => p.id === photoId);
      if (photo) {
        Object.assign(photo, delta);
      }
    },

    async fetchPhoto(photoId) {
      try {
        const { data: photo } = await api.get(`/api/catalog/${photoId}`);
        const updatedPhoto = photo;
        const index = this.photos.findIndex((p) => p.id == photoId);
        if (index !== -1) {
          this.photos[index] = { ...this.photos[index], ...updatedPhoto };
        } else {
          this.photos.push(updatedPhoto);
        }
        return updatedPhoto;
      } catch (error) {
        console.warn("API not available for fetchPhoto:", error.message);
        // Mock behavior - just return existing photo
      }
    },

    async deletePhotos(photoIds) {
      try {
        await api.post(`/api/catalog/delete`, { ids: photoIds });
        photoIds.forEach((id) => {
          delete this.selectedPhotosRecord[id];
        });
        this.photos = this.photos.filter(
          (photo) => !photoIds.includes(photo.id)
        );
      } catch (error) {
        console.warn(
          "API not available for deletePhotos, using local delete:",
          error.message
        );
      }
    },

    async deleteDuplicates(photosIds) {
      try {
        const res = await api.post(`/api/catalog/deleteDuplicates`, {
          duplicates: photosIds,
        });

        const { deleted } = res.data;

        // Elimina las fotos borradas del store
        this.photos = this.photos.filter((p) => !deleted.includes(p.id));
      } catch (error) {
        console.warn(
          "API not available for deleteDuplicates, using local delete:",
          error.message
        );
        // Fallback: delete locally
        this.photos = this.photos.filter((p) => !photosIds.includes(p.id));
      }
    },

    async checkDuplicates(photoIds = null) {
      try {
        const payload = photoIds ? { newPhotoIds: photoIds } : {};
        const res = await api.post("/api/catalog/checkDuplicates", payload);
        const duplicatesMap = res.data;

        for (const photo of this.photos) {
          if (!photoIds || photoIds.includes(photo.id)) {
            const duplicates = duplicatesMap[photo.id] || [];
            this.updatePhoto(photo.id, {
              duplicates,
              isDuplicate: duplicates.length > 0,
            });
          }
        }

        return duplicatesMap;
      } catch (error) {
        console.warn("API not available for checkDuplicates:", error.message);
        // Return empty duplicates map as fallback
        return {};
      }
    },

    // Acciones de selección global - solo para PhotoHub (PhotosCatalog y PhotosUpload)
    togglePhotoSelection(photoId) {
      this.selectedPhotosRecord[photoId] = !this.selectedPhotosRecord[photoId];
    },

    selectAllPhotos(photoIds) {
      photoIds.forEach((photoId) => {
        this.selectedPhotosRecord[photoId] = true;
      });
    },

    deselectAllPhotos(photoIds) {
      photoIds.forEach((photoId) => {
        this.selectedPhotosRecord[photoId] = false;
      });
    },

    clearAllSelections() {
      this.selectedPhotosRecord = {};
    },
  },
});
