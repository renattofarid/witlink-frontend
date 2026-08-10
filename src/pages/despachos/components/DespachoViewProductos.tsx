import { Badge } from "@/components/ui/badge";
import type { DespachoProductoDetalleResource } from "../lib/despacho.interface";

interface Props {
  productos: DespachoProductoDetalleResource[];
}

export function DespachoViewProductos({ productos }: Props) {
  if (!productos.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Sin productos registrados.
      </p>
    );
  }

  return (
    <div className="divide-y rounded-md border">
      {productos.map((p, i) => {
        const series = (p.series ?? [])
          .map((s) => s.serie)
          .filter((s): s is NonNullable<typeof s> => !!s);

        return (
          <div key={p.id} className="flex flex-col gap-2 px-3 py-2.5">
            <div className="flex items-center gap-3">
              <span className="w-5 shrink-0 text-right text-xs text-muted-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {p.producto.nombre || p.producto.sap || "—"}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {p.producto.sap}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {p.producto.tipo && (
                  <Badge color="muted" className="text-xs">
                    {p.producto.tipo}
                  </Badge>
                )}
                {p.producto.origen && (
                  <Badge variant="outline" className="text-xs">
                    {p.producto.origen}
                  </Badge>
                )}
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  ×{Number(p.cantidad)}
                </span>
              </div>
            </div>

            {series.length > 0 && (
              <div className="ml-8 flex flex-wrap items-center gap-1.5">
                {series.map((s) => (
                  <Badge
                    key={s.id}
                    variant="outline"
                    className="font-mono text-xs"
                    title={[
                      s.mac && `MAC: ${s.mac}`,
                      s.emta_mac && `EMTA MAC: ${s.emta_mac}`,
                      s.ua && `UA: ${s.ua}`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || undefined}
                  >
                    {s.serie}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
