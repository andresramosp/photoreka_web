<template>
  <div class="base-image-section">
    <div class="base-image-header">
      <n-select
        v-model:value="selectedSearchType"
        size="small"
        :options="expansionTypeOptions"
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
</template>

<script setup lang="ts">
import { NSelect } from "naive-ui";
import { ref } from "vue";

interface Photo {
  id: string;
  url: string;
  title: string;
  rating: number;
}

interface Props {
  baseImage: Photo;
}

interface Emits {
  (e: "search-type-changed", searchType: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedSearchType = ref("general");

const expansionTypeOptions = [
  { label: "General", value: "general" },
  { label: "Narrative", value: "narrative" },
  { label: "Context", value: "context" },
  { label: "Tags", value: "tags" },
];

const expansionTypeMap: any = {
  general: { criteria: "embedding" },
  narrative: { criteria: "semantic", fields: ["story"] },
  context: { criteria: "semantic", fields: ["context"] },
  tags: { criteria: "tags" },
};

const onSearchTypeChange = (key: string) => {
  emit("search-type-changed", expansionTypeMap[key]);
};
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
</style>
