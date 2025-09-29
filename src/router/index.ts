import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { useMaintenanceMode } from "../composables/useMaintenanceMode";
import { trackPageView } from "../utils/analytics";
import DashboardView from "../views/DashboardView.vue";
import CanvasView from "../views/CanvasView.vue";
import SearchView from "../views/SearchView.vue";
import CollectionsView from "../views/CollectionsView.vue";
import PhotoHubView from "../views/PhotoHubView.vue";
import ProjectBuilderView from "../views/ProjectBuilderView.vue";
import FramerView from "../views/FramerView.vue";
import PortfolioReportView from "../views/PortfolioReportView.vue";
import SettingsView from "../views/SettingsView.vue";
import HelpView from "../views/HelpView.vue";
import PlanView from "../views/PlanView.vue";
import AuthView from "../views/AuthView.vue";
import ProfileSelectionView from "../views/ProfileSelectionView.vue";
import StoragePlanSelectionView from "../views/StoragePlanSelectionView.vue";
import GridMaker from "../views/GridMakerView.vue";
import LandingView from "../views/LandingView.vue";
import TermsView from "../views/TermsView.vue";
import MaintenanceView from "../views/MaintenanceView.vue";
import ThreeDView from "../views/3DView.vue";

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
        title: "Photoreka - Photo Management and Curation Platform",
        description:
          "Transform your photos with AI-powered enhancement tools. Create stunning canvases, photo frames, and artistic compositions with Photoreka's free tools.",
        keywords:
          "photo enhancement, AI photo tools, canvas maker, photo frames, image editor, photo culling, photo organizer",
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
        title: "Terms of Service - Photoreka",
        description:
          "Read Photoreka's terms of service and user agreement for our AI photo enhancement platform.",
        keywords: "terms of service, privacy policy, user agreement, Photoreka",
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
        title: "Free Canvas Playground - Photoreka",
        description:
          "Try our free photo canvas maker without registration. Create artistic compositions and enhance your photos with AI-powered tools.",
        keywords:
          "free canvas maker, photo playground, no registration photo editor, AI photo enhancement",
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
      path: "/3d-view",
      name: "3d-view",
      component: ThreeDView,
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
      },
    },
    {
      path: "/framer",
      name: "framer",
      component: FramerView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/free-framer",
      name: "free-framer",
      component: FramerView,
      meta: {
        requiresGuest: false, // Accessible without authentication
        playground: true,
        title: "Free Photo Framer - Photoreka",
        description:
          "Create beautiful photo frames for free without registration. Design custom frames and borders for your photos with our easy-to-use framer tool.",
        keywords:
          "free photo frames, photo framer, custom photo borders, no registration photo tool",
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

// Track page views after navigation
router.afterEach((to) => {
  // Update document title
  const pageTitle = (to.meta?.title as string) || "Photoreka";
  document.title = pageTitle;

  // Update meta description
  const description =
    (to.meta?.description as string) ||
    "Transform your photos with AI-powered enhancement tools. Create stunning canvases, photo frames, and artistic compositions with Photoreka.";
  updateMetaTag("name", "description", description);

  // Update meta keywords
  const keywords =
    (to.meta?.keywords as string) ||
    "photo enhancement, AI photo tools, canvas maker, photo frames, image editor";
  updateMetaTag("name", "keywords", keywords);

  // Update Open Graph tags
  updateMetaTag("property", "og:title", pageTitle);
  updateMetaTag("property", "og:description", description);
  updateMetaTag("property", "og:url", `https://photoreka.com${to.fullPath}`);

  // Update Twitter tags
  updateMetaTag("property", "twitter:title", pageTitle);
  updateMetaTag("property", "twitter:description", description);
  updateMetaTag(
    "property",
    "twitter:url",
    `https://photoreka.com${to.fullPath}`
  );

  // Update canonical URL
  updateCanonicalUrl(`https://photoreka.com${to.fullPath}`);

  // Track page view with GA4
  trackPageView(to.fullPath, pageTitle);
});

// Helper function to update meta tags
function updateMetaTag(attribute: string, value: string, content: string) {
  let element = document.querySelector(
    `meta[${attribute}="${value}"]`
  ) as HTMLMetaElement;
  if (element) {
    element.content = content;
  } else {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    element.content = content;
    document.getElementsByTagName("head")[0].appendChild(element);
  }
}

// Helper function to update canonical URL
function updateCanonicalUrl(url: string) {
  let canonical = document.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement;
  if (canonical) {
    canonical.href = url;
  } else {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = url;
    document.getElementsByTagName("head")[0].appendChild(canonical);
  }
}

export default router;
