<template>
  <div class="base-image-section">
    <div class="base-image-header">
      <n-select
        v-model:value="toolbarState.expansion.type"
        size="small"
        :options="expansionTypeOptions"
        placeholder="Search type"
        label-field="label"
      />
    </div>
    <div class="base-image-container">
      <img
        :src="baseImage.thumbnailUrl"
        :alt="baseImage.title"
        class="photo-image"
      />
      <div class="base-image-overlay">
        <span class="base-image-label">Source photo</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NSelect } from "naive-ui";
import { nextTick, onMounted, ref, watch } from "vue";
import { useCanvasStore, expansionTypeOptions } from "@/stores/canvas.js";
import { useTagDisplay } from "@/composables/canvas/useTagsDisplay";
import { debounce } from "lodash";

const props = defineProps({
  baseImage: { type: Object, required: true },
  toolbarState: { type: Object, required: true },
});

const emit = defineEmits(["photos-generated", "loading"]);

const canvasStore = useCanvasStore();

const { filteredTags, selectedColor, hoverColor, defaultColor, pillHeight } =
  useTagDisplay(() => props.baseImage?.tags);

const tagsOverlay = ref(null);
const pageSize = 100;

const loadPhotosFromToolbar = async () => {
  if (!props.baseImage) return;
  emit("loading", true);
  const basePosition = { x: 0, y: 0 };

  const result = await canvasStore.addPhotosFromPhoto(
    [props.baseImage],
    props.toolbarState.expansion.type,
    100,
    basePosition,
    props.toolbarState.expansion.opposite,
    props.toolbarState.expansion.inverted
  );

  await nextTick();
  emit("loading", false);
  emit("photos-generated", result.slice(0, pageSize));
};

const loadPhotosFromSelections = debounce(async () => {
  if (!props.baseImage) return;

  const hasSelections =
    props.toolbarState.expansion.type === "tags" &&
    filteredTags.value.some((t) => t.tag.selected);

  if (!hasSelections) {
    emit("photos-generated", []);
    return;
  }

  emit("loading", true);
  const basePosition = { x: 0, y: 0 };

  const result = await canvasStore.addPhotosFromPhoto(
    [props.baseImage],
    props.toolbarState.expansion.type,
    100,
    basePosition,
    props.toolbarState.expansion.opposite,
    props.toolbarState.expansion.inverted
  );

  await nextTick();
  emit("loading", false);
  emit("photos-generated", result);
}, 2000);

const getBoxStyle = (detection) => {
  const s = scale.value;
  const x = detection.x1 * s;
  const y = detection.y1 * s;
  const width = (detection.x2 - detection.x1) * s;
  const height = (detection.y2 - detection.y1) * s;

  return {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    border: "1.5px solid white",
    backgroundColor: detection.selected
      ? "rgba(var(--v-theme-secondary), 0.4)"
      : "transparent",
    pointerEvents: "auto",
    zIndex: 3,
  };
};

// Watchers
watch(
  [filteredTags],
  () => {
    const criteria = props.toolbarState.expansion.type;
    if (
      (criteria === "tags" || criteria === "composition") &&
      !props.toolbarState.expansion.onCanvas
    ) {
      loadPhotosFromSelections();
    }
  },
  { deep: true }
);

watch(
  () => [props.baseImage, props.toolbarState.expansion.type],
  async ([photo, type]) => {
    resetAllTags();
    const isInteractive = ["tags", "composition"].includes(type);
    const skip = isInteractive && !props.toolbarState.expansion.onCanvas;
    if (!photo || skip) return;
    await loadPhotosFromToolbar();
  },
  { immediate: true }
);

watch(
  () => [
    props.toolbarState.expansion.opposite,
    props.toolbarState.expansion.inverted,
  ],
  async () => {
    const criteria = props.toolbarState.expansion.type;
    if (
      (criteria === "tags" || criteria === "composition") &&
      !props.toolbarState.expansion.onCanvas
    ) {
      loadPhotosFromSelections();
    } else {
      loadPhotosFromToolbar();
    }
  }
);

watch(
  () => props.toolbarState.expansion.type,
  (newCriteria) => {
    if (newCriteria === "tags" || newCriteria === "composition") {
      emit("photos-generated", []);
    }
  }
);

function resetAllTags() {
  filteredTags.value.forEach((tagPhoto) => {
    tagPhoto.tag.selected = false;
  });
}

onMounted(() => {
  resetAllTags();
});
</script>

<style scoped>
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

.base-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  padding-bottom: 3px;
  padding-left: 5px;
}

.base-image-label {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
</style>
