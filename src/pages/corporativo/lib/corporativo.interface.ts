import type { PaginationResponse } from "@/lib/core.interface";
import type {
  InventarioMaterialResource,
  InventarioSerieResource,
} from "@/pages/inventario/lib/inventario.interface";

export type CorporativoInventarioSerieResponse =
  PaginationResponse<InventarioSerieResource>;

export type CorporativoInventarioMaterialResponse =
  PaginationResponse<InventarioMaterialResource>;

export interface ReservaSotBody {
  numero_sot: string;
  almacen_id: number;
}

export interface CambiarUbicacionMasivoBody {
  series: number[];
  situacion: "DI" | "DE" | "IN" | "RE" | "TR";
  sot?: string;
}

export interface CambiarUbicacionMasivoResponse {
  message: string;
  data: {
    procesadas: number;
    series: number[];
  };
}
