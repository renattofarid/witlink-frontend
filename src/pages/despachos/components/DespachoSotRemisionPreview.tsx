import { MapPin } from "lucide-react";
import { useSotRemisionQuery } from "@/pages/sots-remision/lib/sot-remision.hook";

interface Props {
  sot: string;
}

/**
 * Previsualiza el destinatario/dirección/RUC que se usará al generar el PDF
 * de la guía de despacho: el backend resuelve estos datos desde
 * `sots_remision` (Excel importado) y, si no encuentra la SOT ahí, cae al
 * comportamiento anterior basado en `liquidaciones` y el técnico asignado.
 */
export function DespachoSotRemisionPreview({ sot }: Props) {
  const { data, isFetching, isError } = useSotRemisionQuery(sot, !!sot);

  if (!sot.trim()) return null;

  if (isFetching) {
    return (
      <p className="text-xs text-muted-foreground">
        Buscando datos de remisión para la SOT...
      </p>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-xs text-muted-foreground">
        No se encontró remisión importada para esta SOT; se usarán los datos
        de liquidación / técnico al generar la guía.
      </p>
    );
  }

  const { razon_social, direccion, ruc } = data.data;

  return (
    <div className="rounded-md border bg-muted/20 p-3 space-y-1">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <MapPin className="size-3.5" />
        Datos de la guía (desde SOT / remisión)
      </p>
      <p className="text-sm">
        <span className="text-muted-foreground">Destinatario: </span>
        {razon_social || "—"}
      </p>
      <p className="text-sm">
        <span className="text-muted-foreground">Punto de llegada: </span>
        {direccion || "—"}
      </p>
      <p className="text-sm">
        <span className="text-muted-foreground">R.U.C./D.N.I.: </span>
        {ruc || "—"}
      </p>
    </div>
  );
}
