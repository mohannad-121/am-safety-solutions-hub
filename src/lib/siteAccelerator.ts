const routeWarmers: Record<string, () => Promise<unknown>> = {
  "/about": () => import("@/pages/About"),
  "/products": () => import("@/pages/Products"),
  "/projects": () => import("@/pages/Projects"),
  "/articles": () => import("@/pages/Articles"),
  "/contact": () => import("@/pages/Contact"),
  "/quote": () => import("@/pages/Quote"),
};

export function warmRoute(path: string) {
  routeWarmers[path]?.().catch(() => undefined);
}

export function initializeSiteAccelerator() {
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined), { once: true });
  }

  const warmCoreRoutes = () => ["/products", "/quote", "/contact"].forEach(warmRoute);
  const idleWindow = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number };
  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(warmCoreRoutes, { timeout: 2500 });
  } else {
    window.setTimeout(warmCoreRoutes, 1200);
  }
}
