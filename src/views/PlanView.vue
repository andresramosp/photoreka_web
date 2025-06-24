<template>
  <div class="plan-container">
    <!-- Storage Section -->
    <div class="section-container">
      <div class="section-header">
        <h2 class="title-tertiary">Storage</h2>
      </div>
      <div class="section-content">
        <n-grid
          :cols="2"
          :x-gap="32"
          :y-gap="24"
          responsive="screen"
          :collapsed-rows="2"
        >
          <!-- Storage Usage -->
          <n-grid-item>
            <div class="storage-usage">
              <div class="usage-header">
                <h3 class="usage-title">Current Usage</h3>
                <div class="usage-stats">
                  <span class="photos-count"
                    >{{ storageData.used }} /
                    {{ storageData.total }} photos</span
                  >
                  <span class="storage-percentage"
                    >{{ storagePercentage }}% used</span
                  >
                </div>
              </div>

              <!-- Pie Chart -->
              <div class="pie-chart-container">
                <div class="pie-chart">
                  <svg viewBox="0 0 42 42" class="pie-svg">
                    <circle
                      class="pie-bg"
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="var(--border-color)"
                      stroke-width="3"
                    ></circle>
                    <circle
                      class="pie-fill"
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="var(--primary-color)"
                      stroke-width="3"
                      :stroke-dasharray="`${storagePercentage} ${100 - storagePercentage}`"
                      stroke-dashoffset="25"
                    ></circle>
                  </svg>
                  <div class="pie-center">
                    <span class="pie-percentage">{{ storagePercentage }}%</span>
                  </div>
                </div>

                <div class="storage-legend">
                  <div class="legend-item">
                    <div class="legend-color used"></div>
                    <span>Used ({{ storageData.used }} photos)</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color free"></div>
                    <span
                      >Available ({{
                        storageData.total - storageData.used
                      }}
                      photos)</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </n-grid-item>

          <!-- Storage Expansion -->
          <n-grid-item>
            <div class="storage-expansion">
              <h3 class="usage-title">Expand Storage</h3>
              <p class="expansion-description">
                Need more space? Purchase additional photo storage for your
                account.
              </p>

              <div class="expansion-form">
                <n-form-item label="Additional Photos">
                  <n-select
                    v-model:value="selectedExpansion"
                    :options="expansionOptions"
                    placeholder="Select photo limit"
                    size="large"
                  />
                </n-form-item>

                <div class="expansion-price" v-if="selectedExpansion">
                  <span class="price-label">Price:</span>
                  <span class="price-amount"
                    >${{ getExpansionPrice(selectedExpansion) }}/month</span
                  >
                </div>

                <n-button
                  type="primary"
                  size="large"
                  block
                  :disabled="!selectedExpansion"
                  @click="handlePurchase"
                >
                  Purchase Storage
                </n-button>
              </div>
            </div>
          </n-grid-item>
        </n-grid>
      </div>
    </div>

    <!-- Usage Section -->
    <div class="section-container">
      <div class="section-header">
        <h2 class="title-tertiary">Usage</h2>
      </div>
      <div class="section-content">
        <!-- Usage Metrics Table -->
        <div class="usage-metrics">
          <h3 class="usage-title">Current Period Usage</h3>
          <n-table :bordered="false" :single-line="false" class="usage-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Used</th>
                <th>Limit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="metric in usageMetrics" :key="metric.feature">
                <td>{{ metric.feature }}</td>
                <td>{{ metric.used }}</td>
                <td>{{ metric.limit }}</td>
                <td>
                  <n-tag
                    :type="getUsageStatus(metric.used, metric.limit).type"
                    size="small"
                  >
                    {{ getUsageStatus(metric.used, metric.limit).text }}
                  </n-tag>
                </td>
              </tr>
            </tbody>
          </n-table>
        </div>

        <!-- Subscription Plans -->
        <div class="subscription-plans">
          <h3 class="usage-title">Subscription Plans</h3>
          <p class="plans-description">
            Choose the plan that best fits your needs. Upgrade or downgrade
            anytime.
          </p>

          <n-grid
            :cols="3"
            :x-gap="24"
            :y-gap="24"
            responsive="screen"
            :collapsed-rows="3"
          >
            <n-grid-item v-for="plan in subscriptionPlans" :key="plan.id">
              <n-card
                :class="[
                  'plan-card',
                  {
                    'plan-current': plan.id === currentPlan,
                    'plan-popular': plan.popular,
                  },
                ]"
                hoverable
              >
                <div class="plan-header">
                  <h4 class="plan-name">{{ plan.name }}</h4>
                  <div class="plan-price">
                    <span class="price-currency">$</span>
                    <span class="price-amount">{{ plan.price }}</span>
                    <span class="price-period">/month</span>
                  </div>
                  <p class="plan-description">{{ plan.description }}</p>
                </div>

                <div class="plan-features">
                  <div
                    v-for="feature in plan.features"
                    :key="feature.name"
                    class="feature-item"
                  >
                    <n-icon
                      :component="feature.included ? CheckIcon : XIcon"
                      :color="
                        feature.included
                          ? 'var(--success-color)'
                          : 'var(--text-tertiary)'
                      "
                      size="16"
                    />
                    <span :class="{ 'feature-disabled': !feature.included }">
                      {{ feature.name }}
                    </span>
                  </div>
                </div>

                <div class="plan-actions">
                  <n-button v-if="plan.id === currentPlan" block disabled>
                    Current Plan
                  </n-button>
                  <n-button
                    v-else
                    type="primary"
                    block
                    @click="handlePlanChange(plan.id)"
                  >
                    {{ plan.id === "free" ? "Downgrade" : "Upgrade" }}
                  </n-button>
                </div>
              </n-card>
            </n-grid-item>
          </n-grid>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from "vue";
import { useMessage } from "naive-ui";

// Icons (using simple SVG components)
const CheckIcon = {
  render: () =>
    h("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, [
      h("path", { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" }),
    ]),
};

const XIcon = {
  render: () =>
    h("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, [
      h("path", {
        d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
      }),
    ]),
};

const message = useMessage();

// Storage Data
const storageData = ref({
  used: 1247,
  total: 5000,
});

const storagePercentage = computed(() => {
  return Math.round((storageData.value.used / storageData.value.total) * 100);
});

// Expansion Options
const selectedExpansion = ref<number | null>(null);
const expansionOptions = [
  { label: "100 additional photos", value: 100 },
  { label: "500 additional photos", value: 500 },
  { label: "1,000 additional photos", value: 1000 },
  { label: "5,000 additional photos", value: 5000 },
];

const getExpansionPrice = (photos: number) => {
  const priceMap: Record<number, number> = {
    100: 2.99,
    500: 9.99,
    1000: 17.99,
    5000: 49.99,
  };
  return priceMap[photos] || 0;
};

// Usage Metrics
const usageMetrics = ref([
  { feature: "Heavy Queries", used: 5, limit: 20 },
  { feature: "Curations", used: 4, limit: 10 },
  { feature: "AI Descriptions", used: 20, limit: 20 },
  { feature: "Canvas Exports", used: 2, limit: 5 },
  { feature: "Collection Syncs", used: 8, limit: 50 },
  { feature: "Advanced Search", used: 12, limit: 100 },
]);

const getUsageStatus = (used: number, limit: number) => {
  const percentage = (used / limit) * 100;
  if (percentage >= 100) return { type: "error", text: "Limit Reached" };
  if (percentage >= 80) return { type: "warning", text: "Almost Full" };
  if (percentage >= 50) return { type: "info", text: "Moderate" };
  return { type: "success", text: "Available" };
};

// Subscription Plans
const currentPlan = ref("advanced");

const subscriptionPlans = ref([
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for getting started with basic photo management",
    popular: false,
    features: [
      { name: "1,000 photos storage", included: true },
      { name: "5 heavy queries/month", included: true },
      { name: "2 curations/month", included: true },
      { name: "Basic AI descriptions", included: true },
      { name: "Canvas access", included: false },
      { name: "Advanced search", included: false },
      { name: "Priority support", included: false },
      { name: "API access", included: false },
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    price: 19.99,
    description: "Great for professional photographers and content creators",
    popular: true,
    features: [
      { name: "5,000 photos storage", included: true },
      { name: "20 heavy queries/month", included: true },
      { name: "10 curations/month", included: true },
      { name: "AI descriptions unlimited", included: true },
      { name: "Canvas access", included: true },
      { name: "Advanced search", included: true },
      { name: "Priority support", included: false },
      { name: "API access", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49.99,
    description: "For teams and agencies who need unlimited access",
    popular: false,
    features: [
      { name: "Unlimited photos storage", included: true },
      { name: "Unlimited heavy queries", included: true },
      { name: "Unlimited curations", included: true },
      { name: "AI descriptions unlimited", included: true },
      { name: "Canvas access", included: true },
      { name: "Advanced search", included: true },
      { name: "Priority support", included: true },
      { name: "API access", included: true },
    ],
  },
]);

// Actions
const handlePurchase = () => {
  message.info(
    `Purchase functionality would be implemented here for ${selectedExpansion.value} photos`,
  );
};

const handlePlanChange = (planId: string) => {
  message.info(
    `Plan change functionality would be implemented here for ${planId} plan`,
  );
};
</script>

<style scoped>
.plan-container {
  padding: var(--spacing-2xl);
  margin: 0 auto;
  max-width: 1200px;
  background-color: var(--bg-body);
  min-height: calc(100vh - 112px);
}

/* Storage Section */
.storage-usage {
  height: 100%;
}

.usage-header {
  margin-bottom: var(--spacing-xl);
}

.usage-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.usage-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.photos-count {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.storage-percentage {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Pie Chart */
.pie-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.pie-chart {
  position: relative;
  width: 120px;
  height: 120px;
}

.pie-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-percentage {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.storage-legend {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-round);
}

.legend-color.used {
  background-color: var(--primary-color);
}

.legend-color.free {
  background-color: var(--border-color);
}

/* Storage Expansion */
.storage-expansion {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.expansion-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
  line-height: var(--line-height-relaxed);
}

.expansion-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.expansion-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.price-label {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.price-amount {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
}

/* Usage Metrics */
.usage-metrics {
  margin-bottom: var(--spacing-4xl);
}

.usage-table {
  background-color: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.usage-table th {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.usage-table td {
  color: var(--text-primary);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.usage-table tr:last-child td {
  border-bottom: none;
}

/* Subscription Plans */
.subscription-plans {
  margin-top: var(--spacing-4xl);
}

.plans-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
  line-height: var(--line-height-relaxed);
}

.plan-card {
  height: 100%;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  transition: var(--transition-normal);
  position: relative;
}

.plan-card.plan-popular::before {
  content: "Most Popular";
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  z-index: 1;
}

.plan-card.plan-current {
  border-color: var(--success-color);
  box-shadow:
    0 0 0 1px var(--success-color),
    var(--shadow-success);
}

.plan-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding-top: var(--spacing-lg);
}

.plan-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.price-currency {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

.price-amount {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.price-period {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.plan-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.plan-features {
  flex: 1;
  margin-bottom: var(--spacing-xl);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.feature-disabled {
  color: var(--text-tertiary);
}

.plan-actions {
  margin-top: auto;
}

/* Responsive */
@media (max-width: 1024px) {
  .plan-container {
    padding: var(--spacing-lg);
  }

  .pie-chart {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 768px) {
  .plan-container {
    padding: var(--spacing-md);
  }

  .section-content {
    padding: var(--spacing-lg);
  }

  .storage-legend {
    flex-direction: row;
    justify-content: center;
    gap: var(--spacing-lg);
  }

  .usage-table th,
  .usage-table td {
    padding: var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
}
</style>
