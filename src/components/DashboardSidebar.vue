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
          <div class="logo-icon">
            <n-icon size="28" color="#2563eb">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0a9 9 0 0118 0z"
                />
              </svg>
            </n-icon>
          </div>
          <div class="logo-text">
            <div class="app-name">Trova</div>
            <div class="app-subtitle">Photo Management</div>
          </div>
        </div>
      </div>

      <!-- First Menu Section: Dashboard, Photo Hub, Collections -->
      <n-menu
        :collapsed="false"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="firstSectionOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
        class="sidebar-menu"
      />

      <!-- First Divider -->
      <div class="menu-divider"></div>

      <!-- Second Menu Section: Search, Canvas, Curation -->
      <n-menu
        :collapsed="false"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="secondSectionOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
        class="sidebar-menu"
      />

      <!-- Second Divider -->
      <div class="menu-divider"></div>

      <!-- Third Menu Section: Settings, Help -->
      <n-menu
        :collapsed="false"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="thirdSectionOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
        class="sidebar-menu"
      />

      <!-- User Profile Section -->
      <div class="user-profile-section">
        <div class="user-profile">
          <n-avatar size="small" class="user-avatar" color="#2563eb">
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
            </n-icon>
          </n-avatar>
          <div class="user-info">
            <div class="user-name">John Doe</div>
            <div class="user-email">john@example.com</div>
          </div>
          <n-button quaternary circle size="small" class="logout-btn">
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5l-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
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
    <div class="sidebar-content">
      <div class="logo-container">
        <div class="logo">
          <div class="logo-icon">
            <n-icon size="28" color="#2563eb">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0a9 9 0 0118 0z"
                />
              </svg>
            </n-icon>
          </div>
          <div v-if="!collapsed" class="logo-text">
            <div class="app-name">Trova</div>
            <div class="app-subtitle">Photo Management</div>
          </div>
        </div>
      </div>

      <!-- First Menu Section: Dashboard, Photo Hub, Collections -->
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="firstSectionOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
        class="sidebar-menu"
      />

      <!-- First Divider -->
      <div class="menu-divider" :class="{ collapsed }"></div>

      <!-- Second Menu Section: Search, Canvas, Curation -->
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="secondSectionOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
        class="sidebar-menu"
      />

      <!-- Second Divider -->
      <div class="menu-divider" :class="{ collapsed }"></div>

      <!-- Third Menu Section: Settings, Help -->
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="thirdSectionOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
        class="sidebar-menu"
      />

      <!-- User Profile Section -->
      <div class="user-profile-section" :class="{ collapsed }">
        <div class="user-profile">
          <n-avatar size="small" class="user-avatar" color="#2563eb">
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
            </n-icon>
          </n-avatar>
          <div v-if="!collapsed" class="user-info">
            <div class="user-name">John Doe</div>
            <div class="user-email">john@example.com</div>
          </div>
          <n-button
            v-if="!collapsed"
            quaternary
            circle
            size="small"
            class="logout-btn"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5l-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </div>
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

// First section: Dashboard, Photo Hub, Collections
const firstSectionOptions: MenuOption[] = [
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
    label: "Photo Hub",
    key: "photo-hub",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M9 12l2 2l4-4m6 2a9 9 0 11-18 0a9 9 0 0118 0z",
            }),
          ]),
      }),
  },
  {
    label: "Collections",
    key: "collections",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11.5-6L9 12.5l1.5 2L13 11l3 4H8l2.5-3zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z",
            }),
          ]),
      }),
  },
];

// Second section: Search, Canvas, Curation
const secondSectionOptions: MenuOption[] = [
  {
    label: "Search",
    key: "search",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z",
            }),
          ]),
      }),
  },
  {
    label: "Canvas",
    key: "canvas",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19l3.5-4.5l2.5 3.01L14.5 12l4.5 7H5z",
            }),
          ]),
      }),
  },
  {
    label: "Curation",
    key: "curation",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19l3.5-4.5l2.5 3.01L14.5 12l4.5 7H5zm9-12c.83 0 1.5-.67 1.5-1.5S14.83 4 14 4s-1.5.67-1.5 1.5S13.17 7 14 7z",
            }),
          ]),
      }),
  },
];

// Third section: Settings, Help
const thirdSectionOptions: MenuOption[] = [
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
  {
    label: "Help",
    key: "help",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41c0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z",
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
  overflow: hidden !important;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.logo-container {
  padding: 0 16px;
  border-bottom: 1px solid #2c2c32;
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 64px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(37, 99, 235, 0.1);
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.logo-icon:hover {
  background-color: rgba(37, 99, 235, 0.15);
}

.logo-text {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  overflow: hidden;
  min-width: 0;
}

.app-name {
  font-size: 18px;
  font-weight: 600;
  color: #ffffffd1;
  line-height: 1.2;
  white-space: nowrap;
}

.app-subtitle {
  font-size: 12px;
  font-weight: 400;
  color: #ffffff73;
  line-height: 1.2;
  white-space: nowrap;
}

.sidebar-menu {
  margin-top: 8px;
}

.menu-divider {
  margin: 16px 20px;
  height: 1px;
  background-color: #2c2c32;
  transition: margin 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-divider.collapsed {
  margin: 16px 12px;
}

.user-profile-section {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid #2c2c32;
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile-section.collapsed {
  padding: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-profile-section.collapsed .user-profile {
  justify-content: center;
  width: auto;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.user-avatar {
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  line-height: 1.2;
  margin-bottom: 2px;
}

.user-email {
  font-size: 12px;
  color: #ffffff73;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  flex-shrink: 0;
  color: #9ca3af;
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
  display: flex;
  flex-direction: column;
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
