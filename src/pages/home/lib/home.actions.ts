import { api } from "@/lib/config";
import type { DashboardData } from "./home.interface";

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get("/dashboard");
  return data;
};
