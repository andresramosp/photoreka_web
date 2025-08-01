<template>
  <div class="related-photos-toolbar" :class="{ 'toolbar-visible': isVisible }">
    <div class="toolbar-content">
      <!-- Base Image Section (Fixed Left) -->
      <PhotoBase
        :baseImage="props.baseImage"
        :toolbar-state="toolbarState"
        @photos-generated="handleGeneratedPhotos"
        @loading="handleLoadingState"
      />

      <!-- Related Photos Section (Scrollable Right) -->
      <div class="related-photos-section">
        <div class="related-photos-header">
          <span class="section-title">Related Photos</span>
        </div>

        <div
          class="related-photos-scroll scrollbar-minimal"
          @wheel="handleHorizontalScroll"
          ref="scrollContainer"
        >
          <div class="related-photos-grid">
            <!-- Show skeletons when loading -->
            <template v-if="props.isLoading">
              <div
                v-for="n in 10"
                :key="`skeleton-${n}`"
                class="related-photo-skeleton"
              >
                <n-skeleton height="100%" />
              </div>
            </template>
            <!-- Show actual photos when loaded -->
            <template v-else>
              <PhotoCard
                v-for="photo in relatedPhotos"
                :key="photo.id"
                :photo="photo"
                :selected="selectedPhotos.includes(photo.id)"
                @select="togglePhotoSelection"
                @info="onPhotoInfo"
                draggable="true"
                @dragstart="(e: any) => onDragStart(e, photo)"
                style="cursor: grab"
              />
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Close Button -->
    <button class="toolbar-close" @click="closeToolbar">
      <n-icon size="16">
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
          />
        </svg>
      </n-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { NIcon, NSkeleton } from "naive-ui";
import PhotoBase from "./PhotoBase.vue";
import PhotoCard, { type Photo } from "../photoCards/PhotoCard.vue";

interface Props {
  isVisible: boolean;
  baseImage?: Photo;
  toolbarState: Object;
  isLoading?: boolean;
}

interface Emits {
  (e: "close"): void;
  (e: "photos-selected", photoIds: string[]): void;
  (e: "search-type-changed", searchType: string): void;
  (e: "loading", isLoading: boolean): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const relatedPhotos = ref<Photo[]>([]);
const scrollContainer = ref<HTMLElement>();
const selectedPhotos = ref<string[]>([]);

function handleGeneratedPhotos(photos: any) {
  relatedPhotos.value = photos;
  selectedPhotos.value = [];

  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollLeft = 0;
    }
  });
}

const togglePhotoSelection = (photoId: string) => {
  const index = selectedPhotos.value.indexOf(photoId);
  if (index > -1) {
    selectedPhotos.value.splice(index, 1);
  } else {
    selectedPhotos.value.push(photoId);
  }
  emit("photos-selected", selectedPhotos.value);
};

const onPhotoInfo = (photo: Photo) => {
  console.log("Photo info requested:", photo);
};

const closeToolbar = () => {
  emit("close");
};

const handleHorizontalScroll = (e: WheelEvent) => {
  if (!scrollContainer.value) return;

  e.preventDefault();
  scrollContainer.value.scrollLeft += e.deltaY;
};

const handleLoadingState = (isLoading: boolean) => {
  emit("loading", isLoading);
};

function removePhotoFromList(photoId: string) {
  selectedPhotos.value = selectedPhotos.value.filter((id) => id != photoId);
  relatedPhotos.value = relatedPhotos.value.filter((p) => p.id !== photoId);
}

defineExpose({ removePhotoFromList });

function onDragStart(ev: any, photo: Photo) {
  const photosToDrag =
    selectedPhotos.value.length > 0
      ? relatedPhotos.value.filter((p) => selectedPhotos.value.includes(p.id))
      : [photo];

  const data = JSON.stringify(photosToDrag);
  ev.dataTransfer?.setData("application/json", data);
}
</script>

<style scoped>
.related-photos-toolbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 240px;
  background: linear-gradient(
    to top,
    var(--bg-container) 0%,
    var(--bg-container) 90%,
    transparent 100%
  );
  border-top: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
  z-index: 100;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
}

.related-photos-toolbar.toolbar-visible {
  transform: translateY(0);
}

.toolbar-content {
  display: flex;
  height: 100%;
  padding: var(--spacing-lg);
  gap: var(--spacing-lg);
}

.toolbar-close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-normal);
}

.toolbar-close:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.related-photos-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.related-photos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.section-title {
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
}

.related-photos-scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: var(--spacing-xs);
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
}

.related-photos-scroll::-webkit-scrollbar {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
}

.related-photos-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.related-photos-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.related-photos-grid {
  display: flex;
  gap: var(--spacing-md);
  height: 160px;
  padding-right: var(--spacing-lg);
}

.related-photos-grid .photo-card {
  flex-shrink: 0;
  width: 160px;
  height: 160px;
}

.related-photo-skeleton {
  flex-shrink: 0;
  width: 160px;
  height: 160px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--bg-surface);
}

@media (max-width: 768px) {
  .related-photos-toolbar {
    height: 200px;
  }

  .toolbar-content {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  .base-image-section {
    width: 120px;
  }

  .base-image-container {
    height: 120px;
  }

  .related-photos-grid {
    height: 120px;
  }

  .related-photos-grid .photo-card {
    width: 120px;
    height: 120px;
  }

  .related-photo-skeleton {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 480px) {
  .related-photos-toolbar {
    height: 180px;
  }

  .base-image-section {
    width: 100px;
  }

  .base-image-container {
    height: 100px;
  }

  .related-photos-grid {
    height: 100px;
  }

  .related-photos-grid .photo-card {
    width: 100px;
    height: 100px;
  }

  .related-photo-skeleton {
    width: 100px;
    height: 100px;
  }

  .related-photos-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}
</style>
