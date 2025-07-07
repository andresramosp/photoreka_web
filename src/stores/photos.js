// stores/photos.js
import { defineStore } from "pinia";
import axios from "axios";

export const usePhotosStore = defineStore("photos", {
  state: () => ({
    photos: [],
    isLoading: false,
    selectedPhotosRecord: {},
  }),

  getters: {
    selectedPhotoIds: (state) =>
      Object.keys(state.selectedPhotosRecord)
        .filter((photoId) => !!state.selectedPhotosRecord[photoId])
        .map(Number),

    uploadedPhotos: (state) =>
      state.photos.filter((p) => p.status == "uploaded"),

    processingPhotos: (state) =>
      state.photos.filter((p) => p.status == "processing"),

    catalogPhotos: (state) =>
      state.photos.filter((p) => p.status == "processed"),

    canUseApp: (state) => {
      // Hardcoded to false for testing purposes
      return false;

      // Real logic: return true if has at least 50 photos without .needProcess
      // const processedPhotos = state.photos.filter(photo => !photo.needProcess);
      // return processedPhotos.length >= 50;
    },
  },

  actions: {
    async getOrFetch(force) {
      if (force || (this.photos.length === 0 && !this.isLoading)) {
        this.isLoading = true;
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/catalog`
          );

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
        const { data: photo } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/catalog/${photoId}`
        );
        const updatedPhoto = photo;
        const index = this.photos.findIndex((p) => p.id == photoId);
        if (index !== -1) {
          this.photos[index] = { ...this.photos[index], ...updatedPhoto };
        } else {
          this.photos.push(updatedPhoto);
        }
        debugger;
        return updatedPhoto;
      } catch (error) {
        console.warn("API not available for fetchPhoto:", error.message);
        // Mock behavior - just return existing photo
      }
    },

    async deletePhotos(photoIds) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/catalog/delete`,
          { ids: photoIds }
        );
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
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/catalog/deleteDuplicates`,
          { duplicates: photosIds }
        );

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
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/catalog/checkDuplicates`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) throw new Error("Error al consultar duplicados");
        const duplicatesMap = await res.json();

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
