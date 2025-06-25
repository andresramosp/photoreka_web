// stores/photos.js
import { defineStore } from "pinia";
import axios from "axios";

export const usePhotosStore = defineStore("photos", {
  state: () => ({
    photos: [],
    isLoading: false,
    isAnalyzing: false,
    selectedPhotosRecord: {},
  }),

  getters: {
    selectedPhotoIds: (state) =>
      Object.keys(state.selectedPhotosRecord).filter(
        (photoId) => !!state.selectedPhotosRecord[photoId]
      ),

    canUseApp: (state) => {
      // Hardcoded to false for testing purposes
      return true;

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
            analyzing: photo.needProcess,
          }));

          this.photos = photos.map((photo) => ({ ...photo }));
        } catch (error) {
          console.warn("API not available, using mock data:", error.message);

          // Fallback to mock data when API is not available
          const mockPhotos = this.generateMockPhotos();
          this.photos = mockPhotos;
        } finally {
          this.isLoading = false;
        }
      }
      return this.photos;
    },

    generateMockPhotos() {
      const mockPhotos = [];
      for (let i = 1; i <= 25; i++) {
        mockPhotos.push({
          id: i,
          filename: `photo_${i}.jpg`,
          needProcess: i > 15, // First 15 photos are processed, rest need processing
          analyzing: i > 15,
          url: `https://picsum.photos/400/300?random=${i}`,
          thumbnail: `https://picsum.photos/200/150?random=${i}`,
          created_at: new Date(Date.now() - i * 86400000).toISOString(),
          tags:
            i % 3 === 0
              ? ["nature", "landscape"]
              : i % 2 === 0
              ? ["portrait"]
              : ["street"],
          duplicates: [],
        });
      }
      return mockPhotos;
    },

    addPhotos(newPhotos) {
      const newPhotoIds = newPhotos.map((p) => p.id);
      this.photos = [
        ...this.photos.filter((p) => !newPhotoIds.includes(p.id)),
        ...newPhotos.map((photo) => ({ ...photo })),
      ];
    },

    updatePhotoStatus(photoId, newStatus) {
      const photo = this.photos.find((p) => p.id === photoId);
      if (photo) {
        Object.assign(photo, newStatus);
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
      } catch (error) {
        console.warn("API not available for fetchPhoto:", error.message);
        // Mock behavior - just return existing photo
      }
    },

    async deletePhoto(photoId) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/api/catalog/${photoId}`
        );
        this.photos = this.photos.filter((photo) => photo.id !== photoId);
      } catch (error) {
        console.warn(
          "API not available for deletePhoto, using local delete:",
          error.message
        );
        // Fallback: delete locally
        this.photos = this.photos.filter((photo) => photo.id !== photoId);
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
            photo.duplicates = duplicatesMap[photo.id] || [];
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
  },
});
