<template>
  <div class="explorer-tab">
    <div class="explorer-content">
      <div class="explorer-header">
        <div class="header-inline">
          <span class="header-text"
            >Select aesthetic characteristics to explore</span
          >
          <div v-if="selectedAspects.length > 0" class="selected-indicator">
            <span class="selected-text">Selected:</span>
            <span class="selected-count">{{ selectedAspects.length }}</span>
          </div>
        </div>
      </div>

      <div class="pills-container">
        <n-tag
          v-for="aspect in aestheticAspects"
          :key="aspect.key"
          :type="selectedAspects.includes(aspect.key) ? 'primary' : 'default'"
          :bordered="false"
          checkable
          :checked="selectedAspects.includes(aspect.key)"
          @update:checked="() => toggleAspect(aspect.key)"
          class="style-pill"
        >
          {{ aspect.label }}
        </n-tag>
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
  gap: 12px;
}

.explorer-header {
  margin-bottom: 12px;
}

.header-text {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.pills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0;
  justify-content: center;
}

.style-pill {
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
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

  .pills-container {
    gap: 6px;
  }

  .style-pill {
    font-size: 12px;
    padding: 6px 10px;
  }

  .explorer-info {
    max-width: 250px;
    padding: 6px 12px;
  }

  .selected-count {
    font-size: 12px;
  }
}
</style>
