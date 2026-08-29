import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import { GuiaComplete } from "../lib/guia.constants";
import { getGuia, openPdf } from "../lib/guia.actions";
import FormSkeleton from "@/components/FormSkeleton";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

export default function GuiaViewPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);

  const { data: guia, isLoading } = useQuery({
    queryKey: [GuiaComplete.QUERY_KEY, "detail", id],
    queryFn: () => getGuia(Number(id)),
    enabled: !!id,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <FormSkeleton />;

  if (!guia) {
    return (
      <FormWrapper>
        <div className="text-muted-foreground text-sm">Guía no encontrada.</div>
      </FormWrapper>
    );
  }

  const persona = guia.usuario?.persona;
  const nombreUsuario = persona
    ? `${persona.nombre} ${persona.apellido_paterno}`
    : (guia.usuario?.nombre_usuario ?? "—");

  const fecha = guia.fecha
    ? new Date(guia.fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";
  const isCorporativo = guia.is_corporativo === true || !!user?.is_corporativo;
      
  return (
    <FormWrapper>
      <TitleFormComponent
        title={GuiaComplete.MODEL.name}
        mode="detail"
        icon="ClipboardList"
        backRoute={GuiaComplete.ABSOLUTE_ROUTE}
      />

      {/* ── Datos de la guía ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Datos de la guía
          </h3>
          <Separator className="mt-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Número</p>
            <p className="font-medium">{guia.numero}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Fecha</p>
            <p className="font-medium">{fecha}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Registrado por</p>
            <p className="font-medium">{nombreUsuario}</p>
          </div>
          {isCorporativo && guia.origen_importacion && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Origen</p>
              <Badge variant="outline" className="text-xs">
                {guia.origen_importacion}
              </Badge>
            </div>
          )}
          {isCorporativo && guia.numero_entrega && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">N° Entrega</p>
              <p className="font-medium">{guia.numero_entrega}</p>
            </div>
          )}
          {isCorporativo && guia.numero_guia_1 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">N° Guía 1</p>
              <p className="font-medium">{guia.numero_guia_1}</p>
            </div>
          )}
          {isCorporativo && guia.numero_guia_2 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">N° Guía 2</p>
              <p className="font-medium">{guia.numero_guia_2}</p>
            </div>
          )}
          {isCorporativo && guia.sol_abastecimiento && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">N° Solicitud</p>
              <p className="font-medium">{guia.sol_abastecimiento}</p>
            </div>
          )}
          {isCorporativo && guia.pedido_traslado && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">N° Pedido</p>
              <p className="font-medium">{guia.pedido_traslado}</p>
            </div>
          )}
        </div>

        {guia.ruta_pdf_guia && (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openPdf(guia.ruta_pdf_guia!)}
            >
              <FileText className="size-3.5 mr-1" />
              Ver PDF adjunto
            </Button>
          </div>
        )}
      </div>

      {/* ── Productos ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Productos
          </h3>
          <Separator className="mt-2" />
        </div>

        {(guia.productos?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">Esta guía no tiene productos registrados.</p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead>Producto / Serie</TableHead>
                  <TableHead className="w-28">Tipo</TableHead>
                  <TableHead className="w-16 text-right">Cant.</TableHead>
                  <TableHead className="w-28">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guia.productos!.map((producto, index) => {
                  const hasSeries = (producto.series?.length ?? 0) > 0;
                  const isProductConfirmado = producto.confirmado === 1;

                  return (
                    <>
                      {/* Product row */}
                      <TableRow key={`p-${producto.id}`}>
                        <TableCell className="text-center text-xs text-muted-foreground font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium leading-tight">{producto.producto.nombre}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {producto.producto.sap}
                            {producto.posicion && (
                              <>
                                {" · Pos. "}
                                {producto.posicion}
                              </>
                            )}
                            {producto.nro_lote && (
                              <>
                                {" · Lote "}
                                {producto.nro_lote}
                              </>
                            )}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {producto.producto.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(producto.cantidad)}
                          {producto.unidad_medida && (
                            <span className="text-xs text-muted-foreground ml-1">
                              {producto.unidad_medida}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" color={isProductConfirmado ? "green" : "muted"} className="text-xs">
                            {isProductConfirmado ? "Confirmado" : "Pendiente"}
                          </Badge>
                        </TableCell>
                      </TableRow>

                      {/* Serie sub-rows */}
                      {hasSeries &&
                        producto.series.map((serieItem, sIndex) => {
                          const isSerieConfirmada = serieItem.confirmado === 1;
                          return (
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
                              <TableCell>
                                <Badge variant="default" color={isSerieConfirmada ? "green" : "muted"} className="text-xs">
                                  {isSerieConfirmada ? "Confirmado" : "Pendiente"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </FormWrapper>
  );
}
