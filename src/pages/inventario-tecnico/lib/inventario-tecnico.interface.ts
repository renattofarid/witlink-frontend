export interface InventarioTecnicoResource {
  id: number;
  tipo: string; // "serie" | "material"
  producto: string;
  sap: string;
  cantidad: number | null;
  serie: string | null;
  fecha: string;
}

export interface DevolverMaterialBody {
  cantidad: number;
}
