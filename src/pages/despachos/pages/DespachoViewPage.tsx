import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, CalendarDays, Hash, Package, User, Wrench } from "lucide-react";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ExportButtons from "@/components/ExportButtons";
import { DespachoComplete } from "../lib/despacho.constants";
import { getDespacho } from "../lib/despacho.actions";
import type { DespachoResource } from "../lib/despacho.interface";
import { DespachoViewProductos } from "../components/DespachoViewProductos";

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
    <div className="flex flex-col gap-0.5">
      <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="size-3" />}
        {label}
      </p>
      <div className="text-sm font-medium">{value ?? "—"}</div>
    </div>
  );
}

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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-primary" />
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

  const nombreTecnico = despacho.tecnico?.persona
    ? `${despacho.tecnico.persona.nombre} ${despacho.tecnico.persona.apellido_paterno}`
    : `Técnico #${despacho.tecnico.id}`;

  const nombreUsuario = despacho.usuario?.persona
    ? `${despacho.usuario.persona.nombre} ${despacho.usuario.persona.apellido_paterno}`
    : (despacho.usuario?.nombre_usuario ?? "—");

  const fecha = despacho.fecha
    ? new Date(despacho.fecha + "T12:00:00").toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <FormWrapper>
      <TitleFormComponent
        title={DespachoComplete.MODEL.name}
        mode="detail"
        icon="List"
        backRoute={DespachoComplete.ABSOLUTE_ROUTE}
      />

      {/* ── Info general ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Información del despacho</CardTitle>
            <div className="flex items-center gap-2">
              {despacho.deleted_at ? (
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
        <CardContent className="py-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
            <InfoField
              label="Número"
              icon={Hash}
              value={<span className="font-mono font-semibold">{despacho.numero}</span>}
            />
            <InfoField label="Fecha" icon={CalendarDays} value={fecha} />
            <InfoField
              label="Almacén"
              icon={Building2}
              value={
                <span>
                  {despacho.almacen?.nombre ?? `#${despacho.almacen.id}`}
                  {despacho.almacen?.direccion && (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {despacho.almacen.direccion}
                    </span>
                  )}
                </span>
              }
            />
            <InfoField label="Técnico" icon={Wrench} value={nombreTecnico} />
            <InfoField label="Registrado por" icon={User} value={nombreUsuario} />
          </div>
        </CardContent>
      </Card>

      {/* ── Productos ───────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Productos</h3>
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {despacho.productos?.length ?? 0}{" "}
            {(despacho.productos?.length ?? 0) === 1 ? "ítem" : "ítems"}
          </span>
        </div>

        <DespachoViewProductos productos={despacho.productos ?? []} />
      </div>
    </FormWrapper>
  );
}
