import { Wrench, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type {
  DesasignacionMaterialDetalleResource,
  DesasignacionSerieDetalleResource,
} from "../lib/desasignacion.interface";

interface Props {
  series: DesasignacionSerieDetalleResource[];
  materiales: DesasignacionMaterialDetalleResource[];
}

export function DesasignacionViewDetalle({ series, materiales }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wrench className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Series / Equipos</h3>
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {series.length} {series.length === 1 ? "ítem" : "ítems"}
          </span>
        </div>

        {series.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sin series devueltas.
          </p>
        ) : (
          <div className="divide-y rounded-md border">
            {series.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="w-5 shrink-0 text-right text-xs text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {s.serie?.producto.nombre || "—"}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {s.serie?.serie ?? "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Materiales</h3>
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {materiales.length} {materiales.length === 1 ? "ítem" : "ítems"}
          </span>
        </div>

        {materiales.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sin materiales devueltos.
          </p>
        ) : (
          <div className="divide-y rounded-md border">
            {materiales.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="w-5 shrink-0 text-right text-xs text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.producto.nombre}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {m.producto.sap ?? "—"}
                  </p>
                </div>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  ×{Number(m.cantidad)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
