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
            <TableHead>Origen</TableHead>
            <TableHead className="text-right">Cant.</TableHead>
            <TableHead>Series</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((p, i) => {
            const series = (p.series ?? [])
              .map((s) => s.serie)
              .filter((s): s is NonNullable<typeof s> => !!s);

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
                  {p.producto.tipo ? (
                    <Badge color="muted" className="text-xs">
                      {p.producto.tipo}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell>
                  {p.producto.origen ? (
                    <Badge variant="outline" className="text-xs">
                      {p.producto.origen}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell className="text-right text-sm font-semibold">
                  {Number(p.cantidad)}
                </TableCell>

                <TableCell>
                  {series.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {series.map((s) => {
                        const situacion = s.situacion_label ?? s.situacion;
                        return (
                          <div
                            key={s.id}
                            className="flex items-center gap-2"
                            title={
                              [
                                s.mac && `MAC: ${s.mac}`,
                                s.emta_mac && `EMTA MAC: ${s.emta_mac}`,
                                s.ua && `UA: ${s.ua}`,
                              ]
                                .filter(Boolean)
                                .join(" · ") || undefined
                            }
                          >
                            <span className="font-mono text-xs">{s.serie}</span>
                            {situacion && (
                              <Badge color="muted" className="text-[10px]">
                                {situacion}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
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
