import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw, FileText, Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { GuiaResource } from "../lib/guia.interface";
import { api } from "@/lib/config";
import { promiseToast } from "@/lib/core.function";
import { GuiaProductosModal } from "./GuiaProductosModal";

async function openPdf(archivo: string) {
  const promise = api
    .get(`/archivos/${archivo}`, { responseType: "blob" })
    .then((response) => {
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = archivo;
      a.click();

      window.open(url);
    });

  promiseToast(promise, {
    loading: "Descargando PDF...",
    success: "PDF descargado",
    error: "Error al descargar el PDF",
  });
}

interface ColumnActions {
  onView: (row: GuiaResource) => void;
  onEdit: (row: GuiaResource) => void;
  onDelete: (row: GuiaResource) => void;
  onRestore: (row: GuiaResource) => void;
}

export const getGuiaColumns = ({
  onView,
  onEdit,
  onDelete,
  onRestore,
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
      return new Date(fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  // {
  //   id: "proveedor",
  //   header: "Proveedor",
  //   cell: ({ row }) => row.original.proveedor?.razon_social ?? "-",
  // },
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
      if (!url) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <button
          onClick={() => openPdf(url)}
          className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          <FileText className="size-3.5" />
          <span className="text-xs">Ver</span>
        </button>
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
        <Badge variant="outline" color="green">
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
