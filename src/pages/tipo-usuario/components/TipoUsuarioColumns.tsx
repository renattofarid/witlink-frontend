import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw, List } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { TipoUsuarioResource } from "../lib/tipo-usuario.interface";

interface ColumnActions {
  onEdit: (row: TipoUsuarioResource) => void;
  onDelete: (row: TipoUsuarioResource) => void;
  onRestore: (row: TipoUsuarioResource) => void;
  onViewOpciones: (row: TipoUsuarioResource) => void;
}

export const getTipoUsuarioColumns = ({
  onEdit,
  onDelete,
  onRestore,
  onViewOpciones,
}: ColumnActions): ColumnDef<TipoUsuarioResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
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
            onClick={() => onViewOpciones(item)}
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
