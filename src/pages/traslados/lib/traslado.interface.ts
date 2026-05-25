import type { PaginationResponse } from "@/lib/core.interface";

export interface TrasladoResource {
  fecha: string;
  guia: null | string;
  tipo_movimiento: string;
  movimiento: string;
  ubicacion: string;
  origen: null | string;
  destino: string;
  registro: string;
  usuario: string;
}

export interface TrasladoProducto {
  id: number;
  producto_id: number;
  producto: string;
  tipo: string;
  cantidad: number;
  movimiento_pendiente_id: number;
  movimiento_confirmado_id: number | null;
  series: string[];
}

export interface TrasladoListItem {
  id: number;
  fecha: string | null;
  numero: string;
  confirmado: boolean;
  almacen_origen_id: number;
  almacen_origen: string;
  almacen_destino_id: number;
  almacen_destino: string;
  cantidad_materiales: number;
  cantidad_series: number;
  usuario: string;
  usuario_confirmo: string | null;
  productos: TrasladoProducto[];
  "fecha_envío": string;
  "fecha_confirmación": string | null;
}

export type TrasladoListResponse = PaginationResponse<TrasladoListItem>;

export interface TrasladoSerieCreateBody {
  destino_almacen_id: number;
  modo_retirados?: boolean;
  series: number[];
}

export interface TrasladoMaterialItem {
  material_id: number;
  cantidad: number;
}

export interface TrasladoMaterialCreateBody {
  destino_almacen_id: number;
  materiales: TrasladoMaterialItem[];
}
