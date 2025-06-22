<template>
  <div class="dashboard-container">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <h1 class="welcome-title">Welcome back, John! 👋</h1>
      <p class="welcome-subtitle">
        Ready to organize and enhance your photos with AI-powered tools.
      </p>
    </div>

    <!-- Stats Grid -->
    <n-grid :cols="24" :x-gap="24" :y-gap="24" class="stats-grid">
      <n-grid-item :span="24" :sm="12" :md="6">
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-header">
              <span class="stat-label">Photos</span>
              <n-icon size="20" color="#3b82f6">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 7H5l3.5-4.5z"
                  />
                </svg>
              </n-icon>
            </div>
            <div class="stat-value">2,847</div>
            <div class="stat-change positive">+12% from last month</div>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="24" :sm="12" :md="6">
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-header">
              <span class="stat-label">Projects</span>
              <n-icon size="20" color="#3b82f6">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                  />
                </svg>
              </n-icon>
            </div>
            <div class="stat-value">156</div>
            <div class="stat-change positive">+8% from last month</div>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="24" :sm="12" :md="6">
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-header">
              <span class="stat-label">Collections</span>
              <n-icon size="20" color="#06b6d4">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11.5-6L9 12.5l1.5 2L13 11l3 4H8l2.5-3zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"
                  />
                </svg>
              </n-icon>
            </div>
            <div class="stat-value">23</div>
            <div class="stat-change positive">+15% from last month</div>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="24" :sm="12" :md="6">
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-header">
              <span class="stat-label">Storage</span>
              <n-icon size="20" color="#8b5cf6">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"
                  />
                </svg>
              </n-icon>
            </div>
            <div class="stat-value">89GB</div>
            <div class="stat-change positive">+5% from last month</div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- Quick Actions Section -->
    <div class="quick-actions-section">
      <h2 class="section-title">Quick Actions</h2>

      <n-grid :cols="24" :x-gap="20" :y-gap="20" class="actions-grid">
        <n-grid-item :span="24" :sm="12" :lg="6">
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
        </n-grid-item>

        <n-grid-item :span="24" :sm="12" :lg="6">
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
        </n-grid-item>

        <n-grid-item :span="24" :sm="12" :lg="6">
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
        </n-grid-item>

        <n-grid-item :span="24" :sm="12" :lg="6">
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
        </n-grid-item>
      </n-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dashboard logic here
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffffd1;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 16px;
  color: #ffffff73;
  margin: 0;
  line-height: 1.5;
}

.stats-grid {
  margin-bottom: 40px;
}

.stat-card {
  background-color: #18181c !important;
  border: 1px solid #2c2c32 !important;
  height: 100%;
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
  font-size: 24px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0 0 24px 0;
}

.actions-grid {
  margin-bottom: 24px;
}

.action-card {
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.action-card:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.action-icon {
  margin-bottom: 16px;
  color: #ffffffd1;
}

.new-project .action-icon {
  color: #22c55e;
}

.upload-photos .action-icon {
  color: #2563eb;
}

.ai-search .action-icon {
  color: #8b5cf6;
}

.collections .action-icon {
  color: #f59e0b;
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.action-description {
  font-size: 14px;
  color: #ffffff73;
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 24px;
  }

  .stat-value {
    font-size: 24px;
  }

  .action-card {
    height: 140px;
    padding: 20px;
  }

  .action-title {
    font-size: 16px;
  }
}
</style>
