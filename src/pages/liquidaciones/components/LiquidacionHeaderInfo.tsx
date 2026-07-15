import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Hash,
  Calendar,
  User2,
  MapPin,
  Briefcase,
  Map,
  FileText,
  Package2,
} from "lucide-react";
import type { LiquidacionResource } from "../lib/liquidaciones.interface";

interface InfoFieldProps {
  label: string;
  value?: string | null;
  icon?: React.ElementType;
  mono?: boolean;
}

function InfoField({ label, value, icon: Icon, mono }: InfoFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
        {Icon && <Icon className="size-3 shrink-0" />}
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-medium truncate",
          mono && "font-mono tracking-tight",
          !value && "text-muted-foreground/60",
        )}
      >
        {value || "—"}
      </p>
    </div>
  );
}

const estadoColorMap: Record<
  string,
  "green" | "yellow" | "red" | "blue" | "muted"
> = {
  ATENDIDA: "green",
  "P. VALIDAR": "yellow",
  RECHAZADO: "red",
  REPROGRAMADO: "blue",
};

interface LiquidacionHeaderInfoProps {
  liquidacion: LiquidacionResource;
}

export default function LiquidacionHeaderInfo({
  liquidacion,
}: LiquidacionHeaderInfoProps) {
  const fecha = liquidacion.fecha
    ? new Date(
        liquidacion.fecha.includes("T")
          ? liquidacion.fecha
          : liquidacion.fecha + "T12:00:00",
      ).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
      <div className="h-0.5 bg-linear-to-r from-primary via-primary/60 to-transparent" />

      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Hash className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
              Orden de servicio
            </p>
            <p className="text-base font-mono font-bold text-foreground leading-none">
              {liquidacion.sot}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {liquidacion.estado && (
            <Badge
              color={estadoColorMap[liquidacion.estado] ?? "muted"}
              className="text-xs"
            >
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

      <div className="px-4 py-3 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <InfoField label="Fecha" value={fecha} icon={Calendar} />
          <InfoField
            label="Código cliente"
            value={liquidacion.codigo}
            icon={User2}
            mono
          />
          <InfoField label="Cliente" value={liquidacion.nombre} icon={User2} />
          <InfoField
            label="Tipo de trabajo"
            value={liquidacion.tipo_trabajo}
            icon={Briefcase}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <InfoField
            label="Dirección"
            value={liquidacion.direccion}
            icon={MapPin}
          />
          <InfoField
            label="Distrito"
            value={liquidacion.distrito}
            icon={Map}
          />
          <InfoField
            label="Plano"
            value={liquidacion.plano}
            icon={FileText}
            mono
          />
          <InfoField
            label="Paquete"
            value={liquidacion.paquete}
            icon={Package2}
          />
        </div>
      </div>
    </div>
  );
}
