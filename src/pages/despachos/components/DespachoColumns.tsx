import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { Trash2 } from "lucide-react";
import type { DespachoResource } from "../lib/despacho.interface";

interface ColumnActions {
  onDelete: (row: DespachoResource) => void;
}

export const getDespachoColumns = ({
  onDelete,
}: ColumnActions): ColumnDef<DespachoResource>[] => [
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
    accessorKey: "almacen_id",
    header: "Almacén",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        #{row.original.almacen_id}
      </span>
    ),
  },
  {
    id: "estado",
    header: "Estado",
    cell: ({ row }) =>
      row.original.deleted_at ? (
        <Badge color="destructive" className="text-xs">
          Eliminado
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="text-xs text-green-600 border-green-600"
        >
          Activo
        </Badge>
      ),
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;
      const isDeleted = !!item.deleted_at;
      return (
        <div className="flex gap-1">
          <ButtonAction
            icon={Trash2}
            canRender={!isDeleted}
            onClick={() => onDelete(item)}
          />
        </div>
      );
    },
  },
];
