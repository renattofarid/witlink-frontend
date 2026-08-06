import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { Trash2, Eye, UserCog } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";
import { DespachoProductosModal } from "./DespachoProductosModal";
import type { DespachoResource } from "../lib/despacho.interface";

interface ColumnActions {
  onDelete: (row: DespachoResource) => void;
  onView: (row: DespachoResource) => void;
  onReassign: (row: DespachoResource) => void;
}

export const getDespachoColumns = ({
  onDelete,
  onView,
  onReassign,
}: ColumnActions): ColumnDef<DespachoResource>[] => [
  {
    accessorKey: "numero",
    header: "Número",
  },
  {
    accessorKey: "sot",
    header: "SOT",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.sot ?? row.original.numero_sot ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = row.original.fecha;
      if (!fecha) return "-";
      return new Date(fecha + "T12:00:00").toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "almacen.nombre",
    header: "Almacén",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        #{row.original.almacen.nombre}
        {/* {row.original.almacen_nombre ? ` - ${row.original.almacen_nombre}` : ""} */}
      </span>
    ),
  },
  {
    accessorKey: "tecnico.nombre_completo",
    header: "Técnico",
    cell: ({ row }) => row.original.tecnico?.nombre_completo ?? "-",
  },
  {
    accessorKey: "usuario.nombre_usuario",
    header: "Registrado por",
    cell: ({ row }) => row.original.usuario?.nombre_usuario ?? "-",
  },
  {
    id: "productos",
    header: "Productos",
    cell: ({ row }) => (
      <DespachoProductosModal
        productos={row.original.productos}
        despachoNumero={row.original.numero}
      />
    ),
  },
  {
    id: "estado",
    header: "Estado",
    cell: ({ row }) =>
      row.original.deleted_at ? (
        <Badge variant="default" color="red">
          Eliminado
        </Badge>
      ) : (
        <Badge variant="default" color="green">
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
        <div className="flex gap-1 items-center">
          <ButtonAction icon={Eye} onClick={() => onView(item)} />
          <ExportButtons
            pdfEndpoint={`/despachos/${item.id}/pdf`}
            pdfFileName={`despacho-${item.numero ?? item.id}.pdf`}
            variant="separate"
          />
          <ButtonAction
            icon={UserCog}
            canRender={!isDeleted}
            onClick={() => onReassign(item)}
            tooltip="Reasignar técnico"
          />
          <ButtonAction
            icon={Trash2}
            canRender={!isDeleted}
            onClick={() => onDelete(item)}
          />
        </div>
      );
    },
  },
];
