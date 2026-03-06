import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UsuariosResource } from "../lib/usuarios.interface";

interface ColumnActions {
  onEdit: (row: UsuariosResource) => void;
  onDelete: (row: UsuariosResource) => void;
  onRestore: (row: UsuariosResource) => void;
}

export const getUsuariosColumns = ({
  onEdit,
  onDelete,
  onRestore,
}: ColumnActions): ColumnDef<UsuariosResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "nombre_usuario",
    header: "Usuario",
  },
  {
    accessorKey: "persona_id",
    header: "Persona ID",
  },
  {
    accessorKey: "tipo_usuario_id",
    header: "Tipo Usuario ID",
  },
  {
    accessorKey: "oficina_id",
    header: "Oficina ID",
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
