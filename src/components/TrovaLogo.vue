<template>
  <div class="trova-logo" :class="{ 'logo-large': size === 'large' }">
    <div class="logo-icon">
      <svg
        :width="iconSize"
        :height="iconSize"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Stylized camera/lens icon for Trova -->
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        />
        <circle
          cx="24"
          cy="24"
          r="12"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        />
        <circle cx="24" cy="24" r="6" fill="currentColor" />
        <!-- Flash/spark elements -->
        <path
          d="M8 24L12 20M8 24L12 28M40 24L36 20M40 24L36 28M24 8L20 12M24 8L28 12M24 40L20 36M24 40L28 36"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <span class="logo-text" v-if="showText">Trova</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: "normal" | "large";
  showText?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "normal",
  showText: true,
});

const iconSize = computed(() => {
  return props.size === "large" ? 48 : 32;
});
</script>

<script lang="ts">
import { computed } from "vue";

export default {
  name: "TrovaLogo",
};
</script>

<style scoped>
.trova-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2563eb;
}

.trova-logo.logo-large {
  gap: 16px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #ffffffd1;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.logo-large .logo-text {
  font-size: 32px;
}

/* Animation for the camera icon */
.logo-icon svg {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.trova-logo:hover .logo-icon svg {
  transform: scale(1.05);
}

/* Subtle glow effect */
.logo-icon svg circle:last-of-type {
  filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.3));
}
</style>
