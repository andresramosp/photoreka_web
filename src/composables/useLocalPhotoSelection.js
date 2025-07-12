// composables/useLocalPhotoSelection.js
import { ref, computed } from "vue";

export function useLocalPhotoSelection() {
  const selectedPhotosRecord = ref({});

  const selectedPhotoIds = computed(() =>
    Object.keys(selectedPhotosRecord.value)
      .filter((photoId) => !!selectedPhotosRecord.value[photoId])
      .map(Number)
  );

  const togglePhotoSelection = (photoId) => {
    selectedPhotosRecord.value[photoId] = !selectedPhotosRecord.value[photoId];
  };

  const selectAllPhotos = (photoIds) => {
    photoIds.forEach((photoId) => {
      selectedPhotosRecord.value[photoId] = true;
    });
  };

  const deselectAllPhotos = (photoIds) => {
    photoIds.forEach((photoId) => {
      selectedPhotosRecord.value[photoId] = false;
    });
  };

  const clearAllSelections = () => {
    selectedPhotosRecord.value = {};
  };

  return {
    selectedPhotosRecord,
    selectedPhotoIds,
    togglePhotoSelection,
    selectAllPhotos,
    deselectAllPhotos,
    clearAllSelections,
  };
}
