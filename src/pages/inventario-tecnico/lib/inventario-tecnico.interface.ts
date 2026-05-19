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

export interface SerieInventarioItem {
  id: number;
  despacho_id: number;
  producto_id: number;
  cantidad: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categoria_id: number;
  sap: string;
  nombre: string;
  tipo: string;
  tecnico_id: number;
  numero: string;
  fecha: string;
  almacen_id: number;
  serie_id: number;
  detalle_productos_despacho_id: number;
  serie: string;
  situacion: string;
  mac: string | null;
  ua: string | null;
  emta_mac: string | null;
  producto: ProductoInventario;
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
