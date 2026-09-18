import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { Trash2, Edit, Eye, UserCog, ClipboardList } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";
import { DespachoProductosModal } from "./DespachoProductosModal";
import type { DespachoResource } from "../lib/despacho.interface";

interface ColumnActions {
  onDelete: (row: DespachoResource) => void;
  onEdit: (row: DespachoResource) => void;
  onView: (row: DespachoResource) => void;
  onReassign: (row: DespachoResource) => void;
  onViewLiquidacion?: (row: DespachoResource) => void;
}

function DespachoAccionesCell({
  item,
  onDelete,
  onEdit,
  onView,
  onReassign,
  onViewLiquidacion,
}: {
  item: DespachoResource;
  onDelete: (row: DespachoResource) => void;
  onEdit: (row: DespachoResource) => void;
  onView: (row: DespachoResource) => void;
  onReassign: (row: DespachoResource) => void;
  onViewLiquidacion?: (row: DespachoResource) => void;
}) {
  const navigate = useNavigate();
  const isDeleted = !!item.deleted_at;
  const isOperativo = (item.tipo ?? "OPERATIVO") === "OPERATIVO";
  const sot = item.sot ?? item.numero_sot;

  const handleGoToLiquidacion = () => {
    if (onViewLiquidacion) {
      onViewLiquidacion(item);
    } else if (sot) {
      navigate(`/liquidaciones/ver/${encodeURIComponent(sot)}`);
    } else {
      navigate(`/liquidaciones`);
    }
  };

  return (
    <div className="flex gap-1 items-center">
      <ButtonAction icon={Eye} onClick={() => onView(item)} />
      {isOperativo && (
        <ButtonAction
          icon={ClipboardList}
          onClick={handleGoToLiquidacion}
          tooltip={sot ? `Ver liquidación (SOT ${sot})` : "Ver liquidaciones"}
        />
      )}
      <ButtonAction
        icon={Edit}
        canRender={!isDeleted}
        onClick={() => onEdit(item)}
        tooltip="Editar despacho"
      />
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
}

export const getDespachoColumns = (actions: ColumnActions): ColumnDef<DespachoResource>[] => [
  {
    accessorKey: "numero",
    header: "Número",
  },
  {
    accessorKey: "sot",
    header: "SOT",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {row.original.sot ?? row.original.numero_sot ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.original.tipo ?? "OPERATIVO";
      return tipo === "HERRAMIENTAS" ? (
        <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 font-medium">
          Herramientas
        </Badge>
      ) : (
        <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400 font-medium">
          Operativo
        </Badge>
      );
    },
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
    cell: ({ row }) => <DespachoAccionesCell item={row.original} {...actions} />,
  },
];
