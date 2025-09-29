<template>
  <div class="threed-view">
    <!-- Error state -->

    <!-- 3D Visualization -->
    <Photos3D class="photos-3d-component" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { usePhotosStore } from "@/stores/photos.js";
import Photos3D from "@/components/Photos3D.vue";

// Store and reactive data
const photosStore = usePhotosStore();
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
    error.value = null;
    await photosStore.getOrFetch(false);
  } catch (err) {
    error.value = err.message || "Error desconocido al cargar las fotos";
    console.error("Error loading photos for 3D view:", err);
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
