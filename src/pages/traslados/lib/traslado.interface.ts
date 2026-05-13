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

export interface TrasladoListItem {
  id: number;
  fecha: string;
  codigo: string;
  producto: string;
  tipo_producto: string;
  cantidad: number;
  almacen_origen_id: number;
  almacen_origen: string;
  almacen_destino_id: number;
  almacen_destino: string;
  serie: string | null;
  usuario: string;
  registro: string;
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
