import { api } from "@/lib/config";
import type { DashboardData, DashboardDetalleResponse } from "./home.interface";

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get("/dashboard");
  return data;
};

export const getDashboardDetalle = async (
  tipo: string
): Promise<DashboardDetalleResponse> => {
  const { data } = await api.get(`/dashboard/detalle/${tipo}`);
  return data;
};
