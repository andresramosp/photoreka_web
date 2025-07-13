<template>
  <n-button
    v-if="shouldShow && !disabled"
    type="info"
    size="large"
    class="floating-process-button"
    @click="handleClick"
  >
    <template #icon>
      <n-icon size="20">
        <InProgress />
      </n-icon>
    </template>
    Process Photos
    <span v-if="selectedCount > 0" style="margin-left: 6px; font-weight: 500"
      >({{ selectedCount }})</span
    >
  </n-button>
</template>

<script setup>
import { InProgress } from "@vicons/carbon";

const props = defineProps({
  shouldShow: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  selectedCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["click"]);

const handleClick = () => {
  emit("click");
};
</script>

<style scoped>
.floating-process-button {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 160px;
  height: 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  font-weight: 600;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.floating-process-button:hover:not(:disabled) {
  transform: translateX(-50%) scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.floating-process-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Transiciones */
.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-enter-from {
  opacity: 0;
  transform: translateX(-50%) scale(0.8) translateY(20px);
}

.fab-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.8) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .floating-process-button {
    bottom: 16px;
    min-width: 140px;
    height: 44px;
    font-size: 14px;
  }
}
</style>
