import { useQuery } from "@tanstack/react-query";
import { getDashboard, getDashboardDetalle } from "./home.actions";

export const useDashboardQuery = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    refetchOnWindowFocus: true,
  });

export const useDashboardDetalleQuery = (tipo: string | null) =>
  useQuery({
    queryKey: ["dashboard-detalle", tipo],
    queryFn: () => getDashboardDetalle(tipo!),
    enabled: !!tipo,
  });
