import { Link } from "react-router-dom";
import { Truck, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuiaDevolucionComplete } from "@/pages/guia-devolucion/lib/devolucion.constants";
import type { DespachoSotItem } from "../lib/liquidaciones.interface";

interface Props {
  despachosSot: DespachoSotItem[];
}

/**
 * Vista de equipos/materiales agrupados por despacho, usada en el detalle de
 * liquidación cuando `meta.modo_operativo === "pext_por_despacho"`. Reemplaza
 * al bloque de "equipos retirados" del flujo estándar.
 */
export default function LiquidacionDespachosSotView({ despachosSot }: Props) {
  if (despachosSot.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-1">
        Sin despachos asociados a esta SOT.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {despachosSot.map((despacho) => (
        <div key={despacho.id} className="rounded-lg border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-muted/30 border-b">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="size-3.5 text-muted-foreground shrink-0" />
              <span className="font-mono font-semibold">{despacho.numero}</span>
              <span className="text-xs text-muted-foreground">
                SOT {despacho.sot} · {despacho.fecha}
              </span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link
                to={`${GuiaDevolucionComplete.ROUTE_ADD}?sot=${encodeURIComponent(despacho.sot)}&despacho_id=${despacho.id}`}
              >
                <Undo2 className="size-3.5 mr-1" />
                Devolver equipos
              </Link>
            </Button>
          </div>

          <div className="px-4 py-3 space-y-1.5">
            {despacho.productos.map((item) => {
              const seriesStr = item.series.map((s) => s.serie.serie).join(", ");
              const cantidad = Number(item.cantidad);
              return (
                <div key={item.id} className="flex items-start gap-2">
                  <span className="font-mono text-xs text-muted-foreground shrink-0 w-28 truncate mt-0.5">
                    {item.producto?.sap ?? "—"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{item.producto?.nombre ?? "Desconocido"}</p>
                    {seriesStr && (
                      <p className="text-xs text-muted-foreground font-mono">
                        Serie: {seriesStr}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                    ({cantidad} {cantidad === 1 ? "unidad" : "unidades"})
                  </span>
                </div>
              );
            })}
            {despacho.productos.length === 0 && (
              <p className="text-xs text-muted-foreground">Sin productos en este despacho.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
