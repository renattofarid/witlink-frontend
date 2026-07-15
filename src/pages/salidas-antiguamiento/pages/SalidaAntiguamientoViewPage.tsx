import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Warehouse } from "lucide-react";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import ExportButtons from "@/components/ExportButtons";
import { SalidaAntiguamientoComplete } from "../lib/salida-antiguamiento.constants";
import { getSalidaAntiguamiento } from "../lib/salida-antiguamiento.actions";
import { SalidaAntiguamientoViewDetalle } from "../components/SalidaAntiguamientoViewDetalle";

export default function SalidaAntiguamientoViewPage() {
  const { id } = useParams();

  const { data: salida, isLoading } = useQuery({
    queryKey: [SalidaAntiguamientoComplete.QUERY_KEY, "detail", id],
    queryFn: () => getSalidaAntiguamiento(Number(id)),
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

  if (!salida) {
    return (
      <FormWrapper>
        <p className="text-sm text-muted-foreground">Salida no encontrada.</p>
      </FormWrapper>
    );
  }

  const fecha = salida.fecha
    ? new Date(salida.fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <FormWrapper>
      <TitleFormComponent
        title={SalidaAntiguamientoComplete.MODEL.name}
        mode="detail"
        icon="Archive"
        backRoute={SalidaAntiguamientoComplete.ABSOLUTE_ROUTE}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="font-mono text-2xl font-bold tracking-tight">
            #{salida.numero}
          </span>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {fecha}
          </p>
        </div>

        <ExportButtons
          pdfEndpoint={`/salidas-antiguamiento/${id}/pdf`}
          pdfFileName={`salida-antiguamiento-${salida.numero ?? id}.pdf`}
          pdfResponseFormat="base64"
          variant="detail"
        />
      </div>

      {salida.almacen && (
        <div className="flex flex-wrap gap-x-8 gap-y-4 border-y py-4">
          <div className="flex flex-col gap-0.5">
            <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Warehouse className="size-3" />
              Almacén
            </p>
            <span className="text-sm font-medium">{salida.almacen.nombre}</span>
          </div>
        </div>
      )}

      {salida.observaciones && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Observaciones: </span>
          {salida.observaciones}
        </p>
      )}

      <SalidaAntiguamientoViewDetalle
        series={salida.series ?? []}
        productos={salida.productos ?? []}
      />
    </FormWrapper>
  );
}
