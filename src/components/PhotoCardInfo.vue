<template>
  <div
    class="photo-card-info"
    :class="{ selected: isSelected, duplicate: photo.isDuplicate }"
    @click="toggleSelection"
  >
    <div class="photo-container">
      <!-- Show skeleton while uploading -->
      <div v-if="photo.status === 'processing'" class="photo-skeleton">
        <n-skeleton height="100%" />
      </div>

      <!-- Show actual image when uploaded -->
      <img
        v-else
        :src="photo.url"
        :alt="photo.name"
        class="photo-image"
        @load="onImageLoad"
        @error="onImageError"
      />

      <!-- Info Button (center overlay) - only show when not uploading -->
      <div v-if="photo.status !== 'processing'" class="info-overlay">
        <n-button
          circle
          size="medium"
          class="info-button"
          @click.stop="showInfo"
        >
          <template #icon>
            <n-icon>
              <InfoIcon />
            </n-icon>
          </template>
        </n-button>
      </div>

      <!-- Duplicate indicator -->
      <div v-if="photo.isDuplicate" class="duplicate-indicator">
        <n-icon size="16" color="#f59e0b">
          <WarningIcon />
        </n-icon>
      </div>

      <!-- Processing overlay -->
      <div v-if="photo.status === 'processing'" class="processing-overlay">
        <n-spin size="medium" />
      </div>

      <!-- Selection indicator -->
      <div v-if="isSelected" class="selection-indicator">
        <n-icon size="20" color="#ffffff">
          <CheckCircleIcon />
        </n-icon>
      </div>
    </div>

    <!-- Footer with detailed information -->
    <div class="photo-footer">
      <div class="photo-title" :title="photo.name">
        {{ photo.name }}
      </div>

      <div v-if="photo.status === 'processing'" class="photo-details">
        <n-skeleton text :repeat="1" width="60%" />
        <n-skeleton text :repeat="1" width="40%" />
      </div>
      <div v-else class="photo-details">
        <span class="photo-size">{{ formatFileSize(photo.size) }}</span>
        <span class="photo-date">{{
          formatDate(photo.uploadDate || photo.date)
        }}</span>
      </div>

      <div class="photo-status">
        <!-- Status tags -->
        <n-tag
          v-if="photo.status === 'processing'"
          size="small"
          type="info"
          class="status-tag"
        >
          Uploading
        </n-tag>
        <n-tag
          v-else-if="photo.isDuplicate"
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
          v-else-if="photo.status === 'analyzed'"
          size="small"
          type="success"
          class="status-tag"
        >
          Analyzed
        </n-tag>

        <!-- Additional info - only show when not uploading -->
        <div v-if="photo.status !== 'processing'" class="additional-info">
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
import { NIcon } from "naive-ui";

// Import @vicons icons from ionicons5 for reliability
import {
  InformationCircleOutline as InfoIcon,
  WarningOutline as WarningIcon,
  CheckmarkCircleOutline as CheckCircleIcon,
} from "@vicons/ionicons5";

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
  position: relative;
  width: 100%;
  aspect-ratio: 3/4; /* Taller than square for more info space */
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  background-color: #2c2c32;
  display: flex;
  flex-direction: column;
}

.photo-card-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.photo-card-info.selected {
  border-color: #8b5cf6;
  box-shadow:
    0 0 0 1px #8b5cf640,
    0 8px 24px rgba(139, 92, 246, 0.2);
}

.photo-container {
  position: relative;
  width: 100%;
  background-color: #2c2c32;
  flex: 1;
  min-height: 0; /* Allow shrinking */
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #2c2c32;
}

/* Note: Photo skeleton styles moved to global.scss */

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

/* Info button */
.info-button {
  background-color: rgba(0, 0, 0, 0.7) !important;
  border: none !important;
  backdrop-filter: blur(8px);
}

/* Selection indicator */
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

/* Photo footer */
.photo-footer {
  padding: 12px 16px;
  background-color: #1a1a1f;
  border-top: 1px solid #2c2c32;
}

.photo-title {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #ffffff73;
  margin: 4px 0;
}

.photo-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
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
