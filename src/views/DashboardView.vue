<template>
  <div class="dashboard-container view-container">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <h1 class="welcome-title">Welcome back, John! 👋</h1>
      <p class="welcome-subtitle">
        Ready to organize and enhance your photos with AI-powered tools.
      </p>
    </div>

    <!-- Quick Actions Section -->
    <div class="quick-actions-section">
      <h2 class="section-title">Quick Actions</h2>

      <div class="actions-grid">
        <div class="action-card upload-photos" :class="{ disabled: false }">
          <div class="action-icon">
            <n-icon size="32">
              <ArrowUpIcon />
            </n-icon>
          </div>
          <h3 class="action-title">Upload Photos</h3>
          <p class="action-description">Add to your library</p>
        </div>

        <div class="action-card new-project" :class="{ disabled: !canUseApp }">
          <div class="action-icon">
            <n-icon size="32">
              <AddIcon />
            </n-icon>
          </div>
          <h3 class="action-title">New Curation</h3>
          <p class="action-description">Start a fresh project</p>
        </div>

        <div
          class="action-card catalog"
          :class="{ disabled: !canUseApp }"
          @click="goToCatalog"
        >
          <div class="action-icon">
            <n-icon size="32">
              <PhotoHubIcon />
            </n-icon>
          </div>
          <h3 class="action-title">Catalog</h3>
          <p class="action-description">Browse your photo catalog</p>
        </div>

        <div class="action-card ai-search" :class="{ disabled: false }">
          <div class="action-icon">
            <n-icon size="32">
              <SettingsIcon />
            </n-icon>
          </div>
          <h3 class="action-title">Manage Plan</h3>
          <p class="action-description">Get more space or usage</p>
        </div>
      </div>
    </div>

    <!-- Recent Projects and Series Section -->
    <div class="recent-projects-section">
      <h2 class="section-title">Recent projects and series</h2>

      <!-- Empty state when can't use app OR no projects available -->
      <div v-if="!canUseApp" class="empty-state">
        <div class="empty-state-icon">
          <n-icon size="64" color="var(--text-tertiary)">
            <CollectionsIcon />
          </n-icon>
        </div>
        <h3 class="empty-state-title">Nothing here yet</h3>
        <p class="empty-state-description">
          Upload and process more photos to start creating collections and
          projects.
        </p>
      </div>

      <div v-else class="projects-grid">
        <div class="project-card" @click="openProject('summer-vacation')">
          <div class="project-preview">
            <div class="photo-stack">
              <div class="photo-item photo-1">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #667eea 0%,
                      #764ba2 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-2">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #f093fb 0%,
                      #f5576c 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-3">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #4facfe 0%,
                      #00f2fe 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-4">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #43e97b 0%,
                      #38f9d7 100%
                    );
                  "
                ></div>
              </div>
            </div>
          </div>
          <div class="project-info">
            <h3 class="project-title">Summer Vacation 2024</h3>
            <p class="project-meta">124 photos • Last updated 2 days ago</p>
          </div>
        </div>

        <div class="project-card" @click="openProject('wedding-series')">
          <div class="project-preview">
            <div class="photo-stack">
              <div class="photo-item photo-1">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #ffecd2 0%,
                      #fcb69f 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-2">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #a8edea 0%,
                      #fed6e3 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-3">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #d299c2 0%,
                      #fef9d7 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-4">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #89f7fe 0%,
                      #66a6ff 100%
                    );
                  "
                ></div>
              </div>
            </div>
          </div>
          <div class="project-info">
            <h3 class="project-title">Wedding Series</h3>
            <p class="project-meta">89 photos • Last updated 1 week ago</p>
          </div>
        </div>

        <div class="project-card" @click="openProject('nature-photography')">
          <div class="project-preview">
            <div class="photo-stack">
              <div class="photo-item photo-1">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #667eea 0%,
                      #764ba2 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-2">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #ff9a9e 0%,
                      #fecfef 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-3">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #a8edea 0%,
                      #fed6e3 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-4">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #fad0c4 0%,
                      #ffd1ff 100%
                    );
                  "
                ></div>
              </div>
            </div>
          </div>
          <div class="project-info">
            <h3 class="project-title">Nature Photography</h3>
            <p class="project-meta">267 photos • Last updated 3 days ago</p>
          </div>
        </div>

        <div class="project-card" @click="openProject('street-photography')">
          <div class="project-preview">
            <div class="photo-stack">
              <div class="photo-item photo-1">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #667eea 0%,
                      #764ba2 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-2">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #f093fb 0%,
                      #f5576c 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-3">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #4facfe 0%,
                      #00f2fe 100%
                    );
                  "
                ></div>
              </div>
              <div class="photo-item photo-4">
                <div
                  class="photo-placeholder"
                  style="
                    background: linear-gradient(
                      135deg,
                      #43e97b 0%,
                      #38f9d7 100%
                    );
                  "
                ></div>
              </div>
            </div>
          </div>
          <div class="project-info">
            <h3 class="project-title">Street Photography</h3>
            <p class="project-meta">56 photos • Last updated 5 days ago</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { usePhotosStore } from "@/stores/photos.js";

// Import @vicons icons from ionicons5 for reliability
import {
  CloudUploadOutline as ArrowUpIcon,
  AddOutline as AddIcon,
  FolderOpenOutline as CollectionsIcon,
  ImageOutline as PhotoHubIcon,
  SettingsOutline as SettingsIcon,
} from "@vicons/ionicons5";

const router = useRouter();
const photosStore = usePhotosStore();

const canUseApp = computed(() => photosStore.canUseApp);

const openProject = (projectId: string) => {
  // Navigate to project view with the specific project ID
  router.push({ name: "collections", params: { id: projectId } });
  console.log(`Opening project: ${projectId}`);
};

const goToCatalog = () => {
  // Navigate to photo-hub with catalog tab active
  router.push({ name: "photo-hub", hash: "#catalog" });
};
</script>

<style scoped>
.dashboard-container {
  padding: var(--spacing-2xl);
  margin: 0 auto;
  background-color: var(--bg-body);
  min-height: 100vh;
}

.welcome-section {
  margin-bottom: var(--spacing-3xl);
}

.welcome-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: var(--line-height-tight);
}

.welcome-subtitle {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.stats-grid {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-4xl);
  transition: var(--transition-normal);
}

.stat-card {
  background-color: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  flex: 1;
  transition: var(--transition-normal);
  min-height: 120px;
}

.stat-content {
  padding: 4px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 14px;
  color: #ffffff73;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #ffffffd1;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: #22c55e;
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2xl) 0;
  line-height: var(--line-height-tight);
}

.actions-grid {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  transition: var(--transition-normal);
}

.action-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
  cursor: pointer;
  padding: var(--spacing-2xl);
  text-align: center;
  height: 160px;
  min-height: 160px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.action-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-primary);
  transform: translateY(-2px);
}

.action-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.action-card.disabled:hover {
  border-color: var(--border-color);
  box-shadow: none;
  transform: none;
}

.action-icon {
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.new-project .action-icon {
  color: var(--success-color);
}

.upload-photos .action-icon {
  color: var(--primary-color);
}

.ai-search .action-icon {
  color: var(--secondary-color);
}

.catalog .action-icon {
  color: var(--warning-color);
}

.action-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: var(--line-height-tight);
}

.action-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-normal);
}

/* Mobile devices - stack vertically when too narrow */
@media (max-width: 768px) {
  .stats-grid {
    flex-direction: column;
    gap: 16px;
  }

  .actions-grid {
    flex-direction: column;
    gap: 16px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }

  .stat-value {
    font-size: 24px;
  }

  .action-card {
    height: 140px;
    padding: 20px;
    min-height: 140px;
  }

  .action-title {
    font-size: 16px;
  }
}

/* Very small screens - even more compact */
@media (max-width: 480px) {
  .welcome-title {
    font-size: 20px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 12px;
  }

  .stat-change {
    font-size: 10px;
  }

  .action-card {
    height: 120px;
    padding: 16px;
    min-height: 120px;
  }

  .action-title {
    font-size: 14px;
  }

  .action-description {
    font-size: 12px;
  }

  .section-title {
    font-size: 20px;
  }
}

/* Tablet and up - ensure horizontal layout */
@media (min-width: 768px) {
  .stats-grid {
    flex-direction: row;
  }

  .actions-grid {
    flex-direction: row;
  }
}

/* Recent Projects Section */
.recent-projects-section {
  margin-top: 48px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.project-card {
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.project-card:hover {
  border-color: #2563eb;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.2);
}

.project-preview {
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
.project-card:hover .photo-item.photo-1 {
  transform: translate(-50%, -50%) rotate(-16deg) translateY(-15px) scale(1.05);
}

.project-card:hover .photo-item.photo-2 {
  transform: translate(-50%, -50%) rotate(-6deg) translateY(-10px) scale(1.03);
}

.project-card:hover .photo-item.photo-3 {
  transform: translate(-50%, -50%) rotate(6deg) translateY(-10px) scale(1.03);
}

.project-card:hover .photo-item.photo-4 {
  transform: translate(-50%, -50%) rotate(16deg) translateY(-15px) scale(1.05);
}

.project-info {
  text-align: center;
}

.project-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.project-meta {
  font-size: 14px;
  color: #ffffff73;
  margin: 0;
  line-height: 1.4;
}

/* Mobile adjustments for projects */
@media (max-width: 768px) {
  .recent-projects-section {
    margin-top: 32px;
  }

  .projects-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .project-card {
    padding: 16px;
  }

  .project-preview {
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

  .project-title {
    font-size: 16px;
  }

  .project-meta {
    font-size: 12px;
  }
}

/* Tablet adjustments */
@media (min-width: 768px) and (max-width: 1024px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: var(--spacing-4xl) var(--spacing-2xl);
  text-align: center;
  min-height: 300px;
  align-content: center;
  align-items: center;
}

.empty-state-icon {
  margin-bottom: var(--spacing-xl);
}

.empty-state-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  line-height: var(--line-height-tight);
}

.empty-state-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
  max-width: 400px;
}

/* Large devices - hover effects */
@media (min-width: 1024px) {
  .action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
  }

  .action-card.disabled:hover {
    transform: none;
    box-shadow: none;
  }

  .projects-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
</style>
