import { CheckCircle2, Hash, Clock, User, Layers, Cpu } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type {
  LiquidacionResource,
  ProductoLiquidacionItem,
  ProductoInfo,
} from "../lib/liquidaciones.interface";

function getProductoInfo(item: ProductoLiquidacionItem): ProductoInfo | null {
  if (item.producto) return item.producto;
  return item.series[0]?.serie?.producto ?? null;
}

function formatPersona(persona: {
  nombre: string | null;
  apellido_paterno: string | null;
  apellido_materno?: string | null;
} | null): string {
  if (!persona) return "—";
  return (
    [persona.nombre, persona.apellido_paterno, persona.apellido_materno]
      .filter(Boolean)
      .join(" ") || "—"
  );
}

interface LiquidacionLiquidadaViewProps {
  liquidacion: LiquidacionResource;
}

export default function LiquidacionLiquidadaView({
  liquidacion,
}: LiquidacionLiquidadaViewProps) {
  const productos = liquidacion.productos ?? [];
  const materiales = productos.filter((item) => item.series.length === 0);
  const equipos = productos.filter((item) => item.series.length > 0);

  const fechaHora = new Date(liquidacion.updated_at).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const usuarioNombre = formatPersona(liquidacion.usuario?.persona ?? null);
  const usuarioPrimerNombre = liquidacion.usuario?.persona?.nombre ?? "—";
  const tecnico1Nombre =
    productos.find((p) => p.tecnico_id === liquidacion.tecnico1?.id)?.tecnico ?? "—";

  return (
    <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden shadow-sm">
      <div className="h-0.5 bg-linear-to-r from-emerald-500 via-emerald-400 to-transparent" />

      {/* Banner principal */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900">
        <div className="size-8 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Esta SOT ya fue liquidada
          </p>
          <p className="text-xs text-muted-foreground">
            Última liquidación registrada por:{" "}
            <span className="font-medium text-foreground">
              {usuarioPrimerNombre}
            </span>
          </p>
        </div>
      </div>

      {/* Fila de metadatos */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 border-b bg-muted/20">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Hash className="size-3 shrink-0" />
          Liquidación{" "}
          <span className="font-mono font-semibold text-foreground">
            #{liquidacion.id}
          </span>
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="size-3 shrink-0" />
          {fechaHora}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <User className="size-3 shrink-0" />
          Registró:{" "}
          <span className="font-medium text-foreground">{usuarioNombre}</span>
        </span>
        {tecnico1Nombre !== "—" && (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <User className="size-3 shrink-0" />
            Personal 1:{" "}
            <span className="font-medium text-foreground uppercase">
              {tecnico1Nombre}
            </span>
          </span>
        )}
      </div>

      {/* Listas de productos */}
      <div className="px-4 py-3 space-y-3">
        {/* Materiales */}
        {materiales.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="size-3" />
              Materiales liquidados
            </p>
            <div className="space-y-1">
              {materiales.map((item) => {
                const prod = getProductoInfo(item);
                const cantidad = Number(item.cantidad);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="font-mono text-xs text-muted-foreground shrink-0 w-28 truncate">
                      {prod?.sap ?? "—"}
                    </span>
                    <span className="flex-1 truncate">{prod?.nombre ?? "Desconocido"}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      ({cantidad} {cantidad === 1 ? "unidad" : "unidades"})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {materiales.length > 0 && equipos.length > 0 && <Separator />}

        {/* Equipos */}
        {equipos.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Cpu className="size-3" />
              Equipos liquidados
            </p>
            <div className="space-y-1.5">
              {equipos.map((item) => {
                const prod = item.series[0]?.serie?.producto;
                const seriesStr = item.series
                  .map((s) => s.serie.serie)
                  .join(", ");
                return (
                  <div key={item.id} className="flex items-start gap-2">
                    <span className="font-mono text-xs text-muted-foreground shrink-0 w-28 truncate mt-0.5">
                      {prod?.sap ?? "—"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {prod?.nombre ?? "Desconocido"}
                      </p>
                      {seriesStr && (
                        <p className="text-xs text-muted-foreground font-mono">
                          Serie: {seriesStr}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {materiales.length === 0 && equipos.length === 0 && (
          <p className="text-xs text-muted-foreground py-1">
            Sin productos registrados en esta liquidación.
          </p>
        )}
      </div>
    </div>
  );
}
