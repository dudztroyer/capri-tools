export interface RouteConfig {
  path: string;
  title: string;
  breadcrumb: string[];
}

export const routeConfig: Record<string, RouteConfig> = {
  "/": {
    path: "/",
    title: "Home",
    breadcrumb: ["Home"],
  },
  "/a-lancha-passa": {
    path: "/a-lancha-passa",
    title: "A lancha passa?",
    breadcrumb: ["Home", "A lancha passa?"],
  },
  "/tide-table": {
    path: "/tide-table",
    title: "Tábua de Maré Mensal",
    breadcrumb: ["Home", "Tábua de Maré Mensal"],
  },
};

export function getRouteConfig(pathname: string): RouteConfig {
  return routeConfig[pathname] || {
    path: pathname,
    title: "Page",
    breadcrumb: ["Home"],
  };
}

