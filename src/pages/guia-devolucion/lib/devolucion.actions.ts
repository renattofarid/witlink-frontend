import { api } from "@/lib/config";
import { GuiaDevolucionComplete } from "./devolucion.constants";


export const getGuiasDevolucion = async (
  params: Record<string, string>,
): Promise<any> => {
  const { data } = await api.get(GuiaDevolucionComplete.ENDPOINT, { params });
  return data;
};