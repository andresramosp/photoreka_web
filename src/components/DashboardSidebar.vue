<template>
  <!-- Mobile overlay version -->
  <div v-if="isMobile" class="mobile-sidebar-container">
    <!-- Mobile overlay backdrop -->
    <div
      v-if="props.mobileMenuOpen"
      class="mobile-overlay"
      @click="emit('close-mobile-menu')"
    ></div>

    <!-- Mobile sidebar -->
    <div v-if="props.mobileMenuOpen" class="mobile-sidebar">
      <div class="logo-container">
        <div class="logo">
          <n-icon size="28" color="#18a058">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2L2 7l10 5l10-5l-10-5zM2 17l10 5l10-5M2 12l10 5l10-5"
              />
            </svg>
          </n-icon>
          <span class="logo-text">Dashboard</span>
        </div>
      </div>

      <n-menu
        :collapsed="false"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
        class="sidebar-menu"
      />
    </div>
  </div>

  <!-- Desktop version -->
  <n-layout-sider
    v-else
    bordered
    collapse-mode="width"
    :collapsed-width="64"
    :width="240"
    :collapsed="collapsed"
    class="sidebar"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="logo-container">
      <div class="logo">
        <n-icon size="28" color="#18a058">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2L2 7l10 5l10-5l-10-5zM2 17l10 5l10-5M2 12l10 5l10-5"
            />
          </svg>
        </n-icon>
        <span v-if="!collapsed" class="logo-text">Dashboard</span>
      </div>
    </div>

    <n-menu
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
      :value="activeKey"
      @update:value="handleMenuSelect"
      class="sidebar-menu"
    />
  </n-layout-sider>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { NIcon } from "naive-ui";
import type { MenuOption } from "naive-ui";

const router = useRouter();
const route = useRoute();
const collapsed = ref(true); // Default collapsed (showing only icons)
const isMobile = ref(window.innerWidth < 768); // Initialize immediately

const props = defineProps<{
  mobileMenuOpen?: boolean;
}>();

const emit = defineEmits(["close-mobile-menu"]);

const activeKey = computed(() => route.name as string);

const renderIcon = (icon: string) => {
  return () => h(NIcon, null, { default: () => h("i", { class: icon }) });
};

const menuOptions: MenuOption[] = [
  {
    label: "Dashboard",
    key: "dashboard",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
            }),
          ]),
      }),
  },
  {
    label: "Analytics",
    key: "analytics",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M16 6l2.29 2.29l-4.88 4.88l-4-4L2 16.59L3.41 18l6-6l4 4l6.3-6.29L22 12V6h-6z",
            }),
          ]),
      }),
  },
  {
    label: "Users",
    key: "users",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M16 4c0-1.11.89-2 2-2s2 .89 2 2s-.89 2-2 2s-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.002 3.002 0 0 0 17 6c-1.1 0-2 .9-2 2v14h2v-6h3zm-4.5-14c.83 0 1.5.67 1.5 1.5S16.33 10 15.5 10S14 9.33 14 8.5s.67-1.5 1.5-1.5zm-2.5 6c0 .83-.67 1.5-1.5 1.5S9.5 14.83 9.5 14s.67-1.5 1.5-1.5s1.5.67 1.5 1.5zM8 22v-4h2v4h2V11.5c0-.83-.67-1.5-1.5-1.5h-3C6.67 10 6 10.67 6 11.5V22h2z",
            }),
          ]),
      }),
  },
  {
    label: "Settings",
    key: "settings",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6s-1.62 3.6-3.6 3.6z",
            }),
          ]),
      }),
  },
];

const handleMenuSelect = (key: string) => {
  router.push({ name: key });
  // On mobile, close menu after selection
  if (isMobile.value) {
    emit("close-mobile-menu");
  }
};

const handleMouseEnter = () => {
  if (!isMobile.value) {
    collapsed.value = false;
  }
};

const handleMouseLeave = () => {
  if (!isMobile.value) {
    collapsed.value = true;
  }
};

const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 768;
  // On mobile, keep collapsed by default and close mobile menu
  if (isMobile.value) {
    collapsed.value = true;
    emit("close-mobile-menu");
  }
};

onMounted(() => {
  window.addEventListener("resize", checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkIsMobile);
});
</script>

<style scoped>
.sidebar {
  background-color: #16161a !important;
  border-right: 1px solid #2c2c32 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  z-index: 100 !important;
}

.logo-container {
  padding: 24px 16px;
  border-bottom: 1px solid #2c2c32;
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #ffffffd1;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-menu {
  margin-top: 8px;
}

/* Mobile sidebar container */
.mobile-sidebar-container {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.mobile-sidebar-container > * {
  pointer-events: auto;
}

/* Mobile overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Mobile sidebar */
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background-color: #16161a;
  border-right: 1px solid #2c2c32;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    left: -240px;
  }
  to {
    left: 0;
  }
}
</style>
