import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "./home.actions";

export const useDashboardQuery = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    refetchOnWindowFocus: true,
  });
