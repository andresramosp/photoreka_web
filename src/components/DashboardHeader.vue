<template>
  <n-layout-header bordered class="header">
    <div class="header-content">
      <div class="header-left">
        <n-button
          v-if="isMobile"
          quaternary
          circle
          class="hamburger-btn"
          @click="$emit('toggle-mobile-menu')"
        >
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
                />
              </svg>
            </n-icon>
          </template>
        </n-button>

        <div class="search-container">
          <n-input
            placeholder="Search photos, projects, collections..."
            class="search-input"
            size="medium"
            clearable
            round
          >
            <template #prefix>
              <n-icon :color="'var(--icon-tertiary)'">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-input>
        </div>
      </div>

      <div class="header-right">
        <n-space>
          <n-button circle quaternary class="header-icon-btn">
            <template #icon>
              <n-icon size="20">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-button>

          <n-button circle quaternary class="header-icon-btn">
            <template #icon>
              <n-icon size="20">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6s-1.62 3.6-3.6 3.6z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-button>

          <n-dropdown
            :options="userMenuOptions"
            @select="handleUserMenuSelect"
            trigger="click"
            placement="bottom-end"
          >
            <n-avatar
              size="small"
              class="user-avatar"
              :color="'var(--primary-color)'"
              :src="userStore.user?.avatar"
            >
              {{ userStore.user?.name?.charAt(0)?.toUpperCase() || "U" }}
            </n-avatar>
          </n-dropdown>
        </n-space>
      </div>
    </div>
  </n-layout-header>
</template>

<script setup lang="ts">
import { computed, h, ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NIcon, useMessage } from "naive-ui";
import { useUserStore } from "../stores/userStore";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const message = useMessage();
const isMobile = ref(false);

defineEmits(["toggle-mobile-menu"]);

const userMenuOptions = [
  {
    label: () =>
      h("div", { class: "user-menu-header" }, [
        h(
          "div",
          { class: "user-email-main" },
          userStore.user?.email || "user@trova.app"
        ),
      ]),
    key: "user-info",
    disabled: true,
  },
  {
    type: "divider",
  },
  {
    label: "Profile",
    key: "profile",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
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
  {
    type: "divider",
  },
  {
    label: "Log Out",
    key: "logout",
    icon: () =>
      h(NIcon, null, {
        default: () =>
          h("svg", { viewBox: "0 0 24 24" }, [
            h("path", {
              fill: "currentColor",
              d: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5l-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
            }),
          ]),
      }),
  },
];

const handleUserMenuSelect = (key: string) => {
  if (key === "logout") {
    userStore.logout();
    message.success("You have logged out successfully");
    router.push("/auth");
  } else if (key === "profile") {
    // Navigate to profile or open profile modal
    message.info("Profile feature in development");
  } else if (key === "settings") {
    router.push("/settings");
  }
};

const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkIsMobile();
  window.addEventListener("resize", checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkIsMobile);
});
</script>

<style scoped>
.header {
  background-color: var(--bg-body) !important;
  border-bottom: 1px solid var(--border-color) !important;
  padding: 0 var(--spacing-2xl);
  height: 64px;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  gap: var(--spacing-2xl);
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
  gap: var(--spacing-lg);
  min-width: 0;
}

.hamburger-btn {
  flex-shrink: 0;
}

.search-container {
  flex: 1;
  min-width: 200px;
  max-width: 800px;
}

.search-input {
  width: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--spacing-md);
}

.header-icon-btn {
  color: var(--icon-secondary);
  transition: var(--transition-fast);
  flex-shrink: 0;
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon-btn:hover {
  color: var(--text-primary);
}

.user-avatar {
  cursor: pointer;
  flex-shrink: 0;
  height: 32px !important;
  width: 32px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Remove default spacing from n-space */
.header-right :deep(.n-space) {
  gap: var(--spacing-md) !important;
  align-items: center !important;
  height: 100%;
}

.header-right :deep(.n-space > .n-space-item) {
  display: flex;
  align-items: center;
  height: 32px;
}

/* User menu styles */
:deep(.user-menu-header) {
  padding: var(--spacing-md) var(--spacing-lg);
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

:deep(.user-email-main) {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

/* Mobile styles */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .header-content {
    gap: 16px;
  }

  .search-container {
    min-width: 150px;
    max-width: none;
  }

  .search-input {
    font-size: 14px;
  }

  .header-right {
    gap: 8px;
  }

  .header-right :deep(.n-space) {
    gap: 8px !important;
    align-items: center !important;
  }

  .header-icon-btn {
    height: 28px;
    width: 28px;
  }

  .user-avatar {
    height: 28px !important;
    width: 28px !important;
  }
}
</style>
