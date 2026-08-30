import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarClock,
  CalendarDays,
  FileText,
  IdCard,
  Package,
  Pencil,
  User,
  Wrench,
} from "lucide-react";
import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ExportButtons from "@/components/ExportButtons";
import { DespachoComplete } from "../lib/despacho.constants";
import { getDespacho } from "../lib/despacho.actions";
import type { DespachoResource } from "../lib/despacho.interface";
import { DespachoViewProductos } from "./DespachoViewProductos";

interface Props {
  open: boolean;
  onClose: () => void;
  despachoId: number | null;
}

export function DespachoDetailSheet({ open, onClose, despachoId }: Props) {
  const navigate = useNavigate();

  const { data: despacho, isLoading } = useQuery({
    queryKey: [DespachoComplete.QUERY_KEY, "detail", despachoId],
    queryFn: () => getDespacho(Number(despachoId)) as Promise<DespachoResource>,
    enabled: open && !!despachoId,
  });

  const nombreTecnico = despacho?.tecnico?.nombre_completo;

  const nombreUsuario = despacho?.usuario?.persona
    ? `${despacho.usuario.persona.nombre} ${despacho.usuario.persona.apellido_paterno}`
    : (despacho?.usuario?.nombre_usuario ?? "—");

  const fecha = despacho?.fecha
    ? new Date(despacho.fecha + "T12:00:00").toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const fechaRegistro = despacho?.created_at
    ? new Date(despacho.created_at).toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const sot = despacho?.sot ?? despacho?.numero_sot ?? null;
  const esCorporativo =
    despacho?.almacen?.is_corporativo ||
    despacho?.almacen?.es_subalmacen_corporativo;

  const totalItems = despacho?.productos?.length ?? 0;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={despacho ? `Despacho #${despacho.numero}` : "Despacho"}
      subtitle="Información del despacho"
      icon="List"
      size="2xl"
      isLoading={isLoading}
    >
      {despacho && (
        <div className="space-y-5 pb-4">
          {/* ── Encabezado ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xl font-bold tracking-tight">
                  #{despacho.numero}
                </span>
                {despacho.deleted_at ? (
                  <Badge color="destructive">Eliminado</Badge>
                ) : (
                  <Badge color="green">Activo</Badge>
                )}
                {esCorporativo && <Badge color="blue">Corporativo</Badge>}
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" />
                {fecha}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!despacho.deleted_at && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`${DespachoComplete.ROUTE_UPDATE}/${despacho.id}`)
                  }
                >
                  <Pencil className="size-3.5" />
                  Editar
                </Button>
              )}
              <ExportButtons
                pdfEndpoint={`/despachos/${despacho.id}/pdf`}
                pdfFileName={`despacho-${despacho.numero ?? despacho.id}.pdf`}
                variant="separate"
              />
            </div>
          </div>

          {/* ── SOT (solo despachos con SOT asociada) ───────────────────── */}
          {sot && (
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                SOT
              </span>
              <span className="font-mono text-sm font-semibold">{sot}</span>
            </div>
          )}

          {/* ── Metadatos ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 border-y py-4 sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Building2 className="size-3" />
                Almacén
              </p>
              <span className="text-sm font-medium">
                {despacho.almacen?.nombre_display ??
                  despacho.almacen?.nombre ??
                  `#${despacho.almacen?.id}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {[despacho.almacen?.codigo, despacho.almacen?.direccion]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Wrench className="size-3" />
                Técnico
              </p>
              <span className="text-sm font-medium">{nombreTecnico ?? "—"}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <IdCard className="size-3" />
                {[despacho.tecnico?.dni, despacho.tecnico?.tipo_empleado]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <User className="size-3" />
                Registrado por
              </p>
              <span className="text-sm font-medium">{nombreUsuario}</span>
            </div>

            {fechaRegistro && (
              <div className="flex flex-col gap-0.5">
                <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <CalendarClock className="size-3" />
                  Fecha de registro
                </p>
                <span className="text-sm font-medium">{fechaRegistro}</span>
              </div>
            )}
          </div>

          {/* ── Productos ───────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Productos</h3>
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
              </span>
            </div>

            <DespachoViewProductos productos={despacho.productos ?? []} />
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
