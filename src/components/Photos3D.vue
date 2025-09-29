<template>
  <div class="photos-3d-container" ref="containerRef">
    <!-- Error Screen -->
    <div v-if="error" class="error-screen">
      <div class="error-content">
        <h2>Error al cargar la visualización 3D</h2>
        <p>{{ error }}</p>
        <button @click="retryLoad" class="retry-btn">Reintentar</button>
      </div>
    </div>

    <!-- 3D Canvas -->
    <TresCanvas v-else v-bind="gl" ref="canvasRef">
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
      <template v-for="(photo, index) in visiblePhotos" :key="photo.id">
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
    <div class="ui-overlay">
      <div class="control-panel" @mousedown.stop @wheel.stop @contextmenu.stop>
        <!-- Embedding Type Section -->
        <div class="control-section">
          <h4 class="section-title">Embedding Type</h4>
          <div class="control-item">
            <n-select
              v-model:value="selectedChunk"
              @update:value="onChunkChange"
              :options="chunkOptions"
              class="embedding-select"
              placeholder="Select embedding type"
              @click.stop
            />
          </div>
        </div>

        <!-- Display Options Section -->
        <div class="control-section">
          <h4 class="section-title">Display Options</h4>

          <div class="control-item">
            <span class="control-label">Billboarding (Face Camera)</span>
            <n-switch
              v-model:value="useBillboarding"
              @update:value="onBillboardingToggle"
              size="small"
              @click.stop
            />
          </div>

          <div class="control-item">
            <span class="control-label">Distance Opacity</span>
            <n-switch
              v-model:value="useDistanceOpacity"
              size="small"
              @click.stop
            />
          </div>
        </div>

        <!-- Radial Scaling Section -->
        <div class="control-section">
          <h4 class="section-title">Radial Scaling</h4>
          <div class="control-item">
            <div class="slider-container">
              <div class="slider-header">
                <span class="control-label"
                  >Distance: {{ inflateFactor.toFixed(1) }}x</span
                >
              </div>
              <n-slider
                v-model:value="inflateFactor"
                @update:value="onInflateFactorChange"
                :min="1"
                :max="3.0"
                :step="0.1"
                :marks="{ 1: '1.0x', 2: '2.0x', 3: '3.0x' }"
                class="radial-slider"
                @click.stop
              />
            </div>
          </div>
        </div>

        <!-- Controls Info -->
        <div class="control-section">
          <h4 class="section-title">
            Controls
            <n-tooltip
              trigger="hover"
              placement="top"
              :keep-alive-on-hover="false"
            >
              <template #trigger>
                <n-icon size="16" class="info-icon">
                  <InfoCircleOutlined />
                </n-icon>
              </template>
              <div class="controls-tooltip">
                <div class="control-tip"><strong>WASD:</strong> Movement</div>
                <div class="control-tip">
                  <strong>Mouse:</strong> Look around
                </div>
                <div class="control-tip"><strong>Shift:</strong> Run</div>
                <div class="control-tip"><strong>Space:</strong> Move up</div>
                <div class="control-tip"><strong>C:</strong> Move down</div>
              </div>
            </n-tooltip>
          </h4>
        </div>
      </div>
    </div>

    <!-- Discrete Loading Indicator -->
    <div v-if="showDiscreteLoader" class="discrete-loader">
      <div class="loader-spinner"></div>
      <span class="loader-text">Loading textures</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { TresCanvas } from "@tresjs/core";
import { NTooltip, NSwitch, NSelect, NIcon, NSlider } from "naive-ui";
import { InfoCircleOutlined } from "@vicons/antd";
import { use3DPhotos } from "@/composables/use3DPhotos.js";
import { useTextureCache } from "@/composables/useTextureCache.js";
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
  reset,
} = use3DPhotos();

// Sistema de caché de texturas
const textureCache = useTextureCache({
  maxCacheSize: 500,
  expiryDays: 7,
});

// Desestructurar funciones del caché
const { loadTexture, isTextureCached, getCachedTextureSync } = textureCache;

// Referencias del DOM y Three.js
const containerRef = ref();
const canvasRef = ref();
const cameraRef = ref();

// Estado del componente
const useBillboarding = ref(true);
const useDistanceOpacity = ref(true);
const currentPosition = ref({ x: 0, y: 0, z: 50 });

// Loader discreto
const showDiscreteLoader = ref(true);

// Escaleo radial
const inflateFactor = ref(2.5);
const originalPositions = ref([]);

// Animación de transición
const isTransitioning = ref(false);
const animationStartTime = ref(0);
const TRANSITION_DURATION = 1500; // 1.5 segundos

// Valor local del selector para evitar conflictos con v-model
const selectedChunk = ref(null);

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

// Texture loader (habilitar CORS anónimo para Cloudflare si aplica)
const textureLoader = new THREE.TextureLoader();
try {
  textureLoader.setCrossOrigin && textureLoader.setCrossOrigin("anonymous");
} catch (_) {}

// Fotos con materiales cargados
const photosWithMaterials = ref([]);

// Cola de texturas pendientes (IDs)
const textureQueue = ref([]);
// Set para evitar duplicar en cola
const queuedIds = new Set();
// Número máximo de texturas a iniciar por frame de animación (aparte del p-limit interno)
const BATCH_PER_FRAME = 2;

// Performance optimization: throttling variables
let frameCounter = 0;
const THROTTLE_INTERVAL = 3; // Execute heavy operations every N frames
let lastCameraPosition = { x: 0, y: 0, z: 0 };
const CAMERA_MOVE_THRESHOLD = 0.5; // Minimum movement to trigger updates

// Reusable THREE.js objects to avoid garbage collection
const reusableFrustum = new THREE.Frustum();
const reusableMatrix = new THREE.Matrix4();
const reusableVector3 = new THREE.Vector3();
const reusableSphere = new THREE.Sphere();

// Distance calculation cache
const distanceCache = new Map();
let cacheValidPosition = { x: 0, y: 0, z: 0 };

// Reusable objects for billboard calculations
const tempObject = new THREE.Object3D();
const directionToCamera = new THREE.Vector3();

// Performance monitoring
let lastPerformanceLog = 0;
const PERFORMANCE_LOG_INTERVAL = 5000; // Log every 5 seconds
const performanceMetrics = {
  frameTime: [],
  updateVisibleTime: [],
  billboardTime: [],
  opacityTime: [],
};

// Placeholder material (se clona por foto para poder variar opacidad individual)
const placeholderCanvas = document.createElement("canvas");
placeholderCanvas.width = 8;
placeholderCanvas.height = 8;
const phCtx = placeholderCanvas.getContext("2d");
phCtx.fillStyle = "#222";
phCtx.fillRect(0, 0, 8, 8);
phCtx.fillStyle = "#444";
phCtx.fillRect(0, 0, 4, 8);
const placeholderTexture = new THREE.CanvasTexture(placeholderCanvas);
placeholderTexture.colorSpace = THREE.SRGBColorSpace;

const createPlaceholderMaterial = () =>
  new THREE.MeshBasicMaterial({
    map: placeholderTexture,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });

// Frustum culling - solo renderizar fotos visibles
const visiblePhotos = ref([]);

// Función para verificar si todas las texturas están cargadas
const checkAllTexturesLoaded = () => {
  // Si no hay fotos y ya no está cargando, ocultar loader
  if (photosWithMaterials.value.length === 0 && !isLoading.value) {
    showDiscreteLoader.value = false;
    return;
  }

  // Si no hay fotos pero aún está cargando, mantener loader
  if (photosWithMaterials.value.length === 0 && isLoading.value) {
    return;
  }

  // Si todas las fotos tienen texturas cargadas, ocultar loader
  const allLoaded = photosWithMaterials.value.every(
    (photo) => photo.__textureLoaded
  );
  const nothingLoading = photosWithMaterials.value.every(
    (photo) => !photo.__loading
  );
  const noQueuePending = textureQueue.value.length === 0;

  // Solo ocultar cuando todo esté realmente terminado
  if (allLoaded && nothingLoading && noQueuePending && !isLoading.value) {
    showDiscreteLoader.value = false;
    console.log("🎯 Ocultando loader discreto - todas las texturas cargadas");
  } else {
    console.log("⏳ Manteniendo loader discreto", {
      allLoaded,
      nothingLoading,
      noQueuePending,
      isLoading: isLoading.value,
      photosCount: photosWithMaterials.value.length,
      queueLength: textureQueue.value.length,
    });
  }
};

// Función para obtener el label del chunk actual
const getCurrentChunkLabel = () => {
  const option = chunkOptions.find((opt) => opt.value === currentChunk.value);
  return option ? option.label : currentChunk.value;
};

// Función de easing para animaciones suaves
const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Función para animar la transición entre posiciones
const animatePositionTransition = (fromPositions, toPositions) => {
  if (fromPositions.length !== toPositions.length) {
    console.warn("⚠️ Número diferente de posiciones en la transición");
    return;
  }

  isTransitioning.value = true;
  animationStartTime.value = performance.now();

  console.log(
    `🎬 Iniciando animación de transición de ${fromPositions.length} fotos`
  );
};

// Función para actualizar las posiciones durante la animación
const updateTransitionPositions = (currentTime) => {
  if (!isTransitioning.value) return;

  const elapsed = currentTime - animationStartTime.value;
  const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
  const easedProgress = easeInOutCubic(progress);

  // Interpolar posiciones para cada foto
  photosWithMaterials.value.forEach((photo, index) => {
    if (index >= originalPositions.value.length) return;

    const targetPos = originalPositions.value[index];
    const startPos = photo.transitionStartPosition || photo.position;

    // Interpolar cada componente
    photo.position = [
      startPos[0] + (targetPos[0] - startPos[0]) * easedProgress,
      startPos[1] + (targetPos[1] - startPos[1]) * easedProgress,
      startPos[2] + (targetPos[2] - startPos[2]) * easedProgress,
    ];
  });

  // Finalizar animación
  if (progress >= 1) {
    isTransitioning.value = false;
    console.log("✅ Transición de posiciones completada");

    // Limpiar propiedades temporales
    photosWithMaterials.value.forEach((photo) => {
      delete photo.transitionStartPosition;
    });

    // Aplicar escaleo si es necesario
    if (inflateFactor.value !== 1.0) {
      applyRadialScaling();
    }
  }
};

// Carga diferida de textura real usando el composable de caché
const loadRealTextureForPhoto = async (photoObj, isCached = false) => {
  if (photoObj.__textureLoaded || photoObj.__loading) return;
  photoObj.__loading = true;
  const imageUrl =
    photoObj.thumbnailUrl || photoObj.url || photoObj.originalUrl;

  if (!imageUrl) {
    photoObj.__loading = false;
    photoObj.__textureLoaded = true;
    return;
  }

  try {
    // Si sabemos que está cacheada, usamos directamente el caché
    // Si no, usamos loadTexture que maneja caché + descarga con rate limiting
    const texture = isCached
      ? await textureCache.getCachedTexture(imageUrl)
      : await loadTexture(imageUrl);

    if (!texture) {
      console.warn("No se pudo cargar textura:", imageUrl);
      photoObj.__textureLoaded = true;
      return;
    }

    // Crear material con la textura
    const newMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Reemplazar material placeholder
    if (photoObj.material) {
      photoObj.material.dispose?.();
      photoObj.material = newMat;
    } else {
      photoObj.material = newMat;
    }
    photoObj.__textureLoaded = true;

    // Verificar si todas las texturas están cargadas
    checkAllTexturesLoaded();
  } catch (e) {
    console.warn("Fallo carga textura (mantengo placeholder):", imageUrl, e);
    photoObj.__textureLoaded = true;
  } finally {
    photoObj.__loading = false;
    // Verificar nuevamente al finalizar
    checkAllTexturesLoaded();
  }
};

// ✨ Nueva función para cargar inmediatamente texturas cacheadas SÍNCRONAMENTE
const loadCachedTexturesImmediately = async (photos) => {
  console.log(
    `🔄 Verificando texturas cacheadas para ${photos.length} fotos...`
  );

  // Verificar cuáles están disponibles en caché
  const cacheCheckPromises = photos.map(async (photo) => {
    const imageUrl = photo.thumbnailUrl || photo.url || photo.originalUrl;
    if (!imageUrl) return { photo, isCached: false };

    const isCached = await isTextureCached(imageUrl);
    return { photo, isCached };
  });

  const cacheResults = await Promise.all(cacheCheckPromises);
  const cachedPhotos = cacheResults.filter((result) => result.isCached);

  if (cachedPhotos.length === 0) {
    console.log("📭 No hay texturas en caché para cargar");
    return cacheResults.map((result) => result.isCached);
  }

  console.log(
    `⚡ Cargando ${cachedPhotos.length} texturas desde caché SÍNCRONAMENTE...`
  );

  // ✨ Cargar todas las texturas cacheadas síncronamente en un solo batch
  const syncLoadPromises = cachedPhotos.map(async ({ photo }) => {
    const imageUrl = photo.thumbnailUrl || photo.url || photo.originalUrl;
    try {
      const texture = await getCachedTextureSync(imageUrl);
      if (texture) {
        // Aplicar textura inmediatamente
        const newMat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
        });

        if (photo.material) {
          photo.material.dispose?.();
        }
        photo.material = newMat;
        photo.__textureLoaded = true;
        return true;
      }
    } catch (e) {
      console.warn("Error cargando textura cacheada:", imageUrl, e);
    }
    return false;
  });

  // Ejecutar todas las cargas síncronas en paralelo
  const syncResults = await Promise.all(syncLoadPromises);
  const successCount = syncResults.filter(Boolean).length;

  console.log(
    `✅ Cargadas instantáneamente ${successCount}/${cachedPhotos.length} texturas desde caché`
  );

  return cacheResults.map((result) => result.isCached);
};

// Integración nueva: Inicializar foto con placeholder y encolar su ID
const registerNewPhotos = async (newPhotos) => {
  console.log("🔄 Registrando fotos nuevas, mostrando loader discreto");
  showDiscreteLoader.value = true;

  const prepared = newPhotos.map((p) => ({
    ...p,
    material: createPlaceholderMaterial(),
    position: p.position || [0, 0, 0],
    billboardRotation: [0, 0, 0],
    __textureLoaded: false,
    __loading: false,
  }));

  // Guardar posiciones originales si aún no las tenemos
  if (originalPositions.value.length === 0) {
    originalPositions.value = prepared.map((p) => [...p.position]);
  } else {
    // Agregar las nuevas posiciones originales
    const newOriginals = prepared
      .slice(photosWithMaterials.value.length)
      .map((p) => [...p.position]);
    originalPositions.value = [...originalPositions.value, ...newOriginals];
  }

  photosWithMaterials.value = [...photosWithMaterials.value, ...prepared];

  // Aplicar escaleo actual si es diferente de 1.0
  if (inflateFactor.value !== 1.0) {
    applyRadialScaling();
  }

  // ✨ NOVEDAD: Cargar inmediatamente todas las texturas cacheadas disponibles
  console.log(
    `🔄 Verificando texturas cacheadas para ${prepared.length} fotos...`
  );
  const cacheResults = await loadCachedTexturesImmediately(prepared);

  // Solo encolar para descarga de red las fotos que NO están en caché
  const photosNeedingDownload = prepared.filter(
    (photo, index) => !cacheResults[index]
  );
  console.log(
    `📥 ${photosNeedingDownload.length} fotos requerirán descarga de red`
  );

  // Actualizar fotos visibles para procesar las que necesitan descarga
  updateVisiblePhotos();
  if (useBillboarding.value) updateBillboardRotations();
};

// ✨ Nueva función optimizada para cambios de chunk que reutiliza texturas
const updatePhotosPositions = async (newPhotos) => {
  console.log("🔄 Actualizando posiciones de fotos existentes con animación");

  // Crear un mapa de fotos por ID para matching rápido
  const existingPhotosMap = new Map();
  photosWithMaterials.value.forEach((photo, index) => {
    existingPhotosMap.set(photo.id, { photo, index });
  });

  // Guardar posiciones actuales para animación
  const oldPositions = photosWithMaterials.value.map((photo) => [
    ...photo.position,
  ]);

  // Array para las nuevas posiciones originales
  const newOriginalPositions = [];
  const updatedPhotos = [];

  // Procesar cada foto nueva
  newPhotos.forEach((newPhoto) => {
    const existing = existingPhotosMap.get(newPhoto.id);

    if (existing) {
      // La foto ya existe, reutilizar material y actualizar posición
      const updatedPhoto = {
        ...existing.photo, // Mantener material y estado de textura
        ...newPhoto, // Actualizar datos (especialmente position)
        material: existing.photo.material, // Preservar material cargado
        __textureLoaded: existing.photo.__textureLoaded,
        __loading: existing.photo.__loading,
        transitionStartPosition: [...existing.photo.position], // Para animación
      };
      updatedPhotos.push(updatedPhoto);
    } else {
      // Foto nueva, crear con placeholder
      const newPhotoObj = {
        ...newPhoto,
        material: createPlaceholderMaterial(),
        position: newPhoto.position || [0, 0, 0],
        billboardRotation: [0, 0, 0],
        __textureLoaded: false,
        __loading: false,
      };
      updatedPhotos.push(newPhotoObj);
    }

    // Guardar posición original para el escaleo radial
    newOriginalPositions.push([...(newPhoto.position || [0, 0, 0])]);
  });

  // Actualizar arrays
  photosWithMaterials.value = updatedPhotos;
  originalPositions.value = newOriginalPositions;

  // Iniciar animación de transición
  animatePositionTransition(oldPositions, newOriginalPositions);

  // Cargar texturas para fotos nuevas que no las tengan
  const photosNeedingTextures = updatedPhotos.filter(
    (photo) => !photo.__textureLoaded && !photo.__loading
  );

  if (photosNeedingTextures.length > 0) {
    console.log(
      `🖼️ Cargando texturas para ${photosNeedingTextures.length} fotos nuevas...`
    );
    const cacheResults = await loadCachedTexturesImmediately(
      photosNeedingTextures
    );

    const photosNeedingDownload = photosNeedingTextures.filter(
      (photo, index) => !cacheResults[index]
    );
    console.log(
      `📥 ${photosNeedingDownload.length} fotos nuevas requerirán descarga de red`
    );
  } else {
    // Solo hay fotos existentes, ocultar loader inmediatamente tras la animación
    setTimeout(() => {
      if (!isTransitioning.value) {
        showDiscreteLoader.value = false;
      }
    }, TRANSITION_DURATION + 100);
  }

  // Actualizar fotos visibles
  updateVisiblePhotos();
  if (useBillboarding.value) updateBillboardRotations();
};

// Función para aplicar escaleo radial
const applyRadialScaling = () => {
  if (
    photosWithMaterials.value.length === 0 ||
    originalPositions.value.length === 0
  )
    return;

  // Calcular centroide de las posiciones originales
  const centroid = [
    originalPositions.value.reduce((sum, pos) => sum + pos[0], 0) /
      originalPositions.value.length,
    originalPositions.value.reduce((sum, pos) => sum + pos[1], 0) /
      originalPositions.value.length,
    originalPositions.value.reduce((sum, pos) => sum + pos[2], 0) /
      originalPositions.value.length,
  ];

  // Aplicar escaleo radial
  photosWithMaterials.value.forEach((photo, index) => {
    if (index >= originalPositions.value.length) return;

    const originalPos = originalPositions.value[index];
    const vector = [
      originalPos[0] - centroid[0],
      originalPos[1] - centroid[1],
      originalPos[2] - centroid[2],
    ];

    photo.position = [
      centroid[0] + vector[0] * inflateFactor.value,
      centroid[1] + vector[1] * inflateFactor.value,
      centroid[2] + vector[2] * inflateFactor.value,
    ];
  });
};

// Handler para cambio en el slider de escaleo
const onInflateFactorChange = () => {
  applyRadialScaling();
  updateVisiblePhotos();
  if (useBillboarding.value) updateBillboardRotations();
};

// Helper function to calculate distance with caching
const getCachedDistance = (photoId, photoPosition, cameraPosition) => {
  // Check if cache is still valid (camera hasn't moved significantly)
  const dx = cameraPosition.x - cacheValidPosition.x;
  const dy = cameraPosition.y - cacheValidPosition.y;
  const dz = cameraPosition.z - cacheValidPosition.z;
  const cameraDistanceMoved = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (cameraDistanceMoved > CAMERA_MOVE_THRESHOLD) {
    // Clear cache and update valid position
    distanceCache.clear();
    cacheValidPosition = {
      x: cameraPosition.x,
      y: cameraPosition.y,
      z: cameraPosition.z,
    };
  }

  // Check if we have cached distance for this photo
  if (distanceCache.has(photoId)) {
    return distanceCache.get(photoId);
  }

  // Calculate and cache distance
  const distance = Math.sqrt(
    Math.pow(cameraPosition.x - photoPosition[0], 2) +
      Math.pow(cameraPosition.y - photoPosition[1], 2) +
      Math.pow(cameraPosition.z - photoPosition[2], 2)
  );

  distanceCache.set(photoId, distance);
  return distance;
};

// Performance logging function
const logPerformanceMetrics = () => {
  if (performanceMetrics.frameTime.length === 0) return;

  const avgFrameTime =
    performanceMetrics.frameTime.reduce((a, b) => a + b) /
    performanceMetrics.frameTime.length;
  const maxFrameTime = Math.max(...performanceMetrics.frameTime);
  const fps = 1000 / avgFrameTime;

  let logMessage = `[Photos3D Performance]`;
  logMessage += `\n  Average frame time: ${avgFrameTime.toFixed(2)}ms`;
  logMessage += `\n  Max frame time: ${maxFrameTime.toFixed(2)}ms`;
  logMessage += `\n  FPS: ${fps.toFixed(1)}`;
  logMessage += `\n  Visible photos: ${visiblePhotos.value.length}`;
  logMessage += `\n  Total photos: ${photosWithMaterials.value.length}`;

  if (performanceMetrics.updateVisibleTime.length > 0) {
    const avgVisible =
      performanceMetrics.updateVisibleTime.reduce((a, b) => a + b) /
      performanceMetrics.updateVisibleTime.length;
    logMessage += `\n  Frustum culling: ${avgVisible.toFixed(2)}ms`;
  }

  if (performanceMetrics.billboardTime.length > 0) {
    const avgBillboard =
      performanceMetrics.billboardTime.reduce((a, b) => a + b) /
      performanceMetrics.billboardTime.length;
    logMessage += `\n  Billboard rotations: ${avgBillboard.toFixed(2)}ms`;
  }

  if (performanceMetrics.opacityTime.length > 0) {
    const avgOpacity =
      performanceMetrics.opacityTime.reduce((a, b) => a + b) /
      performanceMetrics.opacityTime.length;
    logMessage += `\n  Opacity updates: ${avgOpacity.toFixed(2)}ms`;
  }

  // Only log if frame time is concerning (> 16.67ms for 60fps)
  if (avgFrameTime > 16.67) {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }

  // Clear metrics arrays to prevent memory buildup
  performanceMetrics.frameTime = [];
  performanceMetrics.updateVisibleTime = [];
  performanceMetrics.billboardTime = [];
  performanceMetrics.opacityTime = [];
};

// Función para actualizar fotos visibles usando Frustum Culling
const updateVisiblePhotos = () => {
  if (!cameraRef.value || photosWithMaterials.value.length === 0) {
    visiblePhotos.value = [];
    return;
  }

  const camera = cameraRef.value;

  // Reutilizar objetos existentes para evitar garbage collection
  reusableMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  reusableFrustum.setFromProjectionMatrix(reusableMatrix);

  // Filtrar fotos que intersectan con el frustum
  const visible = photosWithMaterials.value.filter((photo) => {
    reusableVector3.set(...photo.position);
    reusableSphere.set(reusableVector3, 2); // Radio de la esfera de la foto
    return reusableFrustum.intersectsSphere(reusableSphere);
  });

  visiblePhotos.value = visible;

  // Encolar para carga real SOLO las que están visibles, no cargadas, y necesitan descarga de red
  visible.forEach((photo) => {
    if (
      !photo.__textureLoaded &&
      !photo.__loading &&
      !queuedIds.has(photo.id)
    ) {
      // Solo encolar para descarga de red - las cacheadas ya se cargaron inmediatamente
      textureQueue.value.push(photo.id);
      queuedIds.add(photo.id);
    }
  });
};

// Función para calcular rotación billboard (mirar cámara) - optimizada
const calculateBillboardRotation = (photoPosition, cameraPosition) => {
  tempObject.position.set(...photoPosition);

  // Reutilizar vector existente
  directionToCamera.set(
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
  if (
    !useDistanceOpacity.value ||
    !cameraRef.value ||
    visiblePhotos.value.length === 0
  ) {
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
    // Use cached distance calculation
    const distance = getCachedDistance(
      photo.id,
      photo.position,
      cameraPosition
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
const onChunkChange = async (newValue) => {
  console.log("🔄 onChunkChange called:", {
    newValue,
    currentChunk: currentChunk.value,
    selectedChunk: selectedChunk.value,
    currentPhotosLength: photos3D.value.length,
    currentMaterialsLength: photosWithMaterials.value.length,
    hasExistingPhotos: photosWithMaterials.value.length > 0,
  });

  // Verificar si realmente necesitamos hacer el cambio
  if (newValue === currentChunk.value && photos3D.value.length > 0) {
    console.log("⏸️ El chunk ya está cargado, no necesita recarga");
    return;
  }

  // Mostrar loader discreto
  showDiscreteLoader.value = true;

  // Si no hay fotos existentes, hacer limpieza completa
  if (photosWithMaterials.value.length === 0) {
    console.log("🧹 Primera carga: limpieza completa");
    visiblePhotos.value = [];
    originalPositions.value = [];
    textureQueue.value = [];
    queuedIds.clear();
  } else {
    console.log("♻️ Fotos existentes detectadas: optimizando transición");
    // Solo limpiar la cola de texturas, mantener fotos con sus materiales
    textureQueue.value = [];
    queuedIds.clear();
  }

  console.log("🧹 Iniciando cambio de chunk...");

  // Llamada a changeChunk que hará la petición al backend
  console.log("🚀 Llamando a changeChunk para obtener nuevas coordenadas...");
  await changeChunk(newValue);

  console.log("✅ Cambio de chunk completado:", {
    newPhotosLength: photos3D.value.length,
    newMaterialsLength: photosWithMaterials.value.length,
  });
};

// Función de retry
const retryLoad = async () => {
  reset();
  await loadAllPhotos(currentChunk.value);
};

// Función de animación
const animate = () => {
  const frameStart = performance.now();
  frameCounter++;

  if (fpControls.value) {
    fpControls.value.update();
  }

  // Actualizar transición de posiciones si está activa
  if (isTransitioning.value) {
    updateTransitionPositions(frameStart);
  }

  // Actualizar posición actual
  let cameraPositionChanged = false;
  if (cameraRef.value) {
    const pos = cameraRef.value.position;
    const newPosition = {
      x: pos.x,
      y: pos.y,
      z: pos.z,
    };

    // Check if camera has moved significantly
    const dx = newPosition.x - lastCameraPosition.x;
    const dy = newPosition.y - lastCameraPosition.y;
    const dz = newPosition.z - lastCameraPosition.z;
    const distanceMoved = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distanceMoved > CAMERA_MOVE_THRESHOLD) {
      cameraPositionChanged = true;
      lastCameraPosition = { ...newPosition };
    }

    currentPosition.value = newPosition;
  }

  // Throttle heavy operations - only execute every THROTTLE_INTERVAL frames
  if (frameCounter % THROTTLE_INTERVAL === 0 || cameraPositionChanged) {
    // Actualizar frustum culling
    const visibleStart = performance.now();
    updateVisiblePhotos();
    const visibleEnd = performance.now();
    performanceMetrics.updateVisibleTime.push(visibleEnd - visibleStart);

    // Actualizar rotaciones billboard si está habilitado
    if (useBillboarding.value) {
      const billboardStart = performance.now();
      updateBillboardRotations();
      const billboardEnd = performance.now();
      performanceMetrics.billboardTime.push(billboardEnd - billboardStart);
    }

    // Actualizar opacidad por distancia
    const opacityStart = performance.now();
    updatePhotoOpacity();
    const opacityEnd = performance.now();
    performanceMetrics.opacityTime.push(opacityEnd - opacityStart);
  }

  // Procesar cola de texturas (limitado por frame) - esto se mantiene en cada frame
  processTextureQueue();

  const frameEnd = performance.now();
  const frameTime = frameEnd - frameStart;
  performanceMetrics.frameTime.push(frameTime);

  // Log performance metrics periodically
  if (frameEnd - lastPerformanceLog > PERFORMANCE_LOG_INTERVAL) {
    logPerformanceMetrics();
    lastPerformanceLog = frameEnd;
  }

  animationId = requestAnimationFrame(animate);
};

// Procesar cola: toma hasta BATCH_PER_FRAME ids visibles y solicita textura real
const processTextureQueue = () => {
  if (textureQueue.value.length === 0) return;
  let processed = 0;
  for (
    let i = 0;
    i < textureQueue.value.length && processed < BATCH_PER_FRAME;
    i++
  ) {
    const id = textureQueue.value[i];
    const photoObj = photosWithMaterials.value.find((p) => p.id === id);
    if (!photoObj) continue;
    if (!photoObj.__textureLoaded && !photoObj.__loading) {
      processed++;
      // Solo llegan aquí fotos que necesitan descarga de red (isCached=false)
      loadRealTextureForPhoto(photoObj, false).finally(() => {
        // Al terminar (éxito o fallo) retirar de la cola
        const idx = textureQueue.value.indexOf(id);
        if (idx !== -1) textureQueue.value.splice(idx, 1);
        queuedIds.delete(id);
        // Verificar si todas las texturas están cargadas después de procesar
        checkAllTexturesLoaded();
      });
    } else {
      // Ya cargada, limpiar cola
      const idx = textureQueue.value.indexOf(id);
      if (idx !== -1) textureQueue.value.splice(idx, 1);
      queuedIds.delete(id);
    }
  }
};

// Inicializar controles FPS
const initFirstPersonControls = () => {
  if (!cameraRef.value || !containerRef.value) {
    console.warn("Camera or container not available for FPS controls");
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

// Watcher: registrar nuevas fotos con placeholder y carga inmediata de texturas cacheadas
watch(
  photos3D,
  async (newPhotos, oldPhotos) => {
    console.log("🔄 Watcher photos3D triggered:", {
      newPhotosLength: newPhotos.length,
      oldPhotosLength: (oldPhotos || []).length,
      photosWithMaterialsLength: photosWithMaterials.value.length,
      hasExistingMaterials: photosWithMaterials.value.length > 0,
    });

    // Si hay fotos nuevas desde la última vez que registramos
    if (
      newPhotos.length > 0 &&
      newPhotos.length !== photosWithMaterials.value.length
    ) {
      // Si es un cambio de chunk y ya tenemos fotos con materiales (optimización)
      if (photosWithMaterials.value.length > 0 && newPhotos.length > 0) {
        console.log(
          "♻️ Usando optimización: actualizando posiciones con animación"
        );
        await updatePhotosPositions(newPhotos);
      }
      // Si no hay fotos con materiales (primera carga o limpieza completa)
      else if (photosWithMaterials.value.length === 0 && newPhotos.length > 0) {
        console.log(
          "📸 Primera carga: registrando todas las fotos del chunk:",
          newPhotos.length
        );
        await registerNewPhotos(newPhotos);
      }
      // Si son fotos adicionales (paginación) - caso menos común
      else if (newPhotos.length > photosWithMaterials.value.length) {
        const newPhotosOnly = newPhotos.slice(photosWithMaterials.value.length);
        console.log(
          "📸 Registrando fotos adicionales (paginación):",
          newPhotosOnly.length
        );
        await registerNewPhotos(newPhotosOnly);
      }
    }
  },
  { immediate: false }
);

// Watcher: mostrar loader discreto cuando esté cargando
watch(isLoading, (newIsLoading) => {
  if (newIsLoading) {
    showDiscreteLoader.value = true;
  } else {
    // Cuando termine de cargar, verificar si todas las texturas están listas
    checkAllTexturesLoaded();
  }
});

// Watcher para sincronizar currentChunk del composable con el selector local
watch(
  currentChunk,
  (newValue) => {
    if (selectedChunk.value !== newValue) {
      selectedChunk.value = newValue;
    }
  },
  { immediate: true }
);

// Lifecycle
onMounted(async () => {
  try {
    // Mostrar loader discreto al iniciar
    showDiscreteLoader.value = true;

    // Inicializar sistema de caché de texturas
    await textureCache.initialize();

    // Cargar fotos iniciales - usar un chunk por defecto si currentChunk es null
    const initialChunk = currentChunk.value || "story";
    // Sincronizar selector local
    selectedChunk.value = initialChunk;

    // Asegurar que currentChunk refleje el valor inicial
    if (currentChunk.value === null) {
      currentChunk.value = initialChunk;
    }
    await loadAllPhotos(initialChunk);

    // Inicializar controles después de un pequeño delay
    setTimeout(() => {
      initFirstPersonControls();
    }, 100);
  } catch (error) {
    console.error("Error initializing 3D photos:", error);
    showDiscreteLoader.value = false;
  }
});
onUnmounted(() => {
  // Ocultar loader discreto
  showDiscreteLoader.value = false;

  // Limpiar controles FPS
  if (fpControls.value) {
    fpControls.value.dispose();
  }

  // Cancelar animación
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  // Limpiar métricas de performance
  performanceMetrics.frameTime = [];
  performanceMetrics.updateVisibleTime = [];
  performanceMetrics.billboardTime = [];
  performanceMetrics.opacityTime = [];

  // Limpiar caches
  distanceCache.clear();

  // Limpiar materiales
  photosWithMaterials.value.forEach((photo) => {
    if (photo.material) {
      if (photo.material.map) {
        photo.material.map.dispose();
      }
      photo.material.dispose();
    }
  });

  // El composable de caché maneja la persistencia de IndexedDB automáticamente
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
  top: var(--spacing-lg);
  left: var(--spacing-lg);
  pointer-events: none;
  z-index: 100;
}

.control-panel {
  background: var(--bg-container, rgba(26, 26, 31, 0.95));
  backdrop-filter: blur(12px);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  min-width: 280px;
  max-width: 320px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideDown 0.2s ease-out;
}

.control-section {
  padding: var(--spacing-lg);
}

.control-section:not(:last-child) {
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.control-item:last-child {
  margin-bottom: 0;
}

.control-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium, 500);
}

/* Embedding Select */
.embedding-select {
  width: 100%;
}

/* Slider Container */
.slider-container {
  width: 100%;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.radial-slider {
  width: 100%;
}

/* Info Icon */
.info-icon {
  color: var(--text-secondary);
  cursor: help;
  transition: color 0.2s ease;
}

.info-icon:hover {
  color: var(--text-primary);
}

/* Controls Tooltip */
.controls-tooltip {
  font-size: var(--font-size-sm);
}

.control-tip {
  margin: var(--spacing-xs) 0;
  color: var(--text-secondary);
}

.control-tip strong {
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold, 600);
}

/* Animation for dropdown */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Error Screen */
.error-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-body);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.error-content {
  text-align: center;
  color: var(--text-primary);
  max-width: 400px;
  padding: var(--spacing-xl);
}

.error-content h2 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-lg);
  color: var(--error-color);
}

.error-content p {
  margin: 0 0 var(--spacing-xl) 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.retry-btn {
  background: var(--primary-color);
  color: var(--text-primary);
  border: none;
  padding: var(--spacing-md) var(--spacing-2xl);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--primary-color-hover);
  transform: translateY(-1px);
}

.retry-btn:active {
  transform: translateY(0);
}

/* Discrete Loader */
.discrete-loader {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--bg-container);
  color: var(--primary-color);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium, 500);
  z-index: 9999;
  box-shadow: var(--shadow-lg);
}

.loader-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
  border-radius: var(--radius-round);
  animation: discreteSpun 1s linear infinite;
}

@keyframes discreteSpun {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader-text {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium, 500);
}
</style>
