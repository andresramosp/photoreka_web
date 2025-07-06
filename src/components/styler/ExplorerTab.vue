<template>
  <div class="explorer-tab">
    <div class="explorer-content">
      <div class="explorer-header">
        <h3 class="explorer-title">Style Explorer</h3>
        <p class="explorer-subtitle">
          Select aesthetic characteristics to find photos with those specific
          qualities
        </p>
      </div>

      <div class="pills-grid">
        <div
          v-for="aspect in aestheticAspects"
          :key="aspect.key"
          class="pill-item"
          :class="{ selected: selectedAspects.includes(aspect.key) }"
          @click="toggleAspect(aspect.key)"
        >
          <div class="pill-header">
            <span class="pill-label">{{ aspect.label }}</span>
            <div
              class="pill-indicator"
              v-if="selectedAspects.includes(aspect.key)"
            >
              <n-icon size="14">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  />
                </svg>
              </n-icon>
            </div>
          </div>
          <p class="pill-description">{{ aspect.description }}</p>
        </div>
      </div>

      <div class="explorer-info" v-if="selectedAspects.length > 0">
        <span class="selected-count"
          >{{ selectedAspects.length }} characteristic{{
            selectedAspects.length > 1 ? "s" : ""
          }}
          selected</span
        >
      </div>

      <div class="explorer-actions">
        <n-button
          type="primary"
          :disabled="selectedAspects.length === 0"
          @click="handleSearch"
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
          Explore Photos
        </n-button>

        <n-button
          secondary
          @click="handleClear"
          :disabled="selectedAspects.length === 0"
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
          Clear Selection
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["search", "clear"]);

// Same aesthetic aspects as RankingTab for consistency
const aestheticAspects = [
  {
    key: "reflections",
    label: "Reflections",
    description: "Mirror-like surfaces, water reflections, glass reflections",
  },
  {
    key: "lighting",
    label: "Lighting",
    description: "Dramatic lighting, golden hour, natural vs artificial light",
  },
  {
    key: "yuxtapositions",
    label: "Juxtapositions",
    description: "Contrasting elements, old vs new, nature vs urban",
  },
  {
    key: "symmetry",
    label: "Symmetry",
    description: "Balanced compositions, geometric patterns, mirror symmetry",
  },
  {
    key: "depth",
    label: "Depth of Field",
    description: "Bokeh effects, shallow focus, background blur",
  },
  {
    key: "colors",
    label: "Color Harmony",
    description:
      "Complementary colors, monochromatic schemes, vibrant palettes",
  },
  {
    key: "textures",
    label: "Textures",
    description: "Surface details, material contrasts, tactile qualities",
  },
  {
    key: "minimalism",
    label: "Minimalism",
    description: "Clean compositions, negative space, simple elements",
  },
  {
    key: "motion",
    label: "Motion",
    description: "Movement blur, dynamic poses, action capture",
  },
  {
    key: "atmosphere",
    label: "Atmosphere",
    description: "Mood, ambiance, emotional tone, weather effects",
  },
];

// Selected aesthetic aspects
const selectedAspects = ref([]);

// Toggle aspect selection
const toggleAspect = (aspectKey) => {
  const index = selectedAspects.value.indexOf(aspectKey);
  if (index > -1) {
    selectedAspects.value.splice(index, 1);
  } else {
    selectedAspects.value.push(aspectKey);
  }
};

const handleSearch = () => {
  if (selectedAspects.value.length === 0) return;

  const searchParams = {
    type: "explorer",
    aspects: selectedAspects.value,
  };

  emit("search", searchParams);
};

const handleClear = () => {
  selectedAspects.value = [];
  emit("clear");
};

// Provide methods to parent if needed
defineExpose({
  selectedAspects,
  toggleAspect,
  clearSelection: handleClear,
});
</script>

<style scoped>
.explorer-tab {
  padding: 0;
}

.explorer-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.explorer-header {
  text-align: center;
  margin-bottom: 8px;
}

.explorer-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0 0 8px 0;
}

.explorer-subtitle {
  font-size: 14px;
  color: #ffffff73;
  margin: 0;
  line-height: 1.4;
}

.pills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin: 8px 0;
}

.pill-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid #2c2c32;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.pill-item:hover {
  border-color: #3c3c42;
  background-color: rgba(255, 255, 255, 0.04);
  transform: translateY(-1px);
}

.pill-item.selected {
  border-color: #2563eb;
  background-color: rgba(37, 99, 235, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.pill-item.selected:hover {
  border-color: #1d4ed8;
  background-color: rgba(37, 99, 235, 0.15);
}

.pill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.pill-label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  transition: color 0.2s ease;
}

.pill-item.selected .pill-label {
  color: #ffffff;
}

.pill-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #2563eb;
  border-radius: 50%;
  color: #ffffff;
  opacity: 1;
  transform: scale(1);
  transition: all 0.2s ease;
}

.pill-description {
  font-size: 12px;
  color: #ffffff73;
  margin: 0;
  line-height: 1.3;
  transition: color 0.2s ease;
}

.pill-item.selected .pill-description {
  color: #ffffffa3;
}

.explorer-info {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  background-color: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 20px;
  max-width: 300px;
  margin: 0 auto;
}

.selected-count {
  font-size: 13px;
  color: #2563eb;
  font-weight: 500;
}

.explorer-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 4px;
}

.search-button {
  min-width: 140px;
  height: 40px;
  font-weight: 500;
}

.clear-button {
  min-width: 120px;
  height: 40px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pills-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
  }

  .pill-item {
    padding: 12px 14px;
  }

  .explorer-actions {
    flex-direction: column;
    gap: 8px;
  }

  .search-button,
  .clear-button {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .explorer-header {
    margin-bottom: 12px;
  }

  .explorer-title {
    font-size: 16px;
  }

  .explorer-subtitle {
    font-size: 13px;
  }

  .pills-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .pill-item {
    padding: 10px 12px;
  }

  .pill-label {
    font-size: 13px;
  }

  .pill-description {
    font-size: 11px;
  }

  .pill-indicator {
    width: 18px;
    height: 18px;
  }

  .explorer-info {
    max-width: 250px;
    padding: 6px 12px;
  }

  .selected-count {
    font-size: 12px;
  }
}

/* Animation for pill selection */
@keyframes pillSelect {
  0% {
    transform: translateY(-1px) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.02);
  }
  100% {
    transform: translateY(-1px) scale(1);
  }
}

.pill-item.selected {
  animation: pillSelect 0.3s ease;
}
</style>
