export interface MovimientoReciente {
  fecha: string;
  codigo: string;
  producto: string;
  tipo: string;
  movimiento: string;
  cantidad: string;
  ubicacion: string;
  serie: string | null;
  referencia: string | null;
}

export interface DashboardData {
  equipos_almacen: number;
  equipos_tecnicos: number;
  materiales_disponibles: string | number;
  movimientos_recientes: MovimientoReciente[];
  ingresos_hoy: number;
  material_consumido: string | number;
}

export interface DashboardDetalleResponse<T = Record<string, any>> {
  titulo: string;
  tipo: string;
  data: T[];
}
