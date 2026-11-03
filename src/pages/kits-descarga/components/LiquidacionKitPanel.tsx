import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, PackageCheck, RefreshCw, Unlink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { errorToast, successToast } from "@/lib/core.function";
import { compareLiquidacionKit, assignLiquidacionKit, getKits, removeLiquidacionKit } from "../lib/kits-descarga.actions";
import type { ComparacionKit, KitDescarga, KitResponse } from "../lib/kits-descarga.interface";

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
}

export default function LiquidacionKitPanel({ liquidacionId, sot }: Props) {
  const queryClient = useQueryClient();
  const [selectedKit, setSelectedKit] = useState("");
  const comparisonQuery = useQuery<ComparacionKit>({
    queryKey: ["liquidacion-kit-comparison", liquidacionId],
    queryFn: () => compareLiquidacionKit(liquidacionId),
    refetchOnWindowFocus: false,
  });
  const kitsQuery = useQuery<KitResponse>({
    queryKey: ["kits-descarga", "publicados", "liquidacion"],
    queryFn: () => getKits({ estado: "PUBLICADO", all: "true", per_page: "100" }),
    refetchOnWindowFocus: false,
  });
  const saveMutation = useMutation({
    mutationFn: () => assignLiquidacionKit(liquidacionId, Number(selectedKit)),
    onSuccess: () => {
      successToast("Kit asociado a la liquidación.");
      setSelectedKit("");
      void queryClient.invalidateQueries({ queryKey: ["liquidacion-kit-comparison", liquidacionId] });
    },
    onError: (error: any) => errorToast(errorMessage(error)),
  });
  const removeMutation = useMutation({
    mutationFn: () => removeLiquidacionKit(liquidacionId),
    onSuccess: () => {
      successToast("Kit retirado de la liquidación.");
      void queryClient.invalidateQueries({ queryKey: ["liquidacion-kit-comparison", liquidacionId] });
    },
    onError: (error: any) => errorToast(errorMessage(error)),
  });

  const comparison = comparisonQuery.data;
  const kits = kitsQuery.data?.data ?? [];

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
        {comparisonQuery.isLoading ? <p className="text-sm text-muted-foreground">Consultando kit...</p> : comparisonQuery.isError ? <p className="text-sm text-red-600">No se pudo consultar la comparación del kit.</p> : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span>Kit actual:</span>
              <Badge variant={comparison?.kit ? "default" : "outline"}>{comparison?.kit ? `${comparison.kit.paquete || "Sin paquete"} · v${comparison.kit.version}` : "Sin kit asociado"}</Badge>
              {comparison?.origen_kit && <span className="text-xs text-muted-foreground">Origen: {comparison.origen_kit}</span>}
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <Metric label="Productos" value={comparison?.resumen.total_productos ?? 0} />
              <Metric label="Conformes" value={comparison?.resumen.conformes ?? 0} tone="success" />
              <Metric label="Excesos" value={comparison?.resumen.excesos ?? 0} tone="danger" />
              <Metric label="Fuera del kit" value={comparison?.resumen.fuera_de_kit ?? 0} tone="danger" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select className="h-9 min-w-72 rounded-md border bg-background px-3 text-sm" value={selectedKit} onChange={(event) => setSelectedKit(event.target.value)} disabled={kitsQuery.isLoading}>
                <option value="">Seleccionar kit publicado...</option>
                {kits.map((kit: KitDescarga) => <option key={kit.id} value={kit.id}>{kit.paquete || "Sin paquete"} · v{kit.version} · {kit.tipo_trabajo?.nombre || `Tipo #${kit.tipo_trabajo_id}`}</option>)}
              </select>
              <Button onClick={() => saveMutation.mutate()} disabled={!selectedKit || saveMutation.isPending}><CheckCircle2 className="mr-1 size-4" />Asociar kit</Button>
              {comparison?.kit && <Button variant="outline" onClick={() => removeMutation.mutate()} disabled={removeMutation.isPending}><Unlink className="mr-1 size-4" />Quitar kit</Button>}
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
