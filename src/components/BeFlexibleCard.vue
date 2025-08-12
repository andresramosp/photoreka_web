<template>
  <div
    class="be-flexible-card"
    @click="handleClick"
    :class="{ loading: isLoading }"
  >
    <div class="card-content">
      <div class="icon-container">
        <n-icon size="42" class="flexibility-icon">
          <PlusCircleFilled />
        </n-icon>
      </div>
      <div class="text-content">
        <h3 class="title">Try Flexible</h3>
        <!-- <p class="description">
          {{
            isLoading
              ? "Switching to flexible mode..."
              : "Continue searching with more flexible matching"
          }}
        </p> -->
      </div>
      <div v-if="isLoading" class="loading-overlay">
        <n-spin size="small" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { PencilOutline } from "@vicons/ionicons5";
import { PlusCircleFilled } from "@vicons/antd";

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

function handleClick() {
  if (!props.isLoading) {
    emit("click");
  }
}
</script>

<style scoped>
.be-flexible-card {
  position: relative;
  background: linear-gradient(135deg, #1a1a1e 0%, #2a2a30 100%);
  border: 2px dashed #4a4a52;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.be-flexible-card:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);
}

.be-flexible-card.loading {
  pointer-events: none;
  opacity: 0.7;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 24px;
  position: relative;
  z-index: 1;
}

.icon-container {
  width: 64px;
  height: 64px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.be-flexible-card:hover .icon-container {
  background: rgba(37, 99, 235, 0.2);
  transform: scale(1.1);
}

.flexibility-icon {
  color: #2563eb;
  transition: all 0.3s ease;
}

.be-flexible-card:hover .flexibility-icon {
  color: #3b82f6;
}

.text-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-size: 17px;

  color: var(--text-primary);
  margin: 0;
  transition: color 0.3s ease;
}

.be-flexible-card:hover .title {
  color: #ffffff;
}

.description {
  font-size: 14px;
  color: #ffffff73;
  margin: 0;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.be-flexible-card:hover .description {
  color: #ffffffa1;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 30, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 2;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .be-flexible-card {
    min-height: 150px;
  }

  .card-content {
    padding: 16px;
    gap: 12px;
  }

  .icon-container {
    width: 48px;
    height: 48px;
  }

  .title {
    font-size: 16px;
  }

  .description {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .be-flexible-card {
    min-height: 120px;
  }

  .card-content {
    padding: 12px;
    gap: 8px;
  }

  .icon-container {
    width: 40px;
    height: 40px;
  }

  .title {
    font-size: 14px;
  }

  .description {
    font-size: 11px;
  }
}
</style>
