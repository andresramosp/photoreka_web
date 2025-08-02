<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    title="Select Google Photos"
    :closable="true"
    :style="{ width: '90vw', maxWidth: '1200px', height: '80vh' }"
  >
    <div class="google-photos-selector">
      <!-- Header with controls -->
      <div class="selector-header">
        <div class="results-info">
          <span class="results-count">
            {{ googlePhotos.length }} photos available
          </span>
          <span v-if="selectedGooglePhotosCount > 0" class="selected-count">
            ({{ selectedGooglePhotosCount }} selected)
          </span>
        </div>
        <div class="header-controls">
          <n-button
            type="default"
            size="small"
            @click="
              isAllSelected
                ? deselectAllGooglePhotos()
                : selectAllGooglePhotos()
            "
          >
            {{ isAllSelected ? "Deselect All" : "Select All" }}
          </n-button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="isLoadingGooglePhotos" class="loading-state">
        <n-spin size="large">
          <div class="loading-text">Loading Google Photos...</div>
        </n-spin>
      </div>

      <!-- Photos grid -->
      <div v-else-if="googlePhotos.length > 0" class="photos-grid-container">
        <div class="photos-grid">
          <div
            v-for="photo in googlePhotos"
            :key="photo.id"
            class="photo-item"
            :class="{ selected: isGooglePhotoSelected(photo.id) }"
            @click="toggleGooglePhotoSelection(photo)"
          >
            <div class="photo-wrapper">
              <img
                :src="photo.thumbnailUrl || photo.url"
                :alt="photo.filename"
                class="photo-image"
                loading="lazy"
              />
              <div class="photo-overlay">
                <div class="photo-checkbox">
                  <n-checkbox
                    :checked="isGooglePhotoSelected(photo.id)"
                    @click.stop="toggleGooglePhotoSelection(photo)"
                    size="large"
                  />
                </div>
              </div>
            </div>
            <div class="photo-info">
              <span class="photo-name">{{ photo.filename || "Untitled" }}</span>
            </div>
          </div>
        </div>

        <!-- Info message since all photos are loaded at once with Picker API -->
        <div class="all-photos-loaded">
          <span>All selected photos are shown above</span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <n-icon size="48" color="#666">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13L13.5 11.5C12.1 10.1 9.9 10.1 8.5 11.5L3 17V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9ZM5 19L8.5 15.5C9.3 14.7 10.7 14.7 11.5 15.5L13 17L19 11V19H5Z"
              />
            </svg>
          </n-icon>
        </div>
        <h3 class="empty-title">No photos found</h3>
        <p class="empty-subtitle">
          We couldn't find any photos in your Google Photos library.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <n-button tertiary @click="closeGoogleSelector">Cancel</n-button>
        <n-button
          type="primary"
          :disabled="selectedGooglePhotosCount === 0"
          @click="confirmSelection"
        >
          Import {{ selectedGooglePhotosCount }} Photos
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import { computed, ref } from "vue";
import { NModal, NButton, NCheckbox, NIcon, NSpin } from "naive-ui";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  googlePhotos: {
    type: Array,
    default: () => [],
  },
  selectedGooglePhotos: {
    type: Array,
    default: () => [],
  },
  isLoadingGooglePhotos: {
    type: Boolean,
    default: false,
  },
  // hasMorePhotos prop no longer needed with Picker API
});

const emit = defineEmits([
  "update:show",
  "confirm-selection",
  "toggle-photo",
  "select-all",
  "deselect-all",
  "close",
  // "load-more" no longer needed
]);

const isLoadingMore = ref(false);

const selectedGooglePhotosCount = computed(
  () => props.selectedGooglePhotos.length
);

const isAllSelected = computed(() => {
  return (
    props.googlePhotos.length > 0 &&
    props.selectedGooglePhotos.length === props.googlePhotos.length
  );
});

function isGooglePhotoSelected(photoId) {
  return props.selectedGooglePhotos.some((p) => p.id === photoId);
}

function toggleGooglePhotoSelection(photo) {
  emit("toggle-photo", photo);
}

function selectAllGooglePhotos() {
  emit("select-all");
}

function deselectAllGooglePhotos() {
  emit("deselect-all");
}

function closeGoogleSelector() {
  emit("close");
}

function confirmSelection() {
  emit("confirm-selection");
}
</script>

<style scoped>
.google-photos-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 60vh;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #2c2c32;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-count {
  font-size: 16px;
  font-weight: 500;
  color: #ffffffd1;
}

.selected-count {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 500;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
}

.loading-text {
  color: #ffffff73;
  font-size: 16px;
}

.photos-grid-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  overflow-y: auto;
  flex: 1;
  padding-right: 8px;
}

.load-more-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  border-top: 1px solid #2c2c32;
  margin-top: 16px;
}

.no-more-photos {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  border-top: 1px solid #2c2c32;
  margin-top: 16px;
}

.no-more-photos span {
  color: #ffffff73;
  font-size: 14px;
}

.all-photos-loaded {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  border-top: 1px solid #2c2c32;
  margin-top: 16px;
}

.all-photos-loaded span {
  color: #ffffff73;
  font-size: 14px;
}

.photo-item {
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.photo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.photo-item.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.photo-wrapper {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  background-color: #1a1a1f;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.2s ease;
}

.photo-item:hover .photo-image {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 8px;
  opacity: 0;
  transition: all 0.2s ease;
}

.photo-item:hover .photo-overlay,
.photo-item.selected .photo-overlay {
  opacity: 1;
}

.photo-checkbox {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.photo-info {
  padding: 8px 4px 4px 4px;
}

.photo-name {
  font-size: 12px;
  color: #ffffff73;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  gap: 16px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0;
}

.empty-subtitle {
  font-size: 14px;
  color: #ffffff73;
  margin: 0;
  max-width: 300px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #2c2c32;
}

/* Responsive */
@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .selector-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
