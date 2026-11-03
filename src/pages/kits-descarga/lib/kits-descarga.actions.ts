import { api } from "@/lib/config";
import type {
  CategoriaBody,
  CategoriaResponse,
  CategoriaTrabajo,
  ComparacionKit,
  ExcelFileResponse,
  KitBody,
  KitDescarga,
  KitHistorialEvent,
  KitResponse,
  ReporteLiquidaciones,
  TipoTrabajoBody,
  TipoTrabajoResponse,
  TipoTrabajo,
} from "./kits-descarga.interface";

const unwrap = <T>(response: T | { data?: T }): T =>
  response && typeof response === "object" && "data" in response && (response as { data?: T }).data !== undefined
    ? (response as { data: T }).data
    : response as T;

export const getKits = async (params: Record<string, string>): Promise<KitResponse> =>
  (await api.get("/kits-descarga", { params })).data;

export const getKit = async (id: number): Promise<KitDescarga> =>
  unwrap((await api.get(`/kits-descarga/${id}`)).data);

export const createKit = async (body: KitBody) =>
  unwrap((await api.post("/kits-descarga", body)).data);

export const updateKit = async (id: number, body: KitBody) =>
  unwrap((await api.put(`/kits-descarga/${id}`, body)).data);

export const publishKit = async (id: number) =>
  unwrap((await api.post(`/kits-descarga/${id}/publicar`)).data);

export const deactivateKit = async (id: number) =>
  unwrap((await api.post(`/kits-descarga/${id}/desactivar`)).data);

export const deleteKit = async (id: number) =>
  (await api.delete(`/kits-descarga/${id}`)).data;

export const restoreKit = async (id: number) =>
  unwrap((await api.post(`/kits-descarga/${id}/restaurar`)).data);

export const getKitHistory = async (id: number): Promise<KitHistorialEvent[]> =>
  unwrap((await api.get(`/kits-descarga/${id}/historial`)).data);

export const getCategorias = async (params: Record<string, string> = {}) =>
  (await api.get<CategoriaResponse>("/categorias-trabajo", { params })).data;

export const getCategoriasAll = async (): Promise<CategoriaTrabajo[]> => {
  const data = (await api.get("/categorias-trabajo", { params: { all: "true" } })).data;
  return Array.isArray(data) ? data : data?.data ?? [];
};

export const createCategoria = async (body: CategoriaBody) =>
  unwrap((await api.post("/categorias-trabajo", body)).data);
export const updateCategoria = async (id: number, body: CategoriaBody) =>
  unwrap((await api.put(`/categorias-trabajo/${id}`, body)).data);
export const deleteCategoria = async (id: number) => (await api.delete(`/categorias-trabajo/${id}`)).data;
export const restoreCategoria = async (id: number) => unwrap((await api.post(`/categorias-trabajo/${id}/restaurar`)).data);

export const getTiposTrabajo = async (params: Record<string, string> = {}) =>
  (await api.get<TipoTrabajoResponse>("/tipos-trabajo", { params })).data;

export const getTiposTrabajoAll = async (): Promise<TipoTrabajo[]> => {
  const data = (await api.get("/tipos-trabajo", { params: { all: "true" } })).data;
  return Array.isArray(data) ? data : data?.data ?? [];
};

export const createTipoTrabajo = async (body: TipoTrabajoBody) => unwrap((await api.post("/tipos-trabajo", body)).data);
export const updateTipoTrabajo = async (id: number, body: TipoTrabajoBody) => unwrap((await api.put(`/tipos-trabajo/${id}`, body)).data);
export const deleteTipoTrabajo = async (id: number) => (await api.delete(`/tipos-trabajo/${id}`)).data;
export const restoreTipoTrabajo = async (id: number) => unwrap((await api.post(`/tipos-trabajo/${id}/restaurar`)).data);

export const downloadImportTemplate = async (): Promise<ExcelFileResponse> =>
  (await api.get("/kits-descarga/importacion/plantilla")).data;

export const validateImport = async (file: File) => {
  const form = new FormData();
  form.append("archivo", file);
  return (await api.post("/kits-descarga/importacion/validar", form)).data;
};

export const importKits = async (file: File) => {
  const form = new FormData();
  form.append("archivo", file);
  return (await api.post("/kits-descarga/importacion", form)).data;
};

export const compareLiquidacionKit = async (identificador: string | number, kitId?: number): Promise<ComparacionKit> =>
  (await api.get(`/liquidaciones/${encodeURIComponent(identificador)}/comparacion-kit`, {
    params: kitId ? { kit_descarga_id: kitId } : undefined,
  })).data;

export const assignLiquidacionKit = async (identificador: string | number, kitId: number) =>
  (await api.put(`/liquidaciones/${encodeURIComponent(identificador)}/kit-descarga`, { kit_descarga_id: kitId })).data;

export const removeLiquidacionKit = async (identificador: string | number) =>
  (await api.delete(`/liquidaciones/${encodeURIComponent(identificador)}/kit-descarga`)).data;

export type ReportFilters = Record<string, string>;
export const getReportLiquidaciones = async (params: ReportFilters): Promise<ReporteLiquidaciones> =>
  (await api.get("/kits-descarga/reportes/liquidaciones", { params })).data;

export const getReportResumen = async (params: ReportFilters) =>
  (await api.get("/kits-descarga/reportes/resumen", { params })).data;

export const exportReport = async (params: ReportFilters): Promise<ExcelFileResponse> =>
  (await api.get("/kits-descarga/reportes/exportar", { params })).data;

