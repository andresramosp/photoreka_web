<template>
  <div class="dashboard-container">
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
        <div class="action-card new-project">
          <div class="action-icon">
            <n-icon size="32">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                />
              </svg>
            </n-icon>
          </div>
          <h3 class="action-title">New Project</h3>
          <p class="action-description">Start a fresh project</p>
        </div>

        <div class="action-card upload-photos">
          <div class="action-icon">
            <n-icon size="32">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                />
              </svg>
            </n-icon>
          </div>
          <h3 class="action-title">Upload Photos</h3>
          <p class="action-description">Add to your library</p>
        </div>

        <div class="action-card ai-search">
          <div class="action-icon">
            <n-icon size="32">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                />
              </svg>
            </n-icon>
          </div>
          <h3 class="action-title">AI Search</h3>
          <p class="action-description">Find photos instantly</p>
        </div>

        <div class="action-card collections">
          <div class="action-icon">
            <n-icon size="32">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11.5-6L9 12.5l1.5 2L13 11l3 4H8l2.5-3zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"
                />
              </svg>
            </n-icon>
          </div>
          <h3 class="action-title">Collections</h3>
          <p class="action-description">Browse organized photos</p>
        </div>
      </div>
    </div>

    <!-- Recent Projects and Series Section -->
    <div class="recent-projects-section">
      <h2 class="section-title">Recent projects and series</h2>

      <div class="projects-grid">
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
import { useRouter } from "vue-router";

const router = useRouter();

const openProject = (projectId: string) => {
  // Navigate to project view with the specific project ID
  router.push({ name: "collections", params: { id: projectId } });
  console.log(`Opening project: ${projectId}`);
};
</script>

<style scoped>
.dashboard-container {
  @extend .view-container;
}

.welcome-section {
  margin-bottom: var(--spacing-3xl);
}

.welcome-title {
  @extend .title-primary;
}

.welcome-subtitle {
  @extend .subtitle-primary;
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
  @extend .title-secondary;
}

.actions-grid {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  transition: var(--transition-normal);
}

.action-card {
  @extend .card-base;
  @extend .card-interactive;
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

.collections .action-icon {
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
  .dashboard-container {
    padding: 0 4px;
  }

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

/* Large devices - hover effects */
@media (min-width: 1024px) {
  .action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
  }

  .projects-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
</style>
