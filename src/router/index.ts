import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { useMaintenanceMode } from "../composables/useMaintenanceMode";
import DashboardView from "../views/DashboardView.vue";
import CanvasView from "../views/CanvasView.vue";
import SearchView from "../views/SearchView.vue";
import CollectionsView from "../views/CollectionsView.vue";
import PhotoHubView from "../views/PhotoHubView.vue";
import ProjectBuilderView from "../views/ProjectBuilderView.vue";
import PortfolioReportView from "../views/PortfolioReportView.vue";
import SettingsView from "../views/SettingsView.vue";
import HelpView from "../views/HelpView.vue";
import PlanView from "../views/PlanView.vue";
import AuthView from "../views/AuthView.vue";
import ProfileSelectionView from "../views/ProfileSelectionView.vue";
import StoragePlanSelectionView from "../views/StoragePlanSelectionView.vue";
import GridMaker from "@/views/GridMaker.vue";
import VisualLabView from "@/views/VisualLabView.vue";
import LandingView from "@/views/LandingView.vue";
import TermsView from "@/views/TermsView.vue";
import MaintenanceView from "@/views/MaintenanceView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: "/",
    //   redirect: "/landing",
    // },
    {
      path: "/",
      name: "landing",
      component: LandingView,
      meta: {
        requiresGuest: false, // Accessible to both guests and authenticated users
      },
    },

    {
      path: "/maintenance",
      name: "maintenance",
      component: MaintenanceView,
      meta: {
        requiresGuest: false, // Accessible to everyone
        layout: false, // Use standalone layout
      },
    },
    {
      path: "/terms",
      name: "terms",
      component: TermsView,
      meta: {
        requiresGuest: false, // Accessible to both guests and authenticated users
        layout: false, // Use standalone layout like landing page
      },
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
      path: "/storage-plan-setup",
      name: "storage-plan-setup",
      component: StoragePlanSelectionView,
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
      path: "/canvas-playground",
      name: "canvas-playground",
      component: CanvasView,
      meta: {
        requiresGuest: false, // Accessible without authentication
        playground: true,
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
      path: "/collections/:id",
      name: "collection-detail",
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
      path: "/project-builder",
      name: "project-builder",
      component: ProjectBuilderView,
      meta: {
        requiresAuth: true,
        keepAlive: true,
      },
    },
    {
      path: "/portfolio-report",
      name: "portfolio-report",
      component: PortfolioReportView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/visual-lab",
      name: "visual-lab",
      component: VisualLabView,
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
  const { shouldBlockRoute } = useMaintenanceMode();

  // Check if bypass is active via URL parameter or localStorage
  const urlBypass = to.query.isMe === "true";
  const storedBypass = localStorage.getItem("maintenance_bypass") === "true";

  // If URL has bypass parameter, save it to localStorage
  if (urlBypass) {
    localStorage.setItem("maintenance_bypass", "true");
  }

  // Has bypass if either URL parameter or localStorage says so
  const hasBypass = urlBypass || storedBypass;

  // If maintenance strict mode is enabled, redirect to maintenance page
  // except for exempt routes or if bypass is active
  if (shouldBlockRoute(to.name as string) && !hasBypass) {
    next("/maintenance");
    return;
  }

  if (to.path === "/") {
    next();
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next("/auth");
  }
  // Check if route requires guest (not authenticated)
  else if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next("/dashboard");
  }
  // If accessing root and not authenticated, go to auth
  else next();
});

export default router;
