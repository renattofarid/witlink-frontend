import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductoResource } from "../lib/producto.interface";

interface ColumnActions {
  onEdit: (row: ProductoResource) => void;
  onDelete: (row: ProductoResource) => void;
  onRestore: (row: ProductoResource) => void;
}

export const getProductoColumns = ({
  onEdit,
  onDelete,
  onRestore,
}: ColumnActions): ColumnDef<ProductoResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "sap",
    header: "SAP",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
  },
  {
    id: "categoria",
    header: "Categoría",
    cell: ({ row }) => row.original.categoria?.nombre ?? "-",
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
