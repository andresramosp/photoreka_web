<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="Add to Collection"
    positive-text="Add"
    negative-text="Cancel"
    :positive-button-props="{ disabled: !selectedCollection }"
    @positive-click="handleAddToCollection"
    @negative-click="handleCancel"
    style="width: 500px"
  >
    <div class="collection-modal-content">
      <p class="modal-description">
        Select a collection to add {{ photoCount }} photo{{
          photoCount === 1 ? "" : "s"
        }}
        to:
      </p>

      <div v-if="isLoadingCollections" class="loading-state">
        <n-spin size="medium" />
        <span>Loading collections...</span>
      </div>

      <div v-else-if="collections.length === 0" class="empty-collections">
        <p>No collections found. Create a collection first.</p>
      </div>

      <div v-else class="collections-list">
        <div
          v-for="collection in collections"
          :key="collection.id"
          class="collection-item"
          :class="{ selected: selectedCollection?.id === collection.id }"
          @click="selectedCollection = collection"
        >
          <div class="collection-info">
            <h4 class="collection-name">{{ collection.name }}</h4>
            <p class="collection-description">
              {{ collection.description || "No description" }}
            </p>
            <span class="collection-count"
              >{{ collection.photoCount || 0 }} photos</span
            >
          </div>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { NModal, NSpin, useMessage } from "naive-ui";
import { useCollectionsStore } from "@/stores/collections.js";

const emit = defineEmits(["add-to-collection", "cancel"]);
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  photoCount: {
    type: Number,
    default: 0,
  },
  photoIds: {
    type: Array,
    default: () => [],
  },
});

const message = useMessage();
const collectionsStore = useCollectionsStore();

// Local state
const showModal = ref(false);
const selectedCollection = ref(null);

// Computed properties
const collections = computed(() => collectionsStore.allCollections);
const isLoadingCollections = computed(() => collectionsStore.isLoading);

// Watch for show prop changes
watch(
  () => props.show,
  (newShow) => {
    showModal.value = newShow;
    if (newShow) {
      selectedCollection.value = null;
      loadCollections();
    }
  },
  { immediate: true }
);

// Watch for modal close
watch(showModal, (newShow) => {
  if (!newShow && props.show) {
    emit("cancel");
  }
});

// Methods
const loadCollections = async () => {
  try {
    await collectionsStore.getOrFetch();
  } catch (error) {
    console.error("Error loading collections:", error);
    message.error("Failed to load collections");
  }
};

const handleAddToCollection = async () => {
  if (selectedCollection.value && props.photoIds.length > 0) {
    try {
      await collectionsStore.addPhotosToCollection(
        selectedCollection.value.id,
        props.photoIds
      );
      message.success(
        `Successfully added ${props.photoCount} photo${
          props.photoCount === 1 ? "" : "s"
        } to "${selectedCollection.value.name}"`
      );
      emit("add-to-collection", {
        collection: selectedCollection.value,
        photoIds: props.photoIds,
      });
      handleCancel();
    } catch (error) {
      console.error("Error adding photos to collection:", error);
      message.error("Failed to add photos to collection");
    }
  }
};

const handleCancel = () => {
  showModal.value = false;
  selectedCollection.value = null;
  emit("cancel");
};
</script>

<style scoped>
/* Collection Modal Styles */
.collection-modal-content {
  padding: 16px 0;
}

.modal-description {
  color: #ffffffd1;
  margin-bottom: 20px;
  font-size: 14px;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 40px 0;
  color: #ffffff73;
}

.empty-collections {
  text-align: center;
  padding: 40px 0;
  color: #ffffff73;
}

.collections-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #2c2c32;
  border-radius: 8px;
  background-color: #1a1a1f;
}

.collection-item {
  padding: 16px;
  border-bottom: 1px solid #2c2c32;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collection-item:last-child {
  border-bottom: none;
}

.collection-item:hover {
  background-color: rgba(139, 92, 246, 0.1);
}

.collection-item.selected {
  background-color: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
}

.collection-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.collection-name {
  font-size: 16px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0;
}

.collection-description {
  font-size: 14px;
  color: #ffffff73;
  margin: 0;
}

.collection-count {
  font-size: 12px;
  color: #8b5cf6;
  font-weight: 500;
}
</style>
