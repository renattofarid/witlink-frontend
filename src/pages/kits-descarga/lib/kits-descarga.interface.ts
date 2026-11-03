import type { PaginationResponse } from "@/lib/core.interface";

export interface CategoriaTrabajo {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
  deleted_at?: string | null;
}

export interface TipoTrabajo {
  id: number;
  categoria_trabajo_id: number;
  codigo: string;
  nombre: string;
  tecnologia: string | null;
  activo: boolean;
  categoria_trabajo?: CategoriaTrabajo | null;
  deleted_at?: string | null;
}

export interface KitDetalle {
  id?: number;
  producto_id: number;
  cantidad: number;
  unidad_medida: string | null;
  producto?: {
    id: number;
    sap: string | null;
    nombre: string;
    tipo?: string;
    origen?: string;
  } | null;
}

export interface KitDescarga {
  id: number;
  tipo_trabajo_id: number;
  modalidad: string | null;
  paquete: string | null;
  version: number;
  estado: "BORRADOR" | "PUBLICADO" | "INACTIVO" | string;
  vigencia_desde: string | null;
  vigencia_hasta: string | null;
  activo: boolean;
  publicado_at: string | null;
  publicado_por: number | null;
  observaciones: string | null;
  tipo_trabajo?: TipoTrabajo | null;
  detalles: KitDetalle[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export type KitResponse = PaginationResponse<KitDescarga>;
export type CategoriaResponse = PaginationResponse<CategoriaTrabajo>;
export type TipoTrabajoResponse = PaginationResponse<TipoTrabajo>;

export interface KitDetalleBody {
  producto_id: number;
  cantidad: number;
  unidad_medida?: string | null;
}

export interface KitBody {
  tipo_trabajo_id: number;
  modalidad?: string | null;
  paquete?: string | null;
  version: number;
  vigencia_desde?: string | null;
  vigencia_hasta?: string | null;
  activo?: boolean;
  observaciones?: string | null;
  detalles: KitDetalleBody[];
}

export interface CategoriaBody {
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface TipoTrabajoBody {
  categoria_trabajo_id: number;
  codigo: string;
  nombre: string;
  tecnologia?: string | null;
  activo: boolean;
}

export interface KitHistorialEvent {
  id: number;
  accion: string;
  entidad: string;
  entidad_id: number;
  datos_anteriores?: Record<string, unknown> | null;
  datos_nuevos?: Record<string, unknown> | null;
  usuario_id?: number | null;
  created_at: string;
}

export interface ComparacionKit {
  liquidacion: {
    id: number;
    sot: string;
    fecha: string | null;
    tipo_trabajo: string | null;
    paquete: string | null;
  };
  kit: KitDescarga | null;
  origen_kit: string;
  resumen: {
    total_productos: number;
    conformes: number;
    excesos: number;
    menores_consumos: number;
    fuera_de_kit: number;
  };
  detalles: Array<{
    producto_id: number;
    sap: string | null;
    nombre: string;
    unidad_medida: string | null;
    cantidad_estandar: number;
    cantidad_real: number;
    diferencia: number;
    diferencia_porcentual: number | null;
    resultado: "conforme" | "exceso" | "menor_consumo" | "fuera_de_kit" | string;
  }>;
}

export interface ReporteLiquidaciones {
  data: Array<{
    liquidacion_id: number;
    sot: string;
    fecha: string | null;
    kit_descarga_id: number | null;
    producto_id: number | null;
    cantidad_estandar: number;
    cantidad_real: number;
    diferencia: number;
    resultado: string;
  }>;
  resumen: {
    total_liquidaciones: number;
    total_registros: number;
    conformes: number;
    excesos: number;
    menores_consumos: number;
    fuera_de_kit: number;
  };
  alertas: Array<{
    tecnico_id: number;
    producto_id: number;
    sots_con_exceso: number;
    exceso_acumulado: number;
  }>;
  cobertura: {
    liquidaciones_liquidadas: number;
    con_kit: number;
    sin_kit: number;
    porcentaje_con_kit: number;
  };
  meta: Record<string, unknown>;
}

export interface ExcelFileResponse {
  file_name: string;
  mime_type: string;
  file_base64?: string;
  base64?: string;
}

