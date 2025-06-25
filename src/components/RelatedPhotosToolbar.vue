<template>
  <div class="related-photos-toolbar" :class="{ 'toolbar-visible': isVisible }">
    <div class="toolbar-content">
      <!-- Base Image Section (Fixed Left) -->
      <div class="base-image-section">
        <div class="base-image-header">
          <n-select
            v-model:value="selectedSearchType"
            size="small"
            :options="searchOptions"
            placeholder="Search type"
            @update:value="onSearchTypeChange"
          />
        </div>
        <div class="base-image-container">
          <img :src="baseImage.url" :alt="baseImage.title" class="base-image" />
          <div class="base-image-overlay">
            <span class="base-image-label">Base</span>
          </div>
        </div>
      </div>

      <!-- Related Photos Section (Scrollable Right) -->
      <div class="related-photos-section">
        <div class="related-photos-header">
          <span class="section-title">Related Photos</span>
          <!-- <span class="selection-count"
            >{{ selectedPhotos.length }} selected</span
          > -->
        </div>

        <div
          class="related-photos-scroll scrollbar-minimal"
          @wheel="handleHorizontalScroll"
          ref="scrollContainer"
        >
          <div class="related-photos-grid">
            <PhotoCard
              v-for="photo in relatedPhotos"
              :key="photo.id"
              :photo="photo"
              :selected="selectedPhotos.includes(photo.id)"
              @select="togglePhotoSelection"
              @info="onPhotoInfo"
            />
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
import { ref, onMounted } from "vue";
import { NSelect, NIcon } from "naive-ui";
import PhotoCard from "./PhotoCard.vue";

interface Photo {
  id: string;
  url: string;
  title: string;
  rating: number;
  matchedTags?: string[];
  width?: number;
  height?: number;
}

interface Props {
  isVisible: boolean;
  baseImage?: Photo;
}

interface Emits {
  (e: "close"): void;
  (e: "photos-selected", photoIds: string[]): void;
  (e: "search-type-changed", searchType: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  baseImage: () => ({
    id: "base-1",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    title: "Base Image",
    rating: 4,
  }),
});

const emit = defineEmits<Emits>();

const scrollContainer = ref<HTMLElement>();
const selectedPhotos = ref<string[]>([]);
const selectedSearchType = ref("similar");

const searchOptions = [
  { label: "Similar", value: "similar" },
  { label: "Same Subject", value: "subject" },
  { label: "Same Style", value: "style" },
  { label: "Same Colors", value: "colors" },
  { label: "Same Location", value: "location" },
  { label: "Same Person", value: "person" },
];

// Generate random related photos
const relatedPhotos = ref<Photo[]>([
  {
    id: "related-1",
    url: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=300&h=300&fit=crop",
    title: "Mountain Landscape",
    rating: 5,
    matchedTags: ["landscape", "mountains", "nature"],
  },
  {
    id: "related-2",
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&h=300&fit=crop",
    title: "Ocean View",
    rating: 4,
    matchedTags: ["ocean", "blue", "horizon"],
  },
  {
    id: "related-3",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=300&fit=crop",
    title: "Forest Path",
    rating: 4,
    matchedTags: ["forest", "trees", "path"],
  },
  {
    id: "related-4",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
    title: "Mountain Range",
    rating: 5,
    matchedTags: ["mountains", "peaks", "snow"],
  },
  {
    id: "related-5",
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&h=300&fit=crop",
    title: "Lake Reflection",
    rating: 4,
    matchedTags: ["lake", "reflection", "calm"],
  },
  {
    id: "related-6",
    url: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=300&h=300&fit=crop",
    title: "Desert Dunes",
    rating: 3,
    matchedTags: ["desert", "sand", "dunes"],
  },
  {
    id: "related-7",
    url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&h=300&fit=crop",
    title: "Waterfall",
    rating: 5,
    matchedTags: ["waterfall", "water", "rocks"],
  },
  {
    id: "related-8",
    url: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=300&h=300&fit=crop",
    title: "Canyon View",
    rating: 4,
    matchedTags: ["canyon", "rocks", "red"],
  },
  {
    id: "related-9",
    url: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=300&h=300&fit=crop",
    title: "Valley Vista",
    rating: 4,
    matchedTags: ["valley", "green", "hills"],
  },
  {
    id: "related-10",
    url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&h=300&fit=crop",
    title: "Sunrise Mountain",
    rating: 5,
    matchedTags: ["sunrise", "mountain", "golden"],
  },
  {
    id: "related-11",
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop",
    title: "Cliff Edge",
    rating: 4,
    matchedTags: ["cliff", "edge", "dramatic"],
  },
  {
    id: "related-12",
    url: "https://images.unsplash.com/photo-1502780402662-acc01917153e?w=300&h=300&fit=crop",
    title: "River Valley",
    rating: 4,
    matchedTags: ["river", "valley", "flowing"],
  },
  {
    id: "related-13",
    url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&h=300&fit=crop",
    title: "Alpine Lake",
    rating: 5,
    matchedTags: ["alpine", "lake", "clear"],
  },
  {
    id: "related-14",
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=300&fit=crop",
    title: "Rolling Hills",
    rating: 3,
    matchedTags: ["hills", "rolling", "grass"],
  },
  {
    id: "related-15",
    url: "https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=300&h=300&fit=crop",
    title: "Coastal Rocks",
    rating: 4,
    matchedTags: ["coast", "rocks", "waves"],
  },
  {
    id: "related-16",
    url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300&h=300&fit=crop",
    title: "Pine Forest",
    rating: 4,
    matchedTags: ["pine", "forest", "evergreen"],
  },
  {
    id: "related-17",
    url: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=300&h=300&fit=crop",
    title: "Sand Patterns",
    rating: 3,
    matchedTags: ["sand", "patterns", "texture"],
  },
  {
    id: "related-18",
    url: "https://images.unsplash.com/photo-1464822759844-d150ad6d1e77?w=300&h=300&fit=crop",
    title: "Snow Peak",
    rating: 5,
    matchedTags: ["snow", "peak", "white"],
  },
  {
    id: "related-19",
    url: "https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=300&h=300&fit=crop",
    title: "Storm Clouds",
    rating: 4,
    matchedTags: ["clouds", "storm", "dramatic"],
  },
  {
    id: "related-20",
    url: "https://images.unsplash.com/photo-1436891620584-47fd0e565afb?w=300&h=300&fit=crop",
    title: "Golden Hour",
    rating: 5,
    matchedTags: ["golden", "hour", "warm"],
  },
]);

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

const onSearchTypeChange = (value: string) => {
  emit("search-type-changed", value);
};

const closeToolbar = () => {
  emit("close");
};

const handleHorizontalScroll = (e: WheelEvent) => {
  if (!scrollContainer.value) return;

  e.preventDefault();
  scrollContainer.value.scrollLeft += e.deltaY;
};
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

/* Base Image Section */
.base-image-section {
  flex-shrink: 0;
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.base-image-header {
  width: 100%;
}

.base-image-container {
  position: relative;
  width: 100%;
  height: 160px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.base-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.base-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  padding: var(--spacing-sm);
}

.base-image-label {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Related Photos Section */
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

.selection-count {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  background: var(--bg-surface);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.related-photos-scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: var(--spacing-xs);
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

/* Responsive */
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

  .related-photos-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}
</style>
