import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, User, Wrench } from "lucide-react";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Badge } from "@/components/ui/badge";
import ExportButtons from "@/components/ExportButtons";
import { DesasignacionComplete } from "../lib/desasignacion.constants";
import { getDesasignacion } from "../lib/desasignacion.actions";
import { DesasignacionViewDetalle } from "../components/DesasignacionViewDetalle";

export default function DesasignacionViewPage() {
  const { id } = useParams();

  const { data: desasignacion, isLoading } = useQuery({
    queryKey: [DesasignacionComplete.QUERY_KEY, "detail", id],
    queryFn: () => getDesasignacion(Number(id)),
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

  if (!desasignacion) {
    return (
      <FormWrapper>
        <p className="text-sm text-muted-foreground">Desasignación no encontrada.</p>
      </FormWrapper>
    );
  }

  const nombreTecnico =
    desasignacion.tecnico?.nombre_completo ??
    [desasignacion.tecnico?.nombre, desasignacion.tecnico?.apellido_paterno]
      .filter(Boolean)
      .join(" ");

  const fecha = desasignacion.fecha
    ? new Date(desasignacion.fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <FormWrapper>
      <TitleFormComponent
        title={DesasignacionComplete.MODEL.name}
        mode="detail"
        icon="Undo2"
        backRoute={DesasignacionComplete.ABSOLUTE_ROUTE}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight">
              #{desasignacion.numero}
            </span>
            {desasignacion.deleted_at ? (
              <Badge color="destructive">Eliminado</Badge>
            ) : (
              <Badge color="green">Activo</Badge>
            )}
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {fecha}
          </p>
        </div>

        <ExportButtons
          pdfEndpoint={`/desasignaciones/${id}/pdf`}
          pdfFileName={`desasignacion-${desasignacion.numero ?? id}.pdf`}
          variant="detail"
        />
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-4 border-y py-4">
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Wrench className="size-3" />
            Técnico
          </p>
          <span className="text-sm font-medium">{nombreTecnico || "—"}</span>
        </div>

        {desasignacion.usuario && (
          <>
            <div className="w-px self-stretch bg-border" />
            <div className="flex flex-col gap-0.5">
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <User className="size-3" />
                Registrado por
              </p>
              <span className="text-sm font-medium">
                {desasignacion.usuario.nombre_usuario}
              </span>
            </div>
          </>
        )}
      </div>

      {desasignacion.observaciones && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Observaciones: </span>
          {desasignacion.observaciones}
        </p>
      )}

      <DesasignacionViewDetalle
        series={desasignacion.series ?? []}
        materiales={desasignacion.materiales ?? []}
      />
    </FormWrapper>
  );
}
