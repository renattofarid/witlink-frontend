import GeneralSheet from "@/components/GeneralSheet";
import { useSerieMovimientosQuery } from "../lib/inventario.hook";
import type { InventarioSerieResource } from "../lib/inventario.interface";
import { Loader2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  open: boolean;
  onClose: () => void;
  serie: InventarioSerieResource | null;
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
};

function tipoClass(tipo: string) {
  return TIPO_BADGE[tipo] ?? "bg-muted text-muted-foreground";
}

export default function InventarioSerieHistorialSheet({
  open,
  onClose,
  serie,
}: Props) {
  const { data: movimientos, isLoading } = useSerieMovimientosQuery(
    open && serie ? serie.serie_id : null,
  );

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Historial — ${serie?.serie ?? ""}`}
      subtitle={serie ? `${serie.sap} · ${serie.producto}` : undefined}
      icon="History"
      size="xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !movimientos?.length ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Sin movimientos registrados.
        </p>
      ) : (
        <ol className="relative border-l border-border ml-3">
          {movimientos.map((m, i) => (
            <li key={i} className="mb-6 ml-6">
              <span className="absolute -left-3 flex size-6 items-center justify-center rounded-full bg-primary ring-4 ring-background text-primary-foreground text-[10px] font-bold">
                {i + 1}
              </span>

              <div className="rounded-lg border bg-card p-3 shadow-sm space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tipoClass(m.tipo_movimiento)}`}
                  >
                    {m.tipo_movimiento}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(m.fecha), "dd MMM yyyy", {
                      locale: es,
                    }).toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-xs uppercase">
                  <span className="text-muted-foreground">{m.origen}</span>
                  <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{m.destino}</span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-1 text-xs text-muted-foreground uppercase">
                  <div className="flex items-center gap-2">
                    <span>📍 {m.ubicacion}</span>
                    {m.guia && (
                      <Badge variant="ghost" className="text-xs h-5 px-1.5">
                        {m.guia}
                      </Badge>
                    )}
                  </div>
                  <span title={`Registrado: ${m.registro}`}>
                    👤 {m.usuario}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </GeneralSheet>
  );
}
