<template>
  <div class="dashboard-container">
    <n-grid :cols="24" :x-gap="24" :y-gap="24" class="stats-grid">
      <n-grid-item :span="24" :md="12" :lg="6">
        <n-card class="stat-card">
          <n-statistic label="Total Users" :value="1254">
            <template #prefix>
              <n-icon class="stat-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M16 4c0-1.11.89-2 2-2s2 .89 2 2s-.89 2-2 2s-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.002 3.002 0 0 0 17 6c-1.1 0-2 .9-2 2v14h2v-6h3zm-4.5-14c.83 0 1.5.67 1.5 1.5S16.33 10 15.5 10S14 9.33 14 8.5s.67-1.5 1.5-1.5zm-2.5 6c0 .83-.67 1.5-1.5 1.5S9.5 14.83 9.5 14s.67-1.5 1.5-1.5s1.5.67 1.5 1.5zM8 22v-4h2v4h2V11.5c0-.83-.67-1.5-1.5-1.5h-3C6.67 10 6 10.67 6 11.5V22h2z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="24" :md="12" :lg="6">
        <n-card class="stat-card">
          <n-statistic label="Revenue" value="$45,231">
            <template #prefix>
              <n-icon class="stat-icon success">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15c0-1.09 1.01-1.85 2.7-1.85c1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61c0 2.31 1.91 3.46 4.7 4.13c2.5.6 3 1.48 3 2.41c0 .69-.49 1.79-2.7 1.79c-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55c0-2.84-2.43-3.81-4.7-4.4z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="24" :md="12" :lg="6">
        <n-card class="stat-card">
          <n-statistic label="Orders" :value="892">
            <template #prefix>
              <n-icon class="stat-icon warning">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zM1 2v2h2l3.6 7.59l-1.35 2.45c-.16.28-.25.61-.25.96c0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="24" :md="12" :lg="6">
        <n-card class="stat-card">
          <n-statistic label="Growth" value="+23.5%">
            <template #prefix>
              <n-icon class="stat-icon success">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M16 6l2.29 2.29l-4.88 4.88l-4-4L2 16.59L3.41 18l6-6l4 4l6.3-6.29L22 12V6h-6z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid :cols="24" :x-gap="24" :y-gap="24" class="content-grid">
      <n-grid-item :span="24" :lg="12">
        <n-card title="Recent Activity" class="activity-card">
          <div class="activity-list">
            <div class="activity-item">
              <n-avatar size="small" class="activity-avatar">
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>
                </n-icon>
              </n-avatar>
              <div class="activity-content">
                <div class="activity-title">New user registered</div>
                <div class="activity-time">2 minutes ago</div>
              </div>
            </div>

            <div class="activity-item">
              <n-avatar size="small" class="activity-avatar">
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zM1 2v2h2l3.6 7.59l-1.35 2.45c-.16.28-.25.61-.25.96c0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z"
                    />
                  </svg>
                </n-icon>
              </n-avatar>
              <div class="activity-content">
                <div class="activity-title">Order #1234 completed</div>
                <div class="activity-time">15 minutes ago</div>
              </div>
            </div>

            <div class="activity-item">
              <n-avatar size="small" class="activity-avatar">
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    />
                  </svg>
                </n-icon>
              </n-avatar>
              <div class="activity-content">
                <div class="activity-title">System backup completed</div>
                <div class="activity-time">1 hour ago</div>
              </div>
            </div>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="24" :lg="12">
        <n-card title="Quick Actions" class="actions-card">
          <n-space vertical size="large">
            <n-button type="primary" size="large" block>
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                    />
                  </svg>
                </n-icon>
              </template>
              Add New User
            </n-button>

            <n-button type="info" size="large" block>
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M16 6l2.29 2.29l-4.88 4.88l-4-4L2 16.59L3.41 18l6-6l4 4l6.3-6.29L22 12V6h-6z"
                    />
                  </svg>
                </n-icon>
              </template>
              View Analytics
            </n-button>

            <n-button type="warning" size="large" block>
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6s-1.62 3.6-3.6 3.6z"
                    />
                  </svg>
                </n-icon>
              </template>
              System Settings
            </n-button>
          </n-space>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
// Dashboard logic can be added here
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.stats-grid {
  margin-bottom: 24px;
}

.stat-card {
  background-color: #18181c !important;
  border: 1px solid #2c2c32 !important;
  height: 100%;
}

.stat-icon {
  color: #18a058;
}

.stat-icon.success {
  color: #18a058;
}

.stat-icon.warning {
  color: #f0a020;
}

.activity-card,
.actions-card {
  background-color: #18181c !important;
  border: 1px solid #2c2c32 !important;
  height: 400px;
}

@media (max-width: 768px) {
  .activity-card,
  .actions-card {
    height: auto;
    min-height: 300px;
  }

  .stats-grid {
    margin-bottom: 16px;
  }

  .content-grid {
    margin-top: 16px;
  }
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #101014;
  border-radius: 8px;
  border: 1px solid #2c2c32;
}

.activity-avatar {
  background-color: #18a058 !important;
}

.activity-content {
  flex: 1;
}

.activity-title {
  color: #ffffffd1;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-time {
  color: #ffffff73;
  font-size: 12px;
}

.content-grid {
  margin-top: 24px;
}
</style>
