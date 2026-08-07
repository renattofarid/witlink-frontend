import GeneralSheet from "@/components/GeneralSheet";
import type { SotRemisionResource } from "../lib/sot-remision.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  data: SotRemisionResource | null;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}

export default function SotRemisionDetailSheet({ open, onClose, data }: Props) {
  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={data ? `SOT ${data.sot}` : "SOT"}
      subtitle="Información de remisión importada del Excel"
      icon="FileSpreadsheet"
      size="lg"
    >
      {data && (
        <div className="space-y-6 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="SOT" value={data.sot} />
            <Field label="R.U.C./D.N.I." value={data.ruc} />
            <Field label="Razón social" value={data.razon_social} />
            <Field label="Dirección" value={data.direccion} />
            <Field label="Distrito" value={data.distrito} />
            <Field label="Provincia" value={data.provincia} />
            <Field label="Departamento" value={data.departamento} />
            {data.estado != null && <Field label="Estado" value={data.estado} />}
            {data.zona != null && <Field label="Zona" value={data.zona} />}
            {data.sede != null && <Field label="Sede" value={data.sede} />}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fila original del Excel
            </p>
            <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(data.datos, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
