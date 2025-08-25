<template>
  <div class="custom-weights-content">
    <div class="weights-container">
      <div
        v-for="group in groupedCriteria"
        :key="group.key"
        class="criteria-group"
      >
        <div class="group-header">
          <h4 class="group-title">{{ group.label }}</h4>
        </div>
        <div class="weights-grid">
          <div
            v-for="criterion in group.criteria"
            :key="criterion.value"
            class="weight-item"
          >
            <div class="weight-label-container">
              <span class="weight-label">{{ criterion.label }}</span>
              <span class="weight-value">{{
                modelValue[criterion.value]?.toFixed(1) || "0.0"
              }}</span>
            </div>
            <div class="weight-control">
              <n-slider
                :value="modelValue[criterion.value] || 0"
                @update:value="(value) => updateWeight(criterion.value, value)"
                :min="0"
                :max="1"
                :step="0.1"
                :marks="{
                  0: '0.0',
                  0.5: '0.5',
                  1: '1.0',
                }"
                :tooltip="false"
                style="width: 100%"
                class="compact-slider"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { NSlider } from "naive-ui";
import { useArtisticScores } from "@/composables/useArtisticScores";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  formatCriterionName: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

// Get artisticScores from composable
const { artisticScores } = useArtisticScores();

// Group criteria by their categories
const groupedCriteria = computed(() => {
  const groups = [];

  Object.entries(artisticScores).forEach(([groupKey, groupData]) => {
    groups.push({
      key: groupKey,
      label: groupData.label,
      criteria: groupData.criteria,
    });
  });

  return groups;
});

const updateWeight = (criterion, value) => {
  const newWeights = { ...props.modelValue };
  newWeights[criterion] = value;
  emit("update:modelValue", newWeights);
};
</script>

<style scoped>
.custom-weights-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.weights-header {
  text-align: center;
}

.weights-subtitle {
  margin: 0;
  font-size: 13px;
  color: #ffffff73;
  line-height: 1.4;
}

.weights-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 450px;
  overflow-y: auto;
  padding-right: 4px;
}

.criteria-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-header {
  padding-bottom: 4px;
  border-bottom: 1px solid #2c2c32;
}

.group-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #8b5cf6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.weights-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.weight-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #2c2c32;
  transition: all 0.2s ease;
}

.weight-item:hover {
  border-color: #8b5cf6;
  transform: translateY(-1px);
}

.weight-label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0px;
}

.weight-label {
  font-size: 13px;
  font-weight: 500;
  color: #ffffffd1;
}

.weight-value {
  font-size: 11px;
  font-weight: 600;
  color: #8b5cf6;
  font-family: monospace;
  background: rgba(139, 92, 246, 0.1);
  padding: 1px 5px;
  border-radius: 3px;
  min-width: 28px;
  text-align: center;
}

.weight-control {
  padding: 2px 0 0px 0;
}

/* Compact slider styles */
:deep(.compact-slider .n-slider-rail) {
  height: 3px !important;
}

:deep(.compact-slider .n-slider-handle) {
  width: 12px !important;
  height: 12px !important;
}

:deep(.compact-slider .n-slider-handle-indicator) {
  width: 8px !important;
  height: 8px !important;
}

:deep(.compact-slider .n-slider-mark) {
  font-size: 9px !important;
  color: #ffffff4d !important;
}

:deep(.compact-slider .n-slider-mark-text) {
  font-size: 9px !important;
  color: #ffffff4d !important;
  margin-top: 3px !important;
}

:deep(.compact-slider .n-slider-fill) {
  background: linear-gradient(90deg, #8b5cf6, #a855f7) !important;
}

:deep(.compact-slider .n-slider-handle:hover) {
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2) !important;
}

/* Scrollbar styling */
.weights-container::-webkit-scrollbar {
  width: 6px;
}

.weights-container::-webkit-scrollbar-track {
  background: #1a1a1f;
  border-radius: 3px;
}

.weights-container::-webkit-scrollbar-thumb {
  background: #2c2c32;
  border-radius: 3px;
}

.weights-container::-webkit-scrollbar-thumb:hover {
  background: #3c3c42;
}

/* Responsive */
@media (max-width: 768px) {
  .criteria-group {
    gap: 6px;
  }

  .group-title {
    font-size: 11px;
  }

  .weight-item {
    padding: 6px 8px;
  }

  .weight-label {
    font-size: 12px;
  }

  .weight-value {
    font-size: 10px;
    padding: 1px 4px;
    min-width: 24px;
  }
}
</style>
