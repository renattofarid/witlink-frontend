import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, CheckCircle2, FileText } from "lucide-react";
import { GuiaComplete } from "../lib/guia.constants";
import { getGuia, openPdf, confirmarSerie, confirmarProducto } from "../lib/guia.actions";
import { promiseToast } from "@/lib/core.function";
import FormSkeleton from "@/components/FormSkeleton";

const GRID = "grid grid-cols-[2.5rem_1fr_6rem_4rem_7rem_7rem] gap-3";

export default function GuiaViewPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: guia, isLoading } = useQuery({
    queryKey: [GuiaComplete.QUERY_KEY, "detail", id],
    queryFn: () => getGuia(Number(id)),
    enabled: !!id,
    refetchOnWindowFocus: true,
  });

  const confirmarProductoMutation = useMutation({
    mutationFn: (productoId: number) => confirmarProducto(productoId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [GuiaComplete.QUERY_KEY, "detail", id],
      }),
  });

  const confirmarSerieMutation = useMutation({
    mutationFn: ({ productoGuiaId, serieId }: { productoGuiaId: number; serieId: number }) =>
      confirmarSerie(productoGuiaId, serieId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [GuiaComplete.QUERY_KEY, "detail", id],
      }),
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
            {/* Header */}
            <div className={`${GRID} items-center px-3 py-2 bg-muted/50 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide`}>
              <span className="text-center">#</span>
              <span>Producto / Serie</span>
              <span>Tipo</span>
              <span className="text-right">Cant.</span>
              <span>Estado</span>
              <span>Acción</span>
            </div>

            {guia.productos!.map((producto, index) => {
              const hasSeries = (producto.series?.length ?? 0) > 0;
              const isProductConfirmado = producto.confirmado === 1;

              return (
                <div key={producto.id} className="border-b last:border-0">
                  {/* Product row */}
                  <div className={`${GRID} items-center px-3 py-3`}>
                    <span className="text-center text-xs text-muted-foreground font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {producto.producto.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {producto.producto.sap}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs w-fit">
                      {producto.producto.tipo}
                    </Badge>
                    <span className="text-right text-sm">{Number(producto.cantidad)}</span>
                    <Badge
                      variant="default"
                      color={isProductConfirmado ? "green" : "muted"}
                      className="text-xs w-fit"
                    >
                      {isProductConfirmado ? "Confirmado" : "Pendiente"}
                    </Badge>
                    <div className="flex items-center">
                      {!isProductConfirmado ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          disabled={confirmarProductoMutation.isPending}
                          onClick={() =>
                            promiseToast(
                              confirmarProductoMutation.mutateAsync(producto.id),
                              {
                                loading: "Confirmando...",
                                success: "Producto confirmado",
                                error: "Error al confirmar",
                              }
                            )
                          }
                        >
                          <CheckCircle className="size-3" />
                          {hasSeries ? "Confirmar todo" : "Confirmar"}
                        </Button>
                      ) : (
                        <CheckCircle2 className="size-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Series sub-rows */}
                  {hasSeries && (
                    <div className="border-t bg-muted/20 divide-y divide-border/40">
                      {producto.series.map((serieItem, sIndex) => {
                        const isSerieConfirmada = serieItem.confirmado === 1;
                        return (
                          <div
                            key={serieItem.serie?.id ?? sIndex}
                            className={`${GRID} items-center px-3 py-2 border-l-2 border-l-muted-foreground/20`}
                          >
                            <span className="text-center text-muted-foreground text-sm">↳</span>
                            <div>
                              <span className="text-xs font-mono font-medium">
                                {serieItem.serie?.serie || "—"}
                              </span>
                              {serieItem.serie?.mac && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  · MAC: {serieItem.serie.mac}
                                </span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs w-fit">
                              {serieItem.serie?.situacion || "—"}
                            </Badge>
                            <span />
                            <Badge
                              variant="default"
                              color={isSerieConfirmada ? "green" : "muted"}
                              className="text-xs w-fit"
                            >
                              {isSerieConfirmada ? "Confirmado" : "Pendiente"}
                            </Badge>
                            <div className="flex items-center">
                              {!isSerieConfirmada ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1"
                                  disabled={confirmarSerieMutation.isPending}
                                  onClick={() => {
                                    if (!serieItem.serie) return;
                                    promiseToast(
                                      confirmarSerieMutation.mutateAsync({
                                        productoGuiaId: producto.id,
                                        serieId: serieItem.serie.id,
                                      }),
                                      {
                                        loading: "Confirmando serie...",
                                        success: "Serie confirmada",
                                        error: "Error al confirmar la serie",
                                      }
                                    );
                                  }}
                                >
                                  <CheckCircle className="size-3" />
                                  Confirmar
                                </Button>
                              ) : (
                                <CheckCircle2 className="size-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FormWrapper>
  );
}
