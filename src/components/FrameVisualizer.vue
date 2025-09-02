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
import { computed, ref, onMounted } from "vue";
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

// Calculate optimal frame size based on container and aspect ratio
const calculateFrameSize = () => {
  const [widthRatio, heightRatio] = props.aspectRatio.split("/").map(Number);
  const aspectRatioValue = widthRatio / heightRatio;

  // More generous container dimensions to better utilize available space
  // Account for padding, margins, and other UI elements
  const availableWidth = Math.min(window.innerWidth * 0.8, 600);
  const availableHeight = Math.min(window.innerHeight * 0.7, 500);

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
  const minSize = 150;
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

  /* Additional centering insurance */
  margin: auto;

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
    padding: var(--spacing-md);
    min-height: 300px;
  }

  .visualizer-container {
    padding: 10px;
  }

  .no-photo-placeholder {
    min-height: 120px;
  }
}

@media (max-width: 600px) {
  .frame-visualizer {
    padding: var(--spacing-sm);
    min-height: 250px;
  }

  .visualizer-container {
    padding: 8px;
  }

  .no-photo-placeholder {
    min-height: 100px;
  }
}

@media (max-height: 500px) {
  .frame-visualizer {
    min-height: 200px;
  }
}
</style>
