import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { OpcionMenuResource } from "../lib/menu.interface";

interface ColumnActions {
  onEdit: (row: OpcionMenuResource) => void;
  onDelete: (row: OpcionMenuResource) => void;
  onRestore: (row: OpcionMenuResource) => void;
}

export const getOpcionMenuColumns = ({
  onEdit,
  onDelete,
  onRestore,
}: ColumnActions): ColumnDef<OpcionMenuResource>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "ruta",
    header: "Ruta",
  },
  {
    accessorKey: "icono",
    header: "Ícono",
  },
  {
    accessorKey: "orden",
    header: "Orden",
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
            color="danger"
            canRender={!isDeleted}
            onClick={() => onDelete(item)}
          />
          <ButtonAction
            icon={RotateCcw}
            color="warning"
            canRender={isDeleted}
            onClick={() => onRestore(item)}
          />
        </div>
      );
    },
  },
];
