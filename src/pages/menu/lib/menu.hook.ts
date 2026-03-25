import { useQuery } from "@tanstack/react-query";
import { getMenus, getOpcionesMenu, getOpcionesMenuAll } from "./menu.actions";
import { MenuComplete, OPCION_MENU_QUERY_KEY } from "./menu.constants";

export const useMenuQuery = (params: Record<string, string>) =>
  useQuery({
    queryKey: [MenuComplete.QUERY_KEY, params],
    queryFn: () => getMenus(params),
    refetchOnWindowFocus: true,
  });

export const useOpcionMenuQuery = (grupoMenuId: number) =>
  useQuery({
    queryKey: [OPCION_MENU_QUERY_KEY, grupoMenuId],
    queryFn: () => getOpcionesMenu(grupoMenuId),
    refetchOnWindowFocus: true,
    enabled: grupoMenuId > 0,
  });

export const useOpcionesMenuAllQuery = () =>
  useQuery({
    queryKey: [OPCION_MENU_QUERY_KEY],
    queryFn: getOpcionesMenuAll,
    refetchOnWindowFocus: true,
  });
