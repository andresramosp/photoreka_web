<template>
  <div class="photoreka-logo" :class="{ 'logo-large': size === 'large' }">
    <div class="logo-icon">
      <img :src="logoName" alt="Photoreka" class="logo-image" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NIcon } from "naive-ui";
import { CameraOutline } from "@vicons/ionicons5";
import logoName from "@/assets/logo_name_sub_curation_lab.png";

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
export default {
  name: "AppLogo",
};
</script>

<style scoped>
.photoreka-logo {
  display: flex;
  align-items: center;
  opacity: 0.8;
  gap: 12px;
  color: #2563eb;
  justify-content: center;
}

.photoreka-logo.logo-large {
  gap: 16px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-image {
  height: 170px;
  width: auto;
  object-fit: contain;
}

.logo-large .logo-image {
  height: 100px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #ffffffd1;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
    sans-serif;
}

.logo-large .logo-text {
  font-size: 32px;
}

/* Animation for the camera icon */
.photoreka-logo:hover .logo-icon {
  transform: scale(1.05);
}

/* Subtle glow effect */
.logo-icon {
  filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.3));
}
</style>
