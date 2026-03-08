import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw, List } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { MenuResource } from "../lib/menu.interface";

interface ColumnActions {
  onEdit: (row: MenuResource) => void;
  onDelete: (row: MenuResource) => void;
  onRestore: (row: MenuResource) => void;
  onViewOpciones: (row: MenuResource) => void;
}

export const getMenuColumns = ({
  onEdit,
  onDelete,
  onRestore,
  onViewOpciones,
}: ColumnActions): ColumnDef<MenuResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
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
            icon={List}
            canRender={!isDeleted}
            onClick={() => onViewOpciones(item)}
            tooltip="Ver opciones"
          />
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
