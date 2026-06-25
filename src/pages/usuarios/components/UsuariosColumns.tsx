import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2 } from "lucide-react";
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
    id: "nombre_completo",
    header: "Nombre completo",
    cell: ({ row }) => row.original.persona.nombre_completo,
  },
  {
    id: "dni",
    header: "DNI",
    cell: ({ row }) => row.original.persona.dni,
  },
  {
    id: "tipo_empleado",
    header: "Tipo empleado",
    cell: ({ row }) => row.original.persona.tipo_empleado,
  },
  {
    id: "tipo_usuario",
    header: "Tipo usuario",
    cell: ({ row }) => row.original.tipoUsuario.nombre,
  },
  {
    id: "almacen",
    header: "Almacén",
    cell: ({ row }) => row.original.almacen?.nombre || "-",
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex gap-1">
          <ButtonAction icon={Pencil} onClick={() => onEdit(item)} />
          <ButtonAction icon={Trash2} onClick={() => onDelete(item)} />
        </div>
      );
    },
  },
];
