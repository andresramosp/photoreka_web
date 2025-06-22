<template>
  <div class="empty-view">
    <div class="empty-content">
      <n-icon size="64" color="#6b7280">
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
          />
        </svg>
      </n-icon>
      <h2 class="empty-title">Search</h2>
      <p class="empty-description">Search view coming soon...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Search logic here
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
