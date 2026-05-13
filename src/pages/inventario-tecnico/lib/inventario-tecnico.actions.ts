import { api } from "@/lib/config";
import type {
  InventarioTecnicoResource,
  InventarioTecnicoApiResponse,
  DevolverMaterialBody,
} from "./inventario-tecnico.interface";

export const getInventarioTecnico = async (
  tecnicoId: number,
  params: Record<string, string> = {},
): Promise<InventarioTecnicoResource[]> => {
  const { data } = await api.get<InventarioTecnicoApiResponse>(
    `/tecnicos/${tecnicoId}/inventario`,
    { params },
  );

  const materiales: InventarioTecnicoResource[] = data.materiales.map((m) => ({
    id: m.id,
    tipo: "material",
    producto: m.material.producto.nombre,
    sap: m.material.producto.sap,
    cantidad: m.cantidad,
    serie: null,
    fecha: m.created_at,
  }));

  const series: InventarioTecnicoResource[] = data.series.map((s) => ({
    id: s.id,
    tipo: "serie",
    producto: s.serie.producto.nombre,
    sap: s.serie.producto.sap,
    cantidad: null,
    serie: s.serie.serie,
    fecha: s.created_at,
  }));

  return [...materiales, ...series];
};

export const devolverMaterial = async (
  tecnicoId: number,
  inventarioId: number,
  body: DevolverMaterialBody,
) => {
  const { data } = await api.post(
    `/tecnicos/${tecnicoId}/inventario/${inventarioId}/devolverMaterial`,
    body,
  );
  return data;
};

export const devolverSerie = async (
  tecnicoId: number,
  inventarioId: number,
) => {
  const { data } = await api.post(
    `/tecnicos/${tecnicoId}/inventario/${inventarioId}/devolerSerie`,
  );
  return data;
};

export const generarCarga = async (tecnicoId: number): Promise<Blob> => {
  const { data } = await api.get(`/tecnicos/${tecnicoId}/generar-carga`, {
    responseType: "blob",
  });
  return data;
};

export const exportarInventarioTecnico = async (tecnicoId: number) => {
  const { data } = await api.get<{ file_name: string; mime_type: string; file_base64: string }>(
    `/tecnicos/${tecnicoId}/inventario/exportarExcel`
  );
  return data;
};
