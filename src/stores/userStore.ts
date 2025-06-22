import { ref } from "vue";
import { defineStore } from "pinia";

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

  // Check for existing token on store initialization
  const initAuth = () => {
    const savedToken = localStorage.getItem("trova_token");
    if (savedToken) {
      token.value = savedToken;
      isAuthenticated.value = true;
      // Mock user data - in real app this would fetch from API
      user.value = {
        id: "mock-user-id",
        email: "user@trova.app",
        name: "Usuario Demo",
        provider: "email",
      };
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    isLoading.value = true;

    try {
      // Mock authentication - replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock validation
      if (email && password.length >= 6) {
        const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        token.value = mockToken;
        isAuthenticated.value = true;
        user.value = {
          id: `user_${Date.now()}`,
          email,
          name: email.split("@")[0],
          provider: "email",
        };

        localStorage.setItem("trova_token", mockToken);

        return { success: true };
      } else {
        return {
          success: false,
          error:
            "Email y contraseña son requeridos. La contraseña debe tener al menos 6 caracteres.",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Error al iniciar sesión. Inténtalo de nuevo.",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; error?: string }> => {
    isLoading.value = true;

    try {
      // Mock registration - replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock validation
      if (email && password.length >= 6 && name) {
        const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        token.value = mockToken;
        isAuthenticated.value = true;
        user.value = {
          id: `user_${Date.now()}`,
          email,
          name,
          provider: "email",
        };

        localStorage.setItem("trova_token", mockToken);

        return { success: true };
      } else {
        return {
          success: false,
          error:
            "Todos los campos son requeridos. La contraseña debe tener al menos 6 caracteres.",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Error al registrarse. Inténtalo de nuevo.",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const loginWithProvider = async (
    provider: "google" | "facebook",
  ): Promise<{ success: boolean; error?: string }> => {
    isLoading.value = true;

    try {
      // Mock social authentication - replace with real OAuth implementation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockToken = `mock_token_${provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      token.value = mockToken;
      isAuthenticated.value = true;
      user.value = {
        id: `user_${provider}_${Date.now()}`,
        email: `user@${provider === "google" ? "gmail.com" : "facebook.com"}`,
        name: `Usuario ${provider === "google" ? "Google" : "Facebook"}`,
        provider,
      };

      localStorage.setItem("trova_token", mockToken);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Error al iniciar sesión con ${provider}. Inténtalo de nuevo.`,
      };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    isAuthenticated.value = false;
    user.value = null;
    localStorage.removeItem("trova_token");
  };

  // Initialize auth state
  initAuth();

  return {
    isAuthenticated,
    token,
    user,
    isLoading,
    login,
    register,
    loginWithProvider,
    logout,
  };
});
