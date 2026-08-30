import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  FileText,
  Package,
  Pencil,
  Wrench,
} from "lucide-react";
import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

/* ── Bloques reutilizables ──────────────────────────────────────────────── */

function Section({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: typeof Package;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border">
      <header className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="flex-1 text-sm font-semibold">{title}</h3>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function DespachoDetailSheet({ open, onClose, despachoId }: Props) {
  const navigate = useNavigate();

  const { data: despacho, isLoading } = useQuery({
    queryKey: [DespachoComplete.QUERY_KEY, "detail", despachoId],
    queryFn: () => getDespacho(Number(despachoId)) as Promise<DespachoResource>,
    enabled: open && !!despachoId,
  });

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

  const productos = despacho?.productos ?? [];
  const totalItems = productos.length;
  const totalUnidades = productos.reduce((acc, p) => acc + Number(p.cantidad || 0), 0);
  const totalSeries = productos.reduce(
    (acc, p) => acc + (p.series?.filter((s) => s.serie).length ?? 0),
    0,
  );

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={despacho ? `Despacho #${despacho.numero}` : "Despacho"}
      subtitle="Información del despacho"
      icon="List"
      size="3xl"
      isLoading={isLoading}
    >
      {despacho && (
        <div className="space-y-4 pb-4">
          {/* ── Encabezado ────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-3">
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

          {/* ── Detalle ───────────────────────────────────────────────── */}
          <Section icon={FileText} title="Detalle">
            <div className="divide-y">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 pb-3 sm:grid-cols-3">
                <Field label="SOT" value={sot} />
                <Field label="Fecha de registro" value={fechaRegistro} />
                <Field label="Registrado por" value={nombreUsuario} />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-3 sm:grid-cols-3">
                <Field
                  label="Almacén"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                      {despacho.almacen?.nombre_display ??
                        despacho.almacen?.nombre}
                    </span>
                  }
                  className="col-span-2 sm:col-span-3"
                />
                <Field label="Código" value={despacho.almacen?.codigo} />
                <Field label="Dirección" value={despacho.almacen?.direccion} />
                <Field
                  label="Tipo"
                  value={esCorporativo ? "Corporativo" : "Estándar"}
                />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 sm:grid-cols-3">
                <Field
                  label="Técnico"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Wrench className="size-3.5 shrink-0 text-muted-foreground" />
                      {despacho.tecnico?.nombre_completo ?? "—"}
                    </span>
                  }
                />
                <Field label="DNI" value={despacho.tecnico?.dni} />
                <Field
                  label="Tipo de empleado"
                  value={despacho.tecnico?.tipo_empleado}
                />
              </div>
            </div>
          </Section>

          {/* ── Productos ─────────────────────────────────────────────── */}
          <Section
            icon={Package}
            title="Productos"
            action={
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge color="muted" className="text-xs">
                  {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
                </Badge>
                <Badge color="muted" className="text-xs">
                  {totalUnidades} und.
                </Badge>
                {totalSeries > 0 && (
                  <Badge color="muted" className="text-xs">
                    {totalSeries} series
                  </Badge>
                )}
              </div>
            }
          >
            <DespachoViewProductos productos={productos} />
          </Section>
        </div>
      )}
    </GeneralSheet>
  );
}
