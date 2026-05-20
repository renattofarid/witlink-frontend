import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GuiaComplete } from "../lib/guia.constants";
import { getEquipoRetirado } from "@/pages/equipo-retirado/lib/equipo-retirado.actions";
import { EquipoRetiradoComplete } from "@/pages/equipo-retirado/lib/equipo-retirado.constants";
import FormSkeleton from "@/components/FormSkeleton";

export default function GuiaEquipoRetiradoViewPage() {
  const { id } = useParams();

  const { data: retirado, isLoading } = useQuery({
    queryKey: [EquipoRetiradoComplete.QUERY_KEY, "detail", id],
    queryFn: () => getEquipoRetirado(Number(id)),
    enabled: !!id,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <FormSkeleton />;

  if (!retirado) {
    return (
      <FormWrapper>
        <div className="text-muted-foreground text-sm">Equipo retirado no encontrado.</div>
      </FormWrapper>
    );
  }

  const fecha = retirado.fecha
    ? new Date(retirado.fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Equipo Retirado"
        mode="detail"
        icon="ClipboardList"
        backRoute={GuiaComplete.ABSOLUTE_ROUTE}
      />

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Datos del equipo retirado
          </h3>
          <Separator className="mt-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">SOT</p>
            <p className="font-medium">{retirado.sot || "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Fecha</p>
            <p className="font-medium">{fecha}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Tipo</p>
            <p className="font-medium">{retirado.nombre_tipo || retirado.tipo || "—"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Productos
          </h3>
          <Separator className="mt-2" />
        </div>

        {(retirado.productos?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">Sin productos registrados.</p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead>Producto / Serie</TableHead>
                  <TableHead className="w-28">Tipo</TableHead>
                  <TableHead className="w-16 text-right">Cant.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {retirado.productos.map((producto, index) => (
                  <>
                    <TableRow key={`p-${producto.id}`}>
                      <TableCell className="text-center text-xs text-muted-foreground font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium leading-tight">{producto.producto.nombre}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{producto.producto.sap}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {producto.producto.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{Number(producto.cantidad)}</TableCell>
                    </TableRow>

                    {producto.series?.map((serieItem, sIndex) => (
                      <TableRow
                        key={`s-${serieItem.serie?.id ?? sIndex}`}
                        className="bg-muted/20 hover:bg-muted/30"
                      >
                        <TableCell className="text-center text-muted-foreground">↳</TableCell>
                        <TableCell className="pl-4 border-l-2 border-l-muted-foreground/20">
                          <span className="text-xs font-mono font-medium">
                            {serieItem.serie?.serie || "—"}
                          </span>
                          {serieItem.serie?.mac && (
                            <span className="text-xs text-muted-foreground ml-2">
                              · MAC: {serieItem.serie.mac}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {serieItem.serie?.situacion || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </FormWrapper>
  );
}
