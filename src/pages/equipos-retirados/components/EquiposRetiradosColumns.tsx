import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { EquipoRetiradoResource } from "../lib/equipos-retirados.interface";
import { ALL_TIPO_EQUIPO_RETIRADO_OPTIONS } from "../lib/equipos-retirados.constants";

interface ColumnActions {
  onEdit: (row: EquipoRetiradoResource) => void;
  onDelete: (row: EquipoRetiradoResource) => void;
  onRestore: (row: EquipoRetiradoResource) => void;
}

export const getEquiposRetiradosColumns = ({
  onEdit,
  onDelete,
  onRestore,
}: ColumnActions): ColumnDef<EquipoRetiradoResource>[] => [
  {
    accessorKey: "sot",
    header: "SOT",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = row.original.fecha;
      if (!fecha) return "—";
      return new Date(fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  {
    id: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.original.tipo;
      const nombre =
        row.original.nombre_tipo ||
        ALL_TIPO_EQUIPO_RETIRADO_OPTIONS.find((o) => o.value === tipo)?.label ||
        tipo;
      return (
        <Badge variant="outline" className="text-xs">
          {nombre}
        </Badge>
      );
    },
  },
  {
    id: "almacen_pertenencia",
    header: "Almacén",
    cell: ({ row }) => {
      const nombre =
        row.original.almacen_pertenencia?.nombre ?? row.original.almacen?.nombre;
      if (!nombre) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <span className="text-xs" title={row.original.almacen?.nombre}>
          {nombre}
        </span>
      );
    },
  },
  {
    id: "productos",
    header: "Productos",
    cell: ({ row }) => {
      const count = row.original.productos?.length ?? 0;
      if (!count)
        return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <Badge variant="default" className="text-xs">
          {count} producto{count !== 1 ? "s" : ""}
        </Badge>
      );
    },
  },
  {
    id: "estado",
    header: "Estado",
    cell: ({ row }) =>
      row.original.deleted_at ? (
        <Badge color="destructive" className="text-xs">
          Eliminado
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="text-xs text-green-600 border-green-600"
        >
          Activo
        </Badge>
      ),
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
