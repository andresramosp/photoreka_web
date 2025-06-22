<template>
  <div class="analytics-container">
    <n-card title="Analytics Overview" class="analytics-card">
      <n-space vertical size="large">
        <n-grid :cols="3" :x-gap="24">
          <n-grid-item>
            <n-statistic label="Page Views" :value="12543">
              <template #suffix>
                <n-tag type="success">+12%</n-tag>
              </template>
            </n-statistic>
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="Unique Visitors" :value="8932">
              <template #suffix>
                <n-tag type="info">+8%</n-tag>
              </template>
            </n-statistic>
          </n-grid-item>
          <n-grid-item>
            <n-statistic label="Bounce Rate" value="23.5%">
              <template #suffix>
                <n-tag type="warning">-3%</n-tag>
              </template>
            </n-statistic>
          </n-grid-item>
        </n-grid>

        <div class="chart-placeholder">
          <div class="chart-title">Traffic Overview</div>
          <div class="chart-content">
            📊 Chart placeholder - Integration with charting library needed
          </div>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
// Analytics logic here
</script>

<style scoped>
.analytics-container {
  max-width: 1200px;
  margin: 0 auto;
}

.analytics-card {
  background-color: #18181c !important;
  border: 1px solid #2c2c32 !important;
}

.chart-placeholder {
  background-color: #101014;
  border: 1px solid #2c2c32;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
}

.chart-title {
  color: #ffffffd1;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.chart-content {
  color: #ffffff73;
  font-size: 14px;
}
</style>
