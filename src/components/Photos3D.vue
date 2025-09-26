<template>
  <div class="photos-3d-container" ref="containerRef">
    <!-- First Person 3D Canvas -->
    <TresCanvas v-bind="gl" ref="canvasRef">
      <TresPerspectiveCamera
        ref="cameraRef"
        :position="[0, 0, 50]"
        :fov="75"
        :aspect="1"
        :near="0.1"
        :far="2000"
      />

      <!-- Basic scene setup -->
      <primitive :object="lightsGroup" />

      <!-- Photo planes - solo mostrar cuando están cargadas -->
      <template
        v-if="!isLoadingTextures && !isInitializing"
        v-for="(photo, index) in photoPositions"
        :key="photo.id"
      >
        <TresMesh
          :position="photo.position"
          :rotation="useBillboarding ? photo.billboardRotation : photo.rotation"
        >
          <primitive :object="planeGeometry" />
          <primitive :object="photo.material" v-if="photo.material" />
        </TresMesh>
      </template>

      <!-- Grid -->
      <primitive :object="gridHelper" :key="gridKey" />
    </TresCanvas>

    <!-- UI Overlay -->
    <div class="ui-overlay" @click.stop @mousedown.stop>
      <div class="info-panel" @click.stop @mousedown.stop @wheel.stop>
        <p v-if="isInitializing">Preparando...</p>
        <p v-else-if="isLoadingTextures">
          Cargando texturas... {{ loadedCount }}/{{ totalPhotos }}
        </p>
        <p v-else-if="photos.length === 0">No hay fotos disponibles</p>
        <p v-else>
          Fotos cargadas: {{ photoPositions.length }}/{{ photos.length }}
        </p>
        <!-- Axis Configuration Controls -->
        <div class="axis-config">
          <h4>Configuración de Ejes:</h4>
          <div class="axis-control">
            <label for="x-axis">Eje X (izq./der.):</label>
            <select
              id="x-axis"
              v-model="artisticAxesConfig.x"
              @change="onAxisChange"
              @click.stop
              @mousedown.stop
              class="axis-select"
            >
              <option
                v-for="metric in availableMetrics"
                :key="metric.value"
                :value="metric.value"
              >
                {{ metric.label }}
              </option>
            </select>
          </div>
          <div class="axis-control">
            <label for="y-axis">Eje Y (arr./ab.):</label>
            <select
              id="y-axis"
              v-model="artisticAxesConfig.y"
              @change="onAxisChange"
              @click.stop
              @mousedown.stop
              class="axis-select"
            >
              <option
                v-for="metric in availableMetrics"
                :key="metric.value"
                :value="metric.value"
              >
                {{ metric.label }}
              </option>
            </select>
          </div>
          <div class="axis-control">
            <label for="z-axis">Eje Z (atrás/adel.):</label>
            <select
              id="z-axis"
              v-model="artisticAxesConfig.z"
              @change="onAxisChange"
              @click.stop
              @mousedown.stop
              class="axis-select"
            >
              <option
                v-for="metric in availableMetrics"
                :key="metric.value"
                :value="metric.value"
              >
                {{ metric.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Space Scale Control -->
        <div class="space-control">
          <h4>Espaciado de Fotos:</h4>
          <div class="scale-control">
            <label for="space-scale"
              >Factor de Escala: {{ spaceScale.toFixed(1) }}x</label
            >
            <input
              id="space-scale"
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              v-model.number="spaceScale"
              @input="onScaleChange"
              @click.stop
              @mousedown.stop
              class="scale-slider"
            />
            <div class="scale-labels">
              <span>Más juntas</span>
              <span>Más separadas</span>
            </div>
          </div>
        </div>

        <!-- <div class="axes-info">
          <h4>Distribución Artística (Rangos Dinámicos):</h4>
          <ul>
            <li>
              <strong>Eje X</strong> (izq./der.): {{ artisticAxesConfig.x }}
              <span v-if="scoreRanges" class="range-info">
                ({{ scoreRanges.x.min.toFixed(1) }} -
                {{ scoreRanges.x.max.toFixed(1) }})
              </span>
            </li>
            <li>
              <strong>Eje Y</strong> (arr./ab.): {{ artisticAxesConfig.y }}
              <span v-if="scoreRanges" class="range-info">
                ({{ scoreRanges.y.min.toFixed(1) }} -
                {{ scoreRanges.y.max.toFixed(1) }})
              </span>
            </li>
            <li>
              <strong>Eje Z</strong> (atrás/adel.): {{ artisticAxesConfig.z }}
              <span v-if="scoreRanges" class="range-info">
                ({{ scoreRanges.z.min.toFixed(1) }} -
                {{ scoreRanges.z.max.toFixed(1) }})
              </span>
            </li>
          </ul>
        </div> -->
        <p>Navegación estilo videojuego:</p>
        <ul>
          <li><strong>WASD</strong>: Moverse</li>
          <li><strong>Ratón</strong>: Mirar (click para activar)</li>
          <li><strong>Rueda</strong>: Avanzar/Retroceder</li>
          <li><strong>Q/Espacio</strong>: Subir</li>
          <li><strong>E/Shift</strong>: Bajar/Correr</li>
        </ul>
        <!-- <div class="controls-status" v-if="fpControls && fpControls.mouseState">
          <p
            class="status-indicator"
            :class="{ active: fpControls.mouseState.value?.isPointerLocked }"
          >
            <span class="indicator-dot"></span>
            {{
              fpControls.mouseState.value?.isPointerLocked
                ? "Controles activos"
                : "Click para activar controles"
            }}
          </p>
        </div> -->

        <!-- Billboarding Toggle -->
        <div class="billboard-toggle">
          <label class="toggle-label">
            <input
              type="checkbox"
              v-model="useBillboarding"
              @change="onBillboardingToggle"
              @click.stop
              @mousedown.stop
            />
            <span class="checkbox-custom"></span>
            Fotos siempre encarando al usuario
          </label>
          <p class="toggle-description">
            {{
              useBillboarding
                ? "Las fotos rotan para encararte"
                : "Rotación basada en scores artísticos"
            }}
          </p>
        </div>

        <!-- Lighting Info -->
        <!-- <div class="lighting-info">
          <h4>Iluminación Mejorada:</h4>
          <ul>
            <li><strong>Luz ambiente</strong> aumentada (0.8)</li>
            <li>
              <strong>3 luces direccionales</strong> desde múltiples ángulos
            </li>
            <li><strong>Material básico</strong> para consistencia visual</li>
          </ul>
          <p class="lighting-note">
            Las fotos siempre se ven bien iluminadas desde cualquier ángulo
          </p>
        </div> -->
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { TresCanvas } from "@tresjs/core";
import { usePhotosStore } from "@/stores/photos.js";
import { loadTextureWithLimit } from "@/utils/rateLimiter.js";
import { useFirstPersonControls } from "@/composables/useFirstPersonControls.js";
import * as THREE from "three";

// Store
const photosStore = usePhotosStore();
const containerRef = ref();
const canvasRef = ref();
const cameraRef = ref();

// Billboarding control
const useBillboarding = ref(true);

// First Person Controls
const fpControls = ref(null);
let animationId = null;

// Available artistic metrics options
const availableMetrics = [
  { value: "storytelling", label: "Storytelling" },
  { value: "visual_games", label: "Visual Games" },
  { value: "humor", label: "Humor" },
  { value: "composition", label: "Composition" },
  { value: "aesthetic_quality", label: "Aesthetic Quality" },
  { value: "candidness", label: "Candidness" },
  { value: "message", label: "Message" },
  { value: "originality", label: "Originality" },
];

// Configuración de ejes artísticos (ahora configurable)
const artisticAxesConfig = ref({
  x: "storytelling", // Eje X: Capacidad narrativa
  y: "visual_games", // Eje Y: Juegos visuales
  z: "humor", // Eje Z: Composición
  scale: 45, // Factor de escala aumentado para mejor uso del espacio
  offset: {
    // Offset para centrar el espacio
    x: 0,
    y: -5, // Ajustado para mejor centrado vertical
    z: 0,
  },
});

// Control de escala para espaciado de fotos
const spaceScale = ref(1.0); // Factor multiplicador para el espaciado

// Grid key for reactivity
const gridKey = ref(0);

// Functions to handle configuration changes
const onAxisChange = async () => {
  if (photoPositions.value.length > 0) {
    await recalculatePositions();
  }
};

const onScaleChange = async () => {
  updateGridSize(); // Update grid to match new scale
  if (photoPositions.value.length > 0) {
    await recalculatePositions();
  }
};

// Function to recalculate positions without reloading materials
const recalculatePositions = async () => {
  if (!scoreRanges.value || photoPositions.value.length === 0) return;

  const updatedPositions = photoPositions.value.map((photo) => {
    const position = calculateArtisticPosition(photo, scoreRanges.value);
    return {
      ...photo,
      position,
    };
  });

  // Apply separation again for new positions
  const separatedPositions = separateOverlappingPositions(updatedPositions);
  photoPositions.value = separatedPositions;

  // Update billboard rotations if enabled
  if (useBillboarding.value) {
    updateBillboardRotations();
  }
};

// Canvas configuration
const gl = ref({
  clearColor: "#1a1a1a",
  antialias: true,
});

// Three.js objects - Improved lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Increased ambient light

// Multiple directional lights for even illumination
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight1.position.set(10, 10, 10);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight2.position.set(-10, 10, -10);

const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight3.position.set(0, -10, 5);

// Create lights group for easier management
const lightsGroup = new THREE.Group();
lightsGroup.add(ambientLight);
// lightsGroup.add(directionalLight1);
// lightsGroup.add(directionalLight2);
// lightsGroup.add(directionalLight3);

const planeGeometry = new THREE.PlaneGeometry(4, 3);
let gridHelper = new THREE.GridHelper(120, 24); // Aumentado el tamaño para el nuevo espacio
gridHelper.position.y = -50; // Ajustado para el nuevo rango

// Function to update grid size based on scale
const updateGridSize = () => {
  const effectiveScale = artisticAxesConfig.value.scale * spaceScale.value;
  const gridSize = Math.max(120, effectiveScale * 3); // Minimum grid size of 120
  gridHelper.geometry.dispose(); // Clean up old geometry
  gridHelper = new THREE.GridHelper(
    gridSize,
    Math.max(24, Math.floor(gridSize / 5))
  );
  gridHelper.position.y = -effectiveScale - 5; // Adjust grid position
  gridKey.value++; // Force reactivity update
};

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Function to create material for a photo
const createPhotoMaterial = async (photo) => {
  const imageUrl = photo.thumbnailUrl || photo.url || photo.originalUrl;

  if (!imageUrl) {
    // Fallback material if no image URL
    return new THREE.MeshBasicMaterial({
      color: 0x666666,
      side: THREE.DoubleSide,
    });
  }

  try {
    // Use rate limited texture loading
    const texture = await loadTextureWithLimit(textureLoader, imageUrl);

    // Use MeshBasicMaterial for consistent appearance without lighting effects
    // This ensures photos always look bright and consistent
    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0,
    });
  } catch (error) {
    console.error("Error loading texture for photo:", photo.id, error);
    // Return fallback material on error
    return new THREE.MeshBasicMaterial({
      color: 0x666666,
      side: THREE.DoubleSide,
    });
  }
};

// Function to calculate min/max ranges from actual photo scores
const calculateScoreRanges = (photos) => {
  const config = artisticAxesConfig.value;
  let xMin = Infinity,
    xMax = -Infinity;
  let yMin = Infinity,
    yMax = -Infinity;
  let zMin = Infinity,
    zMax = -Infinity;

  photos.forEach((photo) => {
    const artisticScores = photo.descriptions?.artistic_scores;
    if (artisticScores) {
      const xScore = artisticScores[config.x];
      const yScore = artisticScores[config.y];
      const zScore = artisticScores[config.z];

      if (xScore !== undefined) {
        xMin = Math.min(xMin, xScore);
        xMax = Math.max(xMax, xScore);
      }
      if (yScore !== undefined) {
        yMin = Math.min(yMin, yScore);
        yMax = Math.max(yMax, yScore);
      }
      if (zScore !== undefined) {
        zMin = Math.min(zMin, zScore);
        zMax = Math.max(zMax, zScore);
      }
    }
  });

  // Fallback to theoretical range if no valid scores found
  if (xMin === Infinity) {
    xMin = 1;
    xMax = 10;
  }
  if (yMin === Infinity) {
    yMin = 1;
    yMax = 10;
  }
  if (zMin === Infinity) {
    zMin = 1;
    zMax = 10;
  }

  // Ensure minimum range to avoid division by zero
  const minRange = 0.1;
  if (xMax - xMin < minRange) {
    const center = (xMin + xMax) / 2;
    xMin = center - minRange / 2;
    xMax = center + minRange / 2;
  }
  if (yMax - yMin < minRange) {
    const center = (yMin + yMax) / 2;
    yMin = center - minRange / 2;
    yMax = center + minRange / 2;
  }
  if (zMax - zMin < minRange) {
    const center = (zMin + zMax) / 2;
    zMin = center - minRange / 2;
    zMax = center + minRange / 2;
  }

  return {
    x: { min: xMin, max: xMax, range: xMax - xMin },
    y: { min: yMin, max: yMax, range: yMax - yMin },
    z: { min: zMin, max: zMax, range: zMax - zMin },
  };
};

// Function to separate photos with identical or very close positions
const separateOverlappingPositions = (photoPositions, minDistance = 0.8) => {
  const result = [...photoPositions];
  const positionMap = new Map();

  // Group photos by similar positions (using a grid approach for better clustering)
  result.forEach((photo, index) => {
    const gridSize = 1.0; // Tamaño de la cuadrícula para detectar solapamiento
    const posKey = `${Math.round(photo.position[0] / gridSize)}_${Math.round(
      photo.position[1] / gridSize
    )}_${Math.round(photo.position[2] / gridSize)}`;

    if (!positionMap.has(posKey)) {
      positionMap.set(posKey, []);
    }
    positionMap.get(posKey).push({ photo, index });
  });

  // Separate overlapping photos using circular arrangement
  positionMap.forEach((photos) => {
    if (photos.length > 1) {
      console.log(`Found ${photos.length} overlapping photos, separating...`);

      photos.forEach(({ photo, index }, groupIndex) => {
        if (groupIndex > 0) {
          // Calculate circular arrangement to separate photos
          const angle = (groupIndex * 2 * Math.PI) / photos.length;
          const radius = minDistance + Math.floor(groupIndex / 6) * 0.3; // Spiral outward for many photos

          // Add deterministic but varied offsets
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius * 0.7; // Less vertical separation
          const offsetZ = Math.sin(angle * 2) * (minDistance * 0.5); // Small Z variation

          result[index].position = [
            photo.position[0] + offsetX,
            photo.position[1] + offsetY,
            photo.position[2] + offsetZ,
          ];

          // Also add slight rotation variation to make separation more obvious
          const rotationVariation = groupIndex * 0.1;
          result[index].rotation = [
            photo.rotation[0] + rotationVariation,
            photo.rotation[1] + rotationVariation * 0.5,
            photo.rotation[2] + rotationVariation * 0.3,
          ];
        }
      });
    }
  });

  return result;
};

// Function to calculate artistic position based on scores with dynamic mapping
const calculateArtisticPosition = (photo, scoreRanges) => {
  const artisticScores = photo.descriptions?.artistic_scores;
  const config = artisticAxesConfig.value;

  if (!artisticScores || !scoreRanges) {
    console.warn("Photo missing artistic_scores or scoreRanges:", photo.id);
    // Fallback to center position if no artistic scores
    return [config.offset.x, config.offset.y, config.offset.z];
  }

  // Get scores for each axis
  const xScore = artisticScores[config.x];
  const yScore = artisticScores[config.y];
  const zScore = artisticScores[config.z];

  // Apply space scale to the base scale
  const effectiveScale = config.scale * spaceScale.value;

  // Map real score ranges to full available space (-scale to +scale)
  const x =
    xScore !== undefined
      ? ((xScore - scoreRanges.x.min) / scoreRanges.x.range - 0.5) *
          2 *
          effectiveScale +
        config.offset.x
      : config.offset.x;

  const y =
    yScore !== undefined
      ? ((yScore - scoreRanges.y.min) / scoreRanges.y.range - 0.5) *
          2 *
          effectiveScale +
        config.offset.y
      : config.offset.y;

  const z =
    zScore !== undefined
      ? ((zScore - scoreRanges.z.min) / scoreRanges.z.range - 0.5) *
          2 *
          effectiveScale +
        config.offset.z
      : config.offset.z;

  return [x, y, z];
};

// Function to calculate billboard rotation (face camera)
const calculateBillboardRotation = (photoPosition, cameraPosition) => {
  // Calculate direction from photo to camera
  const direction = new THREE.Vector3(
    cameraPosition.x - photoPosition[0],
    cameraPosition.y - photoPosition[1],
    cameraPosition.z - photoPosition[2]
  );

  // Normalize the direction vector
  direction.normalize();

  // Calculate rotation to face the camera
  // We want the photo to face the camera, so we look from photo towards camera
  const lookAt = new THREE.Matrix4().lookAt(
    new THREE.Vector3(...photoPosition),
    new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z),
    new THREE.Vector3(0, 1, 0) // Up vector
  );

  // Extract rotation from the matrix
  const rotation = new THREE.Euler().setFromRotationMatrix(lookAt);

  // Return rotation as array [x, y, z]
  return [rotation.x, rotation.y, rotation.z];
};

// Function to update billboard rotations for all photos
const updateBillboardRotations = () => {
  if (
    !useBillboarding.value ||
    !cameraRef.value ||
    photoPositions.value.length === 0
  ) {
    return;
  }

  const camera = cameraRef.value;
  const cameraPosition = camera.position;

  // Update billboard rotation for each photo
  photoPositions.value.forEach((photo) => {
    photo.billboardRotation = calculateBillboardRotation(
      photo.position,
      cameraPosition
    );
  });
};

// Function to calculate subtle rotation based on artistic scores
const calculateArtisticRotation = (photo) => {
  const artisticScores = photo.descriptions?.artistic_scores;

  if (!artisticScores) {
    return [0, 0, 0];
  }

  // Use some artistic scores to create subtle, meaningful rotations
  const humor = artisticScores.humor || 5.5;
  const strangeness = artisticScores.strangeness || 5.5;
  const candidness = artisticScores.candidness || 5.5;

  // Convert from 1-10 range to small rotation values (-0.2 to 0.2 radians)
  const rotX = ((humor - 5.5) / 4.5) * 0.2;
  const rotY = ((strangeness - 5.5) / 4.5) * 0.2;
  const rotZ = ((candidness - 5.5) / 4.5) * 0.1;

  return [rotX, rotY, rotZ];
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
const scoreRanges = ref(null); // Store score ranges for UI display
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

  // Calculate dynamic score ranges from actual photo data
  const calculatedRanges = calculateScoreRanges(photosValue);
  scoreRanges.value = calculatedRanges; // Store for UI display

  console.log("Dynamic score ranges calculated:", calculatedRanges);

  // Crear todas las posiciones basadas en scores artísticos usando rangos dinámicos
  const photoData = photosValue.map((photo, index) => {
    const position = calculateArtisticPosition(photo, calculatedRanges);
    const rotation = calculateArtisticRotation(photo);

    return {
      ...photo,
      position,
      rotation,
    };
  });

  // Separar fotos que están en posiciones muy cercanas para evitar flickering
  const separatedPhotoData = separateOverlappingPositions(photoData);

  // Cargar materiales uno por uno para progreso coherente
  const positions = [];
  for (const photoInfo of separatedPhotoData) {
    const material = await createPhotoMaterial(photoInfo);
    positions.push({
      ...photoInfo,
      material,
      billboardRotation: [0, 0, 0], // Initialize billboard rotation
    });

    // Actualizar progreso después de cada textura cargada
    loadedCount.value = positions.length;
  }

  photoPositions.value = positions;
  isLoadingTextures.value = false;

  // Initialize billboard rotations if enabled
  if (useBillboarding.value) {
    updateBillboardRotations();
  }
};

// Handler for billboarding toggle
const onBillboardingToggle = () => {
  if (useBillboarding.value) {
    // When enabling billboarding, calculate initial rotations
    updateBillboardRotations();
  }
};

// Función de animación para actualizar controles FPS
const animate = () => {
  if (fpControls.value) {
    fpControls.value.update();
  }

  // Update billboard rotations if enabled
  if (useBillboarding.value) {
    updateBillboardRotations();
  }

  animationId = requestAnimationFrame(animate);
};

// Inicializar controles FPS
const initFirstPersonControls = () => {
  if (!cameraRef.value || !containerRef.value) {
    console.error("Camera or container not available for FPS controls");
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

// Lifecycle
onMounted(async () => {
  try {
    await photosStore.getOrFetch(false);

    // Inicializar controles FPS después de que el canvas esté listo
    setTimeout(() => {
      initFirstPersonControls();
    }, 100);

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

onUnmounted(() => {
  // Limpiar controles FPS
  if (fpControls.value) {
    fpControls.value.cleanup();
  }

  // Cancelar animación
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
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

/* Axis Configuration Controls */
.axis-config {
  margin: 15px 0;
  padding: 12px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 6px;
  background: rgba(74, 222, 128, 0.05);
}

.axis-config h4 {
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: #4ade80;
  font-weight: 600;
}

.axis-control {
  margin-bottom: 8px;
}

.axis-control:last-child {
  margin-bottom: 0;
}

.axis-control label {
  display: block;
  font-size: 0.8em;
  color: #e5e5e5;
  margin-bottom: 4px;
  font-weight: 500;
}

.axis-select {
  width: 100%;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  color: #e5e5e5;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.axis-select:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(74, 222, 128, 0.5);
}

.axis-select:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  border-color: #4ade80;
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.2);
}

.axis-select option {
  background: #1a1a1a;
  color: #e5e5e5;
  padding: 4px;
}

/* Space Scale Control */
.space-control {
  margin: 15px 0;
  padding: 12px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 6px;
  background: rgba(74, 222, 128, 0.05);
}

.space-control h4 {
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: #4ade80;
  font-weight: 600;
}

.scale-control label {
  display: block;
  font-size: 0.8em;
  color: #e5e5e5;
  margin-bottom: 8px;
  font-weight: 500;
}

.scale-slider {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  opacity: 0.8;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.scale-slider:hover {
  opacity: 1;
}

.scale-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4ade80;
  cursor: pointer;
  border: 2px solid #1a1a1a;
  transition: all 0.3s ease;
}

.scale-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
}

.scale-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4ade80;
  cursor: pointer;
  border: 2px solid #1a1a1a;
  transition: all 0.3s ease;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 0.75em;
  color: #ccc;
}

.scale-labels span {
  font-style: italic;
}

.axes-info {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  background: rgba(74, 222, 128, 0.05);
}

.axes-info h4 {
  margin: 0 0 8px 0;
  font-size: 0.9em;
  color: #4ade80;
}

.axes-info ul {
  margin: 0;
  font-size: 0.8em;
}

.axes-info li {
  margin: 3px 0;
  color: #e5e5e5;
}

.range-info {
  font-size: 0.85em;
  color: #4ade80;
  font-weight: 500;
  margin-left: 5px;
}

.controls-status {
  margin: 15px 0 0 0;
  padding: 8px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  background: rgba(74, 222, 128, 0.05);
}

.status-indicator {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 0.85em;
  font-weight: 500;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  margin-right: 8px;
  transition: background-color 0.3s ease;
}

.status-indicator.active .indicator-dot {
  background: #4ade80;
}

.status-indicator.active {
  color: #4ade80;
}

/* Billboarding Toggle */
.billboard-toggle {
  margin: 15px 0 0 0;
  padding: 10px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  background: rgba(74, 222, 128, 0.05);
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 500;
  color: #e5e5e5;
  margin: 0;
  user-select: none;
}

.toggle-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 2px solid #4ade80;
  border-radius: 3px;
  margin-right: 8px;
  display: inline-block;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-label input[type="checkbox"]:checked + .checkbox-custom {
  background: #4ade80;
}

.toggle-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: "✓";
  position: absolute;
  top: -2px;
  left: 1px;
  color: #1a1a1a;
  font-size: 12px;
  font-weight: bold;
}

.toggle-description {
  margin: 5px 0 0 24px;
  font-size: 0.75em;
  color: #4ade80;
  font-style: italic;
}

/* Lighting Info */
.lighting-info {
  margin: 15px 0 0 0;
  padding: 10px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  background: rgba(74, 222, 128, 0.05);
}

.lighting-info h4 {
  margin: 0 0 8px 0;
  font-size: 0.9em;
  color: #4ade80;
}

.lighting-info ul {
  margin: 0 0 8px 0;
  padding-left: 16px;
  font-size: 0.8em;
}

.lighting-info li {
  margin: 3px 0;
  color: #e5e5e5;
}

.lighting-note {
  margin: 0;
  font-size: 0.75em;
  color: #4ade80;
  font-style: italic;
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
