<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-content">
        <div class="auth-header">
          <TrovaLogo size="large" />
          <p class="auth-subtitle">Your photo management platform</p>
        </div>

        <div class="auth-form-container">
          <slot />
        </div>

        <div class="auth-footer">
          <p class="footer-text">© 2024 Trova. All rights reserved.</p>
        </div>
      </div>
    </div>

    <!-- Background decoration -->
    <div class="auth-background">
      <div class="bg-pattern"></div>
      <div class="bg-gradient"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TrovaLogo from "./TrovaLogo.vue";
</script>

<style scoped>
.auth-layout {
  width: 100vw;
  height: 100vh;
  background-color: #101014;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.auth-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-content {
  background-color: #1a1a1f;
  border-radius: 16px;
  border: 1px solid #2c2c32;
  padding: 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: 16px;
}

.auth-subtitle {
  margin: 16px 0 0 0;
  font-size: 16px;
  color: #ffffff73;
  font-weight: 400;
}

.auth-form-container {
  margin-bottom: 12px;
}

.auth-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #2c2c32;
}

.footer-text {
  margin: 0;
  font-size: 12px;
  color: #ffffff40;
}

/* Background decoration */
.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(
      circle at 25% 25%,
      rgba(37, 99, 235, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 75% 75%,
      rgba(139, 92, 246, 0.1) 0%,
      transparent 50%
    );
  background-size:
    800px 800px,
    600px 600px;
  background-position:
    0 0,
    200px 200px;
  animation: float 20s infinite ease-in-out;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    rgba(37, 99, 235, 0.05) 0%,
    transparent 70%
  );
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(1deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(-1deg);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .auth-layout {
    padding: 16px;
  }

  .auth-content {
    padding: 28px 24px;
    border-radius: 12px;
  }

  .auth-header {
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .auth-layout {
    padding: 12px;
  }

  .auth-content {
    padding: 24px 20px;
    border-radius: 8px;
    border: none;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }

  .auth-header {
    margin-bottom: 16px;
  }
}

/* Animation for content entrance */
.auth-content {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
