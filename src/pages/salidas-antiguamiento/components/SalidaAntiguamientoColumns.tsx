import type { ColumnDef } from "@tanstack/react-table";
import { ButtonAction } from "@/components/ButtonAction";
import { Eye } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";
import type { SalidaAntiguamientoResource } from "../lib/salida-antiguamiento.interface";

interface ColumnActions {
  onView: (row: SalidaAntiguamientoResource) => void;
}

export const getSalidaAntiguamientoColumns = ({
  onView,
}: ColumnActions): ColumnDef<SalidaAntiguamientoResource>[] => [
  {
    accessorKey: "numero",
    header: "Número",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = row.original.fecha;
      if (!fecha) return "-";
      return new Date(fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "almacen.nombre",
    header: "Almacén",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.almacen?.nombre ?? "-"}
      </span>
    ),
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex gap-1 items-center">
          <ButtonAction icon={Eye} onClick={() => onView(item)} />
          <ExportButtons
            pdfEndpoint={`/salidas-antiguamiento/${item.id}/pdf`}
            pdfFileName={`salida-antiguamiento-${item.numero ?? item.id}.pdf`}
            pdfResponseFormat="base64"
            variant="separate"
          />
        </div>
      );
    },
  },
];
