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
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>

      <div class="header-right">
        <n-space>
          <n-button circle quaternary>
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-button>

          <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
            <n-button circle>
              <n-avatar
                size="small"
                :src="userAvatar"
                fallback-src="/default-avatar.png"
              >
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>
                </n-icon>
              </n-avatar>
            </n-button>
          </n-dropdown>
        </n-space>
      </div>
    </div>
  </n-layout-header>
</template>

<script setup lang="ts">
import { computed, h, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { NIcon } from "naive-ui";

const route = useRoute();
const isMobile = ref(false);

defineEmits(["toggle-mobile-menu"]);

const pageTitle = computed(() => {
  const routeName = route.name as string;
  switch (routeName) {
    case "dashboard":
      return "Dashboard";
    case "analytics":
      return "Analytics";
    case "users":
      return "Users";
    case "settings":
      return "Settings";
    default:
      return "Dashboard";
  }
});

const userAvatar = "";

const userMenuOptions = [
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
    label: "Logout",
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
  console.log("User menu selected:", key);
  if (key === "logout") {
    // Handle logout logic here
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
  background-color: #16161a !important;
  border-bottom: 1px solid #2c2c32 !important;
  padding: 0 24px;
  height: 64px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.hamburger-btn {
  margin-right: 8px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #ffffffd1;
}

.header-right {
  display: flex;
  align-items: center;
}

/* Mobile styles */
@media (max-width: 768px) {
  .header {
    margin-left: 0;
    width: 100%;
    padding: 0 16px;
  }

  .page-title {
    font-size: 18px;
  }
}
</style>
