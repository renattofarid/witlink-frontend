import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { TecnicoResource } from "../lib/tecnico.interface";

interface ColumnActions {
  onEdit: (row: TecnicoResource) => void;
  onDelete: (row: TecnicoResource) => void;
  onRestore: (row: TecnicoResource) => void;
}

export const getTecnicoColumns = ({
  onEdit,
  onDelete,
  onRestore,
}: ColumnActions): ColumnDef<TecnicoResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    id: "persona",
    header: "Técnico",
    cell: ({ row }) => {
      const { nombre, apellido_paterno, apellido_materno } = row.original.persona;
      return `${nombre} ${apellido_paterno} ${apellido_materno}`;
    },
  },
  {
    id: "dni",
    header: "DNI",
    cell: ({ row }) => row.original.persona.dni,
  },
  {
    id: "cuadrilla",
    header: "Cuadrilla",
    cell: ({ row }) => row.original.cuadrilla.nombre,
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
