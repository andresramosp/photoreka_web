<template>
  <div class="collections-view view-container">
    <!-- Header -->
    <div class="collections-header">
      <h1 class="page-title">Collections</h1>
      <p class="page-subtitle">
        Organize your photos into albums and series for better management and
        storytelling.
      </p>
    </div>

    <!-- Tabs for Albums and Series -->
    <div class="collections-tabs">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="albums" tab="Albums">
          <div class="tab-content">
            <!-- Albums Section -->
            <div class="section-header">
              <div class="section-info">
                <h2 class="section-title">Photo Albums</h2>
                <span class="item-count">{{ albums.length }} albums</span>
              </div>
              <n-button type="primary" @click="showCreateDialog('album')">
                <template #icon>
                  <n-icon><AddOutline /></n-icon>
                </template>
                New Album
              </n-button>
            </div>

            <!-- Albums Grid -->
            <div v-if="albums.length > 0" class="collections-grid">
              <div
                v-for="album in albums"
                :key="album.id"
                class="collection-card"
                @click="openCollection(album)"
              >
                <div class="collection-preview">
                  <div v-if="album.photos.length > 0" class="photos-stack">
                    <div
                      v-for="(photo, index) in album.photos.slice(0, 4)"
                      :key="photo.id"
                      class="photo-item"
                      :class="`photo-${index + 1}`"
                    >
                      <img
                        :src="photo.url"
                        :alt="photo.name"
                        class="photo-image"
                      />
                    </div>
                  </div>
                  <div v-else class="empty-preview">
                    <n-icon size="40" color="#6b7280">
                      <ImagesOutline />
                    </n-icon>
                    <span class="empty-text">No photos</span>
                  </div>
                </div>
                <div class="collection-info">
                  <h3 class="collection-title">{{ album.title }}</h3>
                  <p class="collection-meta">
                    {{ album.photos.length }} photos
                    <span v-if="album.updatedAt">
                      • Updated {{ formatDate(album.updatedAt) }}
                    </span>
                  </p>
                  <p v-if="album.description" class="collection-description">
                    {{ album.description }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Empty State for Albums -->
            <div v-else class="empty-state">
              <n-icon size="64" color="#6b7280">
                <ImagesOutline />
              </n-icon>
              <h3 class="empty-title">No albums yet</h3>
              <p class="empty-description">
                Create your first album to start organizing your photos
              </p>
              <n-button type="primary" @click="showCreateDialog('album')">
                <template #icon>
                  <n-icon><AddOutline /></n-icon>
                </template>
                Create Album
              </n-button>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="series" tab="Series">
          <div class="tab-content">
            <!-- Series Section -->
            <div class="section-header">
              <div class="section-info">
                <h2 class="section-title">Photo Series</h2>
                <span class="item-count">{{ series.length }} series</span>
              </div>
              <n-button type="primary" @click="showCreateDialog('series')">
                <template #icon>
                  <n-icon><AddOutline /></n-icon>
                </template>
                New Series
              </n-button>
            </div>

            <!-- Series Grid -->
            <div v-if="series.length > 0" class="collections-grid">
              <div
                v-for="item in series"
                :key="item.id"
                class="collection-card"
                @click="openCollection(item)"
              >
                <div class="collection-preview">
                  <div v-if="item.photos.length > 0" class="photos-stack">
                    <div
                      v-for="(photo, index) in item.photos.slice(0, 4)"
                      :key="photo.id"
                      class="photo-item"
                      :class="`photo-${index + 1}`"
                    >
                      <img
                        :src="photo.url"
                        :alt="photo.name"
                        class="photo-image"
                      />
                    </div>
                  </div>
                  <div v-else class="empty-preview">
                    <n-icon size="40" color="#6b7280">
                      <LayersOutline />
                    </n-icon>
                    <span class="empty-text">No photos</span>
                  </div>
                </div>
                <div class="collection-info">
                  <h3 class="collection-title">{{ item.title }}</h3>
                  <p class="collection-meta">
                    {{ item.photos.length }} photos
                    <span v-if="item.updatedAt">
                      • Updated {{ formatDate(item.updatedAt) }}
                    </span>
                  </p>
                  <p v-if="item.description" class="collection-description">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Empty State for Series -->
            <div v-else class="empty-state">
              <n-icon size="64" color="#6b7280">
                <LayersOutline />
              </n-icon>
              <h3 class="empty-title">No series yet</h3>
              <p class="empty-description">
                Create your first series to tell visual stories with your photos
              </p>
              <n-button type="primary" @click="showCreateDialog('series')">
                <template #icon>
                  <n-icon><AddOutline /></n-icon>
                </template>
                Create Series
              </n-button>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- Create Collection Dialog -->
    <n-modal
      v-model:show="createDialogVisible"
      preset="dialog"
      :title="`Create New ${createType === 'album' ? 'Album' : 'Series'}`"
      positive-text="Create"
      negative-text="Cancel"
      @positive-click="createCollection"
      @negative-click="createDialogVisible = false"
    >
      <div class="create-form">
        <n-form ref="formRef" :model="formData" :rules="formRules">
          <n-form-item label="Name" path="title">
            <n-input
              v-model:value="formData.title"
              placeholder="Enter a name..."
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

    <!-- Collection Details Dialog -->
    <n-modal
      v-model:show="detailsDialogVisible"
      preset="dialog"
      :style="{ maxWidth: '90vw', width: '1200px', maxHeight: '90vh' }"
      :title="selectedCollection?.title"
      :closable="true"
      :bordered="false"
    >
      <div v-if="selectedCollection" class="collection-details">
        <!-- Collection Header -->
        <div class="details-header">
          <div class="collection-meta-info">
            <p class="meta-text">
              {{ selectedCollection.photos.length }} photos
              <span v-if="selectedCollection.updatedAt">
                • Updated {{ formatDate(selectedCollection.updatedAt) }}
              </span>
            </p>
            <p v-if="selectedCollection.description" class="collection-desc">
              {{ selectedCollection.description }}
            </p>
          </div>
          <div class="header-actions">
            <n-button @click="addPhotosToCollection">
              <template #icon>
                <n-icon><AddOutline /></n-icon>
              </template>
              Add Photos
            </n-button>
            <n-button quaternary type="error" @click="deleteCollection">
              <template #icon>
                <n-icon><TrashOutline /></n-icon>
              </template>
              Delete
            </n-button>
          </div>
        </div>

        <!-- Photos Grid -->
        <div v-if="selectedCollection.photos.length > 0" class="photos-grid">
          <div
            v-for="photo in selectedCollection.photos"
            :key="photo.id"
            class="photo-card"
          >
            <img :src="photo.url" :alt="photo.name" class="photo-thumbnail" />
            <div class="photo-overlay">
              <n-button
                size="small"
                quaternary
                type="error"
                @click="removePhotoFromCollection(photo.id)"
              >
                <template #icon>
                  <n-icon><CloseOutline /></n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-photos">
          <n-icon size="48" color="#6b7280">
            <ImagesOutline />
          </n-icon>
          <p class="empty-message">No photos in this collection</p>
          <n-button type="primary" @click="addPhotosToCollection">
            <template #icon>
              <n-icon><AddOutline /></n-icon>
            </template>
            Add Photos
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- Photos Dialog -->
    <PhotosDialog
      v-model:show="photosDialogVisible"
      :title="`Add Photos to ${selectedCollection?.title}`"
      @photos-selected="onPhotosSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  NButton,
  NIcon,
  NTabs,
  NTabPane,
  NModal,
  NForm,
  NFormItem,
  NInput,
  useMessage,
} from "naive-ui";
import {
  AddOutline,
  ImagesOutline,
  LayersOutline,
  TrashOutline,
  CloseOutline,
} from "@vicons/ionicons5";
import PhotosDialog from "@/components/canvas/PhotosDialog.vue";

const message = useMessage();

// State
const activeTab = ref("albums");
const createDialogVisible = ref(false);
const detailsDialogVisible = ref(false);
const photosDialogVisible = ref(false);
const createType = ref("album");
const selectedCollection = ref(null);
const formRef = ref(null);

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

// Mock data - In real app, this would come from API/store
const albums = ref([
  {
    id: 1,
    title: "Summer Vacation 2024",
    description: "Our amazing trip to the mountains and beaches",
    photos: [
      {
        id: 1,
        name: "Beach sunset",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
      },
      {
        id: 2,
        name: "Mountain view",
        url: "https://images.unsplash.com/photo-1464822759356-8d6106e78f86?w=300&h=300&fit=crop",
      },
      {
        id: 3,
        name: "Camp fire",
        url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&h=300&fit=crop",
      },
      {
        id: 4,
        name: "Hiking trail",
        url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&h=300&fit=crop",
      },
    ],
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    title: "Wedding Photography",
    description: "Sarah & Mike's beautiful wedding ceremony",
    photos: [
      {
        id: 5,
        name: "Ceremony",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=300&fit=crop",
      },
      {
        id: 6,
        name: "Reception",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&h=300&fit=crop",
      },
    ],
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: 3,
    title: "Empty Album",
    description: "Testing empty state",
    photos: [],
    updatedAt: new Date("2024-01-05"),
  },
]);

const series = ref([
  {
    id: 4,
    title: "Urban Street Photography",
    description: "Capturing city life and architecture",
    photos: [
      {
        id: 7,
        name: "Street art",
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
      },
      {
        id: 8,
        name: "City lights",
        url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&h=300&fit=crop",
      },
      {
        id: 9,
        name: "Architecture",
        url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=300&h=300&fit=crop",
      },
    ],
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: 5,
    title: "Nature Portraits",
    description: "Wildlife and nature photography series",
    photos: [
      {
        id: 10,
        name: "Forest path",
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
      },
    ],
    updatedAt: new Date("2024-01-08"),
  },
]);

// Methods
const showCreateDialog = (type) => {
  createType.value = type;
  formData.value = { title: "", description: "" };
  createDialogVisible.value = true;
};

const createCollection = async () => {
  try {
    await formRef.value?.validate();

    const newCollection = {
      id: Date.now(),
      title: formData.value.title,
      description: formData.value.description,
      photos: [],
      updatedAt: new Date(),
    };

    if (createType.value === "album") {
      albums.value.push(newCollection);
      message.success("Album created successfully");
    } else {
      series.value.push(newCollection);
      message.success("Series created successfully");
    }

    createDialogVisible.value = false;
  } catch (error) {
    // Validation failed
  }
};

const openCollection = (collection) => {
  selectedCollection.value = collection;
  detailsDialogVisible.value = true;
};

const addPhotosToCollection = () => {
  photosDialogVisible.value = true;
};

const onPhotosSelected = (photos) => {
  if (selectedCollection.value && photos.length > 0) {
    // Add photos to collection (avoid duplicates)
    const existingIds = selectedCollection.value.photos.map((p) => p.id);
    const newPhotos = photos.filter((p) => !existingIds.includes(p.id));

    selectedCollection.value.photos.push(...newPhotos);
    selectedCollection.value.updatedAt = new Date();

    message.success(
      `Added ${newPhotos.length} photos to ${selectedCollection.value.title}`,
    );
  }
};

const removePhotoFromCollection = (photoId) => {
  if (selectedCollection.value) {
    const index = selectedCollection.value.photos.findIndex(
      (p) => p.id === photoId,
    );
    if (index > -1) {
      selectedCollection.value.photos.splice(index, 1);
      selectedCollection.value.updatedAt = new Date();
      message.success("Photo removed from collection");
    }
  }
};

const deleteCollection = () => {
  if (selectedCollection.value) {
    const isAlbum = albums.value.find(
      (a) => a.id === selectedCollection.value.id,
    );

    if (isAlbum) {
      const index = albums.value.findIndex(
        (a) => a.id === selectedCollection.value.id,
      );
      albums.value.splice(index, 1);
      message.success("Album deleted");
    } else {
      const index = series.value.findIndex(
        (s) => s.id === selectedCollection.value.id,
      );
      series.value.splice(index, 1);
      message.success("Series deleted");
    }

    detailsDialogVisible.value = false;
    selectedCollection.value = null;
  }
};

const formatDate = (date) => {
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24)),
    "day",
  );
};

onMounted(() => {
  // Initialize data or fetch from API
});
</script>

<style scoped>
.collections-view {
  padding: var(--spacing-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.collections-header {
  margin-bottom: var(--spacing-3xl);
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
}

.collections-tabs {
  margin-top: var(--spacing-xl);
}

.tab-content {
  padding-top: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.section-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.item-count {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  background: var(--bg-card);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

/* Collections Grid */
.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-xl);
}

.collection-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.collection-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);
}

.collection-preview {
  height: 200px;
  background: #18181c;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photos-stack {
  position: relative;
  width: 120px;
  height: 120px;
}

.photo-item {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Fan arrangement */
.photo-1 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-8deg) translateY(-10px);
  z-index: 4;
}

.photo-2 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-2deg) translateY(-5px);
  z-index: 3;
}

.photo-3 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(2deg) translateY(-5px);
  z-index: 2;
}

.photo-4 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(8deg) translateY(-10px);
  z-index: 1;
}

.collection-card:hover .photo-1 {
  transform: translate(-50%, -50%) rotate(-12deg) translateY(-15px) scale(1.05);
}

.collection-card:hover .photo-2 {
  transform: translate(-50%, -50%) rotate(-4deg) translateY(-10px) scale(1.02);
}

.collection-card:hover .photo-3 {
  transform: translate(-50%, -50%) rotate(4deg) translateY(-10px) scale(1.02);
}

.collection-card:hover .photo-4 {
  transform: translate(-50%, -50%) rotate(12deg) translateY(-15px) scale(1.05);
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.empty-text {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.collection-info {
  padding: var(--spacing-lg);
}

.collection-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.collection-meta {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.collection-description {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Empty States */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl);
  text-align: center;
}

.empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: var(--spacing-lg) 0 var(--spacing-md) 0;
}

.empty-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
  max-width: 400px;
}

/* Create Form */
.create-form {
  padding-top: var(--spacing-md);
}

/* Collection Details */
.collection-details {
  max-height: 70vh;
  overflow-y: auto;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.collection-meta-info {
  flex: 1;
}

.meta-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.collection-desc {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.photo-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  group: hover;
}

.photo-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.photo-card:hover .photo-thumbnail {
  transform: scale(1.05);
}

.empty-photos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl);
  text-align: center;
}

.empty-message {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: var(--spacing-lg) 0 var(--spacing-xl) 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .collections-view {
    padding: var(--spacing-lg);
  }

  .page-title {
    font-size: var(--font-size-3xl);
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .collections-grid {
    grid-template-columns: 1fr;
  }

  .details-header {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
