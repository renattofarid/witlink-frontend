import { api } from "@/lib/config";
import { LiquidacionesComplete } from "./liquidaciones.constants";
import type {
  SotSearchResponse,
  LiquidacionesResponse,
  SaveProductosBody,
  SaveProductosResponse,
  UpdateProductosBody,
  ActaResource,
} from "./liquidaciones.interface";

function buildLiquidacionesParams(params: Record<string, string>) {
  const { sots, ...rest } = params;
  const result: Record<string, unknown> = { ...rest };

  if (sots) {
    const items = sots.split(",").filter(Boolean);
    result.sots = items;
  }

  return result;
}

function serializeParams(params: Record<string, unknown>): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => search.append(`${key}[]`, String(item)));
    } else {
      search.append(key, String(value));
    }
  });

  return search.toString();
}

export const searchSot = async (sot: string): Promise<SotSearchResponse> => {
  const { data } = await api.get(
    `${LiquidacionesComplete.ENDPOINT}/${encodeURIComponent(sot)}`,
  );
  return data;
};

export const getLiquidaciones = async (
  params: Record<string, string>,
): Promise<LiquidacionesResponse> => {
  const { data } = await api.get(LiquidacionesComplete.ENDPOINT, {
    params: buildLiquidacionesParams(params),
    paramsSerializer: {
      serialize: serializeParams,
    },
  });
  return data;
};

export const saveProductosLiquidacion = async (
  body: SaveProductosBody,
): Promise<SaveProductosResponse> => {
  const { data } = await api.post("/detalle-productos-liquidacion", body);
  return data;
};

export const updateProductosLiquidacion = async (
  body: UpdateProductosBody,
): Promise<SaveProductosResponse> => {
  const { data } = await api.put("/detalle-productos-liquidacion", body);
  return data;
};

export const deleteDetalleProducto = async (
  id: number,
  forzar: boolean = false,
) => {
  const { data } = await api.delete(`/detalle-productos-liquidacion/${id}`, {
    params: { forzar },
  });
  return data;
};

export interface ImportarConsolidadoResponse {
  recibidos?: number;
  creados: number;
  actualizados: number;
  omitidos: number;
  mensaje?: string;
  errores?: Array<{ sot: string; motivo: string }>;
  sots_no_importados?: string[];
}

export interface DateChunk {
  desde: string;
  hasta: string;
}

/** Parte el rango en tramos de N días para progreso y timeouts más cortos. */
export function buildDateChunks(
  desde: string,
  hasta: string,
  daysPerChunk = 7,
): DateChunk[] {
  const chunks: DateChunk[] = [];
  const start = new Date(`${desde}T00:00:00`);
  const end = new Date(`${hasta}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [{ desde, hasta }];
  }

  let cursor = start;
  while (cursor <= end) {
    const chunkEnd = new Date(cursor);
    chunkEnd.setDate(chunkEnd.getDate() + daysPerChunk - 1);
    if (chunkEnd > end) chunkEnd.setTime(end.getTime());

    const toStr = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    chunks.push({ desde: toStr(cursor), hasta: toStr(chunkEnd) });
    cursor = new Date(chunkEnd);
    cursor.setDate(cursor.getDate() + 1);
  }

  return chunks.length ? chunks : [{ desde, hasta }];
}

export const actualizarSotsConsolidadoAtendidas = async (
  desde: string,
  hasta: string,
): Promise<ImportarConsolidadoResponse> => {
  const { data } = await api.post<ImportarConsolidadoResponse>(
    `${LiquidacionesComplete.ENDPOINT}/importar-consolidado`,
    { desde, hasta },
    { timeout: 180_000 },
  );
  return data;
};

export const actualizarSotsConsolidadoAtendidasPorTramos = async (
  desde: string,
  hasta: string,
  onProgress?: (info: {
    current: number;
    total: number;
    chunkDesde: string;
    chunkHasta: string;
  }) => void,
): Promise<ImportarConsolidadoResponse> => {
  const chunks = buildDateChunks(desde, hasta, 7);
  const aggregate: ImportarConsolidadoResponse = {
    recibidos: 0,
    creados: 0,
    actualizados: 0,
    omitidos: 0,
    errores: [],
    sots_no_importados: [],
  };

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    onProgress?.({
      current: i + 1,
      total: chunks.length,
      chunkDesde: chunk.desde,
      chunkHasta: chunk.hasta,
    });

    const data = await actualizarSotsConsolidadoAtendidas(chunk.desde, chunk.hasta);

    aggregate.recibidos = (aggregate.recibidos ?? 0) + (data.recibidos ?? 0);
    aggregate.creados += data.creados ?? 0;
    aggregate.actualizados += data.actualizados ?? 0;
    aggregate.omitidos += data.omitidos ?? 0;

    if (data.errores?.length) {
      aggregate.errores = [...(aggregate.errores ?? []), ...data.errores].slice(0, 50);
    }
    if (data.sots_no_importados?.length) {
      aggregate.sots_no_importados = [
        ...(aggregate.sots_no_importados ?? []),
        ...data.sots_no_importados,
      ].slice(0, 50);
    }
  }

  const total = aggregate.creados + aggregate.actualizados;
  if (aggregate.errores?.length && total === 0) {
    aggregate.mensaje = `Ninguna SOT se guardó en el rango. Recibidas: ${aggregate.recibidos}.`;
  } else if (aggregate.errores?.length) {
    aggregate.mensaje = "Algunas SOT no se importaron porque no se encontraron técnicos asociados.";
  } else if (total === 0 && (aggregate.recibidos ?? 0) === 0) {
    aggregate.mensaje = "No hay SOT atendidas en SOTs para el rango de fechas seleccionado.";
  } else {
    aggregate.mensaje = "Las SOT atendidas se actualizaron correctamente.";
  }

  return aggregate;
};

export const importarLiquidacionesCSV = async (file: File) => {
  const formData = new FormData();
  formData.append("archivo", file);
  const { data } = await api.post(
    `${LiquidacionesComplete.ENDPOINT}/importar-csv`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};

export const exportarResumenLiquidacion = async (
  liquidacionId: number,
): Promise<Blob> => {
  const { data } = await api.get(
    `${LiquidacionesComplete.ENDPOINT}/${liquidacionId}/exportar`,
    { responseType: "blob" },
  );
  return data;
};

export const getInventarioTecnicoLiquidacion = async (tecnicoId: number) => {
  const { data } = await api.get(`/tecnicos/${tecnicoId}/inventario`);
  return data;
};

export const importarActas = async (
  fecha: string,
  archivos: File[],
): Promise<unknown> => {
  const formData = new FormData();
  formData.append("fecha", fecha);
  archivos.forEach((file) => formData.append("archivos[]", file));
  const { data } = await api.post("/actas", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getActaBySot = async (sot: string) => {
  const { data } = await api.get<ActaResource[]>(`/actas/${encodeURIComponent(sot)}`);
  return data;
};

export const getActaBlob = async (rutaArchivo: string): Promise<Blob> => {
  const { data } = await api.post("/archivos", { ruta_pdf: rutaArchivo }, { responseType: "blob" });
  return data;
};
