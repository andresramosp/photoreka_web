<template>
  <div class="threed-view">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando fotos...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <h2>Error al cargar las fotos</h2>
        <p>{{ error }}</p>
        <button @click="retry" class="retry-btn">Reintentar</button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasPhotos" class="empty-state">
      <div class="empty-content">
        <h2>No hay fotos disponibles</h2>
        <p>Sube algunas fotos para ver la visualización 3D</p>
        <router-link to="/photo-hub" class="upload-link">
          Ir a subir fotos
        </router-link>
      </div>
    </div>

    <!-- 3D Visualization -->
    <Photos3D v-else class="photos-3d-component" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { usePhotosStore } from "@/stores/photos.js";
import Photos3D from "@/components/Photos3D.vue";

// Store and reactive data
const photosStore = usePhotosStore();
const isLoading = ref(false);
const error = ref(null);

// Computed properties
const hasPhotos = computed(() => {
  const photos = photosStore.allPhotos.filter(
    (photo) =>
      photo.status === "processed" ||
      photo.status === "preprocessed" ||
      photo.status === "uploaded"
  );
  return photos.length > 0;
});

// Methods
const retry = async () => {
  error.value = null;
  await loadPhotos();
};

const loadPhotos = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    await photosStore.getOrFetch(false);
  } catch (err) {
    error.value = err.message || "Error desconocido al cargar las fotos";
    console.error("Error loading photos for 3D view:", err);
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  await loadPhotos();
});
</script>

<style scoped>
.threed-view {
  width: 100%;
  height: 100vh;
  position: relative;
}

.photos-3d-component {
  width: 100%;
  height: 100%;
}

/* Loading state styles */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #4ade80;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-spinner p {
  font-size: 1.1em;
  color: #e5e5e5;
  margin: 0;
}

/* Error state styles */
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
}

.error-content {
  text-align: center;
  max-width: 400px;
  padding: 40px;
}

.error-content h2 {
  color: #ef4444;
  margin: 0 0 15px 0;
  font-size: 1.5em;
}

.error-content p {
  color: #e5e5e5;
  margin: 0 0 25px 0;
  line-height: 1.5;
}

.retry-btn {
  background: #4ade80;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.retry-btn:hover {
  background: #22c55e;
  transform: translateY(-1px);
}

.retry-btn:active {
  transform: translateY(0);
}

/* Empty state styles */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
}

.empty-content {
  text-align: center;
  max-width: 400px;
  padding: 40px;
}

.empty-content h2 {
  color: #fbbf24;
  margin: 0 0 15px 0;
  font-size: 1.5em;
}

.empty-content p {
  color: #e5e5e5;
  margin: 0 0 25px 0;
  line-height: 1.5;
}

.upload-link {
  display: inline-block;
  background: #4ade80;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1em;
  transition: background-color 0.2s, transform 0.1s;
}

.upload-link:hover {
  background: #22c55e;
  transform: translateY(-1px);
  text-decoration: none;
}

.upload-link:active {
  transform: translateY(0);
}
</style>
