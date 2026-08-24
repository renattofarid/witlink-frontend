import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { MaterialResource } from "../lib/materiales.interface";

interface ColumnActions {
  onEdit: (row: MaterialResource) => void;
  onDelete: (row: MaterialResource) => void;
  onRestore: (row: MaterialResource) => void;
}

export const getMaterialesColumns = ({
  onEdit,
  onDelete,
}: ColumnActions): ColumnDef<MaterialResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    id: "sap",
    header: "SAP",
    cell: ({ row }) => row.original.producto.sap,
  },
  {
    id: "origen",
    header: "Origen",
    cell: ({ row }) => row.original.producto.origen,
  },
  {
    id: "nombre",
    header: "Producto",
    cell: ({ row }) => row.original.producto.nombre,
  },
  {
    id: "tipo",
    header: "Tipo",
    cell: ({ row }) => row.original.producto.tipo,
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex gap-1">
          <ButtonAction icon={Pencil} onClick={() => onEdit(item)} />
          <ButtonAction
            icon={Trash2}
            color="red"
            onClick={() => onDelete(item)}
          />
        </div>
      );
    },
  },
];
