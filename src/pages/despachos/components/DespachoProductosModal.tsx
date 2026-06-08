import { useState } from "react";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GeneralSheet from "@/components/GeneralSheet";
import type { DespachoProductoDetalleResource } from "../lib/despacho.interface";

const SITUACION_LABELS: Record<string, string> = {
  DE: "Despachado",
  DI: "Disponible",
  MA: "Mantenimiento",
  BA: "Baja",
};

interface DespachoProductosModalProps {
  productos: DespachoProductoDetalleResource[];
  despachoNumero?: string;
}

export function DespachoProductosModal({
  productos,
  despachoNumero,
}: DespachoProductosModalProps) {
  const [open, setOpen] = useState(false);
  const count = productos?.length ?? 0;

  if (!count) return <span className="text-muted-foreground text-xs">—</span>;

  return (
    <>
      <Button
        variant="secondary"
        color="primary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Package className="size-3" />
        {count} producto{count !== 1 ? "s" : ""}
      </Button>

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Detalle de productos"
        subtitle={despachoNumero ? `Despacho ${despachoNumero}` : undefined}
        icon="Package"
        size="4xl"
      >
        <div className="space-y-4">
          {productos.map((item, i) => {
            const series = item.series ?? [];

            return (
              <div
                key={item.id ?? i}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">
                      {item.producto.nombre || item.producto.sap || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {item.producto.sap}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.producto.tipo && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.producto.tipo}
                      </Badge>
                    )}
                    <Badge variant="default" className="text-xs">
                      Cant: {item.cantidad}
                    </Badge>
                  </div>
                </div>

                {series.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Series ({series.length})
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-muted-foreground uppercase tracking-wide">
                            <th className="py-1.5 px-2 text-left font-medium w-8">
                              #
                            </th>
                            <th className="py-1.5 px-2 text-left font-medium">
                              Serie
                            </th>
                            <th className="py-1.5 px-2 text-left font-medium">
                              MAC
                            </th>
                            <th className="py-1.5 px-2 text-left font-medium">
                              EMTA MAC
                            </th>
                            <th className="py-1.5 px-2 text-left font-medium">
                              UA
                            </th>
                            <th className="py-1.5 px-2 text-left font-medium">
                              Situación
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {series.map((s, si) => (
                            <tr
                              key={si}
                              className="border-b last:border-0 hover:bg-muted/30"
                            >
                              <td className="py-1.5 px-2 text-muted-foreground">
                                {si + 1}
                              </td>
                              <td className="py-1.5 px-2 font-mono font-medium">
                                {s.serie?.serie || (
                                  <span className="text-muted-foreground italic">
                                    pendiente
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 px-2 font-mono text-muted-foreground">
                                {s.serie?.mac ? (
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-mono font-normal"
                                  >
                                    {s.serie.mac}
                                  </Badge>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="py-1.5 px-2 font-mono text-muted-foreground">
                                {s.serie?.emta_mac ? (
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-mono font-normal"
                                  >
                                    {s.serie.emta_mac}
                                  </Badge>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="py-1.5 px-2 text-muted-foreground">
                                {s.serie?.ua || "—"}
                              </td>
                              <td className="py-1.5 px-2">
                                {s.serie?.situacion ? (
                                  <Badge variant="default" className="text-xs">
                                    {SITUACION_LABELS[s.serie.situacion] ??
                                      s.serie.situacion}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sin series registradas.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </GeneralSheet>
    </>
  );
}
