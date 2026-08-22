import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { MaterialResource } from "../lib/materiales.interface";

interface ColumnActions {
  onEdit: (row: MaterialResource) => void;
  onDelete: (row: MaterialResource) => void;
  onRestore: (row: MaterialResource) => void;
}

export const getMaterialesColumns = ({
  onEdit,
  onDelete,
  onRestore,
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
    id: "origen",
    header: "Origen",
    cell: ({ row }) => {
      const { origen, origen_label } = row.original;
      const label = origen_label || origen;
      return label ? <Badge>{label}</Badge> : "—";
    },
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
            color="red"
            canRender={!isDeleted}
            onClick={() => onDelete(item)}
          />
          <ButtonAction
            icon={RotateCcw}
            color="amber"
            canRender={isDeleted}
            onClick={() => onRestore(item)}
          />
        </div>
      );
    },
  },
];
