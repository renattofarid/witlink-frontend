// --- Raw API types ---

interface ProductoInventario {
  id: number;
  sap: string;
  nombre: string;
  tipo: string;
  necesita_serie: boolean;
}

interface MaterialDetalle {
  id: number;
  producto_id: number;
  cantidad: string;
  almacen_id: number;
  producto: ProductoInventario;
}

export interface MaterialInventarioItem {
  id: number;
  tecnico_id: number;
  material_id: number;
  cantidad: number;
  created_at: string;
  updated_at: string;
  material: MaterialDetalle;
}

interface SerieDetalle {
  id: number;
  producto_id: number;
  serie: string;
  situacion: string;
  mac: string | null;
  ua: string | null;
  created_at: string;
  updated_at: string;
  almacen_id: number;
  emta_mac: string | null;
  deleted_at: string | null;
  producto: ProductoInventario;
}

export interface SerieInventarioItem {
  id: number;
  tecnico_id: number;
  serie_id: number;
  created_at: string;
  updated_at: string;
  serie: SerieDetalle;
}

export interface InventarioTecnicoApiResponse {
  materiales: MaterialInventarioItem[];
  series: SerieInventarioItem[];
}

// --- Normalized for the table ---

export interface InventarioTecnicoResource {
  id: number;
  tipo: "material" | "serie";
  producto: string;
  sap: string;
  cantidad: number | null;
  serie: string | null;
  fecha: string;
}

export interface DevolverMaterialBody {
  cantidad: number;
}

export interface DevolverSerieResponse {
  message: string;
  devolucion_id: number;
}

export interface DevolverMaterialResponse {
  message: string;
  devolucion_id: number;
}

export interface DevolucionSerieItem {
  id: number;
  devolucion_id: number;
  serie_id: number;
  serie: {
    id: number;
    serie: string;
    producto: { id: number; nombre: string; sap: string };
  };
}

export interface DevolucionMaterialItem {
  id: number;
  devolucion_id: number;
  producto_id: number;
  cantidad: string;
  producto: { id: number; nombre: string; sap: string };
}

export interface DevolucionResource {
  id: number;
  numero: string;
  fecha: string;
  tecnico_id: number;
  almacen_id: number;
  usuario_id: number;
  series: DevolucionSerieItem[];
  materiales: DevolucionMaterialItem[];
}
