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

export interface TrasladoCreateBody {
  operacion: string;
  destino_almacen_id: number;
  modo_retirados?: number;
}
