import { isAxiosError } from "axios";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, PackageCheck, RefreshCw, Unlink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { errorToast, successToast } from "@/lib/core.function";
import { compareLiquidacionKit, assignLiquidacionKit, getAssignableKits, removeLiquidacionKit } from "../lib/kits-descarga.actions";
import type { ComparacionKit } from "../lib/kits-descarga.interface";

const resultLabel: Record<string, string> = {
  conforme: "Conforme",
  exceso: "Exceso",
  menor_consumo: "Menor consumo",
  fuera_de_kit: "Fuera del kit",
};

const errorMessage = (error: any) => error?.response?.data?.message ?? "No se pudo completar la operación.";

interface Props {
  liquidacionId: number;
  sot: string;
  canAssign?: boolean;
}

export default function LiquidacionKitPanel({ liquidacionId, sot, canAssign = true }: Props) {
  const queryClient = useQueryClient();
  const [selectedKit, setSelectedKit] = useState("");
  const comparisonQuery = useQuery<ComparacionKit>({
    queryKey: ["liquidacion-kit-comparison", liquidacionId],
    queryFn: () => compareLiquidacionKit(liquidacionId),
    refetchOnWindowFocus: false,
  });
  const kitsQuery = useQuery({
    queryKey: ["kits-descarga", "publicados", "liquidacion"],
    queryFn: getAssignableKits,
    enabled: canAssign,
    refetchOnWindowFocus: false,
  });
  const saveMutation = useMutation({
    mutationFn: () => assignLiquidacionKit(liquidacionId, Number(selectedKit)),
    onSuccess: () => {
      successToast("Kit asociado a la liquidación.");
      setSelectedKit("");
      return queryClient.invalidateQueries({ queryKey: ["liquidacion-kit-comparison", liquidacionId] });
    },
    onError: (error: any) => errorToast(errorMessage(error)),
  });
  const removeMutation = useMutation({
    mutationFn: () => removeLiquidacionKit(liquidacionId),
    onSuccess: () => {
      successToast("Kit retirado de la liquidación.");
      return queryClient.invalidateQueries({ queryKey: ["liquidacion-kit-comparison", liquidacionId] });
    },
    onError: (error: any) => errorToast(errorMessage(error)),
  });

  const comparison = comparisonQuery.data;
  const comparisonError = comparisonQuery.error;
  const comparisonErrorMessage = isAxiosError<{ message?: string }>(comparisonError) && comparisonError.response?.status === 404
    ? comparisonError.response.data?.message
    : undefined;
  const kits = kitsQuery.data ?? [];
  const isUpdatingKit = saveMutation.isPending || removeMutation.isPending;

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-2">
          <PackageCheck className="size-5 text-primary" />
          <div>
            <h2 className="font-semibold">Kit de descarga</h2>
            <p className="text-xs text-muted-foreground">Compara el consumo de la SOT {sot} contra su kit publicado.</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" title="Actualizar comparación" onClick={() => void comparisonQuery.refetch()} disabled={comparisonQuery.isFetching}>
          <RefreshCw className={`size-4 ${comparisonQuery.isFetching ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {canAssign ? (
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Asignar kit"
              className="h-9 w-full rounded-md border bg-background px-3 text-sm sm:w-auto sm:min-w-72"
              value={selectedKit}
              onChange={(event) => setSelectedKit(event.target.value)}
              disabled={kitsQuery.isLoading || kitsQuery.isError || kits.length === 0 || isUpdatingKit}
            >
              <option value="">Asignar kit...</option>
              {kits.map((kit) => (
                <option key={kit.id} value={kit.id}>
                  {kit.tipo_trabajo?.nombre || `Tipo #${kit.tipo_trabajo_id}`} · v{kit.version} · {kit.tipo_trabajo?.tecnologia || "Sin tecnología"}
                </option>
              ))}
            </select>
            <Button onClick={() => saveMutation.mutate()} disabled={!kits.some((kit) => String(kit.id) === selectedKit) || kitsQuery.isError || isUpdatingKit}>
              <CheckCircle2 className="mr-1 size-4" />Asignar kit
            </Button>
            {!comparisonQuery.isError && comparison?.kit && (
              <Button variant="outline" onClick={() => removeMutation.mutate()} disabled={isUpdatingKit}>
                <Unlink className="mr-1 size-4" />Quitar kit
              </Button>
            )}
            {kitsQuery.isLoading && <p className="basis-full text-xs text-muted-foreground">Cargando kits publicados y activos...</p>}
            {kitsQuery.isError && <p className="basis-full text-xs text-red-600">No se pudieron cargar los kits publicados y activos.</p>}
            {kitsQuery.isSuccess && kits.length === 0 && <p className="basis-full text-xs text-muted-foreground">No hay kits publicados y activos.</p>}
          </div>
        ) : (
          <p className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">Esta liquidación está cerrada. La asignación del kit está bloqueada.</p>
        )}
        {comparisonQuery.isLoading ? <p className="text-sm text-muted-foreground">Consultando kit...</p> : comparisonQuery.isError ? <p className="text-sm text-red-600">{comparisonErrorMessage ?? "No se pudo consultar la comparación del kit."}</p> : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span>Kit actual:</span>
              <Badge variant={comparison?.kit ? "default" : "outline"}>{comparison?.kit ? `${comparison.kit.tipo_trabajo?.nombre || `Tipo #${comparison.kit.tipo_trabajo_id}`} · v${comparison.kit.version}` : "Sin kit asociado"}</Badge>
              {comparison?.origen_kit && <span className="text-xs text-muted-foreground">Origen: {comparison.origen_kit}</span>}
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <Metric label="Productos" value={comparison?.resumen.total_productos ?? 0} />
              <Metric label="Conformes" value={comparison?.resumen.conformes ?? 0} tone="success" />
              <Metric label="Excesos" value={comparison?.resumen.excesos ?? 0} tone="danger" />
              <Metric label="Fuera del kit" value={comparison?.resumen.fuera_de_kit ?? 0} tone="danger" />
            </div>
            {!!comparison?.detalles.length && <div className="overflow-x-auto rounded-lg border"><table className="w-full text-sm"><thead className="bg-muted/60 text-left"><tr><th className="p-2">SAP / Producto</th><th className="p-2">Estándar</th><th className="p-2">Real</th><th className="p-2">Diferencia</th><th className="p-2">Resultado</th></tr></thead><tbody>{comparison.detalles.map((detail) => <tr key={detail.producto_id} className="border-t"><td className="p-2"><span className="font-mono">{detail.sap || "-"}</span> <span className="text-muted-foreground">{detail.nombre}</span></td><td className="p-2">{detail.cantidad_estandar}</td><td className="p-2">{detail.cantidad_real}</td><td className="p-2">{detail.diferencia}</td><td className="p-2">{resultLabel[detail.resultado] || detail.resultado}</td></tr>)}</tbody></table></div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "success" | "danger" }) {
  return <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className={`text-xl font-semibold ${tone === "success" ? "text-emerald-600" : tone === "danger" ? "text-red-600" : ""}`}>{value}</p></div>;
}
