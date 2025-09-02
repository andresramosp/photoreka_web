<template>
  <div class="frame-visualizer">
    <div class="visualizer-container">
      <!-- Frame container with dynamic aspect ratio -->
      <div class="frame-container" :style="frameContainerStyle">
        <!-- Photo container -->
        <div class="photo-container">
          <img
            v-if="photoUrl"
            :src="photoUrl"
            :alt="photoAlt"
            class="photo-image"
            @load="onImageLoad"
            @error="onImageError"
          />
          <div v-else class="no-photo-placeholder">
            <n-icon :size="48" color="#ccc">
              <ImageIcon />
            </n-icon>
            <p>No photo selected</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { NIcon } from "naive-ui";
import { ImageOutline as ImageIcon } from "@vicons/ionicons5";

// Props
const props = defineProps({
  photoUrl: {
    type: String,
    default: null,
  },
  photoAlt: {
    type: String,
    default: "Photo",
  },
  aspectRatio: {
    type: String,
    default: "1/1",
  },
  frameColor: {
    type: String,
    default: "#ffffff",
  },
  margin: {
    type: Number,
    default: 12,
  },
  maxWidth: {
    type: String,
    default: "90%",
  },
  maxHeight: {
    type: String,
    default: "90%",
  },
});

// Emits
const emit = defineEmits(["image-load", "image-error"]);

// Reactive window size for responsive calculations
const windowSize = ref({
  width: window.innerWidth,
  height: window.innerHeight,
});

const updateWindowSize = () => {
  windowSize.value = { width: window.innerWidth, height: window.innerHeight };
};

// Calculate optimal frame size based on container and aspect ratio
const calculateFrameSize = () => {
  const [widthRatio, heightRatio] = props.aspectRatio.split("/").map(Number);
  const aspectRatioValue = widthRatio / heightRatio;

  // Check if we're in mobile view
  const isMobile = windowSize.value.width <= 768;

  // More generous container dimensions to better utilize available space
  // Account for padding, margins, and other UI elements
  // Use smaller dimensions for mobile
  const availableWidth = isMobile
    ? Math.min(windowSize.value.width * 0.7, 320) // Even smaller for mobile
    : Math.min(windowSize.value.width * 0.8, 600);
  const availableHeight = isMobile
    ? Math.min(windowSize.value.height * 0.3, 250) // Smaller height for mobile
    : Math.min(windowSize.value.height * 0.7, 500);

  let frameWidth, frameHeight;

  // Calculate size that fits within both constraints with some margin
  const widthBasedHeight = availableWidth / aspectRatioValue;
  const heightBasedWidth = availableHeight * aspectRatioValue;

  if (widthBasedHeight <= availableHeight) {
    // Width constraint is more restrictive
    frameWidth = availableWidth;
    frameHeight = widthBasedHeight;
  } else {
    // Height constraint is more restrictive
    frameWidth = heightBasedWidth;
    frameHeight = availableHeight;
  }

  // Ensure minimum viable size
  const minSize = isMobile ? 120 : 150; // Smaller minimum size for mobile
  if (frameWidth < minSize || frameHeight < minSize) {
    if (aspectRatioValue > 1) {
      frameWidth = minSize * aspectRatioValue;
      frameHeight = minSize;
    } else {
      frameWidth = minSize;
      frameHeight = minSize / aspectRatioValue;
    }
  }

  return {
    width: `${Math.round(frameWidth)}px`,
    height: `${Math.round(frameHeight)}px`,
  };
};

// Computed styles
const frameContainerStyle = computed(() => {
  // Trigger recalculation when window size changes
  const _ = windowSize.value;
  const size = calculateFrameSize();

  return {
    backgroundColor: props.frameColor,
    padding: `${props.margin}px`,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    borderRadius: "4px",
    width: size.width,
    height: size.height,
  };
});

// Methods
const onImageLoad = (event) => {
  emit("image-load", event);
};

const onImageError = (event) => {
  emit("image-error", event);
};

// Lifecycle
onMounted(() => {
  window.addEventListener("resize", updateWindowSize);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWindowSize);
});
</script>

<style scoped>
.frame-visualizer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 400px; /* Ensure minimum height for proper display */
  padding: var(--spacing-md);
  box-sizing: border-box;
  overflow: hidden; /* Prevent content overflow */
}

.visualizer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  /* Add some padding to ensure frame doesn't touch edges */
  padding: 12px;
  box-sizing: border-box;
}

.frame-container {
  /* Dynamic styling applied via computed style */
  transition: all 0.3s ease;
  position: relative;

  /* Ensure the frame is properly sized and centered */
  flex-shrink: 0;

  /* Better centering */
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Prevent the frame from being larger than its container */
  max-width: calc(100% - 24px);
  max-height: calc(100% - 24px);
}

/* Container query would be ideal here, but using aspect-ratio calculations instead */
.photo-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius-sm);
  background-color: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-image {
  width: 100%;
  height: 100%;
  /* Use contain to fit the photo within the frame without cropping */
  object-fit: contain;
  display: block;
  transition: transform 0.3s ease;
  background-color: var(--bg-tertiary);
}

/* Hover effect for better UX */
.frame-container:hover .photo-image {
  transform: scale(1.02);
}

.no-photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--text-tertiary);
  height: 100%;
  min-height: 200px;
}

.no-photo-placeholder p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

/* Responsive behavior */
@media (max-width: 768px) {
  .frame-visualizer {
    padding: var(--spacing-sm);
    min-height: 200px; /* Smaller min height for mobile */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .visualizer-container {
    padding: 6px; /* Less padding for mobile */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-container {
    /* Ensure frame doesn't get too large on mobile */
    max-width: calc(100% - 12px) !important;
    max-height: calc(100% - 12px) !important;
    /* Better centering for mobile */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .no-photo-placeholder {
    min-height: 100px;
  }
}

@media (max-width: 600px) {
  .frame-visualizer {
    padding: var(--spacing-xs);
    min-height: 180px; /* Even smaller for small screens */
  }

  .visualizer-container {
    padding: 4px;
  }

  .no-photo-placeholder {
    min-height: 80px;
  }

  .frame-container {
    max-width: calc(100% - 8px) !important;
    max-height: calc(100% - 8px) !important;
  }
}

@media (max-height: 500px) {
  .frame-visualizer {
    min-height: 200px;
  }
}
</style>
