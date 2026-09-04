import { useMemo } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventarioMaterialesCorporativoQuery } from "@/pages/corporativo/lib/corporativo.hook";
import type { DespachoProductoFormValues } from "../lib/despacho.schema";

interface DespachoSotMaterialsPanelProps {
  almacenId: number | null;
  sot: string;
  existingProductIds: Set<string>;
  onAdd: (item: DespachoProductoFormValues) => void;
}

export function DespachoSotMaterialsPanel({
  almacenId,
  sot,
  existingProductIds,
  onAdd,
}: DespachoSotMaterialsPanelProps) {
  const params = useMemo(
    () => ({ almacen_id: String(almacenId ?? ""), sot, per_page: "50" }),
    [almacenId, sot],
  );

  const { data, isLoading, isFetching } = useInventarioMaterialesCorporativoQuery(
    params,
    !!almacenId && sot.trim().length > 0,
  );

  const reservedMaterials = (data?.data ?? []).filter(
    (m) => Number(m.cantidad_reservada ?? 0) > 0 || m.reserva_sot === sot,
  );

  if (!sot.trim() || !almacenId) return null;

  return (
    <div className="rounded-md border bg-muted/20 p-3 space-y-2 mb-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Materiales reservados / disponibles para la SOT "{sot}"
        </p>
        {isFetching && (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        )}
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Buscando...</p>
      ) : reservedMaterials.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No hay materiales reservados para esta SOT en el almacén actual.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {reservedMaterials.map((item) => {
            const prodIdStr = String(item.producto_id);
            const alreadyAdded = existingProductIds.has(prodIdStr);
            const cantReservada = Number(item.cantidad_reservada ?? 1);

            return (
              <div
                key={item.producto_id}
                className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 bg-background"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-foreground">
                    {item.producto}
                  </span>
                  <p className="text-xs text-muted-foreground truncate">
                    SAP: {item.sap ?? "—"}
                    {item.reserva_sot && (
                      <>
                        <span className="mx-1 text-border">·</span>
                        reservado: {item.reserva_sot} ({cantReservada} un.)
                      </>
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={alreadyAdded}
                  className="h-7 text-xs px-2 shrink-0"
                  onClick={() =>
                    onAdd({
                      producto_id: prodIdStr,
                      nombre: item.producto,
                      sap: item.sap,
                      tipo: (item.tipo as "MATERIAL" | "EQUIPO") ?? "MATERIAL",
                      cantidad: cantReservada > 0 ? cantReservada : 1,
                      series: [],
                    })
                  }
                >
                  <Plus className="size-3 mr-1" />
                  {alreadyAdded ? "Agregado" : "Agregar"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
