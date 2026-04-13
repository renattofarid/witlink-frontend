import { api } from "@/lib/config";
import { KardexComplete } from "./kardex.constants";
import type { KardexResponse } from "./kardex.interface";

export const getKardex = async (
  params: Record<string, string>,
): Promise<KardexResponse> => {
  const { data } = await api.get(KardexComplete.ENDPOINT, { params });
  return data;
};
