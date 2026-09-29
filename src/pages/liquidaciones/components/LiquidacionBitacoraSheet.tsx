import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock3, Database, UserRound } from "lucide-react";
import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLiquidacionBitacora } from "../lib/liquidaciones.actions";
import type { LiquidacionResource } from "../lib/liquidaciones.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  liquidacion: LiquidacionResource | null;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function LiquidacionBitacoraSheet({ open, onClose, liquidacion }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["liquidacion-bitacora", liquidacion?.id],
    queryFn: () => getLiquidacionBitacora(liquidacion!.id),
    enabled: open && !!liquidacion,
  });

  const origen = data?.liquidacion.origen_almacen;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Bitácora de liquidación${liquidacion?.sot ? ` · SOT ${liquidacion.sot}` : ""}`}
      subtitle="Evidencia de registro, almacenes, productos y operaciones realizadas"
      icon="History"
      size="6xl"
      isLoading={isLoading}
    >
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudo cargar la bitácora de esta liquidación.
        </div>
      )}

      {data && (
        <div className="space-y-5 pb-6">
          <section className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Almacén de la liquidación</p>
              <p className="mt-1 font-semibold">{data.liquidacion.almacen?.nombre ?? "Sin dato"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Responsable guardado actualmente</p>
              <p className="mt-1 font-semibold">{data.liquidacion.usuario_registrado}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(data.liquidacion.created_at)}</p>
            </div>
            <div className={cn("rounded-lg border p-3", data.resumen.tiene_inconsistencias && "border-red-300 bg-red-50 dark:bg-red-950/20")}>
              <p className="text-xs text-muted-foreground">Comparación de almacenes</p>
              <p className={cn("mt-1 font-semibold", data.resumen.tiene_inconsistencias ? "text-red-700 dark:text-red-300" : "text-emerald-700")}>
                {data.resumen.diferencias} diferencia(s) de {data.resumen.total_productos}
              </p>
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Database className="mt-0.5 size-5 text-primary" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">Por qué figura en ese almacén</h3>
                  <Badge variant="outline">
                    {origen?.certeza === "confirmado" ? "Confirmado" : origen?.certeza === "probable" ? "Evidencia probable" : "Evidencia incompleta"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{origen?.explicacion}</p>
                {origen?.referencia && <p className="mt-1 text-xs font-mono">Referencia: {origen.referencia}</p>}
              </div>
            </div>
          </section>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            Para auditoría, considera como evidencia directa los eventos con usuario, fecha e IP. Las explicaciones marcadas como “Evidencia probable” o “Evidencia incompleta” son reconstrucciones del sistema y no identifican por sí solas a un responsable.
          </div>

          <section>
            <div className="mb-2 flex items-center gap-2">
              {data.resumen.tiene_inconsistencias ? <AlertTriangle className="size-5 text-red-600" /> : <CheckCircle2 className="size-5 text-emerald-600" />}
              <h3 className="font-semibold">Almacén de cada producto o serie</h3>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[850px] text-sm">
                <thead className="bg-muted/60 text-left text-xs">
                  <tr>
                    <th className="p-2">SAP / Producto</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Serie / Cantidad</th>
                    <th className="p-2">Almacén actual del producto</th>
                    <th className="p-2">Almacén del movimiento</th>
                    <th className="p-2">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productos.map((item, index) => (
                    <tr key={`${item.detalle_id}-${item.serie ?? index}`} className="border-t">
                      <td className="p-2"><span className="font-mono text-xs">{item.sap}</span><br /><span>{item.producto}</span></td>
                      <td className="p-2">{item.tipo}</td>
                      <td className="p-2 font-mono">{item.serie ?? item.cantidad}</td>
                      <td className="p-2 font-medium">{item.almacen_producto?.nombre ?? "Sin evidencia"}</td>
                      <td className="p-2">{item.almacen_movimiento?.nombre ?? "Sin dato"}</td>
                      <td className="p-2">
                        {item.coincide_almacen_liquidacion ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Coincide</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">No coincide</Badge>
                        )}
                        {item.eliminado && <Badge variant="outline" className="ml-1">Eliminado</Badge>}
                      </td>
                    </tr>
                  ))}
                  {data.productos.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No existen productos asociados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2">
              <Clock3 className="size-5 text-primary" />
              <h3 className="font-semibold">Línea de tiempo</h3>
            </div>
            <div className="space-y-2">
              {data.eventos.map((evento, index) => (
                <div key={`${evento.tipo}-${evento.fecha}-${index}`} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{evento.titulo}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><UserRound className="size-3" />{evento.usuario}</span>
                        <span>{evento.almacen?.nombre ?? "Sin almacén asociado"}</span>
                        {evento.ip && <span>IP: {evento.ip}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{formatDateTime(evento.fecha)}</p>
                      <Badge variant="outline" className="mt-1 text-[10px]">{evento.estado}</Badge>
                    </div>
                  </div>
                  {evento.detalle && <p className="mt-2 text-xs text-muted-foreground">{evento.detalle}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </GeneralSheet>
  );
}
