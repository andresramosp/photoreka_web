<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <!-- Authentication Layout -->
      <router-view v-if="!userStore.isAuthenticated" />

      <!-- Profile Setup Layout (authenticated but special case) -->
      <router-view
        v-else-if="
          route.name === 'profile-setup' || route.name === 'storage-plan-setup'
        "
      />

      <!-- Authenticated App Layout -->
      <template v-else>
        <!-- Desktop Layout -->
        <n-layout
          v-if="!isMobile"
          has-sider
          style="height: 100vh"
          class="app-layout"
        >
          <DashboardSidebar />
          <n-layout class="main-layout">
            <DashboardHeader />
            <n-layout-content class="main-content">
              <router-view />
            </n-layout-content>
          </n-layout>
        </n-layout>

        <!-- Mobile Layout -->
        <div v-else class="mobile-layout">
          <!-- Mobile sidebar overlay - completely separate from layout -->
          <DashboardSidebar
            :mobile-menu-open="mobileMenuOpen"
            @close-mobile-menu="mobileMenuOpen = false"
          />

          <!-- Main mobile content -->
          <div class="mobile-content">
            <DashboardHeader @toggle-mobile-menu="toggleMobileMenu" />
            <div class="main-content mobile-main-content">
              <router-view />
            </div>
          </div>
        </div>
      </template>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { darkTheme } from "naive-ui";
import type { GlobalThemeOverrides } from "naive-ui";
import { useUserStore } from "./stores/userStore";
import DashboardSidebar from "./components/DashboardSidebar.vue";
import DashboardHeader from "./components/DashboardHeader.vue";

const route = useRoute();
const userStore = useUserStore();

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#2563eb",
    primaryColorHover: "#3b82f6",
    primaryColorPressed: "#1d4ed8",
    primaryColorSuppl: "#2563eb",
  },
};

const mobileMenuOpen = ref(false);
const isMobile = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    mobileMenuOpen.value = false;
  }
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
.app-layout {
  position: relative;
}

.main-layout {
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
}

.main-content {
  background-color: #101014;
  height: calc(100vh - 64px);
  overflow: hidden;
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile layout styles */
.mobile-layout {
  position: relative;
  height: 100vh;
  background-color: #101014;
}

.mobile-content {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.mobile-main-content {
  flex: 1;
  overflow: auto;
  background-color: #101014;
  height: calc(100vh - 64px);
}

/* Responsive styles - padding removed for full canvas expansion */
</style>

<style>
body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",
    "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #101014;
}

#app {
  height: 100vh;
}
</style>
