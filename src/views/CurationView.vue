<template>
  <div class="curation-container">
    <!-- Search Input Section -->
    <div class="search-section">
      <div class="search-input-row">
        <n-input
          v-model:value="searchQuery"
          type="textarea"
          placeholder="Describe the photos you want to curate... e.g., 'urban architecture with people' or 'nature landscapes at sunset'"
          :autosize="{ minRows: 1, maxRows: 2 }"
          class="search-input"
          @input="onSearchChange"
        />
        <div class="search-actions">
          <n-button
            type="primary"
            :loading="isSearching"
            :disabled="!hasSearchQuery"
            @click="performSearch"
            class="search-button"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                  />
                </svg>
              </n-icon>
            </template>
            Search Photos
          </n-button>
          <n-button
            secondary
            @click="clearSearch"
            :disabled="!hasSearchQuery && candidatePhotos.length === 0"
            class="clear-button"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
                  />
                </svg>
              </n-icon>
            </template>
            Clear
          </n-button>
        </div>
      </div>
    </div>

    <!-- Main Curation Area -->
    <div
      class="curation-main"
      v-if="candidatePhotos.length > 0 || curatedPhotos.length > 0"
    >
      <!-- Left Side: Curation Area -->
      <div class="curation-area">
        <div class="area-header">
          <h3 class="area-title">Curation Area</h3>
          <div class="area-stats">
            <span class="stats-text">{{ candidatePhotos.length }} photos</span>
          </div>
        </div>

        <div
          class="photos-grid"
          v-if="candidatePhotos.length > 0 || isSearching"
        >
          <!-- Show skeletons while searching -->
          <template v-if="isSearching">
            <div v-for="n in 6" :key="`skeleton-${n}`" class="photo-skeleton">
              <n-skeleton height="100%" />
            </div>
          </template>
          <!-- Show actual photos -->
          <PhotoCard
            v-for="photo in candidatePhotos"
            :key="photo.id"
            :photo="photo"
            :mode="'curation'"
            :selected="false"
            @select="togglePhotoSelection"
            @info="showPhotoInfo"
            @move-to-selection="moveToSelection"
          />
        </div>

        <div class="empty-area" v-else>
          <n-icon size="48" color="#6b7280">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
              />
            </svg>
          </n-icon>
          <p class="empty-text">No photos to review</p>
        </div>

        <div class="area-actions" v-if="candidatePhotos.length > 0">
          <n-button
            :loading="isLoadingMore"
            @click="searchMorePhotos"
            class="search-more-button"
            size="large"
            :disabled="!hasMoreResults"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                  />
                </svg>
              </n-icon>
            </template>
            Search More
          </n-button>
        </div>
      </div>

      <!-- Right Side: Selection Area -->
      <div class="selection-area">
        <div class="area-header">
          <h3 class="area-title">Selection Area</h3>
          <div class="area-stats">
            <span class="stats-text">{{ curatedPhotos.length }} curated</span>
            <n-button
              v-if="curatedPhotos.length > 0"
              size="small"
              @click="clearSelection"
              class="clear-selection-button"
            >
              Clear All
            </n-button>
          </div>
        </div>

        <div class="photos-grid" v-if="curatedPhotos.length > 0">
          <PhotoCard
            v-for="photo in curatedPhotos"
            :key="photo.id"
            :photo="photo"
            :mode="'selection'"
            :selected="false"
            @select="togglePhotoSelection"
            @info="showPhotoInfo"
            @move-to-curation="moveToCuration"
          />
        </div>

        <div class="empty-area" v-else>
          <n-icon size="48" color="#6b7280">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
              />
            </svg>
          </n-icon>
          <p class="empty-text">Curated photos will appear here</p>
          <p class="empty-subtitle">
            Move photos from the left to start curating
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <n-icon size="64" color="#6b7280" class="empty-icon">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14S14 11.99 14 9.5S11.99 5 9.5 5Z"
            />
          </svg>
        </n-icon>
        <h2 class="empty-title">Start Curating Photos</h2>
        <p class="empty-description">
          Enter a search topic above to find photos for curation
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import PhotoCard from "../components/PhotoCard.vue";

// Photo interface with curation-specific properties
interface CurationPhoto {
  id: string;
  url: string;
  title: string;
  rating: number;
  score: number; // AI-generated curation score 0-100
  aiComment: string; // AI-generated comment for curation
  matchedTags?: string[];
  width?: number;
  height?: number;
}

// State
const searchQuery = ref("");
const isSearching = ref(false);
const isLoadingMore = ref(false);
const hasMoreResults = ref(true);
const candidatePhotos = ref<CurationPhoto[]>([]);
const curatedPhotos = ref<CurationPhoto[]>([]);

// Computed properties
const hasSearchQuery = computed(() => searchQuery.value.trim().length > 0);

// Mock photo data with curation metadata
const generateMockPhotos = (count: number = 6): CurationPhoto[] => {
  const basePhotos = [
    {
      url: "https://images.pexels.com/photos/32669076/pexels-photo-32669076.jpeg",
      title: "Iceland Mountains",
      tags: ["landscape", "mountains", "nature", "ice", "dramatic"],
    },
    {
      url: "https://images.pexels.com/photos/32657569/pexels-photo-32657569.jpeg",
      title: "Sisters in Dresses",
      tags: ["portrait", "people", "family", "fashion", "outdoor"],
    },
    {
      url: "https://images.pexels.com/photos/32666826/pexels-photo-32666826.jpeg",
      title: "Carballino España",
      tags: ["street", "urban", "architecture", "people", "culture"],
    },
    {
      url: "https://images.pexels.com/photos/3117550/pexels-photo-3117550.jpeg",
      title: "Vintage Flowers",
      tags: ["flowers", "vintage", "art", "botanical", "still-life"],
    },
    {
      url: "https://images.pexels.com/photos/32675858/pexels-photo-32675858.jpeg",
      title: "Beach Sunset",
      tags: ["sunset", "beach", "ocean", "golden-hour", "serene"],
    },
    {
      url: "https://images.pexels.com/photos/32617822/pexels-photo-32617822.jpeg",
      title: "City River View",
      tags: ["city", "river", "sunset", "urban", "reflection"],
    },
    {
      url: "https://images.pexels.com/photos/983587/pexels-photo-983587.jpeg",
      title: "Italian Pasta",
      tags: ["food", "pasta", "wine", "italian", "dining"],
    },
    {
      url: "https://images.pexels.com/photos/32642185/pexels-photo-32642185.jpeg",
      title: "Scorpion Detail",
      tags: ["wildlife", "macro", "animal", "detail", "nature"],
    },
    {
      url: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg",
      title: "Forest Path",
      tags: ["forest", "path", "nature", "trees", "peaceful"],
    },
    {
      url: "https://images.pexels.com/photos/1020315/pexels-photo-1020315.jpeg",
      title: "City Skyline",
      tags: ["city", "skyline", "buildings", "urban", "night"],
    },
    {
      url: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg",
      title: "Coffee and Book",
      tags: ["coffee", "book", "cozy", "lifestyle", "indoor"],
    },
    {
      url: "https://images.pexels.com/photos/1172675/pexels-photo-1172675.jpeg",
      title: "Concert Crowd",
      tags: ["concert", "crowd", "music", "event", "energy"],
    },
  ];

  const aiComments = [
    "Strong composition with excellent use of leading lines and natural lighting",
    "Compelling subject matter with authentic emotion and perfect timing",
    "Outstanding color palette that creates a cohesive visual narrative",
    "Exceptional technical quality with sharp focus and balanced exposure",
    "Unique perspective that offers fresh insight into familiar subject matter",
    "Masterful use of depth of field to guide viewer attention",
    "Perfect capturing of decisive moment with natural spontaneity",
    "Excellent storytelling potential with rich contextual details",
    "Strong visual impact through effective use of contrast and texture",
    "Authentic atmosphere that effectively conveys mood and emotion",
    "Professional composition following rule of thirds with balanced elements",
    "Captivating scene with natural drama and compelling visual flow",
  ];

  return Array.from({ length: count }, (_, index) => {
    const basePhoto = basePhotos[index % basePhotos.length];
    const score = Math.floor(Math.random() * 40) + 60; // Score between 60-100
    const rating = Math.floor(Math.random() * 3) + 3; // Rating between 3-5

    return {
      id: `photo-${Date.now()}-${index}`,
      url: basePhoto.url,
      title: basePhoto.title,
      rating,
      score,
      aiComment: aiComments[index % aiComments.length],
      matchedTags: basePhoto.tags,
      width: 2000 + Math.floor(Math.random() * 2000),
      height: 1500 + Math.floor(Math.random() * 1500),
    };
  });
};

// Methods
const onSearchChange = () => {
  console.log("Search query changed:", searchQuery.value);
};

const performSearch = async () => {
  if (!hasSearchQuery.value) return;

  isSearching.value = true;
  candidatePhotos.value = [];
  hasMoreResults.value = true;

  console.log("Performing curation search:", searchQuery.value);

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Generate initial batch of photos
  candidatePhotos.value = generateMockPhotos(6);
  hasMoreResults.value = true;

  isSearching.value = false;
};

const searchMorePhotos = async () => {
  if (isLoadingMore.value || !hasMoreResults.value) return;

  isLoadingMore.value = true;

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Add 6 more photos at the beginning
  const morePhotos = generateMockPhotos(6);
  candidatePhotos.value.unshift(...morePhotos);

  // Simulate end of results after 3 loads
  if (candidatePhotos.value.length >= 18) {
    hasMoreResults.value = false;
  }

  isLoadingMore.value = false;
};

const clearSearch = () => {
  searchQuery.value = "";
  candidatePhotos.value = [];
  curatedPhotos.value = [];
  hasMoreResults.value = true;
};

const clearSelection = () => {
  // Move all curated photos back to candidates
  candidatePhotos.value.unshift(...curatedPhotos.value);
  curatedPhotos.value = [];
};

const moveToSelection = (photoId: string) => {
  const photoIndex = candidatePhotos.value.findIndex((p) => p.id === photoId);
  if (photoIndex === -1) return;

  const photo = candidatePhotos.value[photoIndex];
  candidatePhotos.value.splice(photoIndex, 1);

  // Add to curated with animation class
  curatedPhotos.value.push({
    ...photo,
    // Mark for animation (could be used in PhotoCard)
  });
};

const moveToCuration = (photoId: string) => {
  const photoIndex = curatedPhotos.value.findIndex((p) => p.id === photoId);
  if (photoIndex === -1) return;

  const photo = curatedPhotos.value[photoIndex];
  curatedPhotos.value.splice(photoIndex, 1);
  candidatePhotos.value.unshift(photo);
};

const togglePhotoSelection = (photoId: string) => {
  console.log("Photo selection toggled:", photoId);
};

const showPhotoInfo = (photo: CurationPhoto) => {
  console.log("Show photo info:", photo);
};
</script>

<style scoped>
.curation-container {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-2xl);
  background-color: var(--bg-body);
  position: relative;
}

/* Search Section */
.search-section {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.search-input-row {
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;
}

.search-input {
  font-size: var(--font-size-md);
  flex: 1;
}

.search-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.search-button {
  min-width: 140px;
  height: 40px;
}

.clear-button {
  min-width: 80px;
  height: 40px;
}

/* Main Curation Area */
.curation-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  min-height: 0; /* Allow grid items to shrink */
}

.curation-area,
.selection-area {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-surface);
}

.area-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.area-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stats-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.clear-selection-button {
  font-size: var(--font-size-xs);
}

.photos-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  overflow-y: auto;
  align-content: start;
}

.empty-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl);
  text-align: center;
}

.empty-text {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: var(--spacing-md) 0 0 0;
}

.empty-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: var(--spacing-xs) 0 0 0;
}

.area-actions {
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-surface);
  display: flex;
  justify-content: center;
}

.search-more-button {
  min-width: 160px;
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6xl);
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  margin-bottom: var(--spacing-lg);
}

.empty-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.empty-description {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

/* Photo Skeleton */
.photo-skeleton {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--bg-surface);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .curation-main {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .curation-container {
    padding: var(--spacing-lg);
  }

  .search-section {
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }

  .search-input-row {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .search-actions {
    width: 100%;
  }

  .search-button {
    flex: 1;
  }

  .area-header {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    padding: var(--spacing-md);
  }

  .area-actions {
    padding: var(--spacing-md) var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .curation-container {
    padding: var(--spacing-md);
  }

  .search-section {
    padding: var(--spacing-md);
  }

  .area-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .area-stats {
    justify-content: space-between;
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
  }

  .empty-area {
    padding: var(--spacing-2xl);
  }

  .loading-content {
    padding: var(--spacing-2xl);
    margin: var(--spacing-md);
  }
}
</style>
