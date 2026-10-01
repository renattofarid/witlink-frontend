import { api } from "@/lib/config";
import { promiseToast } from "@/lib/core.function";
import type { ExcelResponse } from "@/lib/exportExcel";
import { GuiaComplete } from "./guia.constants";
import type {
  GuiaResponse,
  GuiaResource,
  GuiaCreateBody,
  GuiaEditBody,
  DetalleSeriesGuiaBody,
  ImportarGuiasCorporativoResponse,
} from "./guia.interface";
import type { AxiosRequestConfig } from "axios";

export async function openPdf(ruta: string) {
  const promise = api
    .post("/archivos", { ruta_pdf: ruta }, { responseType: "blob" })
    .then((response) => {
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = ruta;
      a.click();
      window.open(url);
    });
  promiseToast(promise, {
    loading: "Descargando PDF...",
    success: "PDF descargado",
    error: "Error al descargar el PDF",
  });
}

export async function exportGuiaExcel(id: number) {
  const promise = api
    .get(`${GuiaComplete.ENDPOINT}/${id}/exportar-excel`)
    .then(({ data }) => {
      const binary = atob(data.file_base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: data.mime_type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    });
  promiseToast(promise, {
    loading: "Generando Excel...",
    success: "Excel descargado",
    error: "Error al descargar el Excel",
  });
}

export const getGuias = async (
  params: Record<string, string>,
): Promise<GuiaResponse> => {
  const { data } = await api.get(GuiaComplete.ENDPOINT, { params });
  return data;
};

export const getGuia = async (id: number): Promise<GuiaResource> => {
  const { data } = await api.get(`${GuiaComplete.ENDPOINT}/${id}`);
  return data;
};

export const createGuia = async (body: GuiaCreateBody) => {
  const formData = buildGuiaFormData(body);
  const { data } = await api.post(GuiaComplete.ENDPOINT, formData);
  return data;
};

export const updateGuia = async (id: number, body: GuiaEditBody) => {
  const formData = buildGuiaEditFormData(body);
  formData.append("_method", "PUT");
  const { data } = await api.post(`${GuiaComplete.ENDPOINT}/${id}`, formData);
  return data;
};

function buildGuiaFormData(body: GuiaCreateBody): FormData {
  const formData = new FormData();
  formData.append("numero", body.numero);
  formData.append("fecha", body.fecha);
  // formData.append("proveedor_id", String(body.proveedor_id));
  if (body.archivo) formData.append("archivo", body.archivo);

  formData.append("productos_json", JSON.stringify(body.productos));

  return formData;
}

function buildGuiaEditFormData(body: GuiaEditBody): FormData {
  const formData = new FormData();
  if (body.numero != null) formData.append("numero", body.numero);
  if (body.fecha != null) formData.append("fecha", body.fecha);
  if (body.archivo) formData.append("archivo", body.archivo);

  if (body.productos) {
    formData.append("productos_json", JSON.stringify([body.productos]));
  }

  return formData;
}

export const crearDetalleSerie = async (
  body: DetalleSeriesGuiaBody,
): Promise<void> => {
  await api.post("/detalle-series-guia", body);
};

export const eliminarDetalleSerie = async (
  productoGuiaId: number,
  serieId: number,
): Promise<void> => {
  await api.delete(`/detalle-series-guia/${productoGuiaId}/${serieId}`);
};

export const confirmarSerie = async (
  productoGuiaId: number,
  serieId: number,
) => {
  const { data } = await api.patch(
    `/detalle-series-guia/${productoGuiaId}/${serieId}`,
  );
  return data;
};

export const confirmarProducto = async (id: number) => {
  const { data } = await api.patch(
    `/productos-guia/${id}/confirmar-disponibilidad`,
  );
  return data;
};

export const confirmarDisponibilidad = async (id: number) => {
  const { data } = await api.patch(
    `${GuiaComplete.ENDPOINT}/${id}/confirmarDisponibilidad`,
  );
  return data;
};

export const deleteProductoGuia = async (id: number) => {
  const config: AxiosRequestConfig = {
    params: {
      forzar: 1,
    },
  };
  const { data } = await api.delete(`/productos-guia/${id}`, config);
  return data;
};

export const deleteGuia = async (id: number) => {
  const { data } = await api.delete(`${GuiaComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreGuia = async (id: number) => {
  const { data } = await api.post(`${GuiaComplete.ENDPOINT}/${id}/restaurar`);
  return data;
};

/**
 * Importación masiva de guías corporativas desde el Excel SAPUI5 del cliente.
 * El backend responde 201 cuando todo se procesó sin observaciones y 422
 * cuando hubo filas/guías omitidas — en ambos casos trae el mismo resumen
 * útil, así que se trata el 422 como un resultado válido en vez de un error
 * de red. `almacen_id` solo aplica para usuarios de almacén corporativo.
 */
export const importarGuiasCorporativo = async (
  archivo: File,
  opciones?: { fecha?: string | null; almacen_id?: number | null },
): Promise<ImportarGuiasCorporativoResponse> => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  if (opciones?.fecha) formData.append("fecha", opciones.fecha);
  if (opciones?.almacen_id != null)
    formData.append("almacen_id", String(opciones.almacen_id));
  try {
    const { data } = await api.post(
      `${GuiaComplete.ENDPOINT}/importar-corporativo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  } catch (error: any) {
    const data = error?.response?.data;
    // El backend responde 422 en dos escenarios distintos:
    //  a) Resumen de importación con observaciones (trae filas_procesadas /
    //     guias_creadas): es un resultado válido y se devuelve como tal.
    //  b) Error de validación de Laravel al subir un archivo inválido
    //     ({ message, errors: { archivo: [...] } }): NO es un resumen, se
    //     re-lanza para que la UI muestre el error real.
    if (
      error?.response?.status === 422 &&
      data &&
      (typeof data.filas_procesadas === "number" ||
        typeof data.guias_creadas === "number" ||
        Array.isArray(data.guias))
    ) {
      return data;
    }
    throw error;
  }
};

export const getSeries = async (params: Record<string, any>) => {
  const { data } = await api.get("/series", { params });
  return data;
};

/**
 * Descarga la plantilla .xlsx para la importación masiva de guías corporativas.
 * El backend genera el archivo para mantener las columnas siempre alineadas
 * con lo que espera el importador.
 */
export const descargarPlantillaGuiasCorporativo =
  async (): Promise<ExcelResponse> => {
    const { data } = await api.get<ExcelResponse>(
      `${GuiaComplete.ENDPOINT}/plantilla-corporativa`,
    );
    return data;
  };

export const verificarDisponibilidadIngreso = async (
  codigo: string,
  tipo: "serie" | "mac" | "emta_mac" | "ua",
) => {
  const { data } = await api.get(
    `/series/${encodeURIComponent(codigo)}/verificar-disponibilidad-ingreso`,
    { params: { tipo } },
  );
  return data;
};

// Exclusivo para el tab "Equipo Retirado" del ingreso: permite reingresar
// series que vienen del campo (retirado/devuelto/instalado/despachado/
// devuelto a claro) y solo bloquea las que están disponibles/pendientes/
// en traslado, a diferencia de verificarDisponibilidadIngreso (almacén).
export const verificarDisponibilidadIngresoRetirado = async (
  codigo: string,
  tipo: "serie" | "mac" | "emta_mac" | "ua",
) => {
  const { data } = await api.get(
    `/series/${encodeURIComponent(codigo)}/verificar-disponibilidad-ingreso-retirado`,
    { params: { tipo } },
  );
  return data;
};

export const getProveedores = async (params: Record<string, any>) => {
  const { data } = await api.get("/proveedores", { params });
  return data;
};

export const getProductos = async (params: Record<string, any>) => {
  const { data } = await api.get("/productos", { params });
  return data;
};

