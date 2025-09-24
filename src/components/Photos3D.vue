<template>
  <div class="photos-3d-container" ref="containerRef">
    <!-- Simple Canvas Implementation -->
    <TresCanvas v-bind="gl">
      <TresPerspectiveCamera :position="[0, 0, 50]" />

      <!-- Basic scene setup -->
      <primitive :object="ambientLight" />
      <primitive :object="directionalLight" />

      <!-- Photo planes -->
      <template v-for="(photo, index) in photoPositions" :key="photo.id">
        <TresMesh :position="photo.position" :rotation="photo.rotation">
          <primitive :object="planeGeometry" />
          <primitive :object="photo.material" v-if="photo.material" />
        </TresMesh>
      </template>

      <!-- Grid -->
      <primitive :object="gridHelper" />

      <!-- Controls -->
      <OrbitControls />
    </TresCanvas>

    <!-- UI Overlay -->
    <div class="ui-overlay">
      <div class="info-panel">
        <h3>Vista 3D de Fotos</h3>
        <p>Fotos cargadas: {{ photos.length }}</p>
        <p>Navegación con ratón:</p>
        <ul>
          <li>Arrastrar: Rotar</li>
          <li>Rueda: Zoom</li>
          <li>Click derecho: Mover</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import { usePhotosStore } from "@/stores/photos.js";
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
const createPhotoMaterial = (photo) => {
  const imageUrl = photo.thumbnailUrl || photo.url || photo.originalUrl;

  if (!imageUrl) {
    // Fallback material if no image URL
    return new THREE.MeshLambertMaterial({
      color: 0x666666,
      side: THREE.DoubleSide,
    });
  }

  const texture = textureLoader.load(
    imageUrl,
    // onLoad
    (texture) => {
      // Texture loaded successfully
      texture.colorSpace = THREE.SRGBColorSpace;
    },
    // onProgress
    undefined,
    // onError
    (error) => {
      console.error("Error loading texture for photo:", photo.id, error);
    }
  );

  return new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
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
const photoPositions = computed(() => {
  return photos.value.map((photo, index) => {
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
      material: createPhotoMaterial(photo),
    };
  });
});

// Lifecycle
onMounted(async () => {
  await photosStore.getOrFetch(false);
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
</style>
