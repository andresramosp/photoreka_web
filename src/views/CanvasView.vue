<template>
  <div class="canvas-container" ref="canvasContainer">
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
      <v-layer ref="layerRef">
        <!-- Canvas content will be added here -->
      </v-layer>
    </v-stage>

    <!-- Related Photos Toolbar -->
    <RelatedPhotosToolbar
      :is-visible="showRelatedPhotos"
      @close="hideRelatedPhotos"
      @photos-selected="onPhotosSelected"
      @search-type-changed="onSearchTypeChanged"
    />

    <!-- Top Left Controls -->
    <div class="canvas-controls top-left">
      <n-space>
        <n-button type="primary" @click="addPhotosToCanvas">
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

        <n-button @click="clearCanvas">
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
            :type="canvasMode === 'design' ? 'primary' : 'default'"
            @click="canvasMode = 'design'"
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

          <div class="expandable-container" :class="{ expanded: isExpanded }">
            <n-button
              :type="canvasMode === 'preview' ? 'primary' : 'default'"
              @click="handleRightButtonClick"
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
              <span v-if="isExpanded" class="button-text">{{
                selectedOption
              }}</span>
              <n-icon v-if="isExpanded" class="dropdown-arrow">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7 10l5 5 5-5z" />
                </svg>
              </n-icon>
            </n-button>

            <div v-if="isExpanded" class="dropdown-menu" @click.stop>
              <div
                v-for="option in dropdownOptions"
                :key="option.value"
                :class="[
                  'dropdown-item',
                  { active: selectedOption === option.label },
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
        <n-button @click="zoomIn">
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

        <n-button @click="zoomOut">
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

        <n-button @click="fitToView">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, h } from "vue";
import { NButton, NButtonGroup, NIcon, NSpace } from "naive-ui";
import RelatedPhotosToolbar from "../components/RelatedPhotosToolbar.vue";

// Refs
const stageRef = ref<any>(null);
const layerRef = ref<any>(null);
const canvasContainer = ref<HTMLElement>();

// State
const canvasMode = ref<"design" | "preview">("design");
const interactionMode = ref<"pan" | "select">("select");
const stageScale = ref(1);
const stagePosition = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const lastPointerPosition = ref({ x: 0, y: 0 });
const showRelatedPhotos = ref(false);

// Expandable dropdown state
const isExpanded = ref(false);
const selectedOption = ref("General");

// Dropdown options with SVG icons
const dropdownOptions = [
  {
    value: "general",
    label: "General",
    icon: () =>
      h("svg", { viewBox: "0 0 24 24" }, [
        h("path", {
          fill: "currentColor",
          d: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z",
        }),
      ]),
  },
  {
    value: "narrative",
    label: "Narrative",
    icon: () =>
      h("svg", { viewBox: "0 0 24 24" }, [
        h("path", {
          fill: "currentColor",
          d: "M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z",
        }),
      ]),
  },
  {
    value: "context",
    label: "Context",
    icon: () =>
      h("svg", { viewBox: "0 0 24 24" }, [
        h("path", {
          fill: "currentColor",
          d: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17M11,9H13V7H11V9Z",
        }),
      ]),
  },
  {
    value: "composition",
    label: "Composition",
    icon: () =>
      h("svg", { viewBox: "0 0 24 24" }, [
        h("path", {
          fill: "currentColor",
          d: "M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V18H11V8H9M13,8V18H15V8H13Z",
        }),
      ]),
  },
  {
    value: "tags",
    label: "Tags",
    icon: () =>
      h("svg", { viewBox: "0 0 24 24" }, [
        h("path", {
          fill: "currentColor",
          d: "M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.78 12.45,22 13,22C13.55,22 14.05,21.78 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.45 21.78,11.95 21.41,11.58Z",
        }),
      ]),
  },
];

// Stage configuration
const stageConfig = computed(() => {
  // Get the canvas container dimensions instead of full window
  const container = canvasContainer.value;
  const width = container?.clientWidth || window.innerWidth;
  const height = container?.clientHeight || window.innerHeight;

  return {
    width,
    height,
    scaleX: stageScale.value,
    scaleY: stageScale.value,
    x: stagePosition.value.x,
    y: stagePosition.value.y,
    draggable: interactionMode.value === "pan",
  };
});

// Event handlers
const handleWheel = (e: any) => {
  e.evt.preventDefault();

  const stage = stageRef.value?.getStage();
  if (!stage) return;

  const scaleBy = 1.1;
  const pointer = stage.getPointerPosition();

  if (!pointer) return;

  const mousePointTo = {
    x: (pointer.x - stage.x()) / stage.scaleX(),
    y: (pointer.y - stage.y()) / stage.scaleY(),
  };

  const direction = e.evt.deltaY > 0 ? -1 : 1;
  const newScale =
    direction > 0 ? stageScale.value * scaleBy : stageScale.value / scaleBy;

  // Limit zoom
  const clampedScale = Math.max(0.1, Math.min(5, newScale));
  stageScale.value = clampedScale;

  const newPos = {
    x: pointer.x - mousePointTo.x * clampedScale,
    y: pointer.y - mousePointTo.y * clampedScale,
  };

  stagePosition.value = newPos;
};

const handleMouseDown = (e: any) => {
  if (interactionMode.value === "pan") {
    isDragging.value = true;
    const pos = e.target.getStage().getPointerPosition();
    lastPointerPosition.value = pos;
  }
};

const handleMouseMove = (e: any) => {
  if (!isDragging.value || interactionMode.value !== "pan") return;

  const stage = e.target.getStage();
  const pos = stage.getPointerPosition();

  const dx = pos.x - lastPointerPosition.value.x;
  const dy = pos.y - lastPointerPosition.value.y;

  stagePosition.value = {
    x: stagePosition.value.x + dx,
    y: stagePosition.value.y + dy,
  };

  lastPointerPosition.value = pos;
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handleStageClick = (e: any) => {
  // Only show toolbar if clicking directly on the stage (not on objects)
  if (e.target === e.target.getStage()) {
    showRelatedPhotos.value = true;
  }
};

// Control functions
const addPhotosToCanvas = () => {
  console.log("Add photos to canvas");
  // TODO: Implement photo addition logic
};

const clearCanvas = () => {
  console.log("Clear canvas");
  // TODO: Implement canvas clearing logic
};

const openConfig = () => {
  console.log("Open config");
  // TODO: Implement config dialog
};

const zoomIn = () => {
  const newScale = Math.min(5, stageScale.value * 1.2);
  stageScale.value = newScale;
};

const zoomOut = () => {
  const newScale = Math.max(0.1, stageScale.value / 1.2);
  stageScale.value = newScale;
};

const fitToView = () => {
  stageScale.value = 1;
  stagePosition.value = { x: 0, y: 0 };
};

const toggleInteractionMode = () => {
  interactionMode.value = interactionMode.value === "pan" ? "select" : "pan";
};

// Dropdown functions
const handleRightButtonClick = (event: Event) => {
  event.stopPropagation();
  if (!isExpanded.value) {
    canvasMode.value = "preview";
    isExpanded.value = true;
  } else {
    // If already expanded, close it
    isExpanded.value = false;
  }
};

const selectOption = (option: any) => {
  selectedOption.value = option.label;
  isExpanded.value = false;
  // Here you can add logic to handle the selected option
  console.log("Selected option:", option);
};

// Toolbar functions
const hideRelatedPhotos = () => {
  showRelatedPhotos.value = false;
};

const onPhotosSelected = (photoIds: string[]) => {
  console.log("Photos selected:", photoIds);
  // TODO: Handle selected photos
};

const onSearchTypeChanged = (searchType: string) => {
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

// Click outside handler to close dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const expandableContainer = document.querySelector(".expandable-container");

  if (
    isExpanded.value &&
    expandableContainer &&
    !expandableContainer.contains(target)
  ) {
    isExpanded.value = false;
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  document.addEventListener("click", handleClickOutside);
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
  overflow: hidden;
  background: var(--bg-container, rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(8px);
}

.mode-button {
  border-radius: 0 !important;
  border: none !important;
  height: 36px;
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
  width: 140px; /* Expanded width to fit text and dropdown arrow */
}

.right-button {
  width: 100%;
  border-top-right-radius: 18px !important;
  border-bottom-right-radius: 18px !important;
  justify-content: space-between;
  white-space: nowrap;
  padding: 0 12px;
}

.button-text {
  margin: 0 8px;
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
  z-index: 20;
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
</style>
