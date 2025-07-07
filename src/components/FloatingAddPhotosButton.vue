<template>
  <Teleport to="body">
    <Transition name="fab">
      <n-button
        v-if="shouldShow"
        type="primary"
        size="large"
        circle
        class="floating-add-button"
        @click="handleClick"
      >
        <template #icon>
          <n-icon size="24">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
              />
            </svg>
          </n-icon>
        </template>
      </n-button>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// Define las rutas donde NO debe aparecer el botón
const hiddenRoutes = ["canvas", "grid-maker"];

// Calcular si el botón debe mostrarse
const shouldShow = computed(() => {
  return !hiddenRoutes.includes(route.name);
});

// Manejar click del botón
const handleClick = async () => {
  // Navegar a photo-hub con el hash para la pestaña upload
  await router.push("/photo-hub#upload");

  // Esperar un tick para que se renderice la vista
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Triggear el click del botón "Choose Files" en PhotosUpload
  const chooseFilesButton = document.querySelector(
    ".upload-btn, .compact-upload-btn",
  );
  if (chooseFilesButton) {
    chooseFilesButton.click();
  }
};
</script>

<style scoped>
.floating-add-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

.floating-add-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

/* Transiciones */
.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.fab-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .floating-add-button {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
  }
}
</style>
