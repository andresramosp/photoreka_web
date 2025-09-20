// Debug script para verificar KeepAlive
console.log("=== DEBUG KEEP ALIVE ===");

// Simular la función getKeepAliveComponents
import { createRouter, createWebHistory } from "vue-router";

// Importar las rutas (simuladas)
const routes = [
  {
    path: "/canvas",
    name: "canvas",
    component: { name: "CanvasView" },
    meta: { requiresAuth: true, keepAlive: true },
  },
  {
    path: "/search",
    name: "search",
    component: { name: "SearchView" },
    meta: { requiresAuth: true, keepAlive: true },
  },
  {
    path: "/collections",
    name: "collections",
    component: { name: "CollectionsView" },
    meta: { requiresAuth: true, keepAlive: true },
  },
  {
    path: "/photo-hub",
    name: "photo-hub",
    component: { name: "PhotoHubView" },
    meta: { requiresAuth: true, keepAlive: true },
  },
  {
    path: "/project-builder",
    name: "project-builder",
    component: { name: "ProjectBuilderView" },
    meta: { requiresAuth: true, keepAlive: true },
  },
  {
    path: "/framer",
    name: "framer",
    component: { name: "FramerView" },
    meta: { requiresAuth: true, keepAlive: true },
  },
  {
    path: "/grid-maker",
    name: "grid-maker",
    component: { name: "GridMakerView" },
    meta: { requiresAuth: true, keepAlive: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const getKeepAliveComponents = () => {
  return router
    .getRoutes()
    .filter((route) => route.meta?.keepAlive)
    .map((route) => {
      const componentName = route.component?.name;
      if (componentName) {
        return componentName;
      }

      const routeName = route.name;
      return routeName
        ? `${routeName.charAt(0).toUpperCase()}${routeName.slice(1)}View`
        : null;
    })
    .filter(Boolean);
};

console.log("Componentes KeepAlive:", getKeepAliveComponents());
