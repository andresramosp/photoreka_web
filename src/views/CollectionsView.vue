<template>
  <div class="collections-view view-container">
    <!-- Collection View (when viewing a specific collection) -->
    <div v-if="showCollectionView && viewingCollection" class="collection-view">
      <!-- Collection Header -->
      <div class="collection-header">
        <div class="collection-header-content">
          <n-button text @click="backToCollections" class="back-button">
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                  />
                </svg>
              </n-icon>
            </template>
            Back to Collections
          </n-button>
          <h1 class="collection-title">
            {{ viewingCollection.name || viewingCollection.title }}
          </h1>
          <p
            class="collection-description"
            v-if="viewingCollection.description"
          >
            {{ viewingCollection.description }}
          </p>
          <p class="collection-meta">
            {{ (viewingCollection.photos || []).length }} photos • Updated
            {{ formatDate(viewingCollection.updatedAt) }}
          </p>
        </div>
      </div>

      <!-- Collection Photos Grid -->
      <div class="collection-photos">
        <PhotosGrid :photos="viewingCollection.photos || []" />
      </div>
    </div>

    <!-- Collections Grid View (default view) -->
    <div v-else>
      <!-- Header Section -->
      <div class="collections-header">
        <div class="header-content">
          <h1 class="page-title">Collections</h1>
          <p class="page-subtitle">
            Organize your photos into beautiful collections for better
            management and storytelling.
          </p>
        </div>
      </div>

      <!-- Collections Grid -->
      <div v-if="isLoading" class="loading-state">
        <n-spin size="large">
          <div class="loading-text">Loading your collections...</div>
        </n-spin>
      </div>

      <div v-else class="collections-grid">
        <!-- Create New Collection Card (only show when there are existing collections) -->
        <div
          v-if="collections.length > 0"
          class="collection-card create-card"
          @click="showCreateDialog"
        >
          <div class="create-preview">
            <div class="create-icon">
              <n-icon size="48" color="var(--primary-color)">
                <AddOutline />
              </n-icon>
            </div>
          </div>
          <div class="collection-info">
            <h3 class="collection-title">Create New Collection</h3>
            <p class="collection-meta">Start organizing your photos</p>
          </div>
        </div>

        <!-- Existing Collections -->
        <div
          v-for="collection in collections"
          :key="collection.id"
          class="collection-card"
          @click="openCollection(collection)"
        >
          <div class="collection-preview">
            <div
              v-if="collection.photos && collection.photos.length > 0"
              class="photo-stack"
            >
              <div
                v-for="(photo, index) in collection.photos.slice(0, 4)"
                :key="photo.id"
                class="photo-item"
                :class="`photo-${index + 1}`"
              >
                <div
                  class="photo-placeholder"
                  :style="{ background: photo.gradient }"
                ></div>
              </div>
            </div>
            <div v-else class="empty-preview">
              <n-icon size="40" color="#ffffff73">
                <ImagesOutline />
              </n-icon>
            </div>
          </div>
          <div class="collection-info">
            <h3 class="collection-title">
              {{ collection.name || collection.title }}
            </h3>
            <p class="collection-meta">
              {{ (collection.photos || []).length }} photos • Updated
              {{ formatDate(collection.updatedAt) }}
            </p>
          </div>
        </div>

        <!-- Empty State (when no collections exist) -->
        <div v-if="collections.length === 0" class="empty-collections-state">
          <div class="empty-collections-content">
            <n-icon size="64" class="empty-collections-icon">
              <ImagesOutline />
            </n-icon>
            <h3 class="empty-collections-title">No collections yet</h3>
            <p class="empty-collections-description">
              Create your first collection to start organizing your photos into
              beautiful collections.
            </p>
            <n-button
              type="primary"
              @click="showCreateDialog"
              class="create-collection-btn"
            >
              <template #icon>
                <n-icon>
                  <AddOutline />
                </n-icon>
              </template>
              Create Your First Collection
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Collection Dialog -->
    <n-modal
      v-model:show="createDialogVisible"
      preset="dialog"
      title="Create New Collection"
      positive-text="Next: Select Photos"
      negative-text="Cancel"
      @positive-click="proceedToPhotoSelection"
      @negative-click="createDialogVisible = false"
    >
      <div class="create-form">
        <n-form ref="formRef" :model="formData" :rules="formRules">
          <n-form-item label="Name" path="title">
            <n-input
              v-model:value="formData.title"
              placeholder="Enter collection name..."
              maxlength="100"
              show-count
            />
          </n-form-item>
          <n-form-item label="Description" path="description">
            <n-input
              v-model:value="formData.description"
              type="textarea"
              placeholder="Add a description (optional)..."
              :rows="3"
              maxlength="500"
              show-count
            />
          </n-form-item>
        </n-form>
      </div>
    </n-modal>

    <!-- Photos Selection Dialog -->
    <PhotosDialog
      v-model="photosDialogVisible"
      :is-trash="false"
      :title="`Add Photos to ${formData.title}`"
      @add-photos="onPhotosSelected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  NButton,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSpin,
  useMessage,
} from "naive-ui";
import { AddOutline, ImagesOutline } from "@vicons/ionicons5";
import PhotosDialog from "@/components/canvas/PhotosDialog.vue";
import PhotosGrid from "@/components/PhotosGrid.vue";
import { api } from "@/utils/axios.js";
import { usePhotosStore } from "@/stores/photos.js";

const route = useRoute();
const router = useRouter();
const message = useMessage();
const photosStore = usePhotosStore();

// State
const createDialogVisible = ref(false);
const photosDialogVisible = ref(false);
const formRef = ref(null);
const isCreatingCollection = ref(false);
const viewingCollection = ref(null); // Collection being viewed
const showCollectionView = ref(false); // Whether to show collection view or grid view

// Form data
const formData = ref({
  title: "",
  description: "",
});

const formRules = {
  title: {
    required: true,
    message: "Please enter a name",
    trigger: "blur",
  },
};

// Collections data
const collections = ref([]);
const isLoadingCollections = ref(false);

// Predefined gradients for photo placeholders
const photoGradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
  "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)",
  "linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)",
  "linear-gradient(135deg, #29323c 0%, #485563 100%)",
];

// Computed para saber si se puede mostrar la grid de colecciones
const isLoading = computed(() => {
  return (
    isLoadingCollections.value ||
    photosStore.isLoading ||
    !Array.isArray(photosStore.allPhotos) ||
    photosStore.allPhotos.length === 0
  );
});

// Function to assign gradient colors to photos
const assignPhotoGradients = (photos) => {
  return photos.map((photo, index) => ({
    ...photo,
    gradient: photoGradients[index % photoGradients.length],
  }));
};

// Function to load collections from API
const loadCollections = async () => {
  isLoadingCollections.value = true;
  try {
    const response = await api.get("/api/collections");
    collections.value = response.data.map((collection) => ({
      ...collection,
      photos: assignPhotoGradients(collection.photos || []),
      updatedAt: new Date(
        collection.updatedAt || collection.created_at || new Date()
      ),
    }));
  } catch (error) {
    console.error("Error loading collections:", error);
    message.error("Failed to load collections");
  } finally {
    isLoadingCollections.value = false;
  }
};

const showCreateDialog = () => {
  formData.value = { title: "", description: "" };
  createDialogVisible.value = true;
};

const proceedToPhotoSelection = async () => {
  try {
    await formRef.value?.validate();
    createDialogVisible.value = false;
    photosDialogVisible.value = true;
  } catch (error) {}
};

const onPhotosSelected = async (photoIds) => {
  if (!photoIds || photoIds.length === 0) {
    message.warning("Please select at least one photo");
    return;
  }
  isCreatingCollection.value = true;
  try {
    const payload = {
      name: formData.value.title,
      description: formData.value.description,
      photoIds: photoIds,
    };
    const response = await api.post("/api/collections", payload);
    message.success(
      `Collection "${formData.value.title}" created successfully with ${photoIds.length} photos`
    );
    formData.value = { title: "", description: "" };
    photosDialogVisible.value = false;
    await loadCollections();
  } catch (error) {
    console.error("Error creating collection:", error);
    message.error("Failed to create collection. Please try again.");
  } finally {
    isCreatingCollection.value = false;
  }
};

const openCollection = (collection) => {
  router.push({ name: "collection-detail", params: { id: collection.id } });
};

const backToCollections = () => {
  router.push({ name: "collections" });
};

const formatDate = (date) => {
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24)),
    "day"
  );
};

// Watch for route changes to update the view
const updateViewingCollection = () => {
  const id = route.params.id;
  if (id && collections.value.length > 0) {
    const found = collections.value.find((c) => String(c.id) === String(id));
    if (found) {
      // Obtener ids de las fotos de la colección
      const photoIds = (found.photos || []).map((p) => p.id);
      // Buscar las fotos completas en el store
      const fullPhotos = photosStore.allPhotos.filter((p) =>
        photoIds.includes(p.id)
      );
      viewingCollection.value = {
        ...found,
        photos: fullPhotos,
      };
      showCollectionView.value = true;
      return;
    }
  }
  viewingCollection.value = null;
  showCollectionView.value = false;
};

onMounted(async () => {
  await photosStore.getOrFetch();
  await loadCollections();
  updateViewingCollection();
});

watch(
  [() => route.params.id, collections, () => photosStore.allPhotos],
  updateViewingCollection
);
</script>

<style scoped>
.collections-view {
  padding: var(--spacing-2xl);
  margin: 0 auto;
  background-color: var(--bg-body);
}

.collections-header {
  margin-bottom: var(--spacing-3xl);
}

.header-content {
  text-align: left;
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
  max-width: 600px;
}

/* Collections Grid */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  text-align: center;
}

.loading-text {
  margin-top: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-size-md);
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.collection-card {
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.collection-card:hover {
  border-color: #2563eb;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.2);
}

.collection-preview {
  position: relative;
  height: 120px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-stack {
  position: relative;
  width: 80px;
  height: 80px;
  perspective: 1000px;
}

.photo-item {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

/* Fan arrangement of photos */
.photo-item.photo-1 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-12deg) translateY(-10px);
  z-index: 4;
}

.photo-item.photo-2 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-4deg) translateY(-5px);
  z-index: 3;
}

.photo-item.photo-3 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(4deg) translateY(-5px);
  z-index: 2;
}

.photo-item.photo-4 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(12deg) translateY(-10px);
  z-index: 1;
}

/* Hover effects for photo stack */
.collection-card:hover .photo-item.photo-1 {
  transform: translate(-50%, -50%) rotate(-16deg) translateY(-15px) scale(1.05);
}

.collection-card:hover .photo-item.photo-2 {
  transform: translate(-50%, -50%) rotate(-6deg) translateY(-10px) scale(1.03);
}

.collection-card:hover .photo-item.photo-3 {
  transform: translate(-50%, -50%) rotate(6deg) translateY(-10px) scale(1.03);
}

.collection-card:hover .photo-item.photo-4 {
  transform: translate(-50%, -50%) rotate(16deg) translateY(-15px) scale(1.05);
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}

.collection-info {
  text-align: center;
}

.collection-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.collection-meta {
  font-size: 14px;
  color: #ffffff73;
  margin: 0;
  line-height: 1.4;
}

/* Create Card Specific Styles */
.create-card {
  border: 2px dashed #2c2c32;
  background-color: transparent;
}

.create-card:hover {
  border-color: #2563eb;
  background-color: rgba(37, 99, 235, 0.05);
}

.create-preview {
  position: relative;
  height: 120px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-icon {
  padding: 20px;
  border-radius: 50%;
  background-color: rgba(37, 99, 235, 0.1);
  transition: all 0.3s ease;
}

.create-card:hover .create-icon {
  background-color: rgba(37, 99, 235, 0.2);
  transform: scale(1.1);
}

/* Create Form */
.create-form {
  padding-top: var(--spacing-md);
}

/* Collection View Styles */
.collection-view {
  padding: var(--spacing-2xl);
  margin: 0 auto;
  background-color: var(--bg-body);
}

.collection-header {
  margin-bottom: var(--spacing-3xl);
}

.collection-header-content {
  text-align: left;
}

.back-button {
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: var(--font-size-md);
}

.back-button:hover {
  color: var(--primary-color);
}

.collection-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.collection-description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  max-width: 600px;
  line-height: 1.6;
}

.collection-meta {
  font-size: var(--font-size-md);
  color: var(--text-tertiary);
  margin: 0;
}

.collection-photos {
  width: 100%;
}

/* Empty Collections State */
.empty-collections-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  text-align: center;
}

.empty-collections-content {
  max-width: 400px;
}

.empty-collections-icon {
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-lg);
}

.empty-collections-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.empty-collections-description {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
  line-height: 1.5;
}

.create-collection-btn {
  font-size: var(--font-size-md);
  padding: var(--spacing-md) var(--spacing-xl);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .collections-view {
    padding: var(--spacing-lg);
  }

  .page-title {
    font-size: var(--font-size-3xl);
  }

  .collections-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .collection-card {
    padding: 16px;
  }

  .collection-preview {
    height: 100px;
    margin-bottom: 12px;
  }

  .photo-stack {
    width: 70px;
    height: 70px;
  }

  .photo-item {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 1024px) {
  .collections-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (min-width: 1600px) {
  .collections-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
</style>
