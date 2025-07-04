<template>
  <div
    class="photo-card"
    :class="{
      selected: isSelected,
      'curation-mode': mode === 'curation',
      'selection-mode': mode === 'selection',
    }"
    @click="toggleSelection"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="photo-container">
      <img
        :src="photo.thumbnailUrl || photo.url"
        :alt="photo.title"
        class="photo-image"
        @load="onImageLoad"
        @error="onImageError"
      />

      <!-- AI Reasoning Tooltip (for curation mode) -->
      <div
        v-if="mode === 'curation' && showTooltip"
        class="ai-reasoning-tooltip"
      >
        <p class="reasoning-text">
          {{
            photo.reasoning ||
            "This photo demonstrates excellent composition with balanced lighting and compelling subject matter that would work well for the intended purpose."
          }}
        </p>
      </div>

      <!-- Bottom overlay with matched tags or curation actions -->
      <div class="bottom-overlay">
        <!-- Matched tags for default mode -->
        <div
          v-if="
            mode === 'default' &&
            uniqueMatchingTags &&
            uniqueMatchingTags.length > 0
          "
          class="matched-tags"
        >
          <span
            v-for="tag in uniqueMatchingTags.slice(0, 3)"
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
          <!-- <span v-if="uniqueMatchingTags.length > 3" class="tag-more">
            +{{ uniqueMatchingTags.length - 3 }}
          </span> -->
        </div>

        <!-- Curation actions for curation mode -->
        <div v-if="mode === 'curation'" class="curation-actions">
          <n-button
            size="small"
            type="primary"
            @click.stop="moveToSelection"
            class="move-button"
          >
            <template #icon>
              <n-icon>
                <ChevronRightIcon />
              </n-icon>
            </template>
            Curate
          </n-button>
        </div>

        <!-- Selection actions for selection mode -->
        <div v-if="mode === 'selection'" class="selection-actions">
          <n-button
            size="small"
            type="warning"
            @click.stop="moveToCuration"
            class="move-button"
          >
            <template #icon>
              <n-icon>
                <ChevronLeftIcon />
              </n-icon>
            </template>
            Return
          </n-button>
        </div>
      </div>

      <!-- Selection indicator -->
      <div v-if="isSelected" class="selection-indicator">
        <n-icon size="20" color="#ffffff">
          <CheckCircleIcon />
        </n-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { NIcon } from "naive-ui";

// Import @vicons icons from ionicons5 for reliability
import {
  ChevronForwardOutline as ChevronRightIcon,
  ChevronBackOutline as ChevronLeftIcon,
  CheckmarkCircleOutline as CheckCircleIcon,
} from "@vicons/ionicons5";

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  rating: number;
  reasoning?: string;
  matchingTags?: string[];
  width?: number;
  height?: number;
  isUploading: boolean;
  file: any;
  needProcess: boolean;
  isDuplicate: boolean;
}

interface Props {
  photo: Photo;
  selected?: boolean;
  mode?: "default" | "curation" | "selection"; // Different modes for different contexts
}

interface Emits {
  (e: "select", photoId: string): void;
  (e: "info", photo: Photo): void;
  (e: "move-to-selection", photoId: string): void; // For curation mode
  (e: "move-to-curation", photoId: string): void; // For selection mode
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  mode: "default",
});

const emit = defineEmits<Emits>();

const isSelected = ref(props.selected);
const imageLoaded = ref(false);
const imageError = ref(false);
const showTooltip = ref(false);

const uniqueMatchingTags = computed(() =>
  Array.from(new Set(props.photo.matchingTags))
);

const toggleSelection = () => {
  isSelected.value = !isSelected.value;
  emit("select", props.photo.id);
};

const showInfo = () => {
  emit("info", props.photo);
};

const onImageLoad = () => {
  imageLoaded.value = true;
};

const onImageError = () => {
  imageError.value = true;
};

const moveToSelection = () => {
  emit("move-to-selection", props.photo.id);
};

const moveToCuration = () => {
  emit("move-to-curation", props.photo.id);
};

const handleMouseEnter = () => {
  if (props.mode === "curation") {
    showTooltip.value = true;
  }
};

const handleMouseLeave = () => {
  showTooltip.value = false;
};
</script>

<style scoped>
@import "@/assets/global.scss";

.photo-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  background-color: #2c2c32;
}

/* .photo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
} */

.photo-card.selected {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 1px #8b5cf640, 0 8px 24px rgba(139, 92, 246, 0.2);
}

.photo-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--bg-surface);
}

/* .photo-card:hover .photo-image {
  transform: scale(1.03);
} */

.bottom-overlay {
  position: absolute;
  bottom: 8px;
  left: 5px;
  right: 5px;
  z-index: 2;
}

/* AI Reasoning Tooltip */
.ai-reasoning-tooltip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: transparent;
  color: white;
  padding: 16px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
  z-index: 5;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  width: 87%;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.5);
}

.reasoning-text {
  margin: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Curation Actions */
.curation-actions,
.selection-actions {
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.photo-card.curation-mode:hover .curation-actions,
.photo-card.selection-mode:hover .selection-actions {
  opacity: 1;
}

.move-button {
  font-size: 11px;
  height: 28px;
  padding: 0 12px;
  backdrop-filter: blur(4px);
}

/* Mode-specific styling */
.photo-card.curation-mode {
  border-color: rgba(37, 99, 235, 0.3);
}

.photo-card.curation-mode:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.photo-card.selection-mode {
  border-color: rgba(34, 197, 94, 0.3);
}

.photo-card.selection-mode:hover {
  border-color: var(--success-color);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.matched-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  background-color: color-mix(in srgb, var(--secondary-color), transparent 50%);
  color: #ffffff;
  font-size: 10px;
  /* font-weight: 500; */
  opacity: 0.9;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: lowercase;
}

.tag-more {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 8px;
}

.selection-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(139, 92, 246, 0.9);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
}

/* Loading states */
.photo-card.loading .photo-image {
  background: linear-gradient(90deg, #18181c 25%, #2c2c32 50%, #18181c 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .photo-card {
    border-radius: 8px;
  }

  .tag {
    font-size: 9px;
    padding: 1px 4px;
  }

  .tag-more {
    font-size: 9px;
    padding: 1px 4px;
  }

  .ai-comment-tooltip {
    font-size: 11px;
    padding: 8px;
  }

  .move-button {
    font-size: 10px;
    height: 24px;
    padding: 0 8px;
  }
}

.photo-card.duplicate {
  border-color: #f59e0b;
}
</style>
