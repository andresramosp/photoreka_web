<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <!-- Landing Page Layout (no sidebar) -->
      <router-view v-if="route.name === 'landing'" />

      <!-- Authentication Layout -->
      <router-view v-else-if="!userStore.isAuthenticated" />

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
              <router-view v-slot="{ Component, route }">
                <KeepAlive :include="getKeepAliveComponents()">
                  <component :is="Component" :key="route.fullPath" />
                </KeepAlive>
              </router-view>
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
              <router-view v-slot="{ Component, route }">
                <KeepAlive :include="getKeepAliveComponents()">
                  <component :is="Component" :key="route.fullPath" />
                </KeepAlive>
              </router-view>
            </div>
          </div>
        </div>

        <!-- Floating Add Photos Button -->
        <FloatingAddPhotosButton />

        <!-- Onboarding Slider -->
        <OnboardingSlider
          v-model="showOnboarding"
          @finish="onOnboardingFinish"
        />
      </template>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, onMounted, onUnmounted, KeepAlive, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { darkTheme } from "naive-ui";
import { useUserStore } from "./stores/userStore";
import DashboardSidebar from "./components/DashboardSidebar.vue";
import DashboardHeader from "./components/DashboardHeader.vue";
import FloatingAddPhotosButton from "./components/FloatingAddPhotosButton.vue";
import { usePhotosStore } from "@/stores/photos.js";
import OnboardingSlider from "./components/OnboardingSlider.vue";

const photosStore = usePhotosStore();

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// KeepAlive functionality
const getKeepAliveComponents = () => {
  return ["CurationView"]; // Add more component names here as needed
};

const themeOverrides = {
  common: {
    primaryColor: "#2563eb",
    primaryColorHover: "#3b82f6",
    primaryColorPressed: "#1d4ed8",
    primaryColorSuppl: "#2563eb",
  },
  Button: {
    // colorWarning: "var(--secondary-color)",
    // colorWarningHover: "var(--secondary-color-hover)",
    // colorWarningPressed: "var(--secondary-color-pressed)",
    // colorWarningSuppl: "var(--secondary-color)",
    // textColorWarning: "#fff", // Asegura buen contraste
    // textColorWarningHover: "#fff",
    // textColorWarningPressed: "#fff",
    // borderWarning: "var(--secondary-color)",
    // borderWarningHover: "var(--secondary-color-hover)",
    // borderWarningPressed: "var(--secondary-color-pressed)",
  },
};

const mobileMenuOpen = ref(false);
const isMobile = ref(false);

// Mostrar onboarding solo la primera vez que el usuario entra
const showOnboarding = ref(false);

// Chequea si el onboarding ya fue mostrado para este usuario
const checkShowOnboarding = () => {
  // Si el usuario no está autenticado, no mostrar
  if (!userStore.isAuthenticated) {
    showOnboarding.value = false;
    return;
  }
  // Usa el id del usuario para guardar la preferencia por usuario
  const userId = userStore.user?.id;
  if (!userId) {
    showOnboarding.value = false;
    return;
  }
  const onboardingKey = `onboarding_shown_${userId}`;
  showOnboarding.value = localStorage.getItem(onboardingKey) !== "true";
};

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
  // Espera a que el usuario esté autenticado antes de cargar las fotos
  if (userStore.isAuthenticated) {
    photosStore.getOrFetch(true);
    checkShowOnboarding();
  }
});

// Watcher para cargar fotos cuando el usuario se autentica
watch(
  () => userStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      photosStore.getOrFetch(true);
      checkShowOnboarding();
    } else {
      showOnboarding.value = false;
    }
  }
);

// Watcher para cuando el usuario esté disponible tras login/refresh
watch(
  () => userStore.user?.id,
  (userId) => {
    if (userStore.isAuthenticated && userId) {
      checkShowOnboarding();
    }
  }
);

onUnmounted(() => {
  window.removeEventListener("resize", checkIsMobile);
});

const onOnboardingFinish = () => {
  showOnboarding.value = false;
  // Guarda en localStorage que el onboarding ya fue mostrado para este usuario
  const userId = userStore.user?.id;
  if (userId) {
    const onboardingKey = `onboarding_shown_${userId}`;
    localStorage.setItem(onboardingKey, "true");
  }
  // TODO: Si en el futuro se guarda en backend, hacer petición aquí
  console.log("Onboarding completed!");
};
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #101014;
}

#app {
  height: 100vh;
}
</style>
