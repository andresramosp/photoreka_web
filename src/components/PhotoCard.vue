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
        :src="photo.url"
        :alt="photo.title"
        class="photo-image"
        @load="onImageLoad"
        @error="onImageError"
      />

      <!-- AI Comment Tooltip (for curation mode) -->
      <div
        v-if="mode === 'curation' && photo.aiComment && showTooltip"
        class="ai-comment-tooltip"
      >
        <p class="comment-text">{{ photo.aiComment }}</p>
      </div>

      <!-- Info Button (center overlay) -->
      <div class="info-overlay">
        <n-button
          circle
          size="medium"
          class="info-button"
          @click.stop="showInfo"
        >
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                />
              </svg>
            </n-icon>
          </template>
        </n-button>
      </div>

      <!-- Top overlay with stars and score -->
      <div class="top-overlay">
        <div class="stars">
          <n-icon
            v-for="star in 5"
            :key="star"
            size="14"
            :color="star <= photo.rating ? '#ffd700' : '#ffffff40'"
          >
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22L12 18.77L5.82 22L7 14.14L2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </n-icon>
        </div>
        <!-- Score display for curation mode -->
        <div
          v-if="mode === 'curation' && photo.score !== undefined"
          class="score-badge"
        >
          <span class="score-value">{{ photo.score }}</span>
        </div>
      </div>

      <!-- Bottom overlay with matched tags or curation actions -->
      <div class="bottom-overlay">
        <!-- Matched tags for default mode -->
        <div
          v-if="
            mode === 'default' &&
            photo.matchedTags &&
            photo.matchedTags.length > 0
          "
          class="matched-tags"
        >
          <span
            v-for="tag in photo.matchedTags.slice(0, 3)"
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
          <span v-if="photo.matchedTags.length > 3" class="tag-more">
            +{{ photo.matchedTags.length - 3 }}
          </span>
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
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6l-6 6l-1.41-1.41z"
                  />
                </svg>
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
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M15.41 16.59L10.83 12L15.41 7.41L14 6l-6 6l6 6l1.41-1.41z"
                  />
                </svg>
              </n-icon>
            </template>
            Return
          </n-button>
        </div>
      </div>

      <!-- Selection indicator -->
      <div v-if="isSelected" class="selection-indicator">
        <n-icon size="20" color="#ffffff">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        </n-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Photo {
  id: string;
  url: string;
  title: string;
  rating: number;
  score?: number; // AI curation score (0-100)
  aiComment?: string; // AI comment for curation
  matchedTags?: string[];
  width?: number;
  height?: number;
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
  if (props.mode === "curation" && props.photo.aiComment) {
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

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.photo-card.selected {
  border-color: #8b5cf6;
  box-shadow:
    0 0 0 1px #8b5cf640,
    0 8px 24px rgba(139, 92, 246, 0.2);
}

.photo-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #2c2c32;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #2c2c32;
}

.photo-card:hover .photo-image {
  transform: scale(1.05);
}

/* Overlays */
.info-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
}

.photo-card:hover .info-overlay {
  opacity: 1;
}

.photo-card.curation-mode .info-overlay,
.photo-card.selection-mode .info-overlay {
  opacity: 0;
}

.photo-card.curation-mode:hover .info-overlay,
.photo-card.selection-mode:hover .info-overlay {
  opacity: 0.7;
}

.info-button {
  background-color: rgba(0, 0, 0, 0.7) !important;
  border: none !important;
  backdrop-filter: blur(8px);
}

.top-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.stars {
  display: flex;
  gap: 2px;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.score-badge {
  background-color: rgba(37, 99, 235, 0.9);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.score-value {
  font-family: "SF Mono", "Monaco", "Consolas", monospace;
}

.bottom-overlay {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  z-index: 2;
}

/* AI Comment Tooltip */
.ai-comment-tooltip {
  position: absolute;
  bottom: 100%;
  left: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.4;
  backdrop-filter: blur(8px);
  z-index: 10;
  margin-bottom: 8px;
  animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.comment-text {
  margin: 0;
  font-style: italic;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  background-color: #22c55e;
  color: #ffffff;
  font-size: 10px;
  font-weight: 500;
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

  .stars {
    padding: 3px 6px;
  }

  .score-badge {
    padding: 1px 6px;
    font-size: 10px;
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
</style>
