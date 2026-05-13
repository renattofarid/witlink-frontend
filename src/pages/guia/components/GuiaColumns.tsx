import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw, FileText, Eye, CheckCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { GuiaResource } from "../lib/guia.interface";
import { openPdf } from "../lib/guia.actions";
import { GuiaProductosModal } from "./GuiaProductosModal";
import { Button } from "@/components/ui/button";
import { parse } from "date-fns";

interface ColumnActions {
  onView: (row: GuiaResource) => void;
  onEdit: (row: GuiaResource) => void;
  onDelete: (row: GuiaResource) => void;
  onRestore: (row: GuiaResource) => void;
  onConfirm: (row: GuiaResource) => void;
}

export const getGuiaColumns = ({
  onView,
  onEdit,
  onDelete,
  onRestore,
  onConfirm,
}: ColumnActions): ColumnDef<GuiaResource>[] => [
  {
    accessorKey: "numero",
    header: "Número",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = row.original.fecha;
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
    id: "usuario",
    header: "Usuario",
    cell: ({ row }) => {
      const { persona, nombre_usuario } = row.original.usuario;
      if (persona) {
        return `${persona.nombre} ${persona.apellido_paterno}`;
      }
      return nombre_usuario;
    },
  },
  {
    id: "productos",
    header: "Productos",
    cell: ({ row }) => (
      <GuiaProductosModal
        productos={row.original.productos ?? []}
        guiaNumero={row.original.numero}
      />
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
        <Button
          onClick={() => openPdf(url)}
          className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
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
