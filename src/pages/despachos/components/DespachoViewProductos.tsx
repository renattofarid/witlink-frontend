import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-right">#</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Cant.</TableHead>
            <TableHead>Series</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((p, i) => {
            const series = (p.series ?? [])
              .map((s) => s.serie)
              .filter((s): s is NonNullable<typeof s> => !!s);

            const situacionText = (s: (typeof series)[number]) =>
              s.situacion_label ?? s.situacion;

            return (
              <TableRow key={p.id} className="align-top">
                <TableCell className="text-right text-xs text-muted-foreground">
                  {i + 1}
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">
                    {p.producto.nombre || p.producto.sap || "—"}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {p.producto.sap}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
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
                    {!p.producto.tipo && !p.producto.origen && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm font-semibold">
                  {Number(p.cantidad)}
                </TableCell>
                <TableCell>
                  {series.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {series.map((s) => (
                        <Badge
                          key={s.id}
                          variant="outline"
                          className="font-mono text-xs"
                          title={
                            [
                              situacionText(s) && `Situación: ${situacionText(s)}`,
                              s.mac && `MAC: ${s.mac}`,
                              s.emta_mac && `EMTA MAC: ${s.emta_mac}`,
                              s.ua && `UA: ${s.ua}`,
                            ]
                              .filter(Boolean)
                              .join(" · ") || undefined
                          }
                        >
                          {s.serie}
                          {situacionText(s) && (
                            <span className="ml-1 rounded bg-muted px-1 text-[10px] font-semibold text-muted-foreground">
                              {situacionText(s)}
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
