<template>
  <div class="empty-view">
    <div class="empty-content">
      <n-icon size="64" color="#6b7280">
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0a9 9 0 0118 0z"
          />
        </svg>
      </n-icon>
      <h2 class="empty-title">Photo Hub</h2>
      <p class="empty-description">Photo Hub view coming soon...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Photo Hub logic here
</script>

<style scoped>
.empty-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 16px 0 8px 0;
}

.empty-description {
  font-size: 16px;
  color: #ffffff73;
  margin: 0;
}
</style>
