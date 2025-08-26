import { computed } from "vue";

/**
 * Composable for handling maintenance mode states
 */
export function useMaintenanceMode() {
  // Check if basic maintenance mode is enabled
  const isMaintenanceMode = computed(() => {
    return import.meta.env.VITE_MAINTENANCE_MODE === "true";
  });

  // Check if strict maintenance mode is enabled
  const isMaintenanceStrictMode = computed(() => {
    return import.meta.env.VITE_MAINTENANCE_STRICT_MODE === "true";
  });

  // Check if any maintenance mode is enabled
  const isAnyMaintenanceMode = computed(() => {
    return isMaintenanceMode.value || isMaintenanceStrictMode.value;
  });

  // Routes that are exempt from strict maintenance mode
  const exemptRoutes = ["landing", "canvas-playground", "maintenance"];

  // Check if a route is exempt from maintenance mode
  const isRouteExempt = (routeName: string | symbol | null | undefined) => {
    return routeName ? exemptRoutes.includes(routeName.toString()) : false;
  };

  // Check if current route should be blocked by maintenance mode
  const shouldBlockRoute = (routeName: string | symbol | null | undefined) => {
    return isMaintenanceStrictMode.value && !isRouteExempt(routeName);
  };

  return {
    isMaintenanceMode,
    isMaintenanceStrictMode,
    isAnyMaintenanceMode,
    exemptRoutes,
    isRouteExempt,
    shouldBlockRoute,
  };
}
