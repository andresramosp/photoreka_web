<template>
  <div class="photos-3d-container" ref="containerRef">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-content">
        <div class="spinner"></div>
        <h2>Cargando visualización 3D</h2>
        <p>{{ loadingProgress }}% completado</p>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: loadingProgress + '%' }"
          ></div>
        </div>
        <p class="progress-text">
          Cargadas {{ totalLoadedPhotos }} fotos (página {{ loadedPages }}{{ pagination ? ` de ${pagination.totalPages}` : '' }})
        </p>
        <p class="chunk-info">Chunk: {{ getCurrentChunkLabel() }}</p>
      </div>
    </div>

    <!-- Error Screen -->
    <div v-else-if="error" class="error-screen">
      <div class="error-content">
        <h2>Error al cargar la visualización 3D</h2>
        <p>{{ error }}</p>
        <button @click="retryLoad" class="retry-btn">Reintentar</button>
      </div>
    </div>

    <!-- 3D Canvas -->
    <TresCanvas v-else-if="photos3D.length > 0" v-bind="gl" ref="canvasRef">
      <TresPerspectiveCamera
        ref="cameraRef"
        :position="[0, 0, 50]"
        :fov="75"
        :aspect="1"
        :near="0.1"
        :far="2000"
      />

      <!-- Lighting -->
      <primitive :object="lightsGroup" />

      <!-- Photo planes - renderizar solo fotos visibles -->
      <template
        v-for="(photo, index) in visiblePhotos"
        :key="photo.id"
      >
        <TresMesh
          :position="photo.position"
          :rotation="useBillboarding ? photo.billboardRotation : [0, 0, 0]"
        >
          <primitive :object="planeGeometry" />
          <primitive :object="photo.material" v-if="photo.material" />
        </TresMesh>
      </template>

      <!-- Grid helper -->
      <primitive :object="gridHelper" />
    </TresCanvas>

    <!-- UI Overlay -->
    <div class="ui-overlay" @click.stop @mousedown.stop>
      <div class="info-panel" @click.stop @mousedown.stop @wheel.stop>
        <h3>Visualización 3D</h3>
        
        <!-- Chunk selector -->
        <div class="chunk-selector">
          <h4>Tipo de embedding:</h4>
          <select 
            v-model="currentChunk" 
            @change="onChunkChange"
            class="chunk-select"
          >
            <option 
              v-for="option in chunkOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Stats -->
        <div class="stats-info">
          <p>Fotos cargadas: {{ photos3D.length }}</p>
          <p>Fotos visibles: {{ visiblePhotos.length }}</p>
          <p v-if="pagination">
            Total disponible: {{ pagination.total }}
          </p>
        </div>

        <!-- Billboarding Toggle -->
        <div class="billboard-toggle">
          <label class="toggle-label">
            <input
              type="checkbox"
              v-model="useBillboarding"
              @change="onBillboardingToggle"
            />
            <span class="checkbox-custom"></span>
            Billboarding (mirar cámara)
          </label>
          <p class="toggle-description">
            Las fotos siempre miran hacia la cámara
          </p>
        </div>

        <!-- Distance Opacity Toggle -->
        <div class="billboard-toggle">
          <label class="toggle-label">
            <input
              type="checkbox"
              v-model="useDistanceOpacity"
            />
            <span class="checkbox-custom"></span>
            Opacidad por distancia
          </label>
          <p class="toggle-description">
            Las fotos lejanas se ven más transparentes
          </p>
        </div>

        <!-- Current Position -->
        <div class="position-indicator">
          <h4>Posición actual:</h4>
          <div class="position-values">
            <div class="position-axis">
              <span class="axis-label">X:</span>
              <span class="axis-value">{{ currentPosition.x.toFixed(1) }}</span>
            </div>
            <div class="position-axis">
              <span class="axis-label">Y:</span>
              <span class="axis-value">{{ currentPosition.y.toFixed(1) }}</span>
            </div>
            <div class="position-axis">
              <span class="axis-label">Z:</span>
              <span class="axis-value">{{ currentPosition.z.toFixed(1) }}</span>
            </div>
          </div>
        </div>

        <!-- Controls Help -->
        <div class="controls-info">
          <h4>Controles:</h4>
          <ul>
            <li><strong>WASD:</strong> Movimiento</li>
            <li><strong>Mouse:</strong> Vista</li>
            <li><strong>Shift:</strong> Correr</li>
            <li><strong>Espacio:</strong> Subir</li>
            <li><strong>C:</strong> Bajar</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { TresCanvas } from "@tresjs/core";
import { use3DPhotos } from "@/composables/use3DPhotos.js";
import { loadTextureWithLimit } from "@/utils/rateLimiter.js";
import { useFirstPersonControls } from "@/composables/useFirstPersonControls.js";
import * as THREE from "three";

// Composable para manejo de fotos 3D
const {
  photos3D,
  isLoading,
  currentChunk,
  pagination,
  error,
  loadedPages,
  totalLoadedPhotos,
  chunkOptions,
  loadingProgress,
  isLoadingComplete,
  loadAllPhotos,
  changeChunk,
  reset
} = use3DPhotos();

// Referencias del DOM y Three.js
const containerRef = ref();
const canvasRef = ref();
const cameraRef = ref();

// Estado del componente
const useBillboarding = ref(true);
const useDistanceOpacity = ref(true);
const currentPosition = ref({ x: 0, y: 0, z: 50 });

// First Person Controls
const fpControls = ref(null);
let animationId = null;

// Canvas configuration
const gl = ref({
  clearColor: "#1a1a1a",
  antialias: true,
});

// Three.js objects - Improved lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight1.position.set(10, 10, 10);

// Create lights group
const lightsGroup = new THREE.Group();
lightsGroup.add(ambientLight);
lightsGroup.add(directionalLight1);

// Geometry for photo planes
const planeGeometry = new THREE.PlaneGeometry(4, 3);

// Grid helper
const gridHelper = new THREE.GridHelper(200, 40);
gridHelper.position.y = -50;

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Fotos con materiales cargados
const photosWithMaterials = ref([]);

// Frustum culling - solo renderizar fotos visibles
const visiblePhotos = ref([]);

// Función para obtener el label del chunk actual
const getCurrentChunkLabel = () => {
  const option = chunkOptions.find(opt => opt.value === currentChunk.value);
  return option ? option.label : currentChunk.value;
};

// Función para crear material de una foto
const createPhotoMaterial = async (photo) => {
  const imageUrl = photo.thumbnailUrl || photo.url || photo.originalUrl;

  if (!imageUrl) {
    console.warn('No image URL found for photo:', photo.id);
    return new THREE.MeshBasicMaterial({ color: 0x333333 });
  }

  try {
    const texture = await loadTextureWithLimit(textureLoader, imageUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshBasicMaterial({ 
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
  } catch (error) {
    console.error('Error loading texture for photo:', photo.id, error);
    return new THREE.MeshBasicMaterial({ color: 0x666666 });
  }
};

// Función para cargar materiales de las fotos
const loadPhotoMaterials = async (newPhotos) => {
  const materialPromises = newPhotos.map(async (photo) => {
    const material = await createPhotoMaterial(photo);
    return {
      ...photo,
      material,
      position: photo.position || [0, 0, 0],
      billboardRotation: [0, 0, 0]
    };
  });

  const photosWithMats = await Promise.all(materialPromises);
  photosWithMaterials.value = [...photosWithMaterials.value, ...photosWithMats];
  
  // Actualizar fotos visibles
  updateVisiblePhotos();
  
  // Inicializar rotaciones billboard si está habilitado
  if (useBillboarding.value) {
    updateBillboardRotations();
  }
};

// Función para actualizar fotos visibles usando Frustum Culling
const updateVisiblePhotos = () => {
  if (!cameraRef.value || photosWithMaterials.value.length === 0) {
    visiblePhotos.value = [];
    return;
  }

  const camera = cameraRef.value;
  const frustum = new THREE.Frustum();
  const matrix = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(matrix);

  // Filtrar fotos que intersectan con el frustum
  const visible = photosWithMaterials.value.filter((photo) => {
    const photoSphere = new THREE.Sphere(
      new THREE.Vector3(...photo.position),
      2 // Radio de la esfera de la foto
    );
    return frustum.intersectsSphere(photoSphere);
  });

  visiblePhotos.value = visible;
};

// Función para calcular rotación billboard (mirar cámara)
const calculateBillboardRotation = (photoPosition, cameraPosition) => {
  const tempObject = new THREE.Object3D();
  tempObject.position.set(...photoPosition);

  // Hacer que mire hacia la cámara
  const directionToCamera = new THREE.Vector3(
    cameraPosition.x - photoPosition[0],
    cameraPosition.y - photoPosition[1],
    cameraPosition.z - photoPosition[2]
  );

  tempObject.lookAt(
    tempObject.position.x + directionToCamera.x,
    tempObject.position.y + directionToCamera.y,
    tempObject.position.z + directionToCamera.z
  );

  return [tempObject.rotation.x, tempObject.rotation.y, tempObject.rotation.z];
};

// Función para actualizar rotaciones billboard
const updateBillboardRotations = () => {
  if (!cameraRef.value || visiblePhotos.value.length === 0) return;

  const camera = cameraRef.value;
  const cameraPosition = camera.position;

  visiblePhotos.value.forEach((photo) => {
    photo.billboardRotation = calculateBillboardRotation(
      photo.position,
      cameraPosition
    );
  });
};

// Distance-based opacity configuration
const MIN_DISTANCE = 20;
const MAX_DISTANCE = 80;
const MIN_OPACITY = 0.2;

// Función para actualizar opacidad basada en distancia
const updatePhotoOpacity = () => {
  if (!useDistanceOpacity.value || !cameraRef.value || visiblePhotos.value.length === 0) {
    // Si no está habilitado, asegurar que todas las fotos tengan opacidad 1
    visiblePhotos.value.forEach((photo) => {
      if (photo.material && photo.material.opacity !== 1) {
        photo.material.opacity = 1;
      }
    });
    return;
  }

  const camera = cameraRef.value;
  const cameraPosition = camera.position;

  visiblePhotos.value.forEach((photo) => {
    const distance = Math.sqrt(
      Math.pow(cameraPosition.x - photo.position[0], 2) +
      Math.pow(cameraPosition.y - photo.position[1], 2) +
      Math.pow(cameraPosition.z - photo.position[2], 2)
    );

    let opacity = 1;
    if (distance > MIN_DISTANCE) {
      const fadeRange = MAX_DISTANCE - MIN_DISTANCE;
      const fadeProgress = Math.min((distance - MIN_DISTANCE) / fadeRange, 1);
      opacity = Math.max(MIN_OPACITY, 1 - fadeProgress);
    }

    if (photo.material) {
      photo.material.opacity = opacity;
    }
  });
};

// Handler para cambio de billboarding
const onBillboardingToggle = () => {
  if (useBillboarding.value) {
    updateBillboardRotations();
  }
};

// Handler para cambio de chunk
const onChunkChange = async () => {
  // Limpiar fotos actuales
  photosWithMaterials.value = [];
  visiblePhotos.value = [];
  
  // Cargar nuevo chunk
  await changeChunk(currentChunk.value);
};

// Función de retry
const retryLoad = async () => {
  reset();
  await loadAllPhotos(currentChunk.value);
};

// Función de animación
const animate = () => {
  if (fpControls.value) {
    fpControls.value.update();
  }

  // Actualizar posición actual
  if (cameraRef.value) {
    const pos = cameraRef.value.position;
    currentPosition.value = {
      x: pos.x,
      y: pos.y,
      z: pos.z
    };
  }

  // Actualizar frustum culling
  updateVisiblePhotos();

  // Actualizar rotaciones billboard si está habilitado
  if (useBillboarding.value) {
    updateBillboardRotations();
  }

  // Actualizar opacidad por distancia
  updatePhotoOpacity();

  animationId = requestAnimationFrame(animate);
};

// Inicializar controles FPS
const initFirstPersonControls = () => {
  if (!cameraRef.value || !containerRef.value) {
    console.warn('Camera or container not available for FPS controls');
    return;
  }

  const camera = cameraRef.value;
  const domElement = containerRef.value;

  fpControls.value = useFirstPersonControls(camera, domElement);
  fpControls.value.setup();

  // Configuración inicial
  fpControls.value.setMoveSpeed(1.2);
  fpControls.value.setMouseSensitivity(0.002);

  // Iniciar loop de animación
  animate();
};

// Watcher para cargar materiales cuando lleguen nuevas fotos
watch(photos3D, async (newPhotos, oldPhotos) => {
  if (newPhotos.length > (oldPhotos || []).length) {
    const newPhotosOnly = newPhotos.slice((oldPhotos || []).length);
    await loadPhotoMaterials(newPhotosOnly);
  }
}, { immediate: false });

// Lifecycle
onMounted(async () => {
  try {
    // Cargar fotos iniciales
    await loadAllPhotos(currentChunk.value);
    
    // Inicializar controles después de un pequeño delay
    setTimeout(() => {
      initFirstPersonControls();
    }, 100);
  } catch (error) {
    console.error('Error initializing 3D photos:', error);
  }
});

onUnmounted(() => {
  // Limpiar controles FPS
  if (fpControls.value) {
    fpControls.value.dispose();
  }

  // Cancelar animación
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  // Limpiar materiales
  photosWithMaterials.value.forEach(photo => {
    if (photo.material) {
      if (photo.material.map) {
        photo.material.map.dispose();
      }
      photo.material.dispose();
    }
  });
});
</script>

<style scoped>
.photos-3d-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  cursor: crosshair;
}

.photos-3d-container:fullscreen {
  cursor: none;
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
  max-width: 300px;
  max-height: 80vh;
  overflow-y: auto;
}

.info-panel h3 {
  margin: 0 0 15px 0;
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

/* Chunk Selector */
.chunk-selector {
  margin: 15px 0;
  padding: 12px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 6px;
  background: rgba(74, 222, 128, 0.05);
}

.chunk-selector h4 {
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: #4ade80;
  font-weight: 600;
}

.chunk-select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  color: #e5e5e5;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chunk-select:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(74, 222, 128, 0.5);
}

.chunk-select:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  border-color: #4ade80;
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.2);
}

.chunk-select option {
  background: #1a1a1a;
  color: #e5e5e5;
  padding: 8px;
}

/* Stats Info */
.stats-info {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  background: rgba(74, 222, 128, 0.05);
}

/* Billboarding Toggle */
.billboard-toggle {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  background: rgba(74, 222, 128, 0.05);
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9em;
  color: #e5e5e5;
  margin-bottom: 5px;
}

.toggle-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(74, 222, 128, 0.5);
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-label input[type="checkbox"]:checked + .checkbox-custom {
  background: #4ade80;
}

.toggle-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 1px;
  color: #1a1a1a;
  font-size: 12px;
  font-weight: bold;
}

.toggle-description {
  font-size: 0.8em;
  color: #ccc;
  margin: 0;
}

/* Position Indicator */
.position-indicator {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  background: rgba(74, 222, 128, 0.05);
}

.position-indicator h4 {
  margin: 0 0 8px 0;
  font-size: 0.9em;
  color: #4ade80;
}

.position-values {
  display: flex;
  gap: 15px;
}

.position-axis {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.8em;
}

.axis-label {
  color: #ccc;
  font-weight: 500;
}

.axis-value {
  color: #4ade80;
  font-weight: bold;
}

/* Controls Info */
.controls-info {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  background: rgba(74, 222, 128, 0.05);
}

.controls-info h4 {
  margin: 0 0 8px 0;
  font-size: 0.9em;
  color: #4ade80;
}

.controls-info ul {
  margin: 0;
  font-size: 0.8em;
}

.controls-info li {
  margin: 3px 0;
  color: #e5e5e5;
}

/* Loading Screen */
.loading-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 20px;
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

.loading-content h2 {
  margin: 0 0 15px 0;
  font-size: 1.5em;
  color: #4ade80;
}

.loading-content p {
  margin: 10px 0;
  color: #e5e5e5;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin: 15px 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9em;
  color: #ccc;
}

.chunk-info {
  font-size: 0.8em;
  color: #4ade80;
  font-style: italic;
}

/* Error Screen */
.error-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.error-content {
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 20px;
}

.error-content h2 {
  margin: 0 0 15px 0;
  font-size: 1.5em;
  color: #ef4444;
}

.error-content p {
  margin: 0 0 20px 0;
  color: #e5e5e5;
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
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #22c55e;
  transform: translateY(-1px);
}

.retry-btn:active {
  transform: translateY(0);
}
</style>