import GeneralSheet from "@/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTraspasoContrataDetailQuery } from "../lib/traspaso-contrata.hook";
import { TraspasoContrataComplete } from "../lib/traspaso-contrata.constants";
import type { TraspasoContrataResource } from "../lib/traspaso-contrata.interface";

function formatISODate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

interface Field {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}

function DocField({ label, value, mono }: Field) {
  return (
    <div className="space-y-0.5 min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`text-sm wrap-break-word ${mono ? "font-mono" : ""}`}>
        {value || "-"}
      </p>
    </div>
  );
}

interface Props {
  item: TraspasoContrataResource | null;
  onClose: () => void;
}

export default function TraspasoContrataDetalleSheet({ item, onClose }: Props) {
  const navigate = useNavigate();
  const { data, isLoading } = useTraspasoContrataDetailQuery(item?.id ?? null);
  const detalle = data ?? item;

  return (
    <GeneralSheet
      open={!!item}
      onClose={onClose}
      title={detalle ? `Traspaso ${detalle.numero}` : undefined}
      subtitle="Traspaso a contrata"
      icon="Truck"
      isLoading={isLoading}
      size="lg"
      childrenFooter={
        detalle ? (
          <Button
            type="button"
            onClick={() => {
              onClose();
              navigate(`${TraspasoContrataComplete.ROUTE_UPDATE}/${detalle.id}`);
            }}
          >
            <Edit className="size-3.5" />
            Editar
          </Button>
        ) : null
      }
    >
      {detalle && (
        <div className="space-y-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <DocField label="Número" value={detalle.numero} mono />
            <DocField label="Fecha" value={formatISODate(detalle.fecha)} />
            <DocField label="RUC contrata" value={detalle.ruc_contrata} mono />
            <DocField
              label="Descripción / Razón social"
              value={detalle.descripcion_contrata}
            />
            <DocField
              label="Dirección"
              value={detalle.direccion_contrata}
            />
            <DocField label="Observaciones" value={detalle.observaciones} />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Materiales
            </p>
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-2 py-1.5 font-medium">SAP</th>
                    <th className="text-left px-2 py-1.5 font-medium">
                      Producto
                    </th>
                    <th className="text-left px-2 py-1.5 font-medium">
                      Cantidad
                    </th>
                    <th className="text-left px-2 py-1.5 font-medium">
                      Movimiento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(detalle.materiales ?? []).map((m) => (
                    <tr key={m.producto_id} className="border-t">
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {m.sap}
                      </td>
                      <td className="px-2 py-1.5">{m.producto}</td>
                      <td className="px-2 py-1.5">{m.cantidad}</td>
                      <td className="px-2 py-1.5 font-mono text-muted-foreground">
                        {m.movimiento_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
