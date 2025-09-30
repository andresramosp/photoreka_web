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
        :aspect="1"
        :near="0.1"
        :far="2000"
      />

      <!-- Lighting -->
      <primitive :object="lightsGroup" />

      <!-- Photo planes - renderizar solo fotos visibles y no ocultas por LOD -->
      <template v-for="(photo, index) in photosToRender" :key="photo.id">
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
    <div v-if="showConfigPanel" class="control-panel" @click.stop>
      <!-- Close Button (Top Right Corner) -->
      <button class="close-panel-btn-corner" @click="showConfigPanel = false">
        <n-icon>
          <CloseOutlined />
        </n-icon>
      </button>

      <!-- Embedding Type Section -->
      <div class="control-section">
        <h4 class="section-title">Clustering Type</h4>
        <div class="control-item">
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
          <span class="control-label">Distance Transparency</span>
          <n-switch
            v-model:value="useDistanceOpacity"
            size="small"
            @click.stop
          />
        </div>
      </div>

      <!-- LOD System Configuration (only show when enabled) -->
      <!-- <div v-if="useLODSystem" class="control-section">
            <h4 class="section-title">LOD Distance Thresholds</h4>

            <div class="control-item">
              <div class="slider-container">
                <div class="slider-header">
                  <span class="control-label"
                    >Reduce Quality: {{ LOD_DISTANCES.FULL_TO_REDUCED }}</span
                  >
                </div>
                <n-slider
                  v-model:value="LOD_DISTANCES.FULL_TO_REDUCED"
                  :min="30"
                  :max="100"
                  :step="5"
                  class="lod-slider"
                  @click.stop
                />
              </div>
            </div>

            <div class="control-item">
              <div class="slider-container">
                <div class="slider-header">
                  <span class="control-label"
                    >Solid Color:
                    {{ LOD_DISTANCES.REDUCED_TO_PLACEHOLDER }}</span
                  >
                </div>
                <n-slider
                  v-model:value="LOD_DISTANCES.REDUCED_TO_PLACEHOLDER"
                  :min="80"
                  :max="200"
                  :step="10"
                  class="lod-slider"
                  @click.stop
                />
              </div>
            </div>

            <div class="control-item">
              <div class="slider-container">
                <div class="slider-header">
                  <span class="control-label"
                    >Hide Completely:
                    {{ LOD_DISTANCES.PLACEHOLDER_TO_HIDDEN }}</span
                  >
                </div>
                <n-slider
                  v-model:value="LOD_DISTANCES.PLACEHOLDER_TO_HIDDEN"
                  :min="150"
                  :max="400"
                  :step="25"
                  class="lod-slider"
                  @click.stop
                />
              </div>
            </div>
          </div> -->

      <!-- Radial Scaling Section -->
      <div class="control-section">
        <h4 class="section-title">Radial Scaling</h4>
        <div class="control-item">
          <div class="slider-container">
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

      <!-- Navigation Controls -->
      <div class="control-section">
        <h4 class="section-title">Navigation Controls</h4>
        <div class="controls-info">
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

    <!-- UI Overlay (for other future UI elements) -->
    <div class="ui-overlay">
      <!-- Reserved for other UI elements -->
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
import {
  InfoCircleOutlined,
  CloseOutlined,
  SettingOutlined,
} from "@vicons/antd";
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
  maxCacheSize: 5000,
  expiryDays: 7,
});

// Desestructurar funciones del caché (añadimos loadMultipleCachedTextures para batch)
const { loadTexture, getCachedTextureSync, loadMultipleCachedTextures } =
  textureCache;

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
    hasSelectedAspects: selectedVisualAspects.value.length > 0,
  });

  photosWithMaterials.value.forEach((photo) => {
    if (selectedVisualAspects.value.length === 0) {
      // Sin filtro: mostrar todas las fotos
      photo.isVisible = true;
    } else {
      // Con filtro: aplicar lógica OR dentro de categorías y AND entre categorías
      if (!photo.descriptions?.visual_aspects) {
        photo.isVisible = false;
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
        photo.isVisible = Array.from(selectedByCategory.entries()).every(
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
  });

  const visibleCount = photosWithMaterials.value.filter(
    (p) => p.isVisible
  ).length;
  const hiddenCount = photosWithMaterials.value.filter(
    (p) => p.isVisible === false
  ).length;

  // Log resumen de la lógica aplicada
  if (selectedVisualAspects.value.length > 0) {
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

    console.log(
      "📋 Lógica de filtrado aplicada (OR dentro de categoría, AND entre categorías):",
      {
        categoríasAfectadas: selectedByCategory.size,
        filtrosPorCategoría: Object.fromEntries(selectedByCategory),
        totalVisibles: visibleCount,
        totalOcultas: hiddenCount,
      }
    );
  }

  console.log(
    `📊 Filtro aplicado: ${visibleCount}/${photosWithMaterials.value.length} fotos visibles, ${hiddenCount} ocultas`
  );

  // Debug adicional: mostrar algunas fotos que NO pasaron el filtro
  if (selectedVisualAspects.value.length > 0 && hiddenCount > 0) {
    const hiddenExamples = photosWithMaterials.value
      .filter((p) => p.isVisible === false)
      .slice(0, 3)
      .map((p) => ({
        id: String(p.id).substring(0, 8) + "...",
        hasVisualAspects: !!p.descriptions?.visual_aspects,
        aspectKeys: p.descriptions?.visual_aspects
          ? Object.keys(p.descriptions.visual_aspects)
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

    // 🎨 IMPORTANTE: Almacenar referencia a la textura original para el sistema LOD
    photoObj.__originalTexture = texture;

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
        // 🎨 IMPORTANTE: Almacenar referencia a la textura original para el sistema LOD
        p.__originalTexture = tex;

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

  const cachedPhotos = prepared.filter((p) => p.__textureLoaded);
  const nonCachedPhotos = prepared.filter((p) => !p.__textureLoaded);
  console.log(`💾 Fotos cacheadas: ${cachedPhotos.length}`);
  console.log(`⏳ Fotos no cacheadas: ${nonCachedPhotos.length}`);
  if (nonCachedPhotos.length > 0) enqueueAllNonCachedPhotos(nonCachedPhotos);

  // Recalcular visibilidad global (frustum + filtros) tras registrar
  updateVisiblePhotos();
  if (useBillboarding.value) updateBillboardRotations();

  // Verificar si podemos ocultar el loader
  if (photosNeedingDownload.length === 0) {
    console.log("🎯 Todas las texturas están cacheadas - ocultando loader");
    checkAllTexturesLoaded();
  }
};

// ✨ Nueva función optimizada para cambios de chunk que reutiliza texturas
const updatePhotosPositions = async (newPhotos) => {
  console.log("🔄 Actualizando posiciones (mutación in-place)");

  await setupLoaderForPhotos(newPhotos);
  showLoader();

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

  console.log("🔍 Debug animación in-place", {
    startLen: startPositions.length,
    targetLen: targetPositions.length,
    totalPhotos: photosWithMaterials.value.length,
  });

  // Animar
  animatePositionTransition(
    startPositions,
    calculateScaledPositions(targetPositions, inflateFactor.value)
  );

  // Texturas a cargar (solo las nuevas)
  const toTexture = photosWithMaterials.value.filter(
    (p) => !p.__textureLoaded && !p.__loading
  );
  if (toTexture.length) {
    const cachedHits = await loadCachedTexturesBatch(toTexture);
    const needDownload = toTexture.filter((p) => !p.__textureLoaded);
    console.log("🧩 Texturas (in-place)", {
      total: toTexture.length,
      cachedHits,
      needDownload: needDownload.length,
    });
    if (needDownload.length) enqueueAllNonCachedPhotos(needDownload);
  }

  applyVisualAspectsFilter();
  if (useBillboarding.value) updateBillboardRotations();
  checkAllTexturesLoaded();
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
  // PERO RESPETANDO el filtro de aspectos visuales (isVisible)
  const existingCachedIds = new Set(
    visiblePhotos.value
      .filter((p) => p.__textureLoaded && p.isVisible !== false)
      .map((p) => p.id)
  );
  const newPhotosToAdd = newVisibleFromFrustum.filter(
    (photo) => !existingCachedIds.has(photo.id)
  );

  // 🔧 CORREGIDO: Separar filtros - primero frustum, luego LOD se aplica en renderizado
  // NO filtrar por __isLODHidden aquí, solo por aspectos visuales y cache
  const existingCached = visiblePhotos.value.filter(
    (p) => p.__textureLoaded && p.isVisible !== false
  );

  // Las nuevas fotos del frustum siempre se añaden (LOD se decide después)
  visiblePhotos.value = [...existingCached, ...newPhotosToAdd];

  // 🔧 CRÍTICO: Restaurar visibilidad de fotos que vuelven al frustum
  visiblePhotos.value.forEach((photo) => {
    // Si una foto está en el frustum, nunca debe estar permanentemente oculta
    if (photo.__isLODHidden) {
      photo.__isLODHidden = false;
      photo.__currentLOD = undefined; // Forzar recálculo en próximo frame
    }
  });

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

// Advanced LOD (Level of Detail) System Configuration
const LOD_LEVELS = {
  FULL: 0, // Full texture quality
  REDUCED: 1, // Lower quality texture
  PLACEHOLDER: 2, // Solid color based on dominant photo color
  HIDDEN: 3, // Not rendered at all
};

// LOD distance thresholds (adjustable and reactive)
const LOD_DISTANCES = ref({
  FULL_TO_REDUCED: 30, // Start reducing texture quality
  REDUCED_TO_PLACEHOLDER: 130, // Replace with solid color
  PLACEHOLDER_TO_HIDDEN: 200, // Stop rendering completely
});

// Enable/disable LOD system
const useLODSystem = ref(true);

// 🔧 Función de depuración para diagnosticar problemas LOD
const debugLODState = () => {
  if (!useLODSystem.value) return;

  const stats = {
    total: visiblePhotos.value.length,
    full: 0,
    reduced: 0,
    placeholder: 0,
    hidden: 0,
    withoutTexture: 0,
  };

  visiblePhotos.value.forEach((photo) => {
    if (!photo.__originalTexture) {
      stats.withoutTexture++;
      return;
    }

    const lod = photo.__currentLOD || LOD_LEVELS.FULL;
    switch (lod) {
      case LOD_LEVELS.FULL:
        stats.full++;
        break;
      case LOD_LEVELS.REDUCED:
        stats.reduced++;
        break;
      case LOD_LEVELS.PLACEHOLDER:
        stats.placeholder++;
        break;
      case LOD_LEVELS.HIDDEN:
        stats.hidden++;
        break;
    }
  });

  console.log("🔍 LOD Debug Stats:", stats);
  return stats;
};

// Cache for dominant colors and reduced textures
const dominantColorCache = new Map();
const reducedTextureCache = new Map();
const placeholderMaterialCache = new Map();

// 🔧 ELIMINADA: función problemática que creaba materiales nuevos

// Extract dominant color from image (fast approximation)
const extractDominantColor = (imageElement) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Use small canvas for performance
  canvas.width = 32;
  canvas.height = 24;

  ctx.drawImage(imageElement, 0, 0, 32, 24);

  const imageData = ctx.getImageData(0, 0, 32, 24);
  const data = imageData.data;

  let r = 0,
    g = 0,
    b = 0;
  const pixelCount = data.length / 4;

  // Average color calculation (fast)
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  r = Math.floor(r / pixelCount);
  g = Math.floor(g / pixelCount);
  b = Math.floor(b / pixelCount);

  return (r << 16) | (g << 8) | b; // Return as hex color
};

// Create reduced quality texture (lower resolution)
const createReducedTexture = (originalTexture) => {
  if (!originalTexture || !originalTexture.image) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Reduce to 25% of original size for performance
  const originalWidth = originalTexture.image.width || 512;
  const originalHeight = originalTexture.image.height || 384;

  canvas.width = Math.max(64, Math.floor(originalWidth * 0.5));
  canvas.height = Math.max(48, Math.floor(originalHeight * 0.5));

  ctx.drawImage(originalTexture.image, 0, 0, canvas.width, canvas.height);

  const reducedTexture = new THREE.CanvasTexture(canvas);
  reducedTexture.colorSpace = THREE.SRGBColorSpace;
  reducedTexture.generateMipmaps = true;
  reducedTexture.minFilter = THREE.LinearMipmapLinearFilter;
  reducedTexture.magFilter = THREE.LinearFilter;
  reducedTexture.wrapS = THREE.ClampToEdgeWrap;
  reducedTexture.wrapT = THREE.ClampToEdgeWrap;

  return reducedTexture;
};

// Determine LOD level based on distance
const getLODLevel = (distance) => {
  if (!useLODSystem.value) return LOD_LEVELS.FULL;

  const distances = LOD_DISTANCES.value;

  if (distance > distances.PLACEHOLDER_TO_HIDDEN) {
    return LOD_LEVELS.HIDDEN;
  } else if (distance > distances.REDUCED_TO_PLACEHOLDER) {
    return LOD_LEVELS.PLACEHOLDER;
  } else if (distance > distances.FULL_TO_REDUCED) {
    return LOD_LEVELS.REDUCED;
  }

  return LOD_LEVELS.FULL;
};

// Sistema LOD corregido - MANTIENE los materiales originales siempre
const updatePhotoLOD = () => {
  if (
    !useLODSystem.value ||
    !cameraRef.value ||
    visiblePhotos.value.length === 0
  ) {
    return;
  }

  const camera = cameraRef.value;
  const cameraPosition = camera.position;

  visiblePhotos.value.forEach((photo) => {
    if (!photo.material) return;

    // Use cached distance calculation
    const distance = getCachedDistance(
      photo.id,
      photo.position,
      cameraPosition
    );

    const lodLevel = getLODLevel(distance);
    const currentLOD = photo.__currentLOD || LOD_LEVELS.FULL;

    // Only update if LOD level changed
    if (lodLevel === currentLOD) {
      return;
    }

    photo.__currentLOD = lodLevel;

    // 🔧 SOLUCIÓN: NUNCA crear nuevos materiales, solo cambiar la textura del material existente
    switch (lodLevel) {
      case LOD_LEVELS.FULL:
        // Restaurar textura original completa
        if (
          photo.__originalTexture &&
          photo.material.map !== photo.__originalTexture
        ) {
          photo.material.map = photo.__originalTexture;
          photo.material.needsUpdate = true;
        }
        // Asegurar visibilidad
        photo.__isLODHidden = false;
        break;

      case LOD_LEVELS.REDUCED:
        // Usar textura reducida (crear solo una vez)
        if (!photo.__reducedTexture && photo.__originalTexture) {
          photo.__reducedTexture = createReducedTexture(
            photo.__originalTexture
          );
        }

        if (
          photo.__reducedTexture &&
          photo.material.map !== photo.__reducedTexture
        ) {
          photo.material.map = photo.__reducedTexture;
          photo.material.needsUpdate = true;
        }
        // Asegurar visibilidad
        photo.__isLODHidden = false;
        break;

      case LOD_LEVELS.PLACEHOLDER:
        // Crear textura de color sólido (crear solo una vez)
        if (!photo.__placeholderTexture) {
          if (!photo.__dominantColor && photo.__originalTexture?.image) {
            photo.__dominantColor = extractDominantColor(
              photo.__originalTexture.image
            );
          }

          if (photo.__dominantColor) {
            // Crear una pequeña textura con el color predominante
            const canvas = document.createElement("canvas");
            canvas.width = 4;
            canvas.height = 4;
            const ctx = canvas.getContext("2d");
            const color = photo.__dominantColor;
            const r = (color >> 16) & 255;
            const g = (color >> 8) & 255;
            const b = color & 255;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, 0, 4, 4);

            photo.__placeholderTexture = new THREE.CanvasTexture(canvas);
            photo.__placeholderTexture.colorSpace = THREE.SRGBColorSpace;
          }
        }

        // Solo cambiar la textura, NO el material
        if (
          photo.__placeholderTexture &&
          photo.material.map !== photo.__placeholderTexture
        ) {
          photo.material.map = photo.__placeholderTexture;
          photo.material.needsUpdate = true;
        }
        // Asegurar visibilidad
        photo.__isLODHidden = false;
        break;

      case LOD_LEVELS.HIDDEN:
        // Marcar como oculta (se filtra en updateVisiblePhotos)
        photo.__isLODHidden = true;
        break;
    }

    // 🔧 CRÍTICO: Si salimos del estado HIDDEN, SIEMPRE restaurar visibilidad
    if (lodLevel !== LOD_LEVELS.HIDDEN) {
      photo.__isLODHidden = false;
    }
  });
};

// Helper function to preload dominant colors for visible photos
const preloadDominantColors = async () => {
  if (!useLODSystem.value) return;

  const photosNeedingColors = visiblePhotos.value.filter(
    (photo) => photo.__originalTexture?.image && !photo.__dominantColor
  );

  photosNeedingColors.forEach((photo) => {
    if (photo.__originalTexture?.image) {
      photo.__dominantColor = extractDominantColor(
        photo.__originalTexture.image
      );
    }
  });
};

// Mantener configuración original de opacidad por distancia
const MIN_DISTANCE = 60;
const MAX_DISTANCE = 100;
const MIN_OPACITY = 0.2;

// Función ORIGINAL de opacidad por distancia (MANTENER INTACTA)
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
    updateVisiblePhotos();

    // Actualizar rotaciones billboard si está habilitado
    if (useBillboarding.value) {
      updateBillboardRotations();
    }

    // IMPORTANTE: Llamar PRIMERO al sistema LOD, luego a opacidad
    // El LOD maneja la calidad de texturas, la opacidad maneja la visibilidad
    updatePhotoLOD();
    updatePhotoOpacity();

    // 🔧 Debug cada 10 segundos aprox (60fps * 3 frames * 200 = ~600 frames)
    if (frameCounter % 600 === 0) {
      debugLODState();
    }
  }

  // Procesar cola de texturas (batch dinámico)
  processTextureQueue();

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
  top: 12px;
  right: 12px;
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
  margin-top: var(--spacing-sm);
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
