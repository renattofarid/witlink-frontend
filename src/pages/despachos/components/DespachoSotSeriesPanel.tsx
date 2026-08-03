import { useCallback, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventarioSeriesCorporativoQuery } from "@/pages/corporativo/lib/corporativo.hook";
import { validateSerieMasivoDisponible } from "../lib/despacho.actions";
import type { MasivoSerieValidadaItem } from "../lib/despacho.interface";

interface DespachoSotSeriesPanelProps {
  almacenId: number | null;
  sot: string;
  existingSeries: Set<string>;
  onAdd: (item: MasivoSerieValidadaItem) => void;
}

// Sugiere, para la SOT ingresada, las series ya reservadas para ella o
// libres en el almacén activo — evita que el usuario tenga que volver a
// tipear a mano lo que un admin corporativo ya apartó desde Inventario.
export function DespachoSotSeriesPanel({
  almacenId,
  sot,
  existingSeries,
  onAdd,
}: DespachoSotSeriesPanelProps) {
  const [addingSerie, setAddingSerie] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  const params = useMemo(
    () => ({ almacen_id: String(almacenId ?? ""), sot, per_page: "50" }),
    [almacenId, sot],
  );

  const { data, isLoading, isFetching } = useInventarioSeriesCorporativoQuery(
    params,
    !!almacenId && sot.trim().length > 0,
  );

  // El endpoint ya filtra a solo series con reserva ACTIVA para esta SOT.
  // Se descarta aquí, por seguridad, cualquiera que ya no siga disponible
  // (por ejemplo si fue despachada pero su reserva aún no se consumió).
  const disponibles = (data?.data ?? []).filter((s) => s.situacion === "DI");

  const handleAdd = useCallback(
    async (serie: string) => {
      setAddingSerie(serie);
      setRowError((prev) => ({ ...prev, [serie]: "" }));
      try {
        const res = await validateSerieMasivoDisponible(serie, almacenId);
        onAdd({
          id: res.serie.id,
          serie: res.serie.serie,
          producto_id: res.serie.producto_id,
          producto_nombre: res.serie.producto.nombre,
          producto_sap: res.serie.producto.sap,
          producto_tipo: res.serie.producto.tipo,
        });
      } catch (err: any) {
        setRowError((prev) => ({
          ...prev,
          [serie]: err.response?.data?.message ?? "Serie no disponible",
        }));
      } finally {
        setAddingSerie(null);
      }
    },
    [onAdd, almacenId],
  );

  if (!sot.trim() || !almacenId) return null;

  return (
    <div className="rounded-md border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Series reservadas / disponibles para la SOT "{sot}"
        </p>
        {isFetching && (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        )}
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Buscando...</p>
      ) : disponibles.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No hay series reservadas ni disponibles para esta SOT en el almacén
          actual.
        </p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {disponibles.map((item) => {
            const already = existingSeries.has(item.serie.toUpperCase());
            return (
              <div
                key={item.serie_id}
                className="flex items-center gap-2 rounded-md border px-2 py-1.5 bg-background"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-mono font-medium">
                    {item.serie}
                  </span>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.producto}
                    {item.reserva_sot && (
                      <>
                        <span className="mx-1 text-border">·</span>
                        reservado: {item.reserva_sot}
                      </>
                    )}
                  </p>
                  {rowError[item.serie] && (
                    <p className="text-xs text-destructive">
                      {rowError[item.serie]}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={already ? "ghost" : "outline"}
                  disabled={already || addingSerie === item.serie}
                  onClick={() => handleAdd(item.serie)}
                >
                  {addingSerie === item.serie ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : already ? (
                    "Agregada"
                  ) : (
                    <>
                      <Plus className="size-3 mr-1" />
                      Agregar
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
