import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/userStore";
import DashboardView from "../views/DashboardView.vue";
import CanvasView from "../views/CanvasView.vue";
import SearchView from "../views/SearchView.vue";
import CollectionsView from "../views/CollectionsView.vue";
import PhotoHubView from "../views/PhotoHubView.vue";
import CurationView from "../views/CurationView.vue";
import SettingsView from "../views/SettingsView.vue";
import HelpView from "../views/HelpView.vue";
import PlanView from "../views/PlanView.vue";
import AuthView from "../views/AuthView.vue";
import ProfileSelectionView from "../views/ProfileSelectionView.vue";
import GridMaker from "@/views/GridMaker.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/auth",
      name: "auth",
      component: AuthView,
      meta: {
        requiresGuest: true,
      },
    },
    {
      path: "/profile-setup",
      name: "profile-setup",
      component: ProfileSelectionView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/canvas",
      name: "canvas",
      component: CanvasView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/search",
      name: "search",
      component: SearchView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/collections",
      name: "collections",
      component: CollectionsView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/photo-hub",
      name: "photo-hub",
      component: PhotoHubView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/curation",
      name: "curation",
      component: CurationView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/grid-maker",
      name: "grid-maker",
      component: GridMaker,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/settings",
      name: "settings",
      component: SettingsView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/help",
      name: "help",
      component: HelpView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/plan",
      name: "plan",
      component: PlanView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // Check if route requires authentication
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next("/auth");
  }
  // Check if route requires guest (not authenticated)
  else if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next("/dashboard");
  }
  // If accessing root and not authenticated, go to auth
  else if (to.path === "/" && !userStore.isAuthenticated) {
    next("/auth");
  } else {
    next();
  }
});

export default router;
