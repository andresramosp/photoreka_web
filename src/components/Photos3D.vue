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
        :position="[0, 0, 150]"
        :fov="75"
        :aspect="cameraAspect"
        :near="0.1"
        :far="2000"
      />

      <!-- Lighting -->
      <primitive :object="lightsGroup" />

      <!-- Photo planes - renderizar solo fotos visibles y no ocultas por LOD -->
      <!-- v-memo: Solo re-renderizar cuando cambien position, rotation o material -->
      <template v-for="(photo, index) in photosToRender" :key="photo.id">
        <TresMesh
          v-memo="[
            photo.position,
            photo.billboardRotation,
            photo.material,
            useBillboarding,
          ]"
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

    <!-- Config Panels (Outside UI Overlay to avoid positioning conflicts) -->
    <!-- Collapsed Panel (Small Corner Button) -->
    <div
      v-if="!showConfigPanel"
      class="collapsed-panel"
      @click="showConfigPanel = true"
      @click.stop
    >
      <n-icon class="settings-icon">
        <SettingOutlined />
      </n-icon>
    </div>

    <!-- Expanded Panel Content -->
    <div v-if="showConfigPanel" class="control-panel" @click.stop @wheel.stop>
      <!-- Close Button (Top Right Corner) -->
      <button class="close-panel-btn-corner" @click="showConfigPanel = false">
        <n-icon>
          <CloseOutlined />
        </n-icon>
      </button>

      <!-- Clustering Type Section (Always Visible) -->
      <div class="control-section">
        <h4 class="section-title">Clustering Type</h4>
        <div class="control-item-full">
          <n-select
            :disabled="showDiscreteLoader"
            v-model:value="selectedChunk"
            @update:value="onChunkChange"
            :options="chunkOptions"
            size="small"
            class="embedding-select"
            placeholder="Select embedding type"
            @click.stop
          />
        </div>
      </div>

      <!-- More Filters Toggle -->
      <div class="control-section">
        <div class="section-toggle" @click="showMoreFilters = !showMoreFilters">
          <span class="section-toggle-label">Search filters</span>
          <div class="section-toggle-indicators">
            <span
              v-if="
                selectedVisualAspects.length > 0 ||
                selectedArtisticScores.length > 0 ||
                searchResults.length > 0
              "
              class="active-indicator"
            >
              {{
                selectedVisualAspects.length +
                selectedArtisticScores.length +
                (searchResults.length > 0 ? 1 : 0)
              }}
            </span>
            <n-icon
              size="12"
              class="toggle-icon"
              :class="{ rotated: showMoreFilters }"
            >
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6l1.41-1.41z"
                />
              </svg>
            </n-icon>
          </div>
        </div>

        <!-- Collapsible Filters Container -->
        <div v-if="showMoreFilters" class="filters-container">
          <div class="filters-content">
            <!-- Visual Aspects Filter -->
            <div class="filter-item">
              <label class="filter-label">Visual Aspects</label>
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

            <!-- Artistic Scores Filter -->
            <div class="filter-item">
              <div style="display: flex; align-items: center; gap: 4px">
                <label class="filter-label" style="margin: 0"
                  >Visual Scores</label
                >
                <n-tooltip trigger="hover" placement="top">
                  <template #trigger>
                    <n-icon
                      size="12"
                      style="color: rgba(255, 255, 255, 0.45); cursor: help"
                    >
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                        />
                      </svg>
                    </n-icon>
                  </template>
                  Will include photos above 7 in the selected scores
                </n-tooltip>
              </div>
              <n-tree-select
                v-model:value="selectedArtisticScores"
                multiple
                clearable
                placeholder="Any"
                :options="createArtisticScoresTreeOptions()"
                :max-tag-count="2"
                class="aspects-select"
                :disabled="showDiscreteLoader"
                size="small"
                check-strategy="child"
                :show-path="false"
                expand-on-click
                @update:value="onArtisticScoresChange"
                @click.stop
              >
                <template #empty>
                  <div style="padding: 8px; color: #888; font-size: 12px">
                    No artistic scores found
                  </div>
                </template>
              </n-tree-select>
            </div>

            <!-- Text Search Filter -->
            <div class="filter-item">
              <div style="display: flex; align-items: center; gap: 4px">
                <label class="filter-label" style="margin: 0"
                  >Search by Content</label
                >
                <n-tooltip trigger="hover" placement="top">
                  <template #trigger>
                    <n-icon
                      size="12"
                      style="color: rgba(255, 255, 255, 0.45); cursor: help"
                    >
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                        />
                      </svg>
                    </n-icon>
                  </template>
                  Applies a shallow and approximate text-based search
                </n-tooltip>
              </div>
              <n-input
                v-model:value="searchQuery"
                placeholder="Search photos by description..."
                size="small"
                :clearable="!isSearching"
                class="text-search-input"
                @input="onSearchChange"
                @clear="clearSearch"
                @keydown.stop
              >
                <template #prefix>
                  <n-icon size="16">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                      />
                    </svg>
                  </n-icon>
                </template>
                <template #suffix>
                  <n-spin
                    v-if="isSearching"
                    size="small"
                    class="search-spinner"
                  />
                </template>
              </n-input>
            </div>
          </div>
        </div>
      </div>

      <!-- Display Options Toggle -->
      <div class="control-section">
        <div
          class="section-toggle"
          @click="showDisplayOptions = !showDisplayOptions"
        >
          <span class="section-toggle-label">Display Options</span>
          <n-icon
            size="12"
            class="toggle-icon"
            :class="{ rotated: showDisplayOptions }"
          >
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6l1.41-1.41z"
              />
            </svg>
          </n-icon>
        </div>

        <!-- Display Options Content -->
        <div v-if="showDisplayOptions" class="options-container">
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
            <span class="control-label">Distance Transparency</span>
            <n-switch
              v-model:value="useDistanceOpacity"
              size="small"
              @click.stop
            />
          </div>

          <!-- Radial Scaling Slider -->
          <div class="control-item-full" style="margin-top: 12px">
            <label
              class="control-label"
              style="margin-bottom: 8px; display: block"
            >
              Radial Scaling
            </label>
            <div class="slider-container">
              <n-slider
                v-model:value="inflateFactor"
                @update:value="onInflateFactorChange"
                :min="1.5"
                :max="3.5"
                :step="0.1"
                :marks="{ 1.5: '1.5x', 2.5: '2.5x', 3.5: '3.5x' }"
                class="radial-slider"
                @click.stop
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Controls Toggle -->
      <div class="control-section">
        <div
          class="section-toggle"
          @click="showNavigationControls = !showNavigationControls"
        >
          <span class="section-toggle-label">Navigation Controls</span>
          <n-icon
            size="12"
            class="toggle-icon"
            :class="{ rotated: showNavigationControls }"
          >
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6l1.41-1.41z"
              />
            </svg>
          </n-icon>
        </div>

        <!-- Navigation Controls Content -->
        <div v-if="showNavigationControls" class="controls-info">
          <div class="control-tip">
            <strong>Click on stage:</strong> Activate camera controls
          </div>
          <div class="control-tip">
            <strong>Escape:</strong> Return to normal mouse
          </div>
          <div class="control-tip">
            <strong>WASD:</strong> Navigate forward/back/left/right
          </div>
          <div class="control-tip">
            <strong>Wheel:</strong> Accelerate movement speed
          </div>
          <div class="control-tip"><strong>F:</strong> Move up</div>
          <div class="control-tip"><strong>V:</strong> Move down</div>
        </div>
      </div>
    </div>

    <!-- Discrete Loading Indicator -->
    <div v-if="showDiscreteLoader" class="discrete-loader">
      <div class="loader-spinner"></div>
      <span class="loader-text">{{
        loadingProgress == 0 ? "Building Stage" : "Loading Photos"
      }}</span>
      <span v-show="loadingProgress != 0" class="loader-percentage"
        >{{ loadingProgress }}%</span
      >
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  markRaw,
  shallowRef,
} from "vue";
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
import {
  InfoCircleOutlined,
  CloseOutlined,
  SettingOutlined,
} from "@vicons/antd";
import { use3DPhotos } from "@/composables/3d-viewer/use3DPhotos.js";
import { useFirstPersonControls } from "@/composables//3d-viewer/useFirstPersonControls.js";
import { visualAspectsOptions } from "@/stores/searchStore.js";
import { useArtisticScores } from "@/composables/useArtisticScores.js";
import { useLODSystemComposable } from "@/composables/3d-viewer/useLODSystem.js";
import { api } from "@/utils/axios";
import * as THREE from "three";
import pLimit from "p-limit";

// ===== Debug Flag (wrap noisy logs) =====
const DEBUG_3D = false; // pon a true temporalmente si quieres verbosidad
function dlog(...args) {
  if (DEBUG_3D) console.log(...args);
}

// ===== Retry Configuration for 429 Errors =====
const MAX_RETRIES = 3; // Maximum number of retry attempts for failed downloads
const INITIAL_RETRY_DELAY = 1000; // Initial delay in ms (exponential backoff)
const RETRY_MULTIPLIER = 2; // Multiplier for exponential backoff
const MAX_RETRY_DELAY = 10000; // Maximum delay between retries (10 seconds)

// ===== LOD System Composable =====
const {
  MAIN_TEXTURE_SIZE,
  resizeTextureToMaxSize,
  configureTextureSafely,
  updatePhotoLOD,
  debugLODState,
} = useLODSystemComposable();

// Stats for monitoring 429 errors
const error429Stats = ref({
  total: 0,
  retried: 0,
  recovered: 0,
  failed: 0,
});

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

// Toggle states for collapsible sections
const showMoreFilters = ref(false);
const showDisplayOptions = ref(false);
const showNavigationControls = ref(false);

// Filtro de aspectos visuales
const selectedVisualAspects = ref([]);

// Filtro de artistic scores
const selectedArtisticScores = ref([]);

// Filtro de búsqueda textual
const searchQuery = ref("");
const isSearching = ref(false);
const searchResults = ref([]);
let searchTimeout = null;

// Loader discreto con progreso
const showDiscreteLoader = ref(true);
const loaderTitle = ref("Loading Photos");
const loaderSubtitle = ref("Preparing your photo collection...");
const totalPhotosToLoad = ref(0);
const loadedPhotosCount = ref(0);
const loadingProgress = ref(0);
// Fase inicial: reducimos trabajo por frame hasta que se cargue suficiente
const initialLoadingPhase = ref(true);

// Escaleo radial
const inflateFactor = ref(3);
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

// Aspect ratio dinámico para evitar problemas de resize
const cameraAspect = ref(1);

// Función para actualizar aspect ratio sin disparar recargas
const updateCameraAspect = () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    const newAspect = rect.width / rect.height || 1;
    // Solo actualizar si hay un cambio significativo (>5%) para evitar micro-ajustes
    if (Math.abs(cameraAspect.value - newAspect) > 0.05) {
      cameraAspect.value = newAspect;
    }
  }
};

// Canvas configuration - Optimized for memory efficiency and context stability
// IMPORTANTE: NO usar ref() aquí para evitar reactividad que cause re-cargas de fotos
const gl = {
  clearColor: "#1a1a1a",
  antialias: false, // Disabled for better performance with many textures
  powerPreference: "high-performance", // Prefer discrete GPU
  forceWebGL: true, // Force WebGL over Canvas 2D
  preserveDrawingBuffer: false, // Better performance
  premultipliedAlpha: false, // Better performance
  stencil: false, // Disable stencil buffer to save memory
  depth: true, // Keep depth buffer for proper rendering
  failIfMajorPerformanceCaveat: true, // Fail if software rendering
  // Auto-adjust pixel ratio on low-end devices
  pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
};

// Three.js objects - Improved lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight1.position.set(10, 10, 10);

// Create lights group
// 🎯 markRaw: Objetos Three.js NO deben ser reactivos para mejor performance
const lightsGroup = markRaw(new THREE.Group());
lightsGroup.add(ambientLight);
lightsGroup.add(directionalLight1);

// Geometry for photo planes - Optimized for GPU
// 🎯 markRaw: Evita que Vue haga este objeto reactivo (mejora de performance)
const planeGeometry = markRaw(new THREE.PlaneGeometry(4, 3));
// Set to not update geometry buffers frequently (GPU optimization)
planeGeometry.attributes.position.setUsage(THREE.StaticDrawUsage);
planeGeometry.attributes.uv.setUsage(THREE.StaticDrawUsage);
planeGeometry.attributes.normal.setUsage(THREE.StaticDrawUsage);

// Grid helper
// 🎯 markRaw: Grid helper tampoco necesita ser reactivo
const gridHelper = markRaw(new THREE.GridHelper(200, 40));
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
// Límite de concurrencia de descargas simultáneas - Reducido para estabilidad
const MAX_CONCURRENT_DOWNLOADS = 12;
// Modo: pre-scheduling de toda la cola (true) o incremental por frame (false)
const FULL_QUEUE_SCHEDULING = true;
// Limitador de concurrencia usando p-limit
const limitTexture = pLimit(MAX_CONCURRENT_DOWNLOADS);

// Map para almacenar imágenes descargadas (imageId -> HTMLImageElement)
const downloadedImagesCache = new Map();

// Control de navegación durante carga inicial
const navigationBlocked = ref(false);
const downloadPhaseComplete = ref(false);

// Performance optimization: throttling variables
let frameCounter = 0;
const THROTTLE_INTERVAL = 3; // Execute heavy operations every N frames
let lastCameraPosition = { x: 0, y: 0, z: 0 };
const CAMERA_MOVE_THRESHOLD = 0.5; // Minimum movement to trigger updates

// Reusable THREE.js objects to avoid garbage collection
// 🎯 markRaw: Objetos reutilizables no necesitan tracking reactivo
const reusableFrustum = markRaw(new THREE.Frustum());
const reusableMatrix = markRaw(new THREE.Matrix4());
const reusableVector3 = markRaw(new THREE.Vector3());
const reusableSphere = markRaw(new THREE.Sphere());

// Distance calculation cache
const distanceCache = new Map();
let cacheValidPosition = { x: 0, y: 0, z: 0 };

// Reusable objects for billboard calculations
// 🎯 markRaw: Objetos temporales de cálculo no necesitan reactividad
const tempObject = markRaw(new THREE.Object3D());
const directionToCamera = markRaw(new THREE.Vector3());

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
phCtx.fillStyle = "#1e40af"; // Azul primario del theme
phCtx.fillRect(0, 0, 8, 8);
phCtx.fillStyle = "#3b82f6"; // Azul más claro para contraste
phCtx.fillRect(0, 0, 4, 8);
// 🎯 markRaw: Texturas Three.js no necesitan reactividad
const placeholderTexture = markRaw(new THREE.CanvasTexture(placeholderCanvas));
// Configure placeholder texture safely
configureTextureSafely(placeholderTexture);

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
const visiblePhotos = ref([]); // SOLO fotos actualmente en el frustum
const cachedPhotosSet = new Set(); // IDs de fotos con texturas cargadas (para evitar recargas)

// Función para limpiar la cola de texturas de fotos ya cargadas
const cleanTextureQueue = () => {
  const initialQueueLength = textureQueue.value.length;
  if (initialQueueLength === 0) return 0;

  // Filtrar solo las fotos que realmente necesitan descarga
  const validIds = textureQueue.value.filter((id) => {
    const photo = photosWithMaterials.value.find((p) => p.id === id);
    return photo && !photo.__imageDownloaded && !photo.__downloading;
  });

  // Limpiar IDs que ya no son válidos del Set
  textureQueue.value.forEach((id) => {
    const photo = photosWithMaterials.value.find((p) => p.id === id);
    if (!photo || photo.__imageDownloaded) {
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

  // Durante fase de descarga, contar imágenes descargadas
  // Después de bulk creation, contar texturas cargadas
  const loadedPhotos = downloadPhaseComplete.value
    ? photosWithMaterials.value.filter((photo) => photo.__textureLoaded)
    : photosWithMaterials.value.filter((photo) => photo.__imageDownloaded);

  loadedPhotosCount.value = loadedPhotos.length;

  const progress = Math.round(
    (loadedPhotosCount.value / totalPhotosToLoad.value) * 100
  );
  loadingProgress.value = Math.min(progress, 100);
  dlog("📊 Progreso de carga:", {
    loaded: loadedPhotosCount.value,
    total: totalPhotosToLoad.value,
    progress: loadingProgress.value + "%",
  });

  if (
    initialLoadingPhase.value &&
    (loadingProgress.value >= 80 ||
      (textureQueue.value.length === 0 && !isLoading.value))
  ) {
    initialLoadingPhase.value = false;
    dlog("🚀 Finaliza initialLoadingPhase (threshold alcanzado)");
  }
};

// Función para verificar si todas las texturas están cargadas
const checkAllTexturesLoaded = () => {
  // Primero limpiar la cola de elementos obsoletos
  cleanTextureQueue();

  // Actualizar progreso
  updateLoadingProgress();

  dlog("🔍 checkAllTexturesLoaded - Estado actual:", {
    photosCount: photosWithMaterials.value.length,
    isLoading: isLoading.value,
    queueLength: textureQueue.value.length,
    progress: loadingProgress.value + "%",
  });

  // Si no hay fotos y ya no está cargando, ocultar loader
  if (photosWithMaterials.value.length === 0 && !isLoading.value) {
    return;
  }

  // Si no hay fotos pero aún está cargando, mantener loader
  if (photosWithMaterials.value.length === 0 && isLoading.value) {
    return;
  }

  // Verificar estado de cada foto
  const loadedPhotos = photosWithMaterials.value.filter(
    (photo) => photo.__textureLoaded
  );
  const loadingPhotos = photosWithMaterials.value.filter(
    (photo) => photo.__loading
  );

  // Verificar si fase de descarga está completa
  const allDownloaded = photosWithMaterials.value.every(
    (photo) => photo.__imageDownloaded
  );
  const nothingDownloading = photosWithMaterials.value.every(
    (photo) => !photo.__downloading
  );
  const noQueuePending = textureQueue.value.length === 0;

  // Si terminó la descarga pero aún no creamos texturas
  if (
    allDownloaded &&
    nothingDownloading &&
    noQueuePending &&
    !isLoading.value &&
    !downloadPhaseComplete.value
  ) {
    console.log("🎉 Fase de descarga completada. Creando texturas en bulk...");
    downloadPhaseComplete.value = true;

    // Crear texturas en bulk
    createTexturesInBulk();

    // Reactivar navegación
    navigationBlocked.value = false;

    // Activar controles de navegación si existen
    if (fpControls.value) {
      console.log("🎮 Activando controles de navegación...");
      fpControls.value.setup();
    }

    // Ocultar loader
    hideLoader();
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

// Computed para las opciones del tree select de artistic scores
const createArtisticScoresTreeOptions = () => {
  const { artisticScores } = useArtisticScores();

  return Object.entries(artisticScores).map(([groupKey, group]) => ({
    label: group.label,
    key: groupKey,
    disabled: false,
    checkable: false,
    children: group.criteria.map((criterion) => ({
      label: criterion.label,
      key: criterion.value,
      disabled: false,
      checkable: true,
    })),
  }));
};

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

// Aplicar filtro de aspectos visuales Y búsqueda textual (solo marca visibilidad, no elimina fotos)
const applyFilters = () => {
  // Crear Set de IDs de fotos que pasan el filtro de búsqueda textual
  const searchFilteredIds = new Set();
  const hasSearchFilter =
    searchQuery.value.trim() && searchResults.value.length > 0;

  if (hasSearchFilter) {
    searchResults.value.forEach((photo) => searchFilteredIds.add(photo.id));
  }

  photosWithMaterials.value.forEach((photo) => {
    // Aplicar filtro de búsqueda textual PRIMERO (más restrictivo)
    if (hasSearchFilter && !searchFilteredIds.has(photo.id)) {
      photo.isVisible = false;
      return;
    }

    // Si no hay filtros de aspectos ni scores, mostrar foto
    if (
      selectedVisualAspects.value.length === 0 &&
      selectedArtisticScores.value.length === 0
    ) {
      photo.isVisible = true;
      return;
    }

    let passesVisualAspects = true;
    let passesArtisticScores = true;

    // Filtro de Visual Aspects (lógica OR dentro de categorías, AND entre categorías)
    if (selectedVisualAspects.value.length > 0) {
      if (!photo.descriptions?.visual_aspects) {
        passesVisualAspects = false;
      } else {
        // Agrupar aspectos seleccionados por categoría
        const selectedByCategory = new Map();
        selectedVisualAspects.value.forEach((selectedAspect) => {
          const category = visualAspectCategoryMap.get(selectedAspect);
          if (category) {
            if (!selectedByCategory.has(category)) {
              selectedByCategory.set(category, []);
            }
            selectedByCategory.get(category).push(selectedAspect);
          }
        });

        // Para que la foto sea visible, debe cumplir TODAS las categorías seleccionadas (AND)
        // Pero dentro de cada categoría, solo necesita cumplir UNA opción (OR)
        passesVisualAspects = Array.from(selectedByCategory.entries()).every(
          ([category, aspectsInCategory]) => {
            const photoAspects = photo.descriptions.visual_aspects[category];
            if (!photoAspects || !Array.isArray(photoAspects)) {
              return false;
            }

            // OR: debe tener al menos uno de los aspectos de esta categoría
            const hasAnyAspectInCategory = aspectsInCategory.some((aspect) =>
              photoAspects.includes(aspect)
            );

            return hasAnyAspectInCategory;
          }
        );
      }
    }

    // Filtro de Artistic Scores (score > 7 para cada score seleccionado)
    if (selectedArtisticScores.value.length > 0) {
      if (!photo.descriptions.artistic_scores) {
        passesArtisticScores = false;
      } else {
        // Para pasar el filtro, la foto debe tener TODOS los scores seleccionados con valor > 7
        passesArtisticScores = selectedArtisticScores.value.every(
          (scoreKey) => {
            const scoreValue = photo.descriptions.artistic_scores[scoreKey];
            return scoreValue !== undefined && scoreValue > 7;
          }
        );
      }
    }

    // La foto es visible solo si pasa AMBOS filtros (AND lógico)
    photo.isVisible = passesVisualAspects && passesArtisticScores;
  });

  const visibleCount = photosWithMaterials.value.filter(
    (p) => p.isVisible
  ).length;
  const hiddenCount = photosWithMaterials.value.filter(
    (p) => p.isVisible === false
  ).length;

  // Log resumen de la lógica aplicada
  const filterInfo = [];
  if (selectedVisualAspects.value.length > 0) {
    filterInfo.push(`${selectedVisualAspects.value.length} visual aspects`);
  }
  if (selectedArtisticScores.value.length > 0) {
    filterInfo.push(`${selectedArtisticScores.value.length} artistic scores`);
  }
  if (hasSearchFilter) {
    filterInfo.push(
      `text search: "${searchQuery.value}" (${searchResults.value.length} results)`
    );
  }

  if (filterInfo.length > 0) {
    console.log(
      `🔍 Filtros aplicados: ${filterInfo.join(
        " + "
      )} | Visibles: ${visibleCount} | Ocultas: ${hiddenCount}`
    );
  }

  // Debug adicional: mostrar algunas fotos que NO pasaron el filtro
  if (
    (selectedVisualAspects.value.length > 0 ||
      selectedArtisticScores.value.length > 0) &&
    hiddenCount > 0
  ) {
    const hiddenExamples = photosWithMaterials.value
      .filter((p) => p.isVisible === false)
      .slice(0, 3)
      .map((p) => ({
        id: String(p.id).substring(0, 8) + "...",
        hasVisualAspects: !!p.descriptions?.visual_aspects,
        hasScores: !!p.descriptions.artistic_scores,
        aspectKeys: p.descriptions?.visual_aspects
          ? Object.keys(p.descriptions.visual_aspects)
          : [],
        scoreKeys: p.descriptions.artistic_scores
          ? Object.keys(p.descriptions.artistic_scores)
          : [],
      }));
    console.log("🔍 Ejemplos de fotos ocultas por filtro:", hiddenExamples);
  }
};

// Computed para fotos filtradas (solo las marcadas como visibles)
const filteredPhotos = computed(() => {
  return photosWithMaterials.value.filter((photo) => photo.isVisible !== false);
});

// 🔧 Computed para fotos que realmente se deben renderizar (filtrar las ocultas por LOD)
const photosToRender = computed(() => {
  return visiblePhotos.value.filter((photo) => !photo.__isLODHidden);
});

// Handler para cambio en filtro de aspectos visuales
const onVisualAspectsChange = () => {
  console.log(
    "🔄 onVisualAspectsChange triggered:",
    selectedVisualAspects.value
  );
  applyFilters();
  updateVisiblePhotos();
  updatePhotoEffects(); // Aplica LOD, Billboard y Opacity con distancias pre-calculadas
};

// Handler para cambio en filtro de artistic scores
const onArtisticScoresChange = () => {
  console.log(
    "🔄 onArtisticScoresChange triggered:",
    selectedArtisticScores.value
  );
  applyFilters();
  updateVisiblePhotos();
  updatePhotoEffects(); // Aplica LOD, Billboard y Opacity con distancias pre-calculadas
};

// Search functionality - Similar a PhotosDialog.vue
const onSearchChange = () => {
  // Clear any existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // If search is empty, clear search
  if (!searchQuery.value.trim()) {
    clearSearch();
    return;
  }

  // Debounce search to avoid too many API calls
  searchTimeout = setTimeout(async () => {
    await performSearch();
  }, 1000);
};

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    clearSearch();
    return;
  }

  isSearching.value = true;
  searchResults.value = [];

  try {
    const payload = {
      description: searchQuery.value.trim(),
      options: {
        iteration: 1,
        pageSize: 100,
        searchMode: "low_precision",
      },
    };

    const { data: response } = await api.post(
      "/api/search/semantic/sync",
      payload
    );

    // Handle direct response from sync endpoint
    if (response.data && response.data.results) {
      const photos = [];
      Object.entries(response.data.results).forEach(([iter, items]) => {
        photos.push(...items.map((i) => i.photo));
      });
      searchResults.value = photos;

      console.log(
        `🔍 Búsqueda textual completada: "${searchQuery.value}" - ${photos.length} resultados`
      );
    } else {
      // If no results, show empty array
      searchResults.value = [];
      console.log(`🔍 Búsqueda textual sin resultados: "${searchQuery.value}"`);
    }

    // Apply filters with search results
    applyFilters();
    updateVisiblePhotos();
    updatePhotoEffects();
  } catch (error) {
    console.error("❌ Error searching photos:", error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  searchResults.value = [];
  isSearching.value = false;
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }

  console.log("🔍 Búsqueda textual limpiada");

  // Reapply filters without search
  applyFilters();
  updateVisiblePhotos();
  updatePhotoEffects();
};

// Función de easing para animaciones suaves
const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Variable para almacenar las posiciones target de la animación actual
let animationTargetPositions = [];

// Función para animar la transición entre posiciones
const animatePositionTransition = (fromPositions, toPositions) => {
  if (fromPositions.length !== toPositions.length) {
    console.warn("⚠️ Número diferente de posiciones en la transición:", {
      from: fromPositions.length,
      to: toPositions.length,
    });

    // 🔧 SOLUCIÓN: Ajustar arrays para que tengan la misma longitud
    const minLength = Math.min(fromPositions.length, toPositions.length);
    const adjustedFromPositions = fromPositions.slice(0, minLength);
    const adjustedToPositions = toPositions.slice(0, minLength);

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
};

// Función para actualizar las posiciones durante la animación
const updateTransitionPositions = (currentTime) => {
  if (!isTransitioning.value || animationTargetPositions.length === 0) {
    // Log solo una vez para evitar spam
    if (isTransitioning.value && animationTargetPositions.length === 0) {
    }
    return;
  }

  const elapsed = currentTime - animationStartTime.value;
  const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
  const easedProgress = easeInOutCubic(progress);

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

    // 🎯 CRÍTICO: Actualizar LOD después de que la animación termine
    // Las posiciones finales ya están aplicadas, ahora calcular LODs correctos

    // 🔧 SOLUCIÓN: Forzar actualización de matrices de cámara ANTES de frustum culling
    // Esto asegura que el frustum se calcule con las posiciones finales correctas
    if (cameraRef.value) {
      cameraRef.value.updateMatrixWorld(true);
      cameraRef.value.updateProjectionMatrix();
    }

    // Limpiar cache de distancias para forzar recálculo
    distanceCache.clear();

    updateVisiblePhotos();
    updatePhotoEffects(); // Aplica LOD, Billboard y Opacity con distancias pre-calculadas
  }
}; // Función para configurar el loader
const setupLoaderForPhotos = async (photos) => {
  console.log("🚀 setupLoaderForPhotos iniciado para", photos.length, "fotos");

  totalPhotosToLoad.value = photos.length;
  loadedPhotosCount.value = 0;
  loadingProgress.value = 0;

  loaderTitle.value = "Loading Photos";
  loaderSubtitle.value = "Preparing your photo collection...";
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

// FASE 1: Solo descargar imágenes sin crear texturas Three.js
const downloadImageOnly = async (
  photoObj,
  retryCount = 0,
  isOnDemandRetry = false
) => {
  if (photoObj.__imageDownloaded || photoObj.__downloading) return;
  photoObj.__downloading = true;
  const imageUrl =
    photoObj.thumbnailUrl || photoObj.url || photoObj.originalUrl;

  if (!imageUrl) {
    photoObj.__downloading = false;
    photoObj.__imageDownloaded = true;
    photoObj.__downloadError = true;
    return;
  }

  try {
    // Descargar imagen SIN crear textura Three.js
    const imageElement = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = imageUrl;
    });

    if (!imageElement) {
      throw new Error("Image element is null");
    }

    // 🔑 CRÍTICO: Guardar imagen ORIGINAL sin redimensionar para poder crear
    // texturas de diferentes resoluciones (ULTRA, FULL, REDUCED) sin pérdida de calidad
    downloadedImagesCache.set(photoObj.id, imageElement);

    photoObj.__imageDownloaded = true;
    photoObj.__downloadError = false;
    photoObj.__retryCount = undefined; // Limpiar contador de reintentos si existía

    // Si esta foto se recuperó después de un error 429, actualizar stats
    if (photoObj.__had429Error) {
      error429Stats.value.recovered++;
      console.log(
        `✅ Foto recuperada después de error 429 (retry ${retryCount}):`,
        photoObj.id
      );
      photoObj.__had429Error = false;
    }

    // Actualizar progreso
    updateLoadingProgress();
  } catch (e) {
    // Detectar error 429 (Too Many Requests)
    const is429Error =
      e.message?.includes("429") ||
      e.toString().includes("429") ||
      e.status === 429;

    if (is429Error) {
      error429Stats.value.total++;
      photoObj.__had429Error = true;
      console.warn(
        `⚠️ Error 429 detectado para foto ${photoObj.id} (intento ${
          retryCount + 1
        }/${MAX_RETRIES})`
      );
    }

    // Intentar retry si no hemos alcanzado el máximo y es un error recuperable
    if (retryCount < MAX_RETRIES && (is429Error || !e.message)) {
      error429Stats.value.retried++;
      photoObj.__retryCount = retryCount + 1;

      // Calcular delay con backoff exponencial
      const delay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(RETRY_MULTIPLIER, retryCount),
        MAX_RETRY_DELAY
      );

      console.log(
        `🔄 Reintentando descarga en ${delay}ms... (intento ${retryCount + 1})`
      );

      // Esperar y reintentar
      await new Promise((resolve) => setTimeout(resolve, delay));
      photoObj.__downloading = false; // Reset flag antes de retry
      return downloadImageOnly(photoObj, retryCount + 1, isOnDemandRetry);
    }

    // Si llegamos aquí, falló definitivamente
    console.warn(
      `❌ Fallo definitivo descarga imagen (${retryCount} reintentos):`,
      imageUrl,
      e
    );
    error429Stats.value.failed++;
    photoObj.__imageDownloaded = true;
    photoObj.__downloadError = true;
    // Solo permitir retry bajo demanda si NO es ya un retry bajo demanda (evita bucle infinito)
    if (!isOnDemandRetry) {
      photoObj.__canRetryOnDemand = true;
    }
    updateLoadingProgress();
  } finally {
    photoObj.__downloading = false;
  }
};

// Función para reintentar carga de foto fallida bajo demanda (cuando usuario se acerca)
const retryFailedPhotoOnDemand = async (photo) => {
  if (
    !photo.__downloadError ||
    !photo.__canRetryOnDemand ||
    photo.__downloading
  ) {
    return false;
  }

  console.log(
    `🔄 Reintentando carga bajo demanda para foto fallida: ${photo.id}`
  );

  // Marcar que ya intentamos retry bajo demanda para no repetir constantemente
  photo.__canRetryOnDemand = false;
  photo.__downloadError = false; // Reset error flag
  photo.__imageDownloaded = false; // Reset downloaded flag

  // Intentar descargar de nuevo (marcado como retry bajo demanda para evitar bucle infinito)
  await downloadImageOnly(photo, 0, true);

  // Si se descargó exitosamente, crear textura inmediatamente
  if (photo.__imageDownloaded && !photo.__downloadError) {
    const imageElement = downloadedImagesCache.get(photo.id);
    if (imageElement) {
      try {
        // 🔑 Guardar imagen original COMPLETA para futuros cambios de LOD
        photo.__originalImageElement = imageElement;

        // Crear textura inicial redimensionada (128px)
        const resizedImage = resizeTextureToMaxSize(
          imageElement,
          MAIN_TEXTURE_SIZE
        );
        const texture = new THREE.CanvasTexture(resizedImage);
        const isSmall = true;
        configureTextureSafely(texture, isSmall);

        const newMat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          alphaTest: 0.01,
          depthWrite: false,
          depthTest: true,
        });

        photo.__originalTexture = texture;

        if (photo.material) {
          photo.material.dispose();
        }
        photo.material = newMat;
        photo.__textureLoaded = true;

        console.log(
          `✅ Foto fallida cargada exitosamente bajo demanda: ${photo.id}`
        );
        return true;
      } catch (error) {
        console.warn("Error creando textura bajo demanda:", photo.id, error);
        photo.__downloadError = true;
        return false;
      }
    }
  }

  return false;
};

// FASE 2: Crear texturas en bulk desde imágenes descargadas
const createTexturesInBulk = () => {
  console.log(
    "🎨 Creando texturas en bulk para",
    downloadedImagesCache.size,
    "imágenes"
  );

  let createdCount = 0;
  let errorCount = 0;

  photosWithMaterials.value.forEach((photo) => {
    // Si tiene error de descarga, mantener placeholder
    if (photo.__downloadError) {
      errorCount++;
      return;
    }

    const imageElement = downloadedImagesCache.get(photo.id);
    if (!imageElement) {
      errorCount++;
      return;
    }

    try {
      // 🔑 IMPORTANTE: Guardar imagen original COMPLETA para LOD de alta calidad
      photo.__originalImageElement = imageElement;

      // Crear textura inicial REDIMENSIONADA para optimizar memoria en vista normal
      const resizedImage = resizeTextureToMaxSize(
        imageElement,
        MAIN_TEXTURE_SIZE
      );
      const texture = new THREE.CanvasTexture(resizedImage);
      const isSmall = true; // Siempre es pequeña (128px)
      configureTextureSafely(texture, isSmall);

      const newMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.01,
        depthWrite: false,
        depthTest: true,
      });

      // Almacenar textura original (128px) para LOD FULL y REDUCED
      photo.__originalTexture = texture;

      // Reemplazar material placeholder
      if (photo.material) {
        photo.material.dispose?.();
      }
      photo.material = newMat;
      photo.__textureLoaded = true;
      createdCount++;
    } catch (error) {
      console.warn("Error creando textura para foto:", photo.id, error);
      errorCount++;
    }
  });

  console.log("✅ Texturas creadas:", createdCount, "| Errores:", errorCount);

  // 🔧 NO limpiar cache de imágenes - las fotos ahora mantienen referencia en __originalImageElement
  // downloadedImagesCache.clear(); // ELIMINADO: necesitamos las imágenes para LOD

  // 🎯 CRÍTICO: Actualizar LOD inmediatamente después de crear texturas
  // Esto asegura que las fotos tengan el nivel de detalle correcto desde el inicio
  updateVisiblePhotos();
  updatePhotoEffects(); // Aplica LOD, Billboard y Opacity con distancias pre-calculadas
};

// Nueva función para encolar TODAS las fotos no cacheadas (sin filtro de frustum)
const enqueueAllNonCachedPhotos = (photos) => {
  if (!photos || photos.length === 0) return 0;

  let enqueuedCount = 0;
  const cameraPos = cameraRef.value?.position || { x: 0, y: 0, z: 0 };

  photos.forEach((photo) => {
    if (
      !photo.__imageDownloaded &&
      !photo.__downloading &&
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

  dlog(`📋 Encoladas ${enqueuedCount} fotos no cacheadas para carga`);
  return enqueuedCount;
};

// Integración nueva: Inicializar foto con placeholder y encolar su ID
const registerNewPhotos = async (newPhotos) => {
  dlog("🔄 Registrando fotos nuevas, configurando loader discreto");

  // Bloquear navegación durante carga inicial
  navigationBlocked.value = true;
  downloadPhaseComplete.value = false;

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
    __imageDownloaded: false,
    __downloading: false,
    __downloadError: false,
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

  // Aplicar filtro de aspectos visuales a las fotos nuevas
  applyFilters();

  // Encolar todas las fotos para carga de texturas
  if (prepared.length > 0) enqueueAllNonCachedPhotos(prepared);

  // Iniciar loop mínimo de descarga (solo processTextureQueue, sin Three.js)
  if (!downloadLoopId) {
    startDownloadLoop();
  }

  // Recalcular visibilidad global (frustum + filtros) tras registrar
  updateVisiblePhotos();
  updatePhotoEffects(); // Aplica LOD, Billboard y Opacity con distancias pre-calculadas
};

// ✨ Nueva función optimizada para cambios de chunk que reutiliza texturas
const updatePhotosPositions = async (newPhotos) => {
  const byId = new Map(newPhotos.map((p) => [p.id, p]));
  const existingById = new Map(photosWithMaterials.value.map((p) => [p.id, p]));

  // Guardar start positions para animación (solo de las que persisten)
  const startPositions = [];
  const targetPositions = [];
  const newOriginalPositions = [];

  // 1. Mutar existentes que siguen estando
  newPhotos.forEach((np) => {
    const existing = existingById.get(np.id);
    const targetPos = np.position || np.coordinates || [0, 0, 0];
    newOriginalPositions.push([...targetPos]);
    if (existing) {
      // preparar transición
      startPositions.push([...(existing.position || targetPos)]);
      targetPositions.push([...targetPos]);
      existing.transitionStartPosition = [...(existing.position || targetPos)];
      // actualizar datos mínimos; NO reemplazar material / flags
      existing.position = [...(existing.position || targetPos)]; // se interpolará, no saltar directo
      existing.coordinates = targetPos;
    }
  });

  // 2. Añadir nuevas que no existían
  newPhotos.forEach((np) => {
    if (!existingById.has(np.id)) {
      const targetPos = np.position || np.coordinates || [0, 0, 0];
      const obj = {
        ...np,
        material: createPlaceholderMaterial(),
        position: [0, 0, 0], // partir del origen para animar hacia target
        billboardRotation: [0, 0, 0],
        __textureLoaded: false,
        __loading: false,
        __imageDownloaded: false,
        __downloading: false,
        __downloadError: false,
        isVisible: true,
        transitionStartPosition: [0, 0, 0],
      };
      photosWithMaterials.value.push(obj);
      startPositions.push([0, 0, 0]);
      targetPositions.push([...targetPos]);
      newOriginalPositions.push([...targetPos]);
    }
  });

  // 3. Eliminar las que ya no vienen
  if (photosWithMaterials.value.length !== newPhotos.length) {
    const validIds = new Set(newPhotos.map((p) => p.id));
    photosWithMaterials.value = photosWithMaterials.value.filter((p) =>
      validIds.has(p.id)
    );
  }

  // Actualizar originales (se usan para escaleo radial)
  originalPositions.value = newOriginalPositions;

  // Animar
  animatePositionTransition(
    startPositions,
    calculateScaledPositions(targetPositions, inflateFactor.value)
  );

  // Imágenes a descargar (solo las nuevas)
  const toTexture = photosWithMaterials.value.filter(
    (p) => !p.__imageDownloaded && !p.__downloading
  );

  // Solo mostrar loader y bloquear navegación si hay fotos nuevas que descargar
  if (toTexture.length > 0) {
    console.log(`🔄 Hay ${toTexture.length} fotos nuevas por descargar`);
    await setupLoaderForPhotos(toTexture);
    showLoader();
    navigationBlocked.value = true;
    downloadPhaseComplete.value = false;
    enqueueAllNonCachedPhotos(toTexture);

    // Iniciar loop mínimo de descarga si no está corriendo
    if (!downloadLoopId) {
      startDownloadLoop();
    }
  } else {
    console.log("✅ No hay fotos nuevas por descargar, solo recolocando");
    // Asegurar que el loader esté oculto
    hideLoader();
  }

  applyFilters();
  updatePhotoEffects(); // Aplica LOD, Billboard y Opacity con distancias pre-calculadas

  // ⚠️ NOTA: NO actualizamos LOD aquí porque las posiciones están en transición
  // El LOD se actualizará automáticamente al finalizar la animación en updateTransitionPositions()
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
  updatePhotoEffects(); // Aplica LOD, Billboard y Opacity con distancias pre-calculadas
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

// Función para actualizar fotos visibles usando Frustum Culling ESTRICTO
// 🎯 OPTIMIZACIÓN: visiblePhotos ahora contiene SOLO fotos en el frustum actual
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

  // 🔥 CRÍTICO: Filtrar SOLO fotos que intersectan con el frustum ACTUAL
  // No mantener fotos antiguas cacheadas en este array
  visiblePhotos.value = filteredPhotos.value.filter((photo) => {
    reusableVector3.set(...photo.position);
    reusableSphere.set(reusableVector3, 2); // Radio de la esfera de la foto
    return reusableFrustum.intersectsSphere(reusableSphere);
  });

  // 🔧 Restaurar visibilidad de fotos que están en el frustum
  visiblePhotos.value.forEach((photo) => {
    if (photo.__isLODHidden) {
      photo.__isLODHidden = false;
      photo.__currentLOD = undefined; // Forzar recálculo en próximo frame
    }
    // Actualizar cache de fotos con texturas cargadas
    if (photo.__textureLoaded) {
      cachedPhotosSet.add(photo.id);
    }
  });

  // Encolar para carga real SOLO las que están visibles, no cargadas, y necesitan descarga de red
  const cameraPos = camera.position;
  visiblePhotos.value.forEach((photo) => {
    if (
      !photo.__imageDownloaded &&
      !photo.__downloading &&
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

// 🚀 NUEVA: Calcular distancias para todas las fotos visibles UNA SOLA VEZ por frame
// Esto evita recalcular distancias múltiples veces en LOD, Billboard y Opacity
const calculateDistancesForVisiblePhotos = (cameraPosition) => {
  return visiblePhotos.value.map((photo) => {
    const distSq =
      Math.pow(cameraPosition.x - photo.position[0], 2) +
      Math.pow(cameraPosition.y - photo.position[1], 2) +
      Math.pow(cameraPosition.z - photo.position[2], 2);

    return {
      photo,
      distSq,
      distance: Math.sqrt(distSq), // Calcular una sola vez
    };
  });
};

// 🎯 Helper: Actualizar LOD, Billboard y Opacity con cálculo de distancias integrado
// Usar esta función cuando se llame fuera del loop principal
const updatePhotoEffects = () => {
  if (!cameraRef.value || visiblePhotos.value.length === 0) return;

  const photosWithDistances = calculateDistancesForVisiblePhotos(
    cameraRef.value.position
  );

  // Ordenar por distancia una sola vez
  photosWithDistances.sort((a, b) => a.distSq - b.distSq);

  // Aplicar todas las funciones
  updatePhotoLOD(
    photosWithDistances,
    retryFailedPhotoOnDemand,
    downloadedImagesCache
  );
  if (useBillboarding.value) updateBillboardRotations(photosWithDistances);
  updatePhotoOpacity(photosWithDistances);
};

// Función para actualizar rotaciones billboard
// 🎯 OPTIMIZADO: Usa distancias pre-calculadas y aplica solo a fotos cercanas
// (fotos lejanas son pequeñas, no se nota tanto la rotación)
const updateBillboardRotations = (photosWithDistances) => {
  if (!cameraRef.value || photosWithDistances.length === 0) return;

  const camera = cameraRef.value;
  const cameraPosition = camera.position;

  // 🎯 Solo aplicar billboard a fotos cercanas si hay muchas
  // (optimización visual: fotos lejanas son tan pequeñas que no se nota)
  let photosToProcess = photosWithDistances;

  if (photosWithDistances.length > MAX_PHOTOS_FOR_BILLBOARD) {
    // Ya vienen ordenadas por distancia, solo tomar las N más cercanas
    photosToProcess = photosWithDistances.slice(0, MAX_PHOTOS_FOR_BILLBOARD);

    dlog(
      `🎨 Billboard: Procesando ${photosToProcess.length}/${photosWithDistances.length} fotos cercanas`
    );
  }

  photosToProcess.forEach(({ photo }) => {
    photo.billboardRotation = calculateBillboardRotation(
      photo.position,
      cameraPosition
    );
  });
};

// 🎯 Límite máximo de fotos para procesar Billboard/Opacity (efectos visuales menores)
// LOD se aplica SIEMPRE a todas las fotos (es necesario para performance)
const MAX_PHOTOS_FOR_BILLBOARD = 2000; // Billboard solo para fotos cercanas
const MAX_PHOTOS_FOR_OPACITY = 2000; // Opacity solo para fotos cercanas

// Mantener configuración original de opacidad por distancia
const MIN_DISTANCE = 60;
const MAX_DISTANCE = 100;
const MIN_OPACITY = 0.2;

// Función de opacidad por distancia
// 🎯 OPTIMIZADO: Usa distancias pre-calculadas y aplica solo a fotos cercanas
// (efecto sutil, no crítico para fotos lejanas)
const updatePhotoOpacity = (photosWithDistances) => {
  if (
    !useDistanceOpacity.value ||
    !cameraRef.value ||
    photosWithDistances.length === 0
  ) {
    // Si no está habilitado, asegurar que todas las fotos tengan opacidad 1
    photosWithDistances.forEach(({ photo }) => {
      if (photo.material && photo.material.opacity !== 1) {
        photo.material.opacity = 1;
      }
    });
    return;
  }

  // 🎯 Solo aplicar opacity a fotos cercanas si hay muchas
  // (efecto visual menor, optimización válida)
  let photosToProcess = photosWithDistances;

  if (photosWithDistances.length > MAX_PHOTOS_FOR_OPACITY) {
    // Ya vienen ordenadas por distancia, solo tomar las N más cercanas
    photosToProcess = photosWithDistances.slice(0, MAX_PHOTOS_FOR_OPACITY);

    dlog(
      `� Opacity: Procesando ${photosToProcess.length}/${photosWithDistances.length} fotos cercanas`
    );
  }

  photosToProcess.forEach(({ photo, distance }) => {
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
    updatePhotoEffects(); // Aplica LOD, Billboard y Opacity con distancias pre-calculadas
  }
};

// Handler para cambio de chunk
const onChunkChange = async (newValue) => {
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

  // Bloquear controles durante fase de descarga inicial
  if (fpControls.value && !navigationBlocked.value) {
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

  const progressRatio =
    totalPhotosToLoad.value > 0
      ? loadedPhotosCount.value / totalPhotosToLoad.value
      : 0;
  const lodAllowed = !initialLoadingPhase.value || progressRatio >= 0.5;
  const frustumInterval = initialLoadingPhase.value ? 9 : THROTTLE_INTERVAL;

  // Solo ejecutar eventos Three.js si no estamos en fase de descarga bloqueada
  if (!navigationBlocked.value) {
    if (frameCounter % frustumInterval === 0 || cameraPositionChanged) {
      updateVisiblePhotos();

      // 🚀 OPTIMIZACIÓN: Calcular distancias UNA SOLA VEZ para todo el frame
      if (lodAllowed && visiblePhotos.value.length > 0 && cameraRef.value) {
        const photosWithDistances = calculateDistancesForVisiblePhotos(
          cameraRef.value.position
        );

        // Ordenar por distancia una sola vez (de cerca a lejos)
        photosWithDistances.sort((a, b) => a.distSq - b.distSq);

        // Aplicar las 3 funciones usando las mismas distancias pre-calculadas
        updatePhotoLOD(
          photosWithDistances,
          retryFailedPhotoOnDemand,
          downloadedImagesCache
        );
        if (useBillboarding.value)
          updateBillboardRotations(photosWithDistances);
        updatePhotoOpacity(photosWithDistances);
      }

      if (!initialLoadingPhase.value && frameCounter % 600 === 0) {
        debugLODState(visiblePhotos.value, photosWithMaterials.value.length);
      }
    }
  }

  // Procesar cola de descargas (siempre, incluso durante bloqueo)
  processTextureQueue();

  animationId = requestAnimationFrame(animate);
};

// Procesador de cola usando p-limit: enqueuea tareas (opcionalmente toda la cola) respetando prioridad ya calculada
const processTextureQueue = () => {
  if (textureQueue.value.length === 0) return;

  // Limpieza ligera de elementos inválidos / ya descargados al frente
  while (textureQueue.value.length) {
    const idFront = textureQueue.value[0];
    const objFront = photosWithMaterials.value.find((p) => p.id === idFront);
    if (!objFront || objFront.__imageDownloaded) {
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
      photoObj.__imageDownloaded ||
      photoObj.__downloading ||
      scheduledDownloads.has(id)
    )
      continue;
    scheduledDownloads.add(id);
    limitTexture(() => downloadImageOnly(photoObj))
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

// Loop mínimo solo para descargas (sin eventos Three.js)
let downloadLoopId = null;
const startDownloadLoop = () => {
  const downloadLoop = () => {
    // Solo procesar cola de descargas, sin eventos Three.js
    processTextureQueue();

    // Continuar mientras esté bloqueada la navegación
    if (navigationBlocked.value) {
      downloadLoopId = requestAnimationFrame(downloadLoop);
    } else {
      // Cuando termine fase de descarga, limpiar y el loop normal tomará el control
      downloadLoopId = null;
    }
  };

  downloadLoopId = requestAnimationFrame(downloadLoop);
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

  // Solo activar controles si no estamos en fase de descarga bloqueada
  if (!navigationBlocked.value) {
    fpControls.value.setup();
  }

  fpControls.value.setSpeedProfile({
    initial: 0.01, // control fino inicial
    max: 45, // velocidad tope (ajustable)
    accelerateInSeconds: 12.5,
  });
  // Bajar aceleración lineal para que accelerateInSeconds tenga efecto
  fpControls.value.setAccelerationRate(5); // de 60 → 5 (mucho más suave)
  // Ajustar escalado global si el espacio es muy grande
  fpControls.value.setWorldScale(2); // duplica desplazamiento efectivo
  // Sensibilidad de ratón
  fpControls.value.setMouseSensitivity(0.0025);
  // Factor de velocidad de rueda del ratón más lento
  fpControls.value.setWheelSpeedFactor(0.15); // 15% = mucho más lento
  // Activar debug temporalmente para verificar
  fpControls.value.toggleDebug(true);
  setTimeout(() => fpControls.value.toggleDebug(false), 5000);

  // Iniciar loop de animación
  animate();
};

// Watcher: registrar nuevas fotos con placeholder y carga inmediata de texturas cacheadas
watch(
  photos3D,
  async (newPhotos, oldPhotos) => {
    if (newPhotos.length > 0) {
      // Si no hay fotos con materiales (primera carga o limpieza completa)
      if (photosWithMaterials.value.length === 0) {
        await registerNewPhotos(newPhotos);
      }
      // Si ya tenemos fotos con materiales (cambio de chunk u optimización)
      else if (photosWithMaterials.value.length > 0) {
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
    applyFilters();
    updateVisiblePhotos();
    updatePhotoEffects(); // Usa helper que calcula distancias internamente
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

// ResizeObserver para manejar cambios de tamaño sin disparar recargas
let resizeObserver = null;

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

    // Configurar aspect ratio inicial
    updateCameraAspect();

    // Configurar ResizeObserver para manejar cambios de tamaño SIN recargar fotos
    if (containerRef.value && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        // Throttle para evitar actualizaciones excesivas
        requestAnimationFrame(() => {
          updateCameraAspect();
          console.log(
            "📼 Aspect ratio actualizado por resize:",
            cameraAspect.value
          );
        });
      });
      resizeObserver.observe(containerRef.value);
    }

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
  // Clear search timeout on unmount
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }

  // Mostrar estadísticas finales de errores 429
  if (error429Stats.value.total > 0) {
    console.log("📊 Estadísticas finales de errores 429:", {
      total: error429Stats.value.total,
      retried: error429Stats.value.retried,
      recovered: error429Stats.value.recovered,
      failed: error429Stats.value.failed,
      recoveryRate: `${Math.round(
        (error429Stats.value.recovered / error429Stats.value.total) * 100
      )}%`,
    });
  }

  // Ocultar loader discreto
  showDiscreteLoader.value = false;

  // Limpiar ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // Limpiar controles FPS

  // Cancelar animaciones
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (downloadLoopId) {
    cancelAnimationFrame(downloadLoopId);
  }

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
  top: 70px;
  right: 15px;
  pointer-events: none;
  z-index: 100;
  /* Reserved for future UI elements */
}

.control-panel {
  background: rgba(26, 26, 31, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  min-width: 300px;
  max-width: 350px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: fixed;
  top: 70px;
  right: 15px;
  z-index: 2000;
  pointer-events: auto;
}

.control-section {
  padding: var(--spacing-md);
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

.control-item-full {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.control-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium, 500);
}

/* Toggle Section Styles */
.section-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  padding: 8px 0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.section-toggle:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.section-toggle-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.section-toggle-indicators {
  display: flex;
  align-items: center;
  gap: 6px;
}

.active-indicator {
  font-size: 9px;
  color: #2563eb;
  background-color: rgba(37, 99, 235, 0.15);
  padding: 2px 5px;
  border-radius: 4px;
  font-weight: 600;
  min-width: 14px;
  text-align: center;
}

.toggle-icon {
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

/* Filters Container */
.filters-container {
  margin-top: 12px;
  animation: slideDown 0.3s ease-out;
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Options Container (for Display Options) */
.options-container {
  margin-top: 12px;
  animation: slideDown 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

/* Collapsed Panel (Small Corner Button) */
.collapsed-panel {
  position: fixed;
  top: 70px;
  right: 15px;
  width: 48px;
  height: 48px;
  background: rgba(26, 26, 31, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  z-index: 2000;
  pointer-events: auto;
}

.collapsed-panel:hover {
  background: rgba(35, 35, 40, 0.95);
  border-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.collapsed-panel .settings-icon {
  color: #ffffff;
  font-size: 20px;
  transition: color 0.2s ease;
}

/* Expanded Panel Header */
.panel-header-expanded {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
}

.panel-title {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.close-panel-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.close-panel-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.close-panel-btn-corner {
  position: absolute;
  top: 3px;
  right: 3px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  z-index: 10;
}

.close-panel-btn-corner:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* Embedding Select */
.embedding-select {
  width: 100%;
}

/* Aspects Select */
.aspects-select {
  width: 100%;
}

/* Text Search Input */
.text-search-input {
  width: 100%;
}

.search-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-results-info {
  margin-top: 8px;
  font-size: 12px;
  color: var(--primary-color);
  text-align: center;
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

.radial-slider,
.lod-slider {
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

/* Controls Info */
.controls-info {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  margin-top: 12px;
  animation: slideDown 0.3s ease-out;
}

.control-tip {
  margin: var(--spacing-xs) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.control-tip:last-child {
  margin-bottom: 0;
}

.control-tip strong {
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold, 600);
}

/* Animations for panel */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

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
  background: var(--bg-container, rgba(26, 26, 31, 0.9));
  backdrop-filter: blur(8px);
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
  box-shadow: var(--shadow-md);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
  z-index: 1500;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
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

.loader-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color, rgba(255, 255, 255, 0.2));
  border-top: 2px solid var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: discreteSpinner 1s linear infinite;
  flex-shrink: 0;
}

@keyframes discreteSpinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader-text {
  color: var(--text-primary, #ffffff);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  margin: 0;
  white-space: nowrap;
}

.loader-percentage {
  color: var(--primary-color, #3b82f6);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-semibold, 600);
  min-width: 35px;
  text-align: right;
  white-space: nowrap;
}
</style>
