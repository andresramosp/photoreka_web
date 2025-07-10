import { useUserStore } from "./stores/userStore";

export function initializeAuth() {
  const userStore = useUserStore();
  userStore.initAuth();
}
