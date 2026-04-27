import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { LiquidacionResource } from "../lib/liquidaciones.interface";

interface InfoFieldProps {
  label: string;
  value?: string | null;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium truncate">{value || "—"}</p>
    </div>
  );
}

interface LiquidacionHeaderInfoProps {
  liquidacion: LiquidacionResource;
}

export default function LiquidacionHeaderInfo({ liquidacion }: LiquidacionHeaderInfoProps) {
  const fecha = liquidacion.fecha
    ? new Date(liquidacion.fecha + "T12:00:00").toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const estadoColorMap: Record<string, "green" | "yellow" | "red" | "blue" | "muted"> = {
    ATENDIDA: "green",
    "P. VALIDAR": "yellow",
    RECHAZADO: "red",
    REPROGRAMADO: "blue",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          SOT: <span className="font-mono">{liquidacion.sot}</span>
        </span>
        <div className="flex gap-2">
          {liquidacion.estado && (
            <Badge color={estadoColorMap[liquidacion.estado] ?? "muted"} className="text-xs">
              {liquidacion.estado}
            </Badge>
          )}
          {liquidacion.estado_liquidacion && (
            <Badge variant="outline" className="text-xs">
              {liquidacion.estado_liquidacion}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
        <InfoField label="Fecha" value={fecha} />
        <InfoField label="Código cliente" value={liquidacion.codigo} />
        <InfoField label="Nombre cliente" value={liquidacion.nombre} />
        <InfoField label="Tipo de trabajo" value={liquidacion.tipo_trabajo} />
      </div>

      <Separator />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
        <InfoField label="Dirección" value={liquidacion.direccion} />
        <InfoField label="Distrito" value={liquidacion.distrito} />
        <InfoField label="Plano" value={liquidacion.plano} />
        <InfoField label="Paquete" value={liquidacion.paquete} />
      </div>
    </div>
  );
}
