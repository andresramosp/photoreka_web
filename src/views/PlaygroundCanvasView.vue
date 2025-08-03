<template>
  <div class="canvas-container playground-mode">
    <!-- Playground Banner -->
    <!-- <div class="playground-banner">
      <div class="banner-content">
        <div class="banner-icon">🎮</div>
        <div class="banner-text">
          <span class="banner-title">Playground Mode</span>
          <span class="banner-subtitle"
            >Upload photos and move them around. Sign up to unlock AI-powered
            features!</span
          >
        </div>
        <div class="banner-actions">
          <n-button type="primary" size="small" @click="handleSignUp">
            Sign Up Free
          </n-button>
        </div>
      </div>
    </div> -->

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
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <v-layer>
          <!-- Selection Rectangle -->
          <v-rect
            v-if="selectionRect.visible"
            :config="{
              x: selectionRect.x,
              y: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
              stroke: secondaryColor,
              strokeWidth: 2,
              fill: 'rgba(37, 99, 235, 0.1)',
              dash: [5, 3],
            }"
          />
          <!-- Photos -->
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
            @dragend="handleDragEnd(photo, $event, false)"
            @dragmove="handleDragMove(photo, $event)"
            @dblclick="handleSelectPhoto(photo, $event)"
            @click="handlePhotoClick(photo, $event)"
            @touchstart="handlePhotoTouchStart(photo, $event)"
            @touchend="handlePhotoTouchEnd(photo, $event)"
          >
            <v-group
              :config="{}"
              @mouseover="
                handleMouseOver(photo);
                stageRef.getStage().container().style.cursor =
                  interactionMode === 'select' ? 'pointer' : 'pointer';
              "
              @mouseout="
                handleMouseOut(photo);
                stageRef.getStage().container().style.cursor =
                  interactionMode === 'select' ? 'crosshair' : 'default';
              "
            >
              <!-- Hover Area -->
              <v-rect
                :config="{
                  x: -10,
                  y: -10,
                  width: photo.config.width + 20,
                  height: photo.config.height + 20,
                  fill: 'transparent',
                }"
              />

              <!-- Image -->
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

              <!-- Info Icon -->
              <v-group
                v-if="photo.hovered"
                :config="{ x: 10, y: 10 }"
                @click="openPhotoInfo(photo, $event)"
                @tap="openPhotoInfo(photo, $event)"
                @touchend="openPhotoInfo(photo, $event)"
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

              <!-- Playground Expansion Teaser Buttons -->
              <ExpandPhotoButtons
                v-if="photo.hovered && !photo.inTrash"
                :photo="photo"
                :enableDiagonal="false"
                @click="showExpansionTeaser"
                :sizeFactor="1.3"
              />

              <!-- Trash Overlay -->
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
            </v-group>
          </v-group>
        </v-layer>
      </v-stage>
    </div>

    <!-- Playground Photos Dialog -->
    <PlaygroundPhotosDialog
      v-model="showPhotosDialog"
      @photos-added="handlePhotosAdded"
    />

    <!-- Photo Info Dialog -->
    <PhotoInfoDialog
      v-model="showPhotoInfoDialog"
      :selected-photo="selectedDialogPhoto"
    />

    <!-- Top Left Controls -->
    <div class="canvas-controls top-left">
      <n-space>
        <n-button
          type="primary"
          @click="showPhotosDialog = true"
          :disabled="!canAddMore"
        >
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
          {{ isAtLimit ? "Photo Limit Reached" : "Add Photos" }}
        </n-button>

        <n-tooltip placement="bottom" trigger="hover">
          <template #trigger>
            <n-button @click="handleClearCanvas">
              <template #icon>
                <n-icon>
                  <ReloadOutline />
                </n-icon>
              </template>
            </n-button>
          </template>
          Clear canvas
        </n-tooltip>

        <!-- Photo Counter -->
        <div class="photo-counter">
          <span class="counter-text">{{ photoCount }}/{{ maxPhotos }}</span>
        </div>
      </n-space>
    </div>

    <!-- Top Right Controls -->
    <div class="canvas-controls top-right">
      <n-space>
        <n-button disabled>
          <template #icon>
            <n-icon size="20" color="#666">
              <SaveOutline />
            </n-icon>
          </template>
          Save (Pro)
        </n-button>
      </n-space>
    </div>

    <!-- Bottom Left Controls -->
    <div class="canvas-controls bottom-left">
      <n-button-group vertical>
        <n-tooltip placement="right" trigger="hover">
          <template #trigger>
            <n-button @click="zoomTick(1)" size="small">
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
          </template>
          Zoom in
        </n-tooltip>

        <n-tooltip placement="right" trigger="hover">
          <template #trigger>
            <n-button @click="zoomTick(-1)" size="small">
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
          </template>
          Zoom out
        </n-tooltip>

        <n-tooltip placement="right" trigger="hover">
          <template #trigger>
            <n-button @click="fitStageToPhotos(0.1)" size="small">
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
          </template>
          Fit view to photos
        </n-tooltip>

        <n-tooltip placement="right" trigger="hover">
          <template #trigger>
            <n-button
              :type="interactionMode === 'pan' ? 'primary' : 'default'"
              @click="toggleInteractionMode"
              size="small"
            >
              <template #icon>
                <n-icon v-if="interactionMode === 'pan'">
                  <HandLeftOutline />
                </n-icon>
                <n-icon v-else>
                  <SelectAllFilled />
                </n-icon>
              </template>
            </n-button>
          </template>
          <span v-if="interactionMode === 'pan'">
            Pan mode active - Click to switch to Select mode (S)
          </span>
          <span v-else>
            Select mode active - Draw rectangle to select photos, Ctrl+click for
            multi-select (S)
          </span>
        </n-tooltip>

        <n-tooltip placement="right" trigger="hover">
          <template #trigger>
            <n-button @click="unstackPhotos" size="small">
              <template #icon>
                <n-icon>
                  <ExpandOutline />
                </n-icon>
              </template>
            </n-button>
          </template>
          Unstack photos
        </n-tooltip>
      </n-button-group>
    </div>

    <!-- Trash Zone -->
    <div
      @click="confirmClearCanvas"
      :class="['trash-zone', { hovering: isHoveringTrash }]"
    >
      🗑️
    </div>
  </div>
</template>

<script setup>
import Konva from "konva";
import {
  useCanvasStage,
  TOOLBAR_WIDTH,
  applyZoom,
} from "@/composables/canvas/useCanvasStage";
import { useCanvasPhoto } from "@/composables/canvas/useCanvasPhoto.js";
import { usePlaygroundCanvasStore } from "@/stores/playgroundCanvas.js";
import {
  ExpandOutline,
  HandLeftOutline,
  ReloadOutline,
} from "@vicons/ionicons5";
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { NButton, NButtonGroup, NIcon, NSpace, NTooltip } from "naive-ui";
import { storeToRefs } from "pinia";
import PlaygroundPhotosDialog from "@/components/canvas/PlaygroundPhotosDialog.vue";
import PhotoInfoDialog from "@/components/PhotoInfoDialog.vue";
import ExpandPhotoButtons from "@/components/canvas/PhotoControls/ExpandPhotoButtons.vue";
import { SaveOutline } from "@vicons/ionicons5";
import { SelectAllFilled } from "@vicons/material";

const playgroundStore = usePlaygroundCanvasStore();
const { photos } = storeToRefs(playgroundStore);

// Computed properties from store
const photoCount = computed(() => playgroundStore.photoCount);
const maxPhotos = computed(() => playgroundStore.maxPhotos);
const canAddMore = computed(() => playgroundStore.canAddMore);
const isAtLimit = computed(() => playgroundStore.isAtLimit);

// Refs
const stageRef = ref(null);
const canvasContainer = ref();

const photoRefs = ref({});
const setPhotoRef = (id) => (el) => {
  if (el) photoRefs.value[id] = el;
};

// State
const interactionMode = ref("pan");
const showPhotosDialog = ref(false);
const showPhotoInfoDialog = ref(false);
const selectedDialogPhoto = ref(null);

// Toolbar state simplificado para playground
const toolbarState = ref({
  mouseMode: "move",
  zoomLevel: 1,
});

const secondaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--secondary-color")
  .trim();

// Canvas composables
const {
  stageConfig,
  selectionRect,
  updateStageOffset,
  handleWheel,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart: stageHandleTouchStart,
  handleTouchMove: stageHandleTouchMove,
  handleTouchEnd: stageHandleTouchEnd,
} = useCanvasStage(stageRef, photos, toolbarState);

const {
  handleSelectPhoto,
  handleDragStart,
  handleDragMove,
  handleDragEnd,
  handleMouseOver,
  handleMouseOut,
  unstackPhotos,
  isHoveringTrash,
} = useCanvasPhoto(stageRef, photos, photoRefs, stageConfig);

// Event handlers
const handlePhotosAdded = () => {
  fitStageToPhotos(0.8);
};

const handlePhotoDrop = (event) => {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);

  if (files.length > 0) {
    playgroundStore
      .addPhotos(files)
      .then(() => {
        fitStageToPhotos(0.8);
      })
      .catch((error) => {
        alert(error.message);
      });
  }
};

const showExpansionTeaser = (event) => {
  event.cancelBubble = true;
  // TODO: Show modal with video teaser
  alert(
    "🎮 This feature is available in the full version! Sign up to unlock AI-powered photo expansion."
  );
};

const getPhotoStrokeColor = (photo) => {
  if (photo.inTrash) return "rgba(250, 11, 11, 0.5)";
  if (photo.selected) return secondaryColor;
  return "gray";
};

const handleClearCanvas = () => {
  playgroundStore.clearCanvas();

  // Reset stage position and zoom
  const stage = stageRef.value.getStage();
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });
  stage.batchDraw();
  toolbarState.value.zoomLevel = 1;
  updateStageOffset();
};

const confirmClearCanvas = () => {
  if (photos.value.length > 0) {
    if (confirm("Clear all photos from canvas?")) {
      handleClearCanvas();
    }
  }
};

const fitStageToPhotos = (extraPaddingRatio = 0.1) => {
  if (!photos.value.length) return;

  const stage = stageRef.value.getStage();
  const containerWidth = stage.width();
  const containerHeight = stage.height() - 60; // Account for banner
  const margin = 40;

  // Calculate bounding box of all photos
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
    }
  );

  // Add padding
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
    2
  );

  const targetX =
    (containerWidth - photosWidth * targetZoom) / 2 -
    bounds.minX * targetZoom +
    margin * targetZoom;
  const targetY =
    (containerHeight - photosHeight * targetZoom) / 2 -
    bounds.minY * targetZoom +
    margin * targetZoom +
    60; // Account for banner

  // Animate to fit
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

const toggleInteractionMode = () => {
  interactionMode.value = interactionMode.value === "pan" ? "select" : "pan";
  toolbarState.value.mouseMode =
    interactionMode.value === "pan" ? "move" : "select";
};

const openPhotoInfo = (photo, event) => {
  event.cancelBubble = true;
  selectedDialogPhoto.value = photo;
  showPhotoInfoDialog.value = true;
};

const handleSignUp = () => {
  // Navigate to auth or show sign up modal
  window.location.href = "/auth";
};

// Stage event handlers
const handleStageClick = (event) => {
  if (
    event.target === event.target.getStage() &&
    (interactionMode.value !== "select" || !selectionRect.visible)
  ) {
    photos.value.forEach((photo) => {
      photo.selected = false;
    });
  }
};

const handleTouchStart = (event) => {
  stageHandleTouchStart(event);
};

const handleTouchMove = (event) => {
  stageHandleTouchMove(event);
};

const handleTouchEnd = (event) => {
  stageHandleTouchEnd(event);
};

const handlePhotoClick = (photo, event) => {
  photo.hovered = !photo.hovered;

  if (interactionMode.value === "select") {
    const isCtrlOrCmd = event.evt.ctrlKey || event.evt.metaKey;

    if (isCtrlOrCmd) {
      photo.selected = !photo.selected;
    } else {
      photos.value.forEach((p) => {
        p.selected = p.id === photo.id;
      });
    }

    event.cancelBubble = true;
  }
};

const handlePhotoTouchStart = (photo, event) => {
  const touch = event.evt.touches[0];
  if (touch) {
    photo._touchStartTime = Date.now();
    photo._touchStartPos = { x: touch.clientX, y: touch.clientY };
  }
  event.cancelBubble = true;
};

const handlePhotoTouchEnd = (photo, event) => {
  const touch = event.evt.changedTouches[0];
  if (touch && photo._touchStartTime && photo._touchStartPos) {
    const touchDuration = Date.now() - photo._touchStartTime;
    const touchDistance = Math.sqrt(
      Math.pow(touch.clientX - photo._touchStartPos.x, 2) +
        Math.pow(touch.clientY - photo._touchStartPos.y, 2)
    );

    if (touchDuration < 500 && touchDistance < 10) {
      photo.hovered = !photo.hovered;

      if (interactionMode.value === "select") {
        photo.selected = !photo.selected;
      }
    }

    delete photo._touchStartTime;
    delete photo._touchStartPos;
  }
  event.cancelBubble = true;
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

// Keyboard shortcuts
const handleKeyDown = (event) => {
  if (event.key === "Delete" || event.key === "Backspace") {
    const selectedPhotos = photos.value.filter((photo) => photo.selected);
    if (selectedPhotos.length > 0) {
      const selectedPhotoIds = selectedPhotos.map((photo) => photo.id);
      playgroundStore.deletePhotos(selectedPhotoIds);
    }
  }

  if (event.key === "s" || event.key === "S") {
    if (!["INPUT", "TEXTAREA"].includes(event.target.tagName)) {
      event.preventDefault();
      toggleInteractionMode();
    }
  }

  if (event.key === "Escape") {
    photos.value.forEach((photo) => {
      photo.selected = false;
    });
  }
};

// Resize handler
const handleResize = () => {
  if (stageRef.value && canvasContainer.value) {
    const stage = stageRef.value.getStage();
    const container = canvasContainer.value;
    stage.width(container.clientWidth);
    stage.height(container.clientHeight);
  }
};

// Lifecycle
onMounted(() => {
  window.addEventListener("resize", handleResize);
  document.addEventListener("keydown", handleKeyDown);
  const stage = stageRef.value.getStage();
  stage.on("dragmove", updateStageOffset);

  // Configure Konva for touch support
  stage.listening(true);
  const canvas = stage.content;
  if (canvas) {
    canvas.style.touchAction = "none";
  }

  updateStageOffset();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  document.removeEventListener("keydown", handleKeyDown);

  // Clean up playground store on unmount
  playgroundStore.clearCanvas();
});

// Watch for photo src changes and load images
watch(
  () => photos.value.map((p) => p.src),
  () => {
    photos.value.forEach((photo) => {
      if (!photo.image && photo.src) {
        const img = new Image();
        img.onload = () => {
          photo.image = img;
          // Force reactivity update
          const stage = stageRef.value?.getStage();
          if (stage) {
            stage.batchDraw();
          }
        };
        img.src = photo.src;
      }
    });
  },
  { immediate: true }
);
</script>

<style scoped>
.canvas-container.playground-mode {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-canvas, #1a1a1a);
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Playground Banner */
.playground-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(
    135deg,
    var(--primary-color, #007bff),
    var(--secondary-color, #6c757d)
  );
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.banner-icon {
  font-size: 1.5rem;
  margin-right: 12px;
}

.banner-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.banner-title {
  font-weight: 600;
  color: white;
  font-size: 1rem;
}

.banner-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
}

.banner-actions {
  margin-left: 16px;
}

/* Canvas adjustments for banner */
.canvas-container.playground-mode
  > div:not(.playground-banner):not(.canvas-controls):not(.trash-zone) {
  margin-top: 60px;
  height: calc(100vh - 60px);
}

.canvas-controls {
  position: absolute;
  z-index: 10;
}

.top-left {
  top: 76px; /* Account for banner */
  left: 16px;
}

.top-right {
  top: 76px; /* Account for banner */
  right: 16px;
}

.bottom-left {
  left: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Photo Counter */
.photo-counter {
  background: var(--bg-container, rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

.counter-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

/* Trash Zone */
.trash-zone {
  position: absolute;
  width: 100px;
  height: 100px;
  bottom: 0px;
  right: 1px;
  border-radius: 8px;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, transform 0.2s ease;
  transform: rotate(0deg) scale(1);
}

.trash-zone.hovering {
  background-color: rgba(255, 0, 0, 0.25);
  border-color: darkred;
  transform: rotate(8deg) scale(1.08);
}

/* Responsive */
@media (max-width: 768px) {
  .banner-content {
    padding: 8px 16px;
  }

  .banner-title {
    font-size: 0.9rem;
  }

  .banner-subtitle {
    font-size: 0.75rem;
  }

  .banner-text {
    margin-right: 12px;
  }

  .top-left {
    top: 68px;
    left: 8px;
  }

  .top-right {
    top: 68px;
    right: 8px;
  }

  .canvas-container.playground-mode
    > div:not(.playground-banner):not(.canvas-controls):not(.trash-zone) {
    margin-top: 52px;
    height: calc(100vh - 52px);
  }
}

@media (max-width: 480px) {
  .banner-content {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .banner-actions {
    margin-left: 0;
    align-self: flex-end;
  }
}
</style>

<style>
.konvajs-content {
  background: black !important;
}
</style>
