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
        :position="[0, 0, 100]"
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
      <!-- Config Panel Container -->
      <div class="config-panel-container" @click.stop>
        <!-- Panel Header with Toggle -->
        <div
          class="panel-header"
          @click="
            showConfigPanel = !showConfigPanel;
            $event.stopPropagation();
          "
        >
          <span class="panel-title">Settings</span>
          <n-icon
            class="panel-toggle-icon"
            :class="{ 'panel-open': showConfigPanel }"
          >
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
              />
            </svg>
          </n-icon>
        </div>

        <!-- Config Panel Content -->
        <div v-if="showConfigPanel" class="control-panel" @click.stop>
          <!-- Embedding Type Section -->
          <div class="control-section">
            <h4 class="section-title">Embedding Type</h4>
            <div class="control-item">
              <n-select
                :disabled="showDiscreteLoader"
                v-model:value="selectedChunk"
                @update:value="onChunkChange"
                :options="chunkOptions"
                class="embedding-select"
                placeholder="Select embedding type"
                @click.stop
              />
            </div>
          </div>

          <!-- Visual Aspects Filter Section -->
          <div class="control-section">
            <h4 class="section-title">Visual Aspects</h4>
            <div class="control-item">
              <n-tree-select
                v-model:value="selectedVisualAspects"
                multiple
                clearable
                placeholder="Any aspect"
                :options="treeSelectOptions"
                :max-tag-count="2"
                class="aspects-select"
                :disabled="showDiscreteLoader"
                size="small"
                check-strategy="child"
                :show-path="false"
                expand-on-click
                @update:value="onVisualAspectsChange"
                @click.stop
              >
                <template #empty>
                  <div style="padding: 8px; color: #888; font-size: 12px">
                    No visual aspects found
                  </div>
                </template>
              </n-tree-select>
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
                  <div class="control-tip"><strong>F:</strong> Move up</div>
                  <div class="control-tip"><strong>V:</strong> Move down</div>
                </div>
              </n-tooltip>
            </h4>
          </div>
        </div>
      </div>
    </div>

    <!-- Discrete Loading Indicator -->
    <div v-if="showDiscreteLoader" class="discrete-loader">
      <div class="loader-header">
        <div class="loader-spinner"></div>
        <span class="loader-title-small">{{ loaderTitle }}</span>
      </div>
      <div class="loader-progress-container">
        <div class="progress-bar-small">
          <div
            class="progress-fill-small"
            :style="{ width: `${loadingProgress}%` }"
          ></div>
        </div>
        <span class="progress-percentage">{{ loadingProgress }}%</span>
      </div>
      <span class="loader-subtitle-small">{{ loaderSubtitle }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { TresCanvas } from "@tresjs/core";
import {
  NTooltip,
  NSwitch,
  NSelect,
  NIcon,
  NSlider,
  NTreeSelect,
  NButton,
} from "naive-ui";
import { InfoCircleOutlined } from "@vicons/antd";
import { use3DPhotos } from "@/composables/use3DPhotos.js";
import { useTextureCache } from "@/composables/useTextureCache.js";
import { useFirstPersonControls } from "@/composables/useFirstPersonControls.js";
import { visualAspectsOptions } from "@/stores/searchStore.js";
import * as THREE from "three";
import pLimit from "p-limit";

// Composable para manejo de fotos 3D
const {
  photos3D,
  isLoading,
  currentChunk,
  error,
  chunkOptions,
  loadAllPhotos,
  changeChunk,
  reset,
} = use3DPhotos();

// Sistema de caché de texturas
const textureCache = useTextureCache({
  maxCacheSize: 500,
  expiryDays: 7,
});

// Desestructurar funciones del caché (añadimos loadMultipleCachedTextures para batch)
const {
  loadTexture,
  isTextureCached,
  getCachedTextureSync,
  loadMultipleCachedTextures,
} = textureCache;

// Referencias del DOM y Three.js
const containerRef = ref();
const canvasRef = ref();
const cameraRef = ref();

// Estado del componente
const useBillboarding = ref(true);
const useDistanceOpacity = ref(true);
const currentPosition = ref({ x: 0, y: 0, z: 80 });

// Panel de configuración ocultable
const showConfigPanel = ref(false);

// Filtro de aspectos visuales
const selectedVisualAspects = ref([]);

// Loader discreto con progreso
const showDiscreteLoader = ref(true);
const loaderTitle = ref("Loading Photos");
const loaderSubtitle = ref("Preparing your photo collection...");
const totalPhotosToLoad = ref(0);
const loadedPhotosCount = ref(0);
const loadingProgress = ref(0);
const hasCachedPhotos = ref(false);

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

// Canvas configuration - Force WebGL2 with GPU acceleration
const gl = ref({
  clearColor: "#1a1a1a",
  antialias: true,
  powerPreference: "high-performance", // Prefer discrete GPU
  forceWebGL: true, // Force WebGL over Canvas 2D
  preserveDrawingBuffer: false, // Better performance
  premultipliedAlpha: false, // Better performance
});

// Three.js objects - Improved lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight1.position.set(10, 10, 10);

// Create lights group
const lightsGroup = new THREE.Group();
lightsGroup.add(ambientLight);
lightsGroup.add(directionalLight1);

// Geometry for photo planes - Optimized for GPU
const planeGeometry = new THREE.PlaneGeometry(4, 3);
// Set to not update geometry buffers frequently (GPU optimization)
planeGeometry.attributes.position.setUsage(THREE.StaticDrawUsage);
planeGeometry.attributes.uv.setUsage(THREE.StaticDrawUsage);
planeGeometry.attributes.normal.setUsage(THREE.StaticDrawUsage);

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

// Cola de texturas pendientes (IDs) y control dinámico de batch
const textureQueue = ref([]);
const queuedIds = new Set();
const scheduledDownloads = new Set(); // evita doble scheduling mientras p-limit gestiona
let dynamicBatch = 4; // tamaño inicial
const MIN_BATCH = 2;
const MAX_BATCH = 10;
// Límite de concurrencia de descargas simultáneas (gestionado por p-limit)
const MAX_CONCURRENT_DOWNLOADS = 20;
// Modo: pre-scheduling de toda la cola (true) o incremental por frame (false)
const FULL_QUEUE_SCHEDULING = true;
// Limitador de concurrencia usando p-limit
const limitTexture = pLimit(MAX_CONCURRENT_DOWNLOADS);

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

// GPU verification and capabilities
const checkGPUCapabilities = () => {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

  if (!gl) {
    console.error("❌ WebGL not supported - falling back to CPU rendering");
    return false;
  }

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  if (debugInfo) {
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    console.log("🎮 GPU Info:", {
      vendor,
      renderer,
      webglVersion: gl.constructor.name,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
    });

    // Check if using software rendering (usually indicates CPU fallback)
    const isSoftwareRenderer =
      renderer.toLowerCase().includes("software") ||
      renderer.toLowerCase().includes("microsoft") ||
      renderer.toLowerCase().includes("llvmpipe");

    if (isSoftwareRenderer) {
      console.warn("⚠️ Software rendering detected - GPU may not be available");
      return false;
    }

    console.log("✅ Hardware-accelerated GPU rendering active");
    return true;
  }

  console.log("✅ WebGL available (GPU info not accessible)");
  return true;
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
    // GPU optimizations
    alphaTest: 0.01, // Discard nearly transparent pixels early in GPU
    depthWrite: false, // Better for transparent objects
    depthTest: true,
  });

// Frustum culling - solo renderizar fotos visibles
const visiblePhotos = ref([]);

// Función para limpiar la cola de texturas de fotos ya cargadas
const cleanTextureQueue = () => {
  const initialQueueLength = textureQueue.value.length;
  if (initialQueueLength === 0) return 0;

  // Filtrar solo las fotos que realmente necesitan carga
  const validIds = textureQueue.value.filter((id) => {
    const photo = photosWithMaterials.value.find((p) => p.id === id);
    return photo && !photo.__textureLoaded && !photo.__loading;
  });

  // Limpiar IDs que ya no son válidos del Set
  textureQueue.value.forEach((id) => {
    const photo = photosWithMaterials.value.find((p) => p.id === id);
    if (!photo || photo.__textureLoaded) {
      queuedIds.delete(id);
    }
  });

  textureQueue.value = validIds;
  const cleanedCount = initialQueueLength - validIds.length;

  if (cleanedCount > 0) {
    console.log(
      `🧼 cleanTextureQueue: Limpiados ${cleanedCount} elementos obsoletos de la cola`
    );
  }

  return cleanedCount;
};

// Función para actualizar el progreso de carga
const updateLoadingProgress = () => {
  if (totalPhotosToLoad.value === 0) {
    loadedPhotosCount.value = 0;
    loadingProgress.value = 0;
    return;
  }

  const loadedPhotos = photosWithMaterials.value.filter(
    (photo) => photo.__textureLoaded
  );
  loadedPhotosCount.value = loadedPhotos.length;

  const progress = Math.round(
    (loadedPhotosCount.value / totalPhotosToLoad.value) * 100
  );
  loadingProgress.value = Math.min(progress, 100);

  console.log("📊 Progreso de carga:", {
    loaded: loadedPhotosCount.value,
    total: totalPhotosToLoad.value,
    progress: loadingProgress.value + "%",
  });
};

// Función para verificar si todas las texturas están cargadas
const checkAllTexturesLoaded = () => {
  // Primero limpiar la cola de elementos obsoletos
  cleanTextureQueue();

  // Actualizar progreso
  updateLoadingProgress();

  console.log("🔍 checkAllTexturesLoaded - Estado actual:", {
    photosCount: photosWithMaterials.value.length,
    isLoading: isLoading.value,
    queueLength: textureQueue.value.length,
    progress: loadingProgress.value + "%",
  });

  // Si no hay fotos y ya no está cargando, ocultar loader
  if (photosWithMaterials.value.length === 0 && !isLoading.value) {
    console.log("📭 No hay fotos y no está cargando - ocultando loader");
    hideLoaderAndEnableNavigation();
    return;
  }

  // Si no hay fotos pero aún está cargando, mantener loader
  if (photosWithMaterials.value.length === 0 && isLoading.value) {
    console.log("⏳ No hay fotos pero aún está cargando - manteniendo loader");
    return;
  }

  // Verificar estado de cada foto
  const loadedPhotos = photosWithMaterials.value.filter(
    (photo) => photo.__textureLoaded
  );
  const loadingPhotos = photosWithMaterials.value.filter(
    (photo) => photo.__loading
  );

  const allLoaded = photosWithMaterials.value.every(
    (photo) => photo.__textureLoaded
  );
  const nothingLoading = photosWithMaterials.value.every(
    (photo) => !photo.__loading
  );
  const noQueuePending = textureQueue.value.length === 0;

  console.log("📊 Estado detallado de texturas:", {
    totalPhotos: photosWithMaterials.value.length,
    loadedPhotos: loadedPhotos.length,
    loadingPhotos: loadingPhotos.length,
    allLoaded,
    nothingLoading,
    noQueuePending,
    isLoading: isLoading.value,
    queueLength: textureQueue.value.length,
  });

  // Solo ocultar cuando todo esté realmente terminado
  if (allLoaded && nothingLoading && noQueuePending && !isLoading.value) {
    console.log(
      "🎯 ¡Todas las condiciones cumplidas! - Ocultando loader discreto"
    );
    hideLoader();
  } else {
    console.log(
      "⏸️ Aún no se cumplen todas las condiciones para ocultar el loader. Razones:",
      {
        allLoaded: !allLoaded ? "❌ No todas las fotos están cargadas" : "✅",
        nothingLoading: !nothingLoading ? "❌ Hay fotos aún cargando" : "✅",
        noQueuePending: !noQueuePending
          ? `❌ Cola pendiente: ${textureQueue.value.length} elementos`
          : "✅",
        isNotLoading: isLoading.value
          ? "❌ Aún está en proceso de carga"
          : "✅",
      }
    );
  }
};

// Función para obtener el label del chunk actual
const getCurrentChunkLabel = () => {
  const option = chunkOptions.find((opt) => opt.value === currentChunk.value);
  return option ? option.label : currentChunk.value;
};

// Computed para las opciones del tree select de aspectos visuales
const treeSelectOptions = computed(() => {
  return visualAspectsOptions.map((group) => ({
    label: group.label,
    key: group.key,
    disabled: false,
    checkable: false,
    children: group.children.map((child) => ({
      label: child.label,
      key: child.value,
      disabled: false,
      checkable: true,
    })),
  }));
});

// Create a mapping from visual aspect values to their categories
const createVisualAspectCategoryMap = () => {
  const categoryMap = new Map();

  visualAspectsOptions.forEach((group) => {
    group.children.forEach((child) => {
      categoryMap.set(child.value, group.key);
    });
  });

  return categoryMap;
};

const visualAspectCategoryMap = createVisualAspectCategoryMap();

// Aplicar filtro de aspectos visuales (solo marca visibilidad, no elimina fotos)
const applyVisualAspectsFilter = () => {
  console.log("🔍 Aplicando filtro de aspectos visuales:", {
    selectedAspects: selectedVisualAspects.value,
    totalPhotos: photosWithMaterials.value.length,
  });

  photosWithMaterials.value.forEach((photo) => {
    if (selectedVisualAspects.value.length === 0) {
      // Sin filtro: mostrar todas las fotos
      photo.isVisible = true;
    } else {
      // Con filtro: verificar si la foto tiene al menos uno de los aspectos seleccionados
      if (!photo.descriptions?.visual_aspects) {
        photo.isVisible = false;
      } else {
        photo.isVisible = selectedVisualAspects.value.some((selectedAspect) => {
          // Get the category for this aspect (e.g., "cold" -> "temperature")
          const category = visualAspectCategoryMap.get(selectedAspect);

          if (!category) {
            console.warn(`⚠️ Category not found for aspect: ${selectedAspect}`);
            return false;
          }

          // Check if the photo has this category and if it includes the selected aspect
          const photoAspects = photo.descriptions.visual_aspects[category];
          if (!photoAspects || !Array.isArray(photoAspects)) {
            return false;
          }

          return photoAspects.includes(selectedAspect);
        });
      }
    }
  });

  const visibleCount = photosWithMaterials.value.filter(
    (p) => p.isVisible
  ).length;
  console.log(
    `📊 Filtro aplicado: ${visibleCount}/${photosWithMaterials.value.length} fotos visibles`
  );
};

// Computed para fotos filtradas (solo las marcadas como visibles)
const filteredPhotos = computed(() => {
  return photosWithMaterials.value.filter((photo) => photo.isVisible !== false);
});

// Handler para cambio en filtro de aspectos visuales
const onVisualAspectsChange = () => {
  console.log(
    "🔄 onVisualAspectsChange triggered:",
    selectedVisualAspects.value
  );
  applyVisualAspectsFilter();
  updateVisiblePhotos();
  if (useBillboarding.value) updateBillboardRotations();
};

// Función de easing para animaciones suaves
const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Variable para almacenar las posiciones target de la animación actual
let animationTargetPositions = [];

// Función para animar la transición entre posiciones
const animatePositionTransition = (fromPositions, toPositions) => {
  console.log("🎬 animatePositionTransition called:", {
    fromLength: fromPositions.length,
    toLength: toPositions.length,
    isTransitioningBefore: isTransitioning.value,
  });

  if (fromPositions.length !== toPositions.length) {
    console.warn("⚠️ Número diferente de posiciones en la transición:", {
      from: fromPositions.length,
      to: toPositions.length,
    });

    // 🔧 SOLUCIÓN: Ajustar arrays para que tengan la misma longitud
    const minLength = Math.min(fromPositions.length, toPositions.length);
    const adjustedFromPositions = fromPositions.slice(0, minLength);
    const adjustedToPositions = toPositions.slice(0, minLength);

    console.log(`🔧 Ajustando arrays a longitud ${minLength}`);

    // Llamar recursivamente con arrays ajustados
    return animatePositionTransition(
      adjustedFromPositions,
      adjustedToPositions
    );
  }

  if (fromPositions.length === 0) {
    console.warn("⚠️ No hay posiciones para animar");
    return;
  }

  // Guardar posiciones target para la animación
  animationTargetPositions = [...toPositions]; // Hacer copia profunda

  isTransitioning.value = true;
  animationStartTime.value = performance.now();

  console.log(
    `🎬 Iniciando animación de transición de ${fromPositions.length} fotos`
  );
  console.log("🎯 Posiciones origen:", fromPositions.slice(0, 3));
  console.log("🎯 Posiciones target:", toPositions.slice(0, 3));
  console.log("🔄 isTransitioning:", isTransitioning.value);
};

// Función para actualizar las posiciones durante la animación
const updateTransitionPositions = (currentTime) => {
  if (!isTransitioning.value || animationTargetPositions.length === 0) {
    // Log solo una vez para evitar spam
    if (isTransitioning.value && animationTargetPositions.length === 0) {
      console.log(
        "⚠️ updateTransitionPositions: animationTargetPositions está vacío"
      );
    }
    return;
  }

  const elapsed = currentTime - animationStartTime.value;
  const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
  const easedProgress = easeInOutCubic(progress);

  // Log cada 30 frames aproximadamente
  if (Math.floor(elapsed / 50) !== Math.floor((elapsed - 16) / 50)) {
    console.log(`🎭 Animando... Progreso: ${(progress * 100).toFixed(1)}%`);
  }

  // Interpolar posiciones para cada foto (usar la longitud mínima por seguridad)
  const maxIndex = Math.min(
    photosWithMaterials.value.length,
    animationTargetPositions.length
  );

  for (let index = 0; index < maxIndex; index++) {
    const photo = photosWithMaterials.value[index];
    const targetPos = animationTargetPositions[index];
    const startPos = photo.transitionStartPosition || photo.position;

    // Interpolar cada componente
    photo.position = [
      startPos[0] + (targetPos[0] - startPos[0]) * easedProgress,
      startPos[1] + (targetPos[1] - startPos[1]) * easedProgress,
      startPos[2] + (targetPos[2] - startPos[2]) * easedProgress,
    ];
  }

  // Finalizar animación
  if (progress >= 1) {
    isTransitioning.value = false;
    console.log("✅ Transición de posiciones completada");

    // Asegurar posiciones finales exactas
    const maxFinalIndex = Math.min(
      photosWithMaterials.value.length,
      animationTargetPositions.length
    );
    for (let index = 0; index < maxFinalIndex; index++) {
      photosWithMaterials.value[index].position = [
        ...animationTargetPositions[index],
      ];
    }

    // Limpiar propiedades temporales
    photosWithMaterials.value.forEach((photo) => {
      delete photo.transitionStartPosition;
    });

    // Limpiar referencias
    animationTargetPositions = [];

    console.log("🎯 Posiciones finales aplicadas correctamente");
  }
};

// Función para detectar si tenemos fotos en cache
const checkIfPhotosAreCached = async (photos) => {
  if (!photos || photos.length === 0) {
    console.log("🔍 checkIfPhotosAreCached: No hay fotos para verificar");
    return false;
  }

  let cachedCount = 0;
  const photosToCheck = photos.slice(0, 10); // Comprobar las primeras 10 fotos

  console.log("🔍 Verificando cache para", photosToCheck.length, "fotos...");

  for (const photo of photosToCheck) {
    const imageUrl = photo.thumbnailUrl || photo.url || photo.originalUrl;
    if (imageUrl) {
      try {
        // Usar getCachedTextureSync en lugar de isTextureCached que podría no existir
        const cachedTexture = getCachedTextureSync(imageUrl);
        if (cachedTexture) {
          cachedCount++;
          console.log("✅ Cache hit:", imageUrl.substring(0, 50) + "...");
        } else {
          console.log("❌ Cache miss:", imageUrl.substring(0, 50) + "...");
        }
      } catch (e) {
        console.warn("⚠️ Error verificando cache para:", imageUrl, e);
      }
    }
  }

  // Si más del 70% están cacheadas, consideramos que hay cache
  const cacheRatio = cachedCount / photosToCheck.length;
  const hasCache = cacheRatio > 0.7;

  console.log("📊 Resultado detección cache:", {
    photosChecked: photosToCheck.length,
    cachedCount,
    cacheRatio: (cacheRatio * 100).toFixed(1) + "%",
    threshold: "70%",
    hasCache,
  });

  return hasCache;
};

// Función para configurar el loader según el estado de cache
const setupLoaderForPhotos = async (photos) => {
  console.log("🚀 setupLoaderForPhotos iniciado para", photos.length, "fotos");

  totalPhotosToLoad.value = photos.length;
  loadedPhotosCount.value = 0;
  loadingProgress.value = 0;

  console.log("🔍 Verificando estado de cache...");
  hasCachedPhotos.value = await checkIfPhotosAreCached(photos);

  console.log(
    "📝 Configurando loader basado en resultado:",
    hasCachedPhotos.value
  );

  loaderTitle.value = "Loading Photos";
  loaderSubtitle.value = "Preparing your photo collection...";

  console.log("📋 Loader configurado:", {
    totalPhotos: totalPhotosToLoad.value,
    hasCachedPhotos: hasCachedPhotos.value,
    title: loaderTitle.value,
    subtitle: loaderSubtitle.value,
  });
};

// Función para ocultar loader (mantener navegación siempre activa)
const hideLoader = () => {
  showDiscreteLoader.value = false;
  console.log("✅ Loader ocultado - Carga completada");
};

// Función para mostrar loader (sin bloquear navegación)
const showLoader = () => {
  showDiscreteLoader.value = true;
  console.log("⏳ Mostrando loader discreto");
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

    // Crear material con la textura - GPU optimized
    // Optimize texture for GPU
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrap;
    texture.wrapT = THREE.ClampToEdgeWrap;
    texture.format = THREE.RGBAFormat;
    // texture.flipY = true; // Default value for images - keeps photos right-side up

    const newMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      // GPU optimizations
      alphaTest: 0.01,
      depthWrite: false,
      depthTest: true,
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
    // Actualizar progreso incluso en caso de error
    updateLoadingProgress();
  } finally {
    photoObj.__loading = false;
    // Verificar nuevamente al finalizar
    checkAllTexturesLoaded();
  }
};

// ✨ Nueva función batch para cargar texturas cacheadas en un solo paso (Quick Win 1)
const loadCachedTexturesBatch = async (photos) => {
  if (!photos || photos.length === 0) return 0;
  const urlMap = new Map(); // id -> url
  photos.forEach((p) => {
    if (p.__textureLoaded) return;
    const url = p.thumbnailUrl || p.url || p.originalUrl;
    if (url) urlMap.set(p.id, url);
  });
  const urls = [...urlMap.values()];
  if (!urls.length) return 0;
  let hits = 0;
  try {
    const texturesMap = await loadMultipleCachedTextures(urls);
    photos.forEach((p) => {
      if (p.__textureLoaded) return;
      const url = urlMap.get(p.id);
      const tex = texturesMap.get(url);
      if (tex) {
        // Reutilizar material placeholder si existe
        if (!p.material) {
          p.material = createPlaceholderMaterial();
        }
        p.material.map = tex;
        p.material.needsUpdate = true;
        p.__textureLoaded = true;
        p.__loading = false;
        hits++;
      }
    });
    if (hits) {
      updateLoadingProgress();
      checkAllTexturesLoaded();
    }
  } catch (e) {
    console.warn("Error en loadCachedTexturesBatch:", e);
  }
  return hits;
};

// Nueva función para encolar TODAS las fotos no cacheadas (sin filtro de frustum)
const enqueueAllNonCachedPhotos = (photos) => {
  if (!photos || photos.length === 0) return 0;

  let enqueuedCount = 0;
  const cameraPos = cameraRef.value?.position || { x: 0, y: 0, z: 0 };

  photos.forEach((photo) => {
    if (
      !photo.__textureLoaded &&
      !photo.__loading &&
      !queuedIds.has(photo.id) &&
      !scheduledDownloads.has(photo.id)
    ) {
      // Pre-calcular prioridad por distancia al cuadrado (sin sqrt)
      const dx = photo.position[0] - cameraPos.x;
      const dy = photo.position[1] - cameraPos.y;
      const dz = photo.position[2] - cameraPos.z;
      photo.__priority = dx * dx + dy * dy + dz * dz;
      textureQueue.value.push(photo.id);
      queuedIds.add(photo.id);
      enqueuedCount++;
    }
  });

  // Ordenar cola por prioridad si agregamos elementos
  if (enqueuedCount > 0 && textureQueue.value.length > 1) {
    textureQueue.value.sort((aId, bId) => {
      const a = photosWithMaterials.value.find((p) => p.id === aId);
      const b = photosWithMaterials.value.find((p) => p.id === bId);
      return (a?.__priority || 0) - (b?.__priority || 0);
    });
  }

  console.log(`📋 Encoladas ${enqueuedCount} fotos no cacheadas para carga`);
  return enqueuedCount;
};

// Integración nueva: Inicializar foto con placeholder y encolar su ID
const registerNewPhotos = async (newPhotos) => {
  console.log("🔄 Registrando fotos nuevas, configurando loader discreto");

  // Configurar el loader según el estado de cache
  await setupLoaderForPhotos(newPhotos);
  showLoader();

  const prepared = newPhotos.map((p) => ({
    ...p,
    material: createPlaceholderMaterial(),
    position: p.position || [0, 0, 0],
    billboardRotation: [0, 0, 0],
    __textureLoaded: false,
    __loading: false,
    isVisible: true, // Inicializar como visible
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

  // ✨ Batch: cargar todas las texturas cacheadas en un solo acceso
  const cachedHits = await loadCachedTexturesBatch(prepared);
  const photosNeedingDownload = prepared.filter((p) => !p.__textureLoaded);
  console.log(
    `� Cache hits: ${cachedHits} | Descarga necesaria: ${photosNeedingDownload.length}`
  );

  // Aplicar filtro de aspectos visuales a las fotos nuevas
  applyVisualAspectsFilter();

  // ⚡ ESTRATEGIA DIFERENTE: Agregar fotos cacheadas inmediatamente a visiblePhotos
  const cachedPhotos = prepared.filter((p) => p.__textureLoaded);
  const nonCachedPhotos = prepared.filter((p) => !p.__textureLoaded);

  console.log(`💾 Fotos cacheadas (inmediatas): ${cachedPhotos.length}`);
  console.log(`⏳ Fotos no cacheadas (progresivas): ${nonCachedPhotos.length}`);

  // Agregar las cacheadas inmediatamente a visibles
  if (cachedPhotos.length > 0) {
    // Filtrar las cacheadas que pasan el filtro de aspectos visuales
    const cachedVisible = cachedPhotos.filter(
      (photo) => photo.isVisible !== false
    );
    visiblePhotos.value = [...(visiblePhotos.value || []), ...cachedVisible];
    console.log(
      `✨ ${cachedVisible.length} fotos cacheadas agregadas inmediatamente a visiblePhotos`
    );
  }

  // Si hay fotos no cacheadas, encolar TODAS para carga (no solo las visibles)
  if (nonCachedPhotos.length > 0) {
    enqueueAllNonCachedPhotos(nonCachedPhotos);
  }

  if (useBillboarding.value) updateBillboardRotations();

  // Verificar si podemos ocultar el loader
  if (photosNeedingDownload.length === 0) {
    console.log("🎯 Todas las texturas están cacheadas - ocultando loader");
    checkAllTexturesLoaded();
  }
};

// ✨ Nueva función optimizada para cambios de chunk que reutiliza texturas
const updatePhotosPositions = async (newPhotos) => {
  console.log("🔄 Actualizando posiciones de fotos existentes con animación");

  // Configurar el loader para las nuevas fotos
  await setupLoaderForPhotos(newPhotos);
  showLoader();

  // Crear un mapa de fotos por ID para matching rápido
  const existingPhotosMap = new Map();
  photosWithMaterials.value.forEach((photo, index) => {
    existingPhotosMap.set(photo.id, { photo, index });
  });

  // Guardar posiciones actuales (infladas) para animación
  const oldPositions = photosWithMaterials.value.map((photo) => [
    ...photo.position,
  ]);

  // Array para las nuevas posiciones originales y finales
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
        isVisible: existing.photo.isVisible || true, // Preservar visibilidad
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
        isVisible: true, // Inicializar como visible
        transitionStartPosition: [0, 0, 0], // Empezar desde el centro
      };
      updatedPhotos.push(newPhotoObj);
    }

    // Guardar posición original para el escaleo radial
    newOriginalPositions.push([...(newPhoto.position || [0, 0, 0])]);
  });

  // Actualizar arrays
  photosWithMaterials.value = updatedPhotos;
  originalPositions.value = newOriginalPositions;

  // 🔧 ASEGURAR SINCRONIZACIÓN: Si hay diferencias de longitud, ajustar oldPositions
  const effectiveOldPositions = oldPositions.slice(0, updatedPhotos.length);

  // 🎯 CALCULAR POSICIONES FINALES CON ESCALEO APLICADO
  const finalPositions = calculateScaledPositions(
    newOriginalPositions,
    inflateFactor.value
  );

  console.log("🔍 Debug animación:", {
    oldPositionsLength: effectiveOldPositions.length,
    finalPositionsLength: finalPositions.length,
    photosWithMaterialsLength: photosWithMaterials.value.length,
    inflateFactor: inflateFactor.value,
    sampleOldPos: effectiveOldPositions.slice(0, 2),
    sampleFinalPos: finalPositions.slice(0, 2),
  });

  // Iniciar animación de transición con las posiciones finales correctas
  animatePositionTransition(effectiveOldPositions, finalPositions);

  // Cargar texturas para fotos nuevas que no las tengan
  const photosNeedingTextures = updatedPhotos.filter(
    (photo) => !photo.__textureLoaded && !photo.__loading
  );

  if (photosNeedingTextures.length > 0) {
    console.log(
      `🖼️ Cargando texturas para ${photosNeedingTextures.length} fotos nuevas...`
    );
    const cachedHits = await loadCachedTexturesBatch(photosNeedingTextures);
    const photosNeedingDownload = photosNeedingTextures.filter(
      (p) => !p.__textureLoaded
    );
    console.log(
      `� Cache hits nuevas: ${cachedHits} | Net: ${photosNeedingDownload.length}`
    );

    // Aplicar filtros a todas las fotos
    applyVisualAspectsFilter();

    // ⚡ Separar fotos cacheadas (existentes + nuevas cacheadas) vs no cacheadas
    const allCachedPhotos = photosNeedingTextures.filter(
      (p) => p.__textureLoaded
    );
    const allNonCachedPhotos = photosNeedingTextures.filter(
      (p) => !p.__textureLoaded
    );

    console.log(
      `💾 Fotos cacheadas en updatePhotosPositions: ${allCachedPhotos.length}`
    );
    console.log(
      `⏳ Fotos no cacheadas en updatePhotosPositions: ${allNonCachedPhotos.length}`
    );

    // Agregar todas las fotos ya cargadas (existentes + cacheadas) a visibles inmediatamente
    const allLoadedPhotos = updatedPhotos.filter(
      (p) => p.__textureLoaded && p.isVisible !== false
    );
    visiblePhotos.value = allLoadedPhotos;
    console.log(
      `✨ ${allLoadedPhotos.length} fotos cargadas mostradas inmediatamente en updatePhotosPositions`
    );

    // Si hay fotos no cacheadas, encolar TODAS para carga (no solo las visibles)
    if (allNonCachedPhotos.length > 0) {
      enqueueAllNonCachedPhotos(allNonCachedPhotos);
    }

    if (useBillboarding.value) updateBillboardRotations();

    if (photosNeedingDownload.length === 0) {
      console.log(
        "🎯 Todas las texturas en updatePhotosPositions están cacheadas - ocultando loader"
      );
      checkAllTexturesLoaded();
    }
  } else {
    // Solo hay fotos existentes - todas ya están cargadas
    console.log("🎯 Solo fotos existentes - todas mostradas inmediatamente");
    applyVisualAspectsFilter();
    const allExistingLoaded = updatedPhotos.filter(
      (p) => p.__textureLoaded && p.isVisible !== false
    );
    visiblePhotos.value = allExistingLoaded;
    if (useBillboarding.value) updateBillboardRotations();
    checkAllTexturesLoaded();
  }
};

// Función para calcular posiciones escaladas sin modificar el estado
const calculateScaledPositions = (positions, scaleFactor) => {
  console.log("📏 calculateScaledPositions:", {
    inputLength: positions.length,
    scaleFactor,
    samplePositions: positions.slice(0, 2),
  });

  if (positions.length === 0) {
    console.warn("⚠️ calculateScaledPositions: array de posiciones vacío");
    return [];
  }

  // Calcular centroide de las posiciones
  const centroid = [
    positions.reduce((sum, pos) => sum + pos[0], 0) / positions.length,
    positions.reduce((sum, pos) => sum + pos[1], 0) / positions.length,
    positions.reduce((sum, pos) => sum + pos[2], 0) / positions.length,
  ];

  console.log("📐 Centroide calculado:", centroid);

  // Aplicar escaleo radial y devolver nuevas posiciones
  const scaledPositions = positions.map((originalPos) => {
    const vector = [
      originalPos[0] - centroid[0],
      originalPos[1] - centroid[1],
      originalPos[2] - centroid[2],
    ];

    return [
      centroid[0] + vector[0] * scaleFactor,
      centroid[1] + vector[1] * scaleFactor,
      centroid[2] + vector[2] * scaleFactor,
    ];
  });

  console.log("📏 Posiciones escaladas (sample):", scaledPositions.slice(0, 2));
  return scaledPositions;
};

// Función para aplicar escaleo radial
const applyRadialScaling = () => {
  if (
    photosWithMaterials.value.length === 0 ||
    originalPositions.value.length === 0
  )
    return;

  // Usar la función de cálculo y aplicar al estado
  const scaledPositions = calculateScaledPositions(
    originalPositions.value,
    inflateFactor.value
  );

  photosWithMaterials.value.forEach((photo, index) => {
    if (index >= scaledPositions.length) return;
    photo.position = scaledPositions[index];
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

// Performance logging function with GPU monitoring
const logPerformanceMetrics = () => {
  if (performanceMetrics.frameTime.length === 0) return;

  const avgFrameTime =
    performanceMetrics.frameTime.reduce((a, b) => a + b) /
    performanceMetrics.frameTime.length;
  const maxFrameTime = Math.max(...performanceMetrics.frameTime);
  const fps = 1000 / avgFrameTime;

  let logMessage = `[Photos3D Performance - GPU Accelerated]`;
  logMessage += `\n  Average frame time: ${avgFrameTime.toFixed(2)}ms`;
  logMessage += `\n  Max frame time: ${maxFrameTime.toFixed(2)}ms`;
  logMessage += `\n  FPS: ${fps.toFixed(1)}`;
  logMessage += `\n  Visible photos: ${visiblePhotos.value.length}`;
  logMessage += `\n  Total photos: ${photosWithMaterials.value.length}`;

  // GPU performance indicators
  if (fps < 30) {
    logMessage += `\n  ⚠️ LOW FPS: Consider reducing photo count or quality`;
  } else if (fps > 55) {
    logMessage += `\n  ✅ GOOD FPS: GPU performing well`;
  }

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

  console.log(logMessage);

  // Clear metrics arrays to prevent memory buildup
  performanceMetrics.frameTime = [];
  performanceMetrics.updateVisibleTime = [];
  performanceMetrics.billboardTime = [];
  performanceMetrics.opacityTime = [];
};

// Función para actualizar fotos visibles usando Frustum Culling
const updateVisiblePhotos = () => {
  if (!cameraRef.value || filteredPhotos.value.length === 0) {
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

  // Filtrar fotos que intersectan con el frustum (usar fotos filtradas)
  const newVisibleFromFrustum = filteredPhotos.value.filter((photo) => {
    reusableVector3.set(...photo.position);
    reusableSphere.set(reusableVector3, 2); // Radio de la esfera de la foto
    return reusableFrustum.intersectsSphere(reusableSphere);
  });

  // ⚡ CLAVE: No sobrescribir, sino mantener fotos cacheadas + agregar nuevas del frustum
  const existingCachedIds = new Set(
    visiblePhotos.value.filter((p) => p.__textureLoaded).map((p) => p.id)
  );
  const newPhotosToAdd = newVisibleFromFrustum.filter(
    (photo) => !existingCachedIds.has(photo.id)
  );

  // Mantener las cacheadas + agregar las nuevas del frustum
  const existingCached = visiblePhotos.value.filter((p) => p.__textureLoaded);
  visiblePhotos.value = [...existingCached, ...newPhotosToAdd];

  // Solo loggear cuando hay cambios significativos
  if (newPhotosToAdd.length > 0) {
    console.log(
      `🔄 updateVisiblePhotos: Manteniendo ${existingCached.length} cacheadas, agregando ${newPhotosToAdd.length} del frustum`
    );
  }

  // Encolar para carga real SOLO las que están visibles, no cargadas, y necesitan descarga de red
  const cameraPos = camera.position;
  newVisibleFromFrustum.forEach((photo) => {
    if (
      !photo.__textureLoaded &&
      !photo.__loading &&
      !queuedIds.has(photo.id) &&
      !scheduledDownloads.has(photo.id)
    ) {
      // Pre-calcular prioridad por distancia al cuadrado (sin sqrt)
      const dx = photo.position[0] - cameraPos.x;
      const dy = photo.position[1] - cameraPos.y;
      const dz = photo.position[2] - cameraPos.z;
      photo.__priority = dx * dx + dy * dy + dz * dz;
      textureQueue.value.push(photo.id);
      queuedIds.add(photo.id);
    }
  });
  // Ordenar cola global una vez tras inserciones (small optimization)
  if (textureQueue.value.length > 1) {
    textureQueue.value.sort((aId, bId) => {
      const a = photosWithMaterials.value.find((p) => p.id === aId);
      const b = photosWithMaterials.value.find((p) => p.id === bId);
      return (a?.__priority || 0) - (b?.__priority || 0);
    });
  }
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

  // 🚨 MOSTRAR LOADER INMEDIATAMENTE antes de la llamada a la API
  loaderTitle.value = "Loading Photos";
  loaderSubtitle.value = "Fetching new coordinates...";
  loadingProgress.value = 0;
  showLoader();

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
  showLoader();
  await loadAllPhotos(currentChunk.value);
};

// Función de animación
const animate = () => {
  const frameStart = performance.now();
  frameCounter++;

  // Calcular frame time y ajustar batch dinámico (Quick Win 2)
  if (!animate._last) animate._last = frameStart;
  const frameTime = frameStart - animate._last;
  animate._last = frameStart;
  if (frameTime < 14 && dynamicBatch < MAX_BATCH) dynamicBatch++;
  else if (frameTime > 26 && dynamicBatch > MIN_BATCH) dynamicBatch--;

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

  // Procesar cola de texturas (batch dinámico)
  processTextureQueue();

  const frameEnd = performance.now();
  // Renombrado para evitar redeclaración (ya existe frameTime arriba para batch dinámico)
  const frameDuration = frameEnd - frameStart;
  performanceMetrics.frameTime.push(frameDuration);

  // Log performance metrics periodically
  if (frameEnd - lastPerformanceLog > PERFORMANCE_LOG_INTERVAL) {
    logPerformanceMetrics();
    lastPerformanceLog = frameEnd;
  }

  animationId = requestAnimationFrame(animate);
};

// Procesador de cola usando p-limit: enqueuea tareas (opcionalmente toda la cola) respetando prioridad ya calculada
const processTextureQueue = () => {
  if (textureQueue.value.length === 0) return;

  // Limpieza ligera de elementos inválidos / ya cargados al frente
  while (textureQueue.value.length) {
    const idFront = textureQueue.value[0];
    const objFront = photosWithMaterials.value.find((p) => p.id === idFront);
    if (!objFront || objFront.__textureLoaded) {
      textureQueue.value.shift();
      queuedIds.delete(idFront);
      continue;
    }
    break;
  }

  if (textureQueue.value.length === 0) return;

  const toSchedule = FULL_QUEUE_SCHEDULING
    ? textureQueue.value.length
    : Math.min(dynamicBatch, textureQueue.value.length);

  // Nota: p-limit mantiene su propia cola; aquí simplemente pre-programamos en orden de prioridad.
  for (let i = 0; i < toSchedule; i++) {
    const id = textureQueue.value.shift();
    queuedIds.delete(id);
    const photoObj = photosWithMaterials.value.find((p) => p.id === id);
    if (
      !photoObj ||
      photoObj.__textureLoaded ||
      photoObj.__loading ||
      scheduledDownloads.has(id)
    )
      continue;
    scheduledDownloads.add(id);
    limitTexture(() => loadRealTextureForPhoto(photoObj, false))
      .catch(() => {})
      .finally(() => {
        scheduledDownloads.delete(id);
        // Cuando terminen todas las tareas pendientes y la cola esté vacía, verificar loader
        if (textureQueue.value.length === 0) {
          // microtask para esperar a que otras finalizaciones entren
          queueMicrotask(() => checkAllTexturesLoaded());
        } else if (!FULL_QUEUE_SCHEDULING) {
          // En modo incremental, intenta seguir drenando sin esperar al próximo frame
          queueMicrotask(() => processTextureQueue());
        }
      });
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

  // Configuración simple: velocidad inicial + aceleración constante
  fpControls.value.setMoveSpeed(1.2); // Velocidad máxima
  fpControls.value.setInitialSpeed(0.0001); // Velocidad inicial baja pero perceptible
  fpControls.value.setAccelerationRate(1.2); // Aceleración constante
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
      currentChunk: currentChunk.value,
      firstThreeNewPhotosIds: newPhotos.slice(0, 3).map((p) => p.id),
      firstThreeExistingIds: photosWithMaterials.value
        .slice(0, 3)
        .map((p) => p.id),
    }); // Si hay fotos nuevas o cambios en las posiciones
    if (newPhotos.length > 0) {
      // Si no hay fotos con materiales (primera carga o limpieza completa)
      if (photosWithMaterials.value.length === 0) {
        console.log(
          "📸 Primera carga: registrando todas las fotos del chunk:",
          newPhotos.length
        );
        // Limpiar filtros solo si es un chunk completamente diferente
        if (
          oldPhotos &&
          oldPhotos.length > 0 &&
          newPhotos.length > 0 &&
          newPhotos[0].id !== oldPhotos[0].id
        ) {
          selectedVisualAspects.value = [];
        }
        await registerNewPhotos(newPhotos);
      }
      // Si ya tenemos fotos con materiales (cambio de chunk u optimización)
      else if (photosWithMaterials.value.length > 0) {
        console.log(
          "♻️ Usando optimización: actualizando posiciones con animación"
        );
        await updatePhotosPositions(newPhotos);
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
    } else {
      console.log("⚠️ Watcher photos3D: No se ejecutó ninguna acción.", {
        newPhotosLength: newPhotos.length,
        photosWithMaterialsLength: photosWithMaterials.value.length,
        reason:
          newPhotos.length === 0
            ? "No hay fotos nuevas"
            : "Condiciones no cumplidas",
      });
    }
  },
  { immediate: false }
);

// Watcher: controlar el loader central cuando esté cargando
watch(isLoading, (newIsLoading, oldIsLoading) => {
  console.log("🔄 isLoading watcher:", {
    oldIsLoading,
    newIsLoading,
    currentPhotosCount: photosWithMaterials.value.length,
  });

  if (newIsLoading) {
    console.log("⏳ Proceso de carga iniciado");
    // No mostrar el loader aquí, se maneja en registerNewPhotos/updatePhotosPositions
  } else {
    console.log(
      "✅ isLoading = false, verificando si todas las texturas están listas"
    );
    // Cuando termine de cargar, verificar si todas las texturas están listas
    checkAllTexturesLoaded();
  }
});

// Watcher para aspectos visuales seleccionados
watch(
  selectedVisualAspects,
  () => {
    console.log(
      "🔄 selectedVisualAspects watcher triggered:",
      selectedVisualAspects.value
    );
    applyVisualAspectsFilter();
    updateVisiblePhotos();
    if (useBillboarding.value) updateBillboardRotations();
  },
  { deep: true }
);

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
    // Verificar capacidades GPU primero
    const gpuAvailable = checkGPUCapabilities();
    if (!gpuAvailable) {
      console.warn(
        "⚠️ GPU acceleration may not be available - performance could be limited"
      );
    }

    // El loader central se configurará en loadAllPhotos

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
  min-width: 280px;
  max-width: 320px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideDown 0.2s ease-out;
  margin-top: var(--spacing-xs);
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

/* Config Panel Container */
.config-panel-container {
  pointer-events: auto;
  position: relative;
}

.panel-header {
  background: var(--bg-container, rgba(26, 26, 31, 0.95));
  backdrop-filter: blur(12px);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  min-width: 200px;
  margin-bottom: var(--spacing-sm);
}

.panel-header:hover {
  background: var(--bg-container-hover, rgba(35, 35, 40, 0.95));
  border-color: rgba(255, 255, 255, 0.15);
}

.panel-title {
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  font-weight: 500;
}

.panel-toggle-icon {
  transition: transform 0.2s ease;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

.panel-toggle-icon.panel-open {
  transform: rotate(180deg);
}

/* Embedding Select */
.embedding-select {
  width: 100%;
}

/* Aspects Select */
.aspects-select {
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
  background: var(--bg-container, rgba(26, 26, 31, 0.95));
  backdrop-filter: blur(12px);
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-lg, 16px) var(--spacing-xl, 24px);
  z-index: 1000;
  min-width: 280px;
  animation: loaderSlideUp 0.3s ease-out;
}

@keyframes loaderSlideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.loader-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md, 12px);
  margin-bottom: var(--spacing-md, 12px);
}

.loader-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color, rgba(255, 255, 255, 0.2));
  border-top: 2px solid var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: discreteSpinner 1s linear infinite;
}

@keyframes discreteSpinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader-title-small {
  color: var(--text-primary, #ffffff);
  font-size: var(--font-size-base, 16px);
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
}

.loader-progress-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  margin-bottom: var(--spacing-sm, 8px);
}

.progress-bar-small {
  flex: 1;
  height: 6px;
  background: var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill-small {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-color, #3b82f6),
    var(--primary-color-hover, #2563eb)
  );
  border-radius: 3px;
  transition: width 0.3s ease;
  animation: progressPulse 2s infinite;
}

@keyframes progressPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.progress-percentage {
  color: var(--primary-color, #3b82f6);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-semibold, 600);
  min-width: 35px;
  text-align: right;
}

.loader-subtitle-small {
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-medium, 500);
  text-align: center;
  display: block;
}
</style>
