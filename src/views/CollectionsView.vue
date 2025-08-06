<template>
  <div class="collections-view view-container">
    <!-- Header Section -->
    <div class="collections-header">
      <div class="header-content">
        <h1 class="page-title">Albums</h1>
        <p class="page-subtitle">
          Organize your photos into beautiful albums for better management and
          storytelling.
        </p>
      </div>
    </div>

    <!-- Albums Grid -->
    <div v-if="isLoadingAlbums" class="loading-state">
      <n-spin size="large">
        <div class="loading-text">Loading your albums...</div>
      </n-spin>
    </div>

    <div v-else class="albums-grid">
      <!-- Create New Album Card (only show when there are existing albums) -->
      <div
        v-if="albums.length > 0"
        class="album-card create-card"
        @click="showCreateDialog"
      >
        <div class="create-preview">
          <div class="create-icon">
            <n-icon size="48" color="var(--primary-color)">
              <AddOutline />
            </n-icon>
          </div>
        </div>
        <div class="album-info">
          <h3 class="album-title">Create New Album</h3>
          <p class="album-meta">Start organizing your photos</p>
        </div>
      </div>

      <!-- Existing Albums -->
      <div
        v-for="album in albums"
        :key="album.id"
        class="album-card"
        @click="openAlbum(album)"
      >
        <div class="album-preview">
          <div
            v-if="album.photos && album.photos.length > 0"
            class="photo-stack"
          >
            <div
              v-for="(photo, index) in album.photos.slice(0, 4)"
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
        <div class="album-info">
          <h3 class="album-title">{{ album.name || album.title }}</h3>
          <p class="album-meta">
            {{ (album.photos || []).length }} photos • Updated
            {{ formatDate(album.updatedAt) }}
          </p>
        </div>
      </div>

      <!-- Empty State (when no albums exist) -->
      <div v-if="albums.length === 0" class="empty-albums-state">
        <div class="empty-albums-content">
          <n-icon size="64" class="empty-albums-icon">
            <ImagesOutline />
          </n-icon>
          <h3 class="empty-albums-title">No albums yet</h3>
          <p class="empty-albums-description">
            Create your first album to start organizing your photos into
            beautiful collections.
          </p>
          <n-button
            type="primary"
            @click="showCreateDialog"
            class="create-album-btn"
          >
            <template #icon>
              <n-icon>
                <AddOutline />
              </n-icon>
            </template>
            Create Your First Album
          </n-button>
        </div>
      </div>
    </div>

    <!-- Create Album Dialog -->
    <n-modal
      v-model:show="createDialogVisible"
      preset="dialog"
      title="Create New Album"
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
              placeholder="Enter album name..."
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
import { ref, onMounted } from "vue";
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
import { api } from "@/utils/axios.js";
import { usePhotosStore } from "@/stores/photos.js";

const message = useMessage();
const photosStore = usePhotosStore();

// State
const createDialogVisible = ref(false);
const photosDialogVisible = ref(false);
const formRef = ref(null);
const isCreatingAlbum = ref(false);

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

// Albums data
const albums = ref([]);
const isLoadingAlbums = ref(false);

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

// Methods
// Function to assign gradient colors to photos
const assignPhotoGradients = (photos) => {
  return photos.map((photo, index) => ({
    ...photo,
    gradient: photoGradients[index % photoGradients.length],
  }));
};

// Function to load albums from API
const loadAlbums = async () => {
  isLoadingAlbums.value = true;
  try {
    const response = await api.get("/api/collections");

    // Process albums and assign gradients to photos
    albums.value = response.data.map((album) => ({
      ...album,
      photos: assignPhotoGradients(album.photos || []),
      updatedAt: new Date(album.updatedAt || album.created_at || new Date()),
    }));
  } catch (error) {
    console.error("Error loading albums:", error);
    message.error("Failed to load albums");
  } finally {
    isLoadingAlbums.value = false;
  }
};

const showCreateDialog = () => {
  formData.value = { title: "", description: "" };
  createDialogVisible.value = true;
};

const proceedToPhotoSelection = async () => {
  try {
    await formRef.value?.validate();
    // Validation passed, proceed to photo selection
    createDialogVisible.value = false;
    photosDialogVisible.value = true;
  } catch (error) {
    // Validation failed, stay in create dialog
  }
};

const onPhotosSelected = async (photoIds) => {
  if (!photoIds || photoIds.length === 0) {
    message.warning("Please select at least one photo");
    return;
  }

  isCreatingAlbum.value = true;

  try {
    const payload = {
      name: formData.value.title,
      description: formData.value.description,
      photoIds: photoIds,
    };

    const response = await api.post("/api/collections", payload);

    message.success(
      `Album "${formData.value.title}" created successfully with ${photoIds.length} photos`
    );

    // Reset form and close dialogs
    formData.value = { title: "", description: "" };
    photosDialogVisible.value = false;

    // Reload albums to show the new one
    await loadAlbums();
  } catch (error) {
    console.error("Error creating album:", error);
    message.error("Failed to create album. Please try again.");
  } finally {
    isCreatingAlbum.value = false;
  }
};

const openAlbum = (album) => {
  // TODO: Navigate to album detail view
  console.log("Opening album:", album.title);
  message.info(`Opening "${album.title}" - This will be implemented next`);
};

const formatDate = (date) => {
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24)),
    "day"
  );
};

onMounted(async () => {
  // Initialize photos store to ensure photos are available for the dialog
  await photosStore.getOrFetch();

  // Load user's albums
  await loadAlbums();
});
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

/* Albums Grid */
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

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.album-card {
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.album-card:hover {
  border-color: #2563eb;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.2);
}

.album-preview {
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
.album-card:hover .photo-item.photo-1 {
  transform: translate(-50%, -50%) rotate(-16deg) translateY(-15px) scale(1.05);
}

.album-card:hover .photo-item.photo-2 {
  transform: translate(-50%, -50%) rotate(-6deg) translateY(-10px) scale(1.03);
}

.album-card:hover .photo-item.photo-3 {
  transform: translate(-50%, -50%) rotate(6deg) translateY(-10px) scale(1.03);
}

.album-card:hover .photo-item.photo-4 {
  transform: translate(-50%, -50%) rotate(16deg) translateY(-15px) scale(1.05);
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}

.album-info {
  text-align: center;
}

.album-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.album-meta {
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

/* Empty Albums State */
.empty-albums-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  text-align: center;
}

.empty-albums-content {
  max-width: 400px;
}

.empty-albums-icon {
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-lg);
}

.empty-albums-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.empty-albums-description {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
  line-height: 1.5;
}

.create-album-btn {
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

  .albums-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .album-card {
    padding: 16px;
  }

  .album-preview {
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
  .albums-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (min-width: 1600px) {
  .albums-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
</style>
