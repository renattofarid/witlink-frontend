import { create } from "zustand";

export interface Tab {
  route: string;
  title: string;
  iconName: string;
}

interface TabsState {
  tabs: Tab[];
  activeRoute: string;
  routeParams: Record<string, Record<string, string>>;
  lastPath: Record<string, string>;
  openTab: (tab: Tab) => void;
  closeTab: (route: string) => void;
  setActiveRoute: (route: string) => void;
  saveParams: (key: string, params: Record<string, string>) => void;
  getParams: (key: string) => Record<string, string> | undefined;
  clearRouteParams: () => void;
  setLastPath: (route: string, path: string) => void;
  getLastPath: (route: string) => string | undefined;
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeRoute: "",
  routeParams: {},
  lastPath: {},

  openTab: (tab) =>
    set((state) => {
      const exists = state.tabs.some((t) => t.route === tab.route);
      return exists ? state : { tabs: [...state.tabs, tab] };
    }),

  closeTab: (route) =>
    set((state) => {
      const newParams = { ...state.routeParams };
      Object.keys(newParams).forEach((k) => {
        if (k === route || k.startsWith(route + "/")) delete newParams[k];
      });
      const newLastPath = { ...state.lastPath };
      delete newLastPath[route];
      return {
        tabs: state.tabs.filter((t) => t.route !== route),
        routeParams: newParams,
        lastPath: newLastPath,
      };
    }),

  setActiveRoute: (route) => set({ activeRoute: route }),

  saveParams: (key, params) =>
    set((state) => ({
      routeParams: { ...state.routeParams, [key]: params },
    })),

  getParams: (key) => get().routeParams[key],

  clearRouteParams: () => set({ routeParams: {} }),

  setLastPath: (route, path) =>
    set((state) => ({ lastPath: { ...state.lastPath, [route]: path } })),

  getLastPath: (route) => get().lastPath[route],
}));
