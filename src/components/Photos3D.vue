<template>
  <div class="photos-3d-container" ref="containerRef">
    <!-- Simple Canvas Implementation -->
    <TresCanvas v-bind="gl">
      <TresPerspectiveCamera :position="[0, 0, 50]" />

      <!-- Basic scene setup -->
      <primitive :object="ambientLight" />
      <primitive :object="directionalLight" />

      <!-- Photo planes - solo mostrar cuando están cargadas -->
      <template
        v-if="!isLoadingTextures && !isInitializing"
        v-for="(photo, index) in photoPositions"
        :key="photo.id"
      >
        <TresMesh :position="photo.position" :rotation="photo.rotation">
          <primitive :object="planeGeometry" />
          <primitive :object="photo.material" v-if="photo.material" />
        </TresMesh>
      </template>

      <!-- Grid -->
      <primitive :object="gridHelper" />

      <!-- Controls -->
      <OrbitControls :zoom-speed="2" />
    </TresCanvas>

    <!-- UI Overlay -->
    <div class="ui-overlay">
      <div class="info-panel">
        <h3>Vista 3D de Fotos</h3>
        <p v-if="isInitializing">Preparando...</p>
        <p v-else-if="isLoadingTextures">
          Cargando texturas... {{ loadedCount }}/{{ totalPhotos }}
        </p>
        <p v-else-if="photos.length === 0">No hay fotos disponibles</p>
        <p v-else>
          Fotos cargadas: {{ photoPositions.length }}/{{ photos.length }}
        </p>
        <p>Navegación con ratón:</p>
        <ul>
          <li>Arrastrar: Rotar</li>
          <li>Rueda: Zoom</li>
          <li>Click derecho: Mover</li>
        </ul>
      </div>
    </div>

    <!-- Loading Screen -->
    <div v-if="isLoadingTextures || isInitializing" class="loading-screen">
      <div class="loading-content">
        <div class="spinner"></div>
        <h2 v-if="isInitializing">Preparando Vista 3D</h2>
        <h2 v-else>Cargando Vista 3D</h2>
        <p v-if="isInitializing">Obteniendo fotos...</p>
        <template v-else>
          <p>Preparando {{ totalPhotos }} fotos...</p>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <p class="progress-text">
            {{ loadedCount }}/{{ totalPhotos }} ({{
              Math.round(progressPercentage)
            }}%) <br />
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import { usePhotosStore } from "@/stores/photos.js";
import { loadTextureWithLimit } from "@/utils/rateLimiter.js";
import * as THREE from "three";

// Store
const photosStore = usePhotosStore();
const containerRef = ref();

// Canvas configuration
const gl = ref({
  clearColor: "#1a1a1a",
  antialias: true,
});

// Three.js objects
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);

const planeGeometry = new THREE.PlaneGeometry(4, 3);
const gridHelper = new THREE.GridHelper(100, 20);
gridHelper.position.y = -25;

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Function to create material for a photo
const createPhotoMaterial = async (photo) => {
  const imageUrl = photo.thumbnailUrl || photo.url || photo.originalUrl;

  if (!imageUrl) {
    // Fallback material if no image URL
    return new THREE.MeshLambertMaterial({
      color: 0x666666,
      side: THREE.DoubleSide,
    });
  }

  try {
    // Use rate limited texture loading
    const texture = await loadTextureWithLimit(textureLoader, imageUrl);

    return new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
  } catch (error) {
    console.error("Error loading texture for photo:", photo.id, error);
    // Return fallback material on error
    return new THREE.MeshLambertMaterial({
      color: 0x666666,
      side: THREE.DoubleSide,
    });
  }
};

// Get photos from store
const photos = computed(() => {
  return photosStore.allPhotos.filter(
    (photo) =>
      photo.status === "processed" ||
      photo.status === "preprocessed" ||
      photo.status === "uploaded"
  );
});

// Generate positions for photos
const photoPositions = ref([]);
const isLoadingTextures = ref(false);
const loadedCount = ref(0);
const totalPhotos = ref(0);
const isInitializing = ref(true); // Estado inicial para evitar mensaje fugaz

// Progress percentage
const progressPercentage = computed(() => {
  if (totalPhotos.value === 0) return 0;
  const percentage = (loadedCount.value / totalPhotos.value) * 100;
  console.log(
    `Progress: ${loadedCount.value}/${totalPhotos.value} = ${percentage}%`
  );
  return percentage;
});

// Function to load all photo materials with rate limiting
const loadPhotoMaterials = async () => {
  const photosValue = photos.value;
  isLoadingTextures.value = true;
  loadedCount.value = 0;
  totalPhotos.value = photosValue.length; // Fijar el total al inicio

  // Crear todas las posiciones primero
  const photoData = photosValue.map((photo, index) => {
    const seed = photo.id * 9301 + 49297;
    const random1 = (seed % 233280) / 233280;
    const random2 = ((seed * 2) % 233280) / 233280;
    const random3 = ((seed * 3) % 233280) / 233280;

    const radius = 20 + random1 * 30;
    const theta = random2 * Math.PI * 2;
    const phi = (random3 * 0.8 + 0.1) * Math.PI;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi) - 10;
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const rotationX = (random1 - 0.5) * 0.4;
    const rotationY = (random2 - 0.5) * 0.4;
    const rotationZ = (random3 - 0.5) * 0.2;

    return {
      ...photo,
      position: [x, y, z],
      rotation: [rotationX, rotationY, rotationZ],
    };
  });

  // Cargar materiales uno por uno para progreso coherente
  const positions = [];
  for (const photoInfo of photoData) {
    const material = await createPhotoMaterial(photoInfo);
    positions.push({
      ...photoInfo,
      material,
    });

    // Actualizar progreso después de cada textura cargada
    loadedCount.value = positions.length;
  }

  photoPositions.value = positions;
  isLoadingTextures.value = false;
};

// Lifecycle
onMounted(async () => {
  try {
    await photosStore.getOrFetch(false);

    // Solo cargar materiales si hay fotos
    if (photos.value.length > 0) {
      isInitializing.value = false;
      await loadPhotoMaterials();
    } else {
      // Si no hay fotos, terminar la inicialización
      isInitializing.value = false;
    }
  } catch (error) {
    console.error("Error initializing 3D view:", error);
    isInitializing.value = false;
  }
});
</script>

<style scoped>
.photos-3d-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.ui-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  pointer-events: none;
  z-index: 100;
}

.info-panel {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  pointer-events: auto;
  max-width: 250px;
}

.info-panel h3 {
  margin: 0 0 10px 0;
  font-size: 1.2em;
  color: #4ade80;
}

.info-panel p {
  margin: 5px 0;
  font-size: 0.9em;
  color: #e5e5e5;
}

.info-panel ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
  font-size: 0.8em;
  color: #ccc;
}

.info-panel li {
  margin: 2px 0;
}

/* Loading Screen */
.loading-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 40px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #4ade80;
  border-radius: 50%;
  margin: 0 auto 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-content h2 {
  margin: 0 0 15px 0;
  font-size: 1.5em;
  color: #4ade80;
  font-weight: 600;
}

.loading-content p {
  margin: 0 0 25px 0;
  color: #e5e5e5;
  font-size: 1em;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background: #4ade80;
  transition: none;
}

.progress-text {
  font-size: 0.9em;
  color: #ccc;
  margin: 0;
}
</style>
