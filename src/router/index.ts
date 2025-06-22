import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import CanvasView from "../views/CanvasView.vue";
import SearchView from "../views/SearchView.vue";
import CollectionsView from "../views/CollectionsView.vue";
import PhotoHubView from "../views/PhotoHubView.vue";
import SettingsView from "../views/SettingsView.vue";
import HelpView from "../views/HelpView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/canvas",
      name: "canvas",
      component: CanvasView,
    },
    {
      path: "/search",
      name: "search",
      component: SearchView,
    },
    {
      path: "/collections",
      name: "collections",
      component: CollectionsView,
    },
    {
      path: "/photo-hub",
      name: "photo-hub",
      component: PhotoHubView,
    },
    {
      path: "/settings",
      name: "settings",
      component: SettingsView,
    },
    {
      path: "/help",
      name: "help",
      component: HelpView,
    },
  ],
});

export default router;
