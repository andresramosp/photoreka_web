import { ref } from "vue";
import { defineStore } from "pinia";
import api from "../utils/axios";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider?: "email" | "google" | "facebook";
}

export const useUserStore = defineStore("user", () => {
  const isAuthenticated = ref(false);
  const token = ref<string | null>(null);
  const user = ref<User | null>(null);
  const isLoading = ref(false);

  // Mock usage limits state by section
  const usageLimits = ref({
    search: {
      exceeded: true,
      permanent: false, // Can be closed by user
      dismissed: false, // Whether user dismissed the badge
    },
    curation: {
      exceeded: true,
      permanent: false, // Cannot be closed, requires credits
      dismissed: false, // Not used when permanent is true
    },
  });

  // Check for existing token on store initialization
  const initAuth = () => {
    const savedToken = localStorage.getItem("frameka_token");
    if (savedToken) {
      token.value = savedToken;
      isAuthenticated.value = true;
      // Mock user data - in real app this would fetch from API
      user.value = {
        id: "mock-user-id",
        email: "user@frameka.app",
        name: "Usuario Demo",
        provider: "email",
      };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    isLoading.value = true;

    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      token.value = receivedToken;
      isAuthenticated.value = true;
      user.value = receivedUser;

      localStorage.setItem("auth_token", receivedToken);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Error logging in.",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    isLoading.value = true;

    try {
      const response = await api.post("/api/auth/register", {
        email,
        password,
        name,
      });
      const { token: receivedToken, user: receivedUser } = response.data;

      token.value = receivedToken;
      isAuthenticated.value = true;
      user.value = receivedUser;

      localStorage.setItem("auth_token", receivedToken);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Error registering.",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const loginWithProvider = async (
    provider: "google" | "facebook"
  ): Promise<{ success: boolean; error?: string }> => {
    isLoading.value = true;

    try {
      // Mock social authentication - replace with real OAuth implementation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockToken = `mock_token_${provider}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      token.value = mockToken;
      isAuthenticated.value = true;
      user.value = {
        id: `user_${provider}_${Date.now()}`,
        email: `user@${provider === "google" ? "gmail.com" : "facebook.com"}`,
        name: `${provider === "google" ? "Google" : "Facebook"} User`,
        provider,
      };

      localStorage.setItem("frameka_token", mockToken);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Error logging in with ${provider}. Please try again.`,
      };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    isAuthenticated.value = false;
    user.value = null;
    localStorage.removeItem("frameka_token");
  };

  const dismissUsageWarning = (section: "search" | "curation") => {
    if (!usageLimits.value[section].permanent) {
      usageLimits.value[section].dismissed = true;
    }
  };

  // Initialize auth state
  initAuth();

  return {
    isAuthenticated,
    token,
    user,
    isLoading,
    usageLimits,
    dismissUsageWarning,
    login,
    register,
    loginWithProvider,
    logout,
  };
});
