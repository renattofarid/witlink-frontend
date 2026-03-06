import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { GuiaResource } from "../lib/guia.interface";

interface ColumnActions {
  onEdit: (row: GuiaResource) => void;
  onDelete: (row: GuiaResource) => void;
  onRestore: (row: GuiaResource) => void;
}

export const getGuiaColumns = ({
  onEdit,
  onDelete,
  onRestore,
}: ColumnActions): ColumnDef<GuiaResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "numero",
    header: "Número",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
  },
  {
    id: "proveedor",
    header: "Proveedor",
    cell: ({ row }) => row.original.proveedor?.razon_social ?? "-",
  },
  {
    id: "productos_count",
    header: "Productos",
    cell: ({ row }) => row.original.productos?.length ?? 0,
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
            icon={Pencil}
            canRender={!isDeleted}
            onClick={() => onEdit(item)}
          />
          <ButtonAction
            icon={Trash2}
            canRender={!isDeleted}
            onClick={() => onDelete(item)}
          />
          <ButtonAction
            icon={RotateCcw}
            canRender={isDeleted}
            onClick={() => onRestore(item)}
          />
        </div>
      );
    },
  },
];
