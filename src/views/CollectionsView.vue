<template>
  <div class="empty-view">
    <div class="empty-content">
      <n-icon size="64" color="#6b7280">
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11.5-6L9 12.5l1.5 2L13 11l3 4H8l2.5-3zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"
          />
        </svg>
      </n-icon>
      <h2 class="empty-title">Collections</h2>
      <p class="empty-description">Collections view coming soon...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Collections logic here
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
