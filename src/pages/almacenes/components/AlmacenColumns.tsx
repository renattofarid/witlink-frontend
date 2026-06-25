import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { AlmacenResource } from "../lib/almacen.interface";

interface ColumnActions {
  onEdit: (row: AlmacenResource) => void;
  onDelete: (row: AlmacenResource) => void;
}

export const getAlmacenColumns = ({
  onEdit,
  onDelete,
}: ColumnActions): ColumnDef<AlmacenResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "codigo",
    header: "Código",
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
      return (
        <div className="flex gap-1">
          <ButtonAction
            icon={Pencil}
            canRender={true}
            onClick={() => onEdit(item)}
          />
          <ButtonAction
            icon={Trash2}
            canRender={true}
            onClick={() => onDelete(item)}
          />
        </div>
      );
    },
  },
];
