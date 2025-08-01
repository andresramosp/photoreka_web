<template>
  <AuthLayout>
    <div class="auth-tabs">
      <div class="tab-buttons">
        <button
          class="tab-button primary-tab"
          :class="{ active: currentMode === 'register' }"
          @click="currentMode = 'register'"
        >
          Sign Up
        </button>
        <button
          class="tab-button secondary-tab"
          :class="{ active: currentMode === 'login' }"
          @click="currentMode = 'login'"
        >
          Log In
        </button>
      </div>

      <div class="tab-content">
        <Transition name="slide" mode="out-in">
          <RegisterForm
            v-if="currentMode === 'register'"
            @switch-mode="handleSwitchMode"
          />
          <LoginForm v-else @switch-mode="handleSwitchMode" />
        </Transition>
      </div>
    </div>

    <!-- Mobile Notice Dialog -->
    <MobileNoticeDialog
      v-model:show="showMobileNotice"
      @goHome="onMobileNoticeGoHome"
    />
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthLayout from "../components/AuthLayout.vue";
import LoginForm from "../components/LoginForm.vue";
import RegisterForm from "../components/RegisterForm.vue";
import MobileNoticeDialog from "../components/MobileNoticeDialog.vue";
import { isMobileDevice } from "../utils/utils.js";

type AuthMode = "login" | "register";

const currentMode = ref<AuthMode>("register");
const showMobileNotice = ref(false);
const route = useRoute();
const router = useRouter();

const handleSwitchMode = (mode: AuthMode) => {
  currentMode.value = mode;
};

// Set currentMode from query param on mount and when route changes
const setModeFromQuery = () => {
  const mode = route.query.mode;
  if (mode === "login" || mode === "register") {
    currentMode.value = mode as AuthMode;
  }
};

const onMobileNoticeGoHome = () => {
  // User wants to go back to landing page
  router.push("/");
};

// Check for mobile device on mount
const checkMobileDevice = () => {
  if (isMobileDevice()) {
    showMobileNotice.value = true;
  }
};

onMounted(() => {
  setModeFromQuery();
  checkMobileDevice();
});

watch(() => route.query.mode, setModeFromQuery);
</script>

<style scoped>
.auth-tabs {
  width: 100%;
}

.tab-buttons {
  display: flex;
  background-color: #2c2c32;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 16px;
}

.tab-button {
  flex: 1;
  padding: 10px 20px;
  background: none;
  border: none;
  color: #ffffff73;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-button:hover {
  color: #ffffffd1;
}

.tab-button.active {
  background-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.primary-tab {
  font-weight: 600;
}

.primary-tab.active {
  background-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.secondary-tab {
  font-weight: 400;
  opacity: 0.8;
}

.secondary-tab.active {
  background-color: #374151;
  color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-content {
  position: relative;
  overflow: hidden;
}

/* Transition animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .tab-buttons {
    margin-bottom: 24px;
  }

  .tab-button {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>
