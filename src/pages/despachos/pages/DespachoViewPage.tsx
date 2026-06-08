import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  Hash,
  Package,
  User,
  Wrench,
} from "lucide-react";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ExportButtons from "@/components/ExportButtons";
import { DespachoComplete } from "../lib/despacho.constants";
import { getDespacho } from "../lib/despacho.actions";
import type {
  DespachoProductoDetalleResource,
  DespachoResource,
  DespachoSerieDetalleResource,
} from "../lib/despacho.interface";

// ── helpers ─────────────────────────────────────────────────────────────────

function InfoField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {Icon && <Icon className="size-3" />}
        {label}
      </p>
      <div className="text-sm font-medium">{value ?? "—"}</div>
    </div>
  );
}

const SITUACION_LABELS: Record<string, string> = {
  DE: "Despachado",
  DI: "Disponible",
  MA: "Mantenimiento",
  BA: "Baja",
};

const SITUACION_COLOR: Record<string, BadgeColor> = {
  DE: "blue",
  DI: "green",
  MA: "yellow",
  BA: "red",
};

function SituacionBadge({ situacion }: { situacion: string }) {
  const label = SITUACION_LABELS[situacion] ?? situacion;
  return (
    <Badge color={SITUACION_COLOR[situacion] ?? "muted"} variant="default">
      {label}
    </Badge>
  );
}

function SerieRow({ serie }: { serie: DespachoSerieDetalleResource }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
      <span className="font-mono font-semibold">{serie.serie}</span>
      {serie.mac && (
        <span className="text-muted-foreground">
          MAC: <span className="font-mono text-foreground">{serie.mac}</span>
        </span>
      )}
      {serie.emta_mac && (
        <span className="text-muted-foreground">
          EMTA:{" "}
          <span className="font-mono text-foreground">{serie.emta_mac}</span>
        </span>
      )}
      {serie.ua && (
        <span className="text-muted-foreground">
          UA: <span className="font-mono text-foreground">{serie.ua}</span>
        </span>
      )}
      <SituacionBadge situacion={serie.situacion} />
    </div>
  );
}

function ProductoCard({
  producto,
  index,
}: {
  producto: DespachoProductoDetalleResource;
  index: number;
}) {
  const series = producto.series ?? [];

  return (
    <Card size="sm">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <div>
              <CardTitle className="text-sm">
                {producto.producto.nombre || producto.producto.sap || "—"}
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                SAP: {producto.producto.sap}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {producto.producto.tipo && (
              <Badge color="muted" className="text-xs">
                {producto.producto.tipo}
              </Badge>
            )}
            {producto.producto.origen && (
              <Badge variant="outline" className="text-xs">
                {producto.producto.origen}
              </Badge>
            )}
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              ×{Number(producto.cantidad)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {series.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Series ({series.length})
            </p>
            {series.map((s, i) =>
              s.serie ? (
                <SerieRow key={i} serie={s.serie} />
              ) : (
                <div
                  key={i}
                  className="text-xs text-muted-foreground italic px-1"
                >
                  Serie no disponible
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Sin series registradas
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── main component ───────────────────────────────────────────────────────────

export default function DespachoViewPage() {
  const { id } = useParams();

  const { data: despacho, isLoading } = useQuery({
    queryKey: [DespachoComplete.QUERY_KEY, "detail", id],
    queryFn: () => getDespacho(Number(id)) as Promise<DespachoResource>,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-primary" />
        </div>
      </FormWrapper>
    );
  }

  if (!despacho) {
    return (
      <FormWrapper>
        <p className="text-sm text-muted-foreground">Despacho no encontrado.</p>
      </FormWrapper>
    );
  }

  const tecnico = despacho.tecnico;
  const nombreTecnico = tecnico?.persona
    ? `${tecnico.persona.nombre} ${tecnico.persona.apellido_paterno}`
    : `Técnico #${despacho.tecnico.id}`;

  const usuario = despacho.usuario;
  const nombreUsuario = usuario?.persona
    ? `${usuario.persona.nombre} ${usuario.persona.apellido_paterno}`
    : (usuario?.nombre_usuario ?? "—");

  const fecha = despacho.fecha
    ? new Date(despacho.fecha + "T12:00:00").toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const isDeleted = !!despacho.deleted_at;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={DespachoComplete.MODEL.name}
        mode="detail"
        icon="List"
        backRoute={DespachoComplete.ABSOLUTE_ROUTE}
      />

      {/* ── Info general ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Información del despacho</CardTitle>
            <div className="flex items-center gap-2">
              {isDeleted ? (
                <Badge color="destructive">Eliminado</Badge>
              ) : (
                <Badge color="green">Activo</Badge>
              )}
              <ExportButtons
                pdfEndpoint={`/despachos/${id}/pdf`}
                pdfFileName={`despacho-${despacho.numero ?? id}.pdf`}
                variant="separate"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
            <InfoField
              label="Número"
              icon={Hash}
              value={
                <span className="font-mono text-sm font-semibold">
                  {despacho.numero}
                </span>
              }
            />
            <InfoField label="Fecha" icon={CalendarDays} value={fecha} />
            <InfoField
              label="Almacén"
              icon={Building2}
              value={
                <span>  
                  {despacho.almacen?.nombre ?? `#${despacho.almacen.id}`}
                  {despacho.almacen?.direccion && (
                    <span className="block text-xs text-muted-foreground font-normal">
                      {despacho.almacen.direccion}
                    </span>
                  )}
                </span>
              }
            />
            <InfoField label="Técnico" icon={Wrench} value={nombreTecnico} />
            <InfoField
              label="Registrado por"
              icon={User}
              value={nombreUsuario}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Productos ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Productos</h3>
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {despacho.productos?.length ?? 0}{" "}
            {(despacho.productos?.length ?? 0) === 1 ? "ítem" : "ítems"}
          </span>
        </div>

        {(despacho.productos?.length ?? 0) > 0 ? (
          <div className="space-y-3">
            {despacho.productos.map((p, i) => (
              <ProductoCard key={p.id} producto={p} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Este despacho no tiene productos registrados.
          </p>
        )}
      </div>
    </FormWrapper>
  );
}
