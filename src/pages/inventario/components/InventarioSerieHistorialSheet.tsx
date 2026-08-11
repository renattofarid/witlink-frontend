import GeneralSheet from "@/components/GeneralSheet";
import { DataTable } from "@/components/DataTable";
import { useSerieHistorialQuery } from "../lib/inventario.hook";
import type { SerieHistorialKardexItem } from "../lib/inventario.interface";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { ColumnDef } from "@tanstack/react-table";

/** Resumen mínimo de una serie necesario para abrir el sheet de historial.
 *  Estructural a propósito: tanto `InventarioSerieResource` (vista Inventario)
 *  como `SerieResource` (vista Series) lo satisfacen sin necesidad de cast. */
export interface HistorialSerieSummary {
  serie_id?: number;
  id?: number;
  serie: string;
  sap: string;
  producto: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  serie: HistorialSerieSummary | null;
}

const TIPO_BADGE: Record<string, string> = {
  "INGRESO CONFIRMADO":
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  DESPACHADO:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  INSTALADO:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  DEVUELTO:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  LIQUIDADO:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function tipoClass(tipo: string) {
  return TIPO_BADGE[tipo] ?? "bg-muted text-muted-foreground";
}

function formatFecha(fecha: string | null | undefined) {
  if (!fecha) return "—";
  try {
    return format(parseISO(fecha), "dd MMM yyyy", { locale: es }).toUpperCase();
  } catch {
    return fecha;
  }
}

const movimientoBadgeColor: Record<string, BadgeColor> = {
  INGRESO: "green",
  SALIDA: "red",
  DEVOLUCION: "blue",
  LIQUIDACION_INSTALADO: "yellow",
  RETIRADO: "gray",
};

const kardexColumns: ColumnDef<SerieHistorialKardexItem>[] = [
  { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => formatFecha(row.original.fecha) },
  { accessorKey: "movimiento", header: "Movimiento", cell: ({ row }) => (
    <Badge variant="default" color={movimientoBadgeColor[row.original.movimiento] ?? "default"}>
      {row.original.movimiento}
    </Badge>
  ) },
  { accessorKey: "cantidad", header: "Cantidad" },
  { accessorKey: "ubicacion", header: "Ubicación" },
  { accessorKey: "stock_anterior", header: "Stock Anterior" },
  { accessorKey: "stock_actual", header: "Stock Actual" },
];

export default function InventarioSerieHistorialSheet({
  open,
  onClose,
  serie,
}: Props) {
  const serieId = serie?.serie_id ?? serie?.id ?? null;
  const { data, isLoading } = useSerieHistorialQuery(
    open ? serieId : null,
  );

  const detalle = data?.serie;
  const cierre = data?.cierre_definitivo;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Historial — ${serie?.serie ?? ""}`}
      subtitle={serie ? `${serie.sap} · ${serie.producto}` : undefined}
      icon="History"
      size="3xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !data ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Sin información de trazabilidad.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Resumen general */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground uppercase">Fecha de ingreso</p>
                <p className="font-medium">{formatFecha(detalle?.fecha_ingreso)}</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase">Técnico actual</p>
                <p className="font-medium">
                  {detalle?.tecnico_actual
                    ? `${detalle.tecnico_actual.nombre} (${detalle.tecnico_actual.dni})`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase">SOT actual</p>
                <p className="font-medium">{data.sot_actual ?? "—"}</p>
              </div>
            </div>

            {cierre?.cerrada && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>
                  Cierre definitivo: LIQUIDADA — SOT {cierre.sot} —{" "}
                  {formatFecha(cierre.fecha)}
                </span>
              </div>
            )}
          </div>

          {/* Timeline de eventos */}
          {!data.eventos?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Sin movimientos registrados.
            </p>
          ) : (
            <ol className="relative border-l border-border ml-3">
              {data.eventos.map((m, i) => (
                <li key={i} className="mb-6 ml-6">
                  <span className="absolute -left-3 flex size-6 items-center justify-center rounded-full bg-primary ring-4 ring-background text-primary-foreground text-[10px] font-bold">
                    {i + 1}
                  </span>

                  <div className="rounded-lg border bg-card p-3 shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tipoClass(m.tipo_label)}`}
                      >
                        {m.tipo_label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatFecha(m.fecha)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-1 text-xs text-muted-foreground uppercase">
                      <div className="flex items-center gap-2">
                        {m.almacen && <span>📍 {m.almacen.nombre}</span>}
                        {m.tecnico && <span>🔧 {m.tecnico.nombre}</span>}
                        {m.referencia && (
                          <Badge variant="ghost" className="text-xs h-5 px-1.5">
                            {m.referencia}
                          </Badge>
                        )}
                      </div>
                      <span title={`Registrado: ${m.registrado_en}`}>
                        👤 {m.usuario}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {/* Kardex asociado */}
          {!!data.kardex?.length && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Movimientos de kardex
              </p>
              <DataTable
                columns={kardexColumns}
                data={data.kardex}
                variant="simple"
                isVisibleColumnFilter={false}
              />
            </div>
          )}
        </div>
      )}
    </GeneralSheet>
  );
}
