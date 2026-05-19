import { ButtonAction } from "@/components/ButtonAction";
import {
  Pencil,
  Trash2,
  RotateCcw,
  FileText,
  Eye,
  CheckCircle,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { GuiaListResource } from "../lib/guia.interface";
import { openPdf } from "../lib/guia.actions";
import { Button } from "@/components/ui/button";
import { parse } from "date-fns";

interface ColumnActions {
  onView: (row: GuiaListResource) => void;
  onEdit: (row: GuiaListResource) => void;
  onDelete: (row: GuiaListResource) => void;
  onRestore: (row: GuiaListResource) => void;
  onConfirm: (row: GuiaListResource) => void;
}

export const getGuiaColumns = ({
  onView,
  onEdit,
  onDelete,
  onRestore,
  onConfirm,
}: ColumnActions): ColumnDef<GuiaListResource>[] => [
  {
    accessorKey: "numero",
    header: "Número",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = row.original.fecha.split("T")[0]; // Obtener solo la parte de la fecha
      if (!fecha) return "-";
      const parsedDate = parse(fecha, "yyyy-MM-dd", new Date());
      return parsedDate.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "almacen",
    header: "Almacén",
    cell: ({ row }) => row.original.almacen ?? "-",
  },
  {
    accessorKey: "usuario",
    header: "Usuario",
    cell: ({ row }) => row.original.usuario,
  },
  {
    id: "cantidades",
    header: "Mat. | Series",
    cell: ({ row }) => (
      <span className="text-xs tabular-nums">
        {row.original.cantidad_materiales} | {row.original.cantidad_series}
      </span>
    ),
  },
  {
    id: "pdf",
    header: "PDF",
    cell: ({ row }) => {
      const url = row.original.ruta_pdf_guia;
      if (!url)
        return (
          <span className="text-muted-foreground text-xs">Sin archivo</span>
        );
      return (
        <Button size="xs" onClick={() => openPdf(url)}>
          <FileText className="size-3.5" />
          <span className="text-xs">Ver</span>
        </Button>
      );
    },
  },
  {
    id: "confirmado",
    header: "Confirmado",
    cell: ({ row }) =>
      row.original.confirmado ? (
        <Badge variant="default" color="green" className="text-xs">
          Confirmado
        </Badge>
      ) : (
        <Badge color="gray" className="text-xs">
          Pendiente
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
            icon={Eye}
            canRender={!isDeleted}
            onClick={() => onView(item)}
          />
          <ButtonAction
            icon={Pencil}
            canRender={!isDeleted}
            onClick={() => onEdit(item)}
          />
          <ButtonAction
            icon={CheckCircle}
            canRender={!isDeleted && !item.confirmado}
            onClick={() => onConfirm(item)}
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
