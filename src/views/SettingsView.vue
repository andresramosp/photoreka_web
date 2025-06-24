<template>
  <div class="settings-container">
    <n-grid :cols="1" :y-gap="24">
      <n-grid-item>
        <n-card title="Account" class="settings-card">
          <n-space vertical size="large">
            <div class="setting-item">
              <div class="setting-label">Subscription Plan</div>
              <n-button type="primary" @click="goToPlan">
                Manage Plan
              </n-button>
            </div>
          </n-space>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="General Settings" class="settings-card">
          <n-space vertical size="large">
            <div class="setting-item">
              <div class="setting-label">Application Name</div>
              <n-input placeholder="Enter application name" value="Dashboard" />
            </div>

            <div class="setting-item">
              <div class="setting-label">Theme</div>
              <n-select
                :options="themeOptions"
                default-value="dark"
                placeholder="Select theme"
              />
            </div>

            <div class="setting-item">
              <div class="setting-label">Language</div>
              <n-select
                :options="languageOptions"
                default-value="en"
                placeholder="Select language"
              />
            </div>
          </n-space>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="Notifications" class="settings-card">
          <n-space vertical size="large">
            <div class="setting-item">
              <div class="setting-label">Email Notifications</div>
              <n-switch :default-value="true" />
            </div>

            <div class="setting-item">
              <div class="setting-label">Push Notifications</div>
              <n-switch :default-value="false" />
            </div>

            <div class="setting-item">
              <div class="setting-label">SMS Notifications</div>
              <n-switch :default-value="false" />
            </div>
          </n-space>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="Security" class="settings-card">
          <n-space vertical size="large">
            <div class="setting-item">
              <div class="setting-label">Two-Factor Authentication</div>
              <n-switch :default-value="false" />
            </div>

            <div class="setting-item">
              <div class="setting-label">Session Timeout (minutes)</div>
              <n-input-number :default-value="30" :min="5" :max="120" />
            </div>

            <n-button type="primary" size="large"> Save Settings </n-button>
          </n-space>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
const themeOptions = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "Auto", value: "auto" },
];

const languageOptions = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
];
</script>

<style scoped>
.settings-container {
  margin: 0 auto;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 1000px;
  justify-content: center;
}

.settings-card {
  background-color: #18181c !important;
  border: 1px solid #2c2c32 !important;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.setting-label {
  color: #ffffffd1;
  font-weight: 500;
  min-width: 200px;
}
</style>
