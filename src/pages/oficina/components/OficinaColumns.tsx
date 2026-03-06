import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { OficinaResource } from "../lib/oficina.interface";

interface ColumnActions {
  onEdit: (row: OficinaResource) => void;
  onDelete: (row: OficinaResource) => void;
  onRestore: (row: OficinaResource) => void;
}

export const getOficinaColumns = ({
  onEdit,
  onDelete,
  onRestore,
}: ColumnActions): ColumnDef<OficinaResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "ubigeo",
    header: "Ubigeo",
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
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
