import type { PaginationResponse } from "@/lib/core.interface";

export interface DevolucionAlmacenDestino {
  id: number;
  nombre: string;
  codigo: string;
  direccion: string;
}

export interface DevolucionDestinoExtra {
  codigo: string;
  destinatario: string;
  ruc_dni: string;
  telefono: string | null;
  punto_llegada: string;
}

export interface DevolucionDestinosResponse {
  almacenes: DevolucionAlmacenDestino[];
  destinos_extra: DevolucionDestinoExtra[];
}

export interface SerieRetiradaDespachoRef {
  id: number;
  numero: string;
  sot: string;
  fecha: string;
}

export interface SerieRetiradaAlmacenRef {
  id: number;
  nombre: string;
  codigo: string;
  direccion: string;
}

export interface SerieRetiradaResource {
  id: number;
  serie: string;
  mac: string | null;
  emta_mac: string | null;
  ua: string | null;
  situacion: string;
  producto_id: number;
  sap: string;
  producto: string;
  /** Almacén donde reside físicamente la serie (p.ej. el consolidado de retirados). */
  almacen_id?: number;
  almacen?: SerieRetiradaAlmacenRef | null;
  /** Subalmacén operativo al que pertenece el retirado (PINT, PMO, PEXT, Norte, Oriente, etc.). */
  almacen_pertenencia_id?: number | null;
  almacen_pertenencia?: SerieRetiradaAlmacenRef | null;
  /** Solo presente cuando la búsqueda se filtra por `sot`/`despacho_id` (flujo PEXT). */
  despacho?: SerieRetiradaDespachoRef;
}

export interface SerieRetiradaResponse {
  data: SerieRetiradaResource[];
}

export interface SeriesRetiradasParams {
  search?: string;
  almacen_id?: number;
  /** Flujo PEXT: filtra series por SOT en vez de exigir estado RETIRADO. */
  sot?: string;
  /** Flujo PEXT: filtra series por despacho específico. */
  despacho_id?: number;
}

/** Situación que bloquea la selección de una serie para devolución. */
export const SITUACION_BLOQUEADA_DEVOLUCION = "DC";

export interface GuiaDevolucionSerieResource {
  id: number;
  serie: string;
  mac: string | null;
  emta_mac: string | null;
  ua: string | null;
  producto_id: number;
  sap?: string | null;
  producto?: string | null;
}

export interface DevolucionAlmacenRef {
  id: number;
  nombre: string;
  direccion: string;
}

export interface DevolucionUsuarioRef {
  id: number;
  nombre_usuario: string;
  persona: string;
}

export interface DevolucionTransportista {
  nombre: string | null;
  documento: string | null;
  direccion: string | null;
  conductor: string | null;
  licencia_conducir: string | null;
  placa_vehiculo: string | null;
  marca_vehiculo: string | null;
}

export interface DevolucionOtrosDatos {
  peso: string | null;
  numero_bultos: string | null;
}

export interface GuiaDevolucionProductoSerieResource {
  id: number;
  serie: string;
  mac: string | null;
  emta_mac: string | null;
  ua: string | null;
  situacion: string;
}

export interface GuiaDevolucionProductoResource {
  id: number;
  producto_id: number;
  sap: string;
  producto: string;
  cantidad: number;
  unidad: string | null;
  descripcion: string | null;
  marca: string | null;
  modelo: string | null;
  series: GuiaDevolucionProductoSerieResource[];
}

export interface GuiaDevolucionListItem {
  id: number;
  numero: string;
  fecha_emision: string;
  fecha_traslado: string;
  destinatario: string;
  ruc_dni: string;
  telefono: string | null;
  punto_partida: string | null;
  punto_llegada: string;
  observacion: string | null;
  motivo_traslado: string;
  numero_guia_referencia: string | null;
  almacen_origen_id: number;
  almacen_origen: DevolucionAlmacenRef | null;
  almacen_destino_id: number | null;
  almacen_destino: DevolucionAlmacenRef | null;
  destino_tipo: string;
  transportista: DevolucionTransportista;
  otros_datos: DevolucionOtrosDatos;
  anulado: boolean;
  fecha_anulacion: string | null;
  usuario: DevolucionUsuarioRef | null;
  productos: GuiaDevolucionProductoResource[];
  created_at: string;
  updated_at: string;
}

export type GuiaDevolucionListResponse = PaginationResponse<GuiaDevolucionListItem>;

export type GuiaDevolucionResource = GuiaDevolucionListItem;

export interface GuiaDevolucionProductoBody {
  producto_id: number;
  unidad: string;
  descripcion: string;
  marca: string;
  modelo: string;
}

export interface GuiaDevolucionCreateBody {
  fecha_emision: string;
  fecha_traslado: string;
  destinatario: string;
  punto_llegada: string;
  ruc_dni: string;
  telefono?: string | null;
  observacion?: string | null;
  motivo_traslado: string;
  numero_guia_referencia?: string | null;
  transportista_nombre?: string | null;
  transportista_documento?: string | null;
  transportista_direccion?: string | null;
  conductor?: string | null;
  licencia_conducir?: string | null;
  placa_vehiculo?: string | null;
  marca_vehiculo?: string | null;
  peso?: string | null;
  numero_bultos?: string | null;
  series: number[];
  productos?: GuiaDevolucionProductoBody[];
}
