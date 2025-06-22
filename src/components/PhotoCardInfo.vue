<template>
  <div
    class="photo-card-info"
    :class="{ selected: isSelected, duplicate: photo.isDuplicate }"
    @click="toggleSelection"
  >
    <div class="photo-container">
      <img
        :src="photo.url"
        :alt="photo.name"
        class="photo-image photo-image-base"
        @load="onImageLoad"
        @error="onImageError"
      />

      <!-- Info Button (center overlay) -->
      <div class="info-overlay">
        <n-button
          circle
          size="medium"
          class="info-button info-button-base"
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

      <!-- Duplicate indicator -->
      <div v-if="photo.isDuplicate" class="duplicate-indicator">
        <n-icon size="16" color="#f59e0b">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1zm1 11h-2v-6h2v6z"
            />
          </svg>
        </n-icon>
      </div>

      <!-- Processing overlay -->
      <div v-if="photo.status === 'processing'" class="processing-overlay">
        <n-spin size="medium" />
      </div>

      <!-- Selection indicator -->
      <div
        v-if="isSelected"
        class="selection-indicator selection-indicator-base"
      >
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

    <!-- Footer with detailed information -->
    <div class="photo-footer photo-footer-base">
      <div class="photo-title photo-title-base" :title="photo.name">
        {{ photo.name }}
      </div>

      <div class="photo-details photo-details-base">
        <span class="photo-size">{{ formatFileSize(photo.size) }}</span>
        <span class="photo-date">{{
          formatDate(photo.uploadDate || photo.date)
        }}</span>
      </div>

      <div class="photo-status photo-status-base">
        <!-- Status tags -->
        <n-tag
          v-if="photo.isDuplicate"
          size="small"
          type="warning"
          class="status-tag"
        >
          Duplicate
        </n-tag>
        <n-tag
          v-else-if="photo.status === 'uploaded'"
          size="small"
          type="success"
          class="status-tag"
        >
          Uploaded
        </n-tag>
        <n-tag
          v-else-if="photo.status === 'processing'"
          size="small"
          type="info"
          class="status-tag"
        >
          Processing
        </n-tag>
        <n-tag
          v-else-if="photo.status === 'analyzed'"
          size="small"
          type="success"
          class="status-tag"
        >
          Analyzed
        </n-tag>

        <!-- Additional info -->
        <div class="additional-info">
          <span v-if="photo.aiTags" class="ai-tags"
            >{{ photo.aiTags }} AI tags</span
          >
          <span v-if="photo.faces" class="faces-count"
            >{{ photo.faces }} faces</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface PhotoInfo {
  id: string;
  name: string;
  size: number | string;
  url: string;
  uploadDate?: Date;
  date?: string;
  isDuplicate?: boolean;
  status?: "uploaded" | "processing" | "analyzed" | "error";
  aiTags?: number;
  faces?: number;
  width?: number;
  height?: number;
}

interface Props {
  photo: PhotoInfo;
  selected?: boolean;
}

interface Emits {
  (e: "select", photoId: string): void;
  (e: "info", photo: PhotoInfo): void;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
});

const emit = defineEmits<Emits>();

const isSelected = ref(props.selected);
const imageLoaded = ref(false);
const imageError = ref(false);

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

const formatFileSize = (size: number | string): string => {
  if (typeof size === "string") return size;

  if (size === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "";

  if (typeof date === "string") return date;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<style scoped>
@import "@/assets/global.scss";

.photo-card-info {
  aspect-ratio: 3/4; /* Taller than square for more info space */
  display: flex;
  flex-direction: column;
}

.photo-container {
  flex: 1;
  min-height: 0; /* Allow shrinking */
}

.photo-image {
  /* Inherits from global styles */
}

/* Info overlay */
.info-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
}

.photo-card-info:hover .info-overlay {
  opacity: 1;
}

/* Duplicate indicator */
.duplicate-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(245, 158, 11, 0.9);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

/* Processing overlay */
.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

/* Duplicate border styling */
.photo-card-info.duplicate {
  border-color: #f59e0b;
}

/* Status tags */
.status-tag {
  flex-shrink: 0;
}

.additional-info {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #ffffff60;
}

.ai-tags,
.faces-count {
  background-color: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .photo-card-info {
    aspect-ratio: 1; /* Square on mobile for space efficiency */
  }

  .additional-info {
    font-size: 10px;
    gap: 4px;
  }

  .ai-tags,
  .faces-count {
    padding: 1px 4px;
  }
}
</style>
