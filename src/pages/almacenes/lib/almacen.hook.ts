import { useQuery } from "@tanstack/react-query";
import { getAlmacenes } from "./almacen.actions";
import { AlmacenComplete } from "./almacen.constants";

export const useAlmacenQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [AlmacenComplete.QUERY_KEY, params],
    queryFn: () => getAlmacenes(params),
  });
};

export const useAlmacenSelectQuery = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["almacenes-select", params],
    queryFn: () => getAlmacenes(params as Record<string, string>),
  });
};
