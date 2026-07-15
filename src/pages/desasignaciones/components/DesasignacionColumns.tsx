import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { Eye } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";
import type { DesasignacionResource } from "../lib/desasignacion.interface";

interface ColumnActions {
  onView: (row: DesasignacionResource) => void;
}

export const getDesasignacionColumns = ({
  onView,
}: ColumnActions): ColumnDef<DesasignacionResource>[] => [
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
    accessorKey: "tecnico.nombre",
    header: "Técnico",
    cell: ({ row }) =>
      row.original.tecnico?.nombre_completo ?? row.original.tecnico?.nombre ?? "-",
  },
  {
    accessorKey: "usuario.nombre_usuario",
    header: "Registrado por",
    cell: ({ row }) => row.original.usuario?.nombre_usuario ?? "-",
  },
  {
    id: "estado",
    header: "Estado",
    cell: ({ row }) =>
      row.original.deleted_at ? (
        <Badge variant="default" color="red">
          Eliminado
        </Badge>
      ) : (
        <Badge variant="default" color="green">
          Activo
        </Badge>
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
            pdfEndpoint={`/desasignaciones/${item.id}/pdf`}
            pdfFileName={`desasignacion-${item.numero ?? item.id}.pdf`}
            variant="separate"
          />
        </div>
      );
    },
  },
];
