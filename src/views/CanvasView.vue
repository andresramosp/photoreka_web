<template>
  <div class="canvas-container">
    <div ref="canvasContainer" @dragover.prevent @drop="handlePhotoDrop">
      <!-- Konva Canvas -->
      <v-stage
        ref="stageRef"
        :config="stageConfig"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @click="handleStageClick"
      >
        <v-layer>
          <!-- Rectángulo de selección -->
          <v-rect
            v-if="selectionRect.visible"
            :config="{
              x: selectionRect.x,
              y: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
              stroke: secondaryColor,
              dash: [4, 4],
            }"
          />
          <!-- Fotos -->
          <v-group
            v-for="photo in photos"
            :key="photo.id"
            :ref="setPhotoRef(photo.id)"
            :config="{
              x: photo.config.x,
              y: photo.config.y,
              draggable: true,
              zIndex: photo.config.zIndex,
              opacity: photo.config.opacity ?? 1,
              _isPhoto: true,
            }"
            @dragstart="handleDragStart(photo, $event)"
            @dragend="
              handleDragEnd(photo, $event, toolbarState.expansion.autoAlign)
            "
            @dragmove="handleDragMove(photo, $event)"
            @dblclick="handleSelectPhoto(photo, $event)"
          >
            <v-group
              :config="{}"
              @mouseover="
                handleMouseOver(photo);
                stageRef.getStage().container().style.cursor = 'pointer';
              "
              @mouseout="
                handleMouseOut(photo);
                stageRef.getStage().container().style.cursor = '';
              "
            >
              <!-- Área de hover con padding invisible -->
              <v-rect
                :config="{
                  x: -10,
                  y: -10,
                  width: photo.config.width + 20,
                  height: photo.config.height + 20,
                  fill: 'transparent',
                }"
              />

              <!-- Imagen -->
              <v-image
                :config="{
                  x: 0,
                  y: 0,
                  width: photo.config.width,
                  height: photo.config.height,
                  image: photo.image,
                  stroke: getPhotoStrokeColor(photo),
                  strokeWidth: photo.selected ? 7 : 2.5,
                }"
              />
              <!-- Info icon -->
              <v-group
                v-if="
                  photo.hovered &&
                  toolbarState.expansion.type !== 'tags' &&
                  !toolbarState.expansion.type !== 'composition'
                "
                :config="{ x: 10, y: 10 }"
                @click="() => {}"
              >
                <v-circle
                  :config="{
                    radius: 5.5,
                    stroke: 'white',
                    strokeWidth: 1,
                  }"
                />
                <v-text
                  :config="{
                    text: 'i',
                    fontSize: 10.5,
                    fill: 'white',
                    align: 'center',
                    verticalAlign: 'middle',
                    width: 20,
                    height: 20,
                    offsetX: 10,
                    offsetY: 9,
                  }"
                />
              </v-group>

              <!-- Spinner de carga -->
              <v-group
                v-if="photo.loading && expansionMode == 'canvas'"
                :config="{
                  x: photo.config.width / 2,
                  y: photo.config.height / 2,
                  opacity: 0.7,
                }"
                ref="spinnerRefs"
              >
                <v-arc
                  :config="{
                    innerRadius: 15,
                    outerRadius: 45,
                    angle: 270,
                    fill: 'transparent',
                    stroke: 'white',
                    strokeWidth: 3,
                    rotation: photo.spinnerRotation || 0,
                  }"
                />
              </v-group>
              <!-- Filtro rojo pre-borrado -->
              <v-rect
                v-if="photo.inTrash"
                :config="{
                  x: 0,
                  y: 0,
                  width: photo.config.width,
                  height: photo.config.height,
                  fill: 'rgba(255, 0, 0, 0.3)',
                }"
              />
              <!-- Tags y botones -->
              <template>
                <!-- <PhotoDetectionAreas
                v-if="
                  toolbarState.expansion.type === 'composition' &&
                  toolbarState.expansion.onCanvas &&
                  photo.hovered
                "
                :photo="photo"
                :detectionAreas="photo.detectionAreas"
                :visible="photo.hovered"
                >/</PhotoDetectionAreas
              > -->
                <TagPillsCanvas
                  v-if="
                    toolbarState.expansion.type === 'tags' &&
                    expansionMode == 'canvas' &&
                    photo.hovered
                  "
                  :photo="photo"
                  :tags="photo.tags"
                  :visible="photo.hovered"
                />
                <ExpandPhotoButtons
                  :photo="photo"
                  :enableDiagonal="
                    toolbarState.photoOptions.spreadMode === 'circular'
                  "
                  v-if="
                    expansionMode == 'canvas' &&
                    !photo.inTrash &&
                    photo.hovered &&
                    (toolbarState.expansion.type !== 'tags' ||
                      photo.tags.some((t) => t.tag.selected)) &&
                    (toolbarState.expansion.type !== 'composition' ||
                      photo.detectionAreas.some((dt) => dt.selected))
                  "
                  @click="handleAddPhotoFromPhoto"
                  :sizeFactor="dynamicSizeFactor"
                />
                <PhotoCenterButton
                  v-else-if="
                    expansionMode !== 'canvas' &&
                    !photo.inTrash &&
                    photo.hovered
                  "
                  :photo="photo"
                  :fill="secondaryColor"
                  icon="+"
                  font-size="30"
                  @click="handleAddPhotoFromPhoto"
                  :sizeFactor="1.3"
                />
              </template>
            </v-group>
          </v-group>
        </v-layer>
      </v-stage>
    </div>

    <!-- Related Photos Toolbar -->
    <RelatedPhotosToolbar
      v-if="showRelatedPhotos"
      :base-image="selectedPhotoForToolbar"
      :is-visible="showRelatedPhotos"
      :is-loading="isLoadingRelatedPhotos"
      :toolbar-state="toolbarState"
      @close="hideRelatedPhotos"
      @loading="isLoadingRelatedPhotos = $event"
      @photos-selected="onPhotosSelected"
      @search-type-changed="onSearchTypeChanged"
    />

    <PhotosDialog v-model="showPhotosDialog" @add-photos="handleAddPhotos" />
    <PhotosDialog
      v-model="showTrashDialog"
      :is-trash="true"
      @add-photos="handleAddPhotos"
    />

    <!-- Top Left Controls -->
    <div class="canvas-controls top-left">
      <n-space>
        <n-button type="primary" @click="showPhotosDialog = true">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V9h-3V7H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4l2 3l3-4l4 5H5z"
                />
              </svg>
            </n-icon>
          </template>
          Add Photos
        </n-button>

        <n-button @click="handleClearCanvas">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
                />
              </svg>
            </n-icon>
          </template>
        </n-button>

        <n-button @click="openConfig">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
                />
              </svg>
            </n-icon>
          </template>
        </n-button>
      </n-space>
    </div>

    <!-- Top Center Mode Switch -->
    <div class="canvas-controls top-center">
      <div class="btn-group-pill">
        <div class="expandable-button-group" ref="expandableGroupRef">
          <n-button
            :type="expansionMode === 'catalog' ? 'primary' : 'default'"
            @click="selectCatalogMode"
            title="Expand on catalog"
            class="mode-button left-button"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M4,4H10V10H4V4M20,4V10H14V4H20M14,15H16V13H14V11H16V13H18V11H20V13H18V15H20V18H18V20H16V18H13V15H14V15M16,15V18H18V15H16M4,20V14H10V20H4M11,14H13V16H11V14M6,6V8H8V6H6M6,16V18H8V16H6M16,6V8H18V6H16Z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-button>

          <div
            class="expandable-container"
            :class="{ expanded: canvasModeIsExpanded }"
          >
            <n-button
              :type="expansionMode === 'canvas' ? 'primary' : 'default'"
              @click.stop="handleOnCanvasClick"
              title="Expand on canvas"
              class="mode-button right-button"
            >
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12,8L10.67,8.09C10.38,7.45 9.8,6.95 9.09,6.67L8,5L6.91,6.09C6.2,6.37 5.62,6.87 5.33,7.51L4,8L5.09,9.09C5.37,9.8 5.87,10.38 6.51,10.67L8,12L9.09,10.91C9.8,10.63 10.38,10.05 10.67,9.41L12,8M16,12L14.67,12.09C14.38,11.45 13.8,10.95 13.09,10.67L12,9L10.91,10.09C10.2,10.37 9.62,10.87 9.33,11.51L8,12L9.09,13.09C9.37,13.8 9.87,14.38 10.51,14.67L12,16L13.09,14.91C13.8,14.63 14.38,14.05 14.67,13.41L16,12M9,19H15V21H9V19Z"
                    />
                  </svg>
                </n-icon>
              </template>
              <span v-if="canvasModeIsExpanded" class="button-text">{{
                expansionTypeOptions.find(
                  (opt) => opt.value == toolbarState.expansion.type,
                ).label
              }}</span>
              <n-icon v-if="canvasModeIsExpanded" class="dropdown-arrow">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7 10l5 5 5-5z" />
                </svg>
              </n-icon>
            </n-button>

            <div v-if="isDropdownOpen" class="dropdown-menu" @click.stop>
              <div
                v-for="option in expansionTypeOptions"
                :key="option.value"
                :class="[
                  'dropdown-item',
                  {
                    active: toolbarState.expansion.type === option.value,
                  },
                ]"
                @click="selectOption(option)"
              >
                <n-icon class="option-icon">
                  <component :is="option.icon" />
                </n-icon>
                <span>{{ option.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Right Controls -->
    <div class="canvas-controls top-right">
      <n-button-group vertical>
        <n-button @click="zoomTick(1)">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                />
                <path
                  fill="currentColor"
                  d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"
                />
              </svg>
            </n-icon>
          </template>
        </n-button>

        <n-button @click="zoomTick(-1)">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                />
                <path fill="currentColor" d="M7 9h5v1H7z" />
              </svg>
            </n-icon>
          </template>
        </n-button>

        <n-button @click="fitStageToPhotos(0.1)">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9 9H15V15H9V9M11 11V13H13V11H11M2 3H8V5H4V9H2V3M22 3V9H20V5H16V3H22M2 21V15H4V19H8V21H2M22 21H16V19H20V15H22V21Z"
                />
              </svg>
            </n-icon>
          </template>
        </n-button>

        <n-button
          :type="interactionMode === 'pan' ? 'primary' : 'default'"
          @click="toggleInteractionMode"
        >
          <template #icon>
            <n-icon v-if="interactionMode === 'pan'">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M13,1L11,3L14,6L12,8L15,11L13,13L16,16L14,18L17,21L19,19L16,16L18,14L15,11L17,9L14,6L16,4L13,1M5,4C3.89,4 3,4.89 3,6A2,2 0 0,0 5,8A2,2 0 0,0 7,6C7,4.89 6.11,4 5,4M5,10A4,4 0 0,1 1,6A4,4 0 0,1 5,2A4,4 0 0,1 9,6A4,4 0 0,1 5,10Z"
                />
              </svg>
            </n-icon>
            <n-icon v-else>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M2,2H8V4H4V8H2V2M2,16V22H8V20H4V16H2M16,2V4H20V8H22V2H16M20,16V20H16V22H22V16H20M6,6H18V18H6V6M8,8V16H16V8H8Z"
                />
              </svg>
            </n-icon>
          </template>
        </n-button>
      </n-button-group>
    </div>
    <div
      @click="showTrashDialog = true"
      :class="['trash-zone', { hovering: isHoveringTrash }]"
    >
      🗑️
    </div>
  </div>
</template>

<script setup>
import {
  useCanvasStage,
  TOOLBAR_WIDTH,
  applyZoom,
} from "@/composables/canvas/useCanvasStage";
import { useCanvasPhoto } from "@/composables/canvas/useCanvasPhoto.js";
import { usePhotoAnimations } from "@/composables/canvas/usePhotoAnimations";
import { useCanvasStore, expansionTypeOptions } from "@/stores/canvas.js";
// import PhotoDetectionAreas from "@/components/canvas/PhotoControls/PhotoDetectionAreas.vue";
import { usePhotosStore } from "@/stores/photos";
import { ref, onMounted, onUnmounted, computed, h, watch } from "vue";
import { NButton, NButtonGroup, NIcon, NSpace } from "naive-ui";
import { storeToRefs } from "pinia";
import PhotosDialog from "@/components/canvas/PhotosDialog.vue";
import ExpandPhotoButtons from "@/components/canvas/PhotoControls/ExpandPhotoButtons.vue";
import PhotoCenterButton from "@/components/canvas/PhotoControls/PhotoCenterButton.vue";
import TagPillsCanvas from "@/components/canvas/TagPills/TagPillsCanvas.vue";
import RelatedPhotosToolbar from "@/components/canvas/RelatedPhotosToolbar.vue";

const canvasStore = useCanvasStore();
const photosStore = usePhotosStore();
// const photosStore = usePhotosStore();
const { photos } = storeToRefs(canvasStore);

// Refs
const stageRef = ref(null);
const canvasContainer = ref();
const expandableGroupRef = ref();

const photoRefs = ref({});
const setPhotoRef = (id) => (el) => {
  if (el) photoRefs.value[id] = el;
};

const toolbarState = ref({
  mouseMode: "move",
  zoomLevel: 0,
  expansion: {
    type: "embedding",
    inverted: false,
    opposite: false,
    autoAlign: false,
    onCanvas: false,
  },
  photoOptions: {
    count: 1,
    spreadMode: "perpendicular",
  },
});

// State
const expansionMode = ref("catalog");
const interactionMode = ref("pan");
const showRelatedPhotos = ref(false);
const showPhotosDialog = ref(false);
const showTrashDialog = ref(false);
const selectedPhotoForToolbar = ref(null);
const isLoadingRelatedPhotos = ref(false);

// Expandable dropdown state
const canvasModeIsExpanded = ref(false);
const isDropdownOpen = ref(false);

// Dropdown options with SVG icons

const secondaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--secondary-color")
  .trim();

const {
  stageConfig,
  stageOffset,
  selectionRect,
  updateStageOffset,
  handleWheel,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} = useCanvasStage(stageRef, photos, toolbarState);

const {
  handleSelectPhoto,
  handleDragStart,
  handleDragMove,
  handleDragEnd,
  handleMouseOver,
  handleMouseOut,
  autoAlignPhotos,
  isHoveringTrash,
} = useCanvasPhoto(stageRef, photos, photoRefs, stageConfig);

const { animatePhotoGroup, animatePhotoGroupExplosion } = usePhotoAnimations();

const dynamicSizeFactor = computed(() => {
  const baseSize = 1.25;
  const zoom = toolbarState.value.zoomLevel || 100;
  let newFactor = baseSize * (0.8 / zoom);
  return Math.min(Math.max(newFactor, 1), 5);
});

// Event handlers

async function handleAddPhotos(photoIds) {
  // Fetch todas las fotos necesarias en paralelo
  await Promise.all(photoIds.map((id) => photosStore.fetchPhoto(id)));

  const photosToAdd = photoIds
    .map((id) => photosStore.photos.find((p) => p.id == id))
    .filter(Boolean);
  canvasStore.addPhotos(photosToAdd);

  fitStageToPhotos(0.8);
}

function handleAddPhotoFromPhoto(event) {
  if (expansionMode.value == "canvas") {
    handleAddPhotosToCanvas(event);
  } else {
    event.cancelBubble = true;
    selectedPhotoForToolbar.value = event.photo;
    showRelatedPhotos.value = true;
  }
}

const handleAddPhotosToCanvas = async (event) => {
  const { photo, position } = event;
  event.cancelBubble = true;
  const basePosition = { x: photo.config.x, y: photo.config.y };

  // Extraemos el margen y dimensiones para calcular offset
  const margin = 35;
  const photoWidth =
    photos.value.length > 0 ? photos.value[0].config.width : 200;
  const photoHeight =
    photos.value.length > 0 ? photos.value[0].config.height : 200;
  const offsetX = photoWidth + margin;
  const offsetY = photoHeight + margin;

  await canvasStore.addPhotosFromPhoto(
    [photo],
    toolbarState.value.expansion.type,
    toolbarState.value.photoOptions.count,
    basePosition,
    toolbarState.value.expansion.opposite,
    toolbarState.value.expansion.inverted,
    true,
  );

  if (
    toolbarState.value.photoOptions.spreadMode == "linear" ||
    toolbarState.value.photoOptions.spreadMode == "perpendicular"
  ) {
    animatePhotoGroup(
      photoRefs,
      photos,
      basePosition,
      position,
      offsetX,
      offsetY,
      toolbarState.value.photoOptions.spreadMode,
    );
  } else {
    animatePhotoGroupExplosion(photoRefs, photos, basePosition, position);
  }
};

const getPhotoStrokeColor = (photo) => {
  if (photo.inTrash) return "rgba(250, 11, 11, 0.5)";
  if (photo.selected) return secondaryColor;
  // if (photo.hovered) return primaryColor;
  return "gray";
};

const handleClearCanvas = () => {
  // Limpiar fotos y descartados
  canvasStore.$patch({ photos: [] });
  canvasStore.$patch({ discardedPhotos: [] });

  // Resetear zoom y posición del stage
  const stage = stageRef.value.getStage();
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });
  stage.batchDraw();

  // Resetear el zoomLevel del estado
  toolbarState.value.zoomLevel = 1;

  // Resetear offset
  updateStageOffset();
};

const fitStageToPhotos = (extraPaddingRatio = 0.1) => {
  if (!photos.value.length) return;

  const stage = stageRef.value.getStage();
  const containerWidth = stage.width() - TOOLBAR_WIDTH; // Restamos el ancho de la toolbar
  const containerHeight = stage.height();
  const margin = 40;

  // Bounding box de todas las fotos
  const bounds = photos.value.reduce(
    (acc, p) => {
      const { x, y, width, height } = p.config;
      acc.minX = Math.min(acc.minX, x);
      acc.minY = Math.min(acc.minY, y);
      acc.maxX = Math.max(acc.maxX, x + width);
      acc.maxY = Math.max(acc.maxY, y + height);
      return acc;
    },
    {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    },
  );

  // Añadir padding adicional
  const paddingX = (bounds.maxX - bounds.minX) * extraPaddingRatio;
  const paddingY = (bounds.maxY - bounds.minY) * extraPaddingRatio;
  bounds.minX -= paddingX;
  bounds.maxX += paddingX;
  bounds.minY -= paddingY;
  bounds.maxY += paddingY;

  const photosWidth = bounds.maxX - bounds.minX + margin * 2;
  const photosHeight = bounds.maxY - bounds.minY + margin * 2;
  const targetZoom = Math.min(
    containerWidth / photosWidth,
    containerHeight / photosHeight,
    2,
  );

  const targetX =
    (containerWidth - photosWidth * targetZoom) / 2 -
    bounds.minX * targetZoom +
    margin * targetZoom +
    TOOLBAR_WIDTH / 2; // Ajustamos el offset para centrar en el espacio disponible
  const targetY =
    (containerHeight - photosHeight * targetZoom) / 2 -
    bounds.minY * targetZoom +
    margin * targetZoom;

  // Tween para animar el zoom y el desplazamiento
  new Konva.Tween({
    node: stage,
    scaleX: targetZoom,
    scaleY: targetZoom,
    x: targetX,
    y: targetY,
    duration: 0.4,
    easing: Konva.Easings.EaseInOut,
    onFinish: () => {
      toolbarState.value.zoomLevel = targetZoom;
      updateStageOffset();
    },
  }).play();
};

const openConfig = () => {
  console.log("Open config");
  // TODO: Implement config dialog
};

const toggleInteractionMode = () => {
  interactionMode.value = interactionMode.value === "pan" ? "select" : "pan";
};

// Mode selection functions
const selectCatalogMode = () => {
  expansionMode.value = "catalog";
  canvasModeIsExpanded.value = false;
  isDropdownOpen.value = false;
};

const handleOnCanvasClick = () => {
  if (expansionMode.value !== "canvas") {
    // First click: switch to catalog mode and expand button
    expansionMode.value = "canvas";
    canvasModeIsExpanded.value = true;
    isDropdownOpen.value = false;
    showRelatedPhotos.value = false;
  } else if (!isDropdownOpen.value) {
    // Second click: open dropdown (already in catalog mode and expanded)
    isDropdownOpen.value = true;
  } else {
    // Third click: close dropdown but keep expanded and in catalog mode
    isDropdownOpen.value = false;
  }
};

const selectOption = (option) => {
  toolbarState.value.expansion.type = option.value;
  isDropdownOpen.value = false;
};

// Toolbar functions
const hideRelatedPhotos = () => {
  showRelatedPhotos.value = false;
};

const onPhotosSelected = (photoIds) => {
  console.log("Photos selected:", photoIds);
  // TODO: Handle selected photos
};

const onSearchTypeChanged = (searchType) => {
  console.log("Search type changed:", searchType);
  // TODO: Update related photos based on search type
};

// Resize handling
const handleResize = () => {
  if (stageRef.value && canvasContainer.value) {
    const stage = stageRef.value.getStage();
    const container = canvasContainer.value;
    stage.width(container.clientWidth);
    stage.height(container.clientHeight);
  }
};

// Click outside handler to close dropdown only
const handleClickOutside = (event) => {
  const target = event.target;

  if (
    isDropdownOpen.value &&
    expandableGroupRef.value &&
    !expandableGroupRef.value.contains(target)
  ) {
    isDropdownOpen.value = false;
    // Keep the button expanded if in catalog mode
  }
};

function zoomTick(direction = 1) {
  const stage = stageRef.value.getStage();
  const scaleBy = 1.11;

  const oldScale = stage.scaleX();
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  const pointer = {
    x: stage.width() / 2,
    y: stage.height() / 2,
  };

  applyZoom(stage, newScale, updateStageOffset, pointer);
}

watch(
  () => photos.value.map((p) => p.src),
  () => {
    photos.value.forEach((photo) => {
      if (!photo.image) {
        const img = new Image();
        img.src = photo.src;
        photo.image = img;
      }
    });
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  document.addEventListener("click", handleClickOutside);
  const stage = stageRef.value.getStage();
  stage.on("dragmove", updateStageOffset);
  updateStageOffset();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px); /* Subtract header height */
  overflow: hidden;
  background: var(--bg-canvas, #1a1a1a);
}

.canvas-controls {
  position: absolute;
  z-index: 10;
}

.top-left {
  top: 16px;
  left: 16px;
}

.top-center {
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
}

.top-right {
  top: 16px;
  right: 16px;
}

/* Expandable button group styles */
.expandable-button-group {
  display: flex;
  align-items: center;
  border-radius: 18px;
  background: var(--bg-container, rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 1;
}

.mode-button {
  border-radius: 0 !important;
  border: none !important;
}

.left-button {
  border-top-left-radius: 18px !important;
  border-bottom-left-radius: 18px !important;
  padding: 0 12px;
}

.expandable-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 40px; /* Initial width for just the icon */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expandable-container.expanded {
  width: 125px; /* Expanded width to fit text and dropdown arrow */
  overflow: visible; /* Allow dropdown to show outside container */
}

.right-button {
  width: 100%;
  border-top-right-radius: 18px !important;
  border-bottom-right-radius: 18px !important;
  justify-content: space-between;
  white-space: nowrap;
  padding: 0 12px;
  overflow: hidden;
}

.button-text {
  font-size: 14px;
  font-weight: 500;
  opacity: 0;
  animation: fadeIn 0.2s ease-in 0.1s forwards;
}

.dropdown-arrow {
  opacity: 0;
  animation: fadeIn 0.2s ease-in 0.1s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-container, rgba(30, 30, 30, 0.95));
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  margin-top: 4px;
  min-width: 140px;
  animation: slideDown 0.2s ease-out;
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

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.8));
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: var(--bg-surface, rgba(255, 255, 255, 0.1));
  color: var(--text-primary, #ffffff);
}

.dropdown-item.active {
  background: var(--primary-color, #007bff);
  color: #ffffff;
}

.option-icon {
  margin-right: 8px;
  width: 16px;
  height: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .canvas-controls {
    font-size: 14px;
  }

  .top-left,
  .top-center,
  .top-right {
    top: 12px;
  }

  .top-left {
    left: 12px;
  }

  .top-right {
    right: 12px;
  }

  .expandable-container.expanded {
    width: 120px; /* Slightly smaller on tablets */
  }
}

@media (max-width: 480px) {
  .top-center {
    top: 70px; /* Move mode switch below other controls on mobile */
  }

  .top-left,
  .top-right {
    top: 8px;
  }

  .top-left {
    left: 8px;
  }

  .top-right {
    right: 8px;
  }

  .expandable-container.expanded {
    width: 100px; /* Even smaller on mobile */
  }

  .button-text {
    font-size: 12px;
  }
}
.trash-zone {
  position: absolute;
  width: 100px;
  height: 100px;
  bottom: 0px;
  display: flex;
  right: 1px;
  /* background-color: rgba(255, 0, 0, 0.1); */
  /* border: 1px solid rgba(250, 11, 11, 0.5); */
  border-radius: 8px;
  font-size: 40px;
  text-align: center;
  align-items: center;
  line-height: 90px;

  transition:
    background-color 0.2s,
    border-color 0.2s,
    transform 0.2s ease;
  transform: rotate(0deg) scale(1);
  align-content: center;
  justify-content: center;
  cursor: pointer;
}

.trash-zone.hovering {
  background-color: rgba(255, 0, 0, 0.25);
  border-color: darkred;
  transform: rotate(8deg) scale(1.08);
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}
</style>
<style>
.konvajs-content {
  background: black !important;
}
</style>
