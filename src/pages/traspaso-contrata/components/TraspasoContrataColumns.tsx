import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Edit, Eye, FileCheck2, Upload } from "lucide-react";
import type { TraspasoContrataResource } from "../lib/traspaso-contrata.interface";

interface ColumnActions {
  onView: (item: TraspasoContrataResource) => void;
  onEdit: (item: TraspasoContrataResource) => void;
  onDownload: (item: TraspasoContrataResource) => void;
  onUploadSigned: (item: TraspasoContrataResource) => void;
  onDownloadSigned: (item: TraspasoContrataResource) => void;
}

function formatISODate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

export const getTraspasoContrataColumns = (
  actions: ColumnActions,
): ColumnDef<TraspasoContrataResource>[] => [
  {
    accessorKey: "numero",
    header: "Nro.",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono font-semibold">{row.original.numero}</span>
    ),
  },
  {
    id: "fecha",
    header: "Fecha",
    size: 100,
    cell: ({ row }) => <span>{formatISODate(row.original.fecha)}</span>,
  },
  {
    accessorKey: "ruc_contrata",
    header: "RUC",
  },
  {
    id: "descripcion_contrata",
    header: "Contrata",
    cell: ({ row }) => (
      <span className="font-medium truncate max-w-50 block">
        {row.original.descripcion_contrata}
      </span>
    ),
  },
  {
    id: "series",
    header: "Series",
    size: 90,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.series?.length ?? 0}
      </span>
    ),
  },
  {
    id: "materiales",
    header: "Materiales",
    size: 90,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.materiales?.length ?? 0}
      </span>
    ),
  },
  {
    id: "regularizacion",
    header: "Regularización",
    size: 125,
    cell: ({ row }) =>
      row.original.tiene_documento_firmado ? (
        <Badge color="green">Firmada</Badge>
      ) : (
        <Badge color="amber">Pendiente</Badge>
      ),
  },
  {
    id: "acciones",
    header: "Acciones",
    size: 310,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          tooltip="Descargar guía de traspaso"
          onClick={() => actions.onDownload(row.original)}
        >
          <Download className="size-3.5" />
        </Button>
        {row.original.tiene_documento_firmado ? (
          <Button
            size="sm"
            variant="outline"
            tooltip="Descargar guía firmada"
            onClick={() => actions.onDownloadSigned(row.original)}
          >
            <FileCheck2 className="size-3.5" />
          </Button>
        ) : null}
        <Button
          size="sm"
          variant={row.original.tiene_documento_firmado ? "ghost" : "default"}
          tooltip={
            row.original.tiene_documento_firmado
              ? "Reemplazar guía firmada"
              : "Subir guía firmada"
          }
          onClick={() => actions.onUploadSigned(row.original)}
        >
          <Upload className="size-3.5" />
          {!row.original.tiene_documento_firmado && "Subir firmado"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          tooltip="Ver detalle"
          onClick={() => actions.onView(row.original)}
        >
          <Eye className="size-3.5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          tooltip="Editar guia de salida"
          onClick={() => actions.onEdit(row.original)}
        >
          <Edit className="size-3.5" />
        </Button>
      </div>
    ),
  },
];
