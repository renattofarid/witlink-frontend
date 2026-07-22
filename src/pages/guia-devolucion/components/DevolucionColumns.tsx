import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, XCircle } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";
import DevolucionDetalleSheet from "./DevolucionDetalleSheet";
import type { GuiaDevolucionListItem } from "../lib/devolucion.interface";

interface ColumnActions {
  onEdit: (item: GuiaDevolucionListItem) => void;
  onAnular: (item: GuiaDevolucionListItem) => void;
}

function formatISODate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

export const getDevolucionColumns = (
  actions: ColumnActions,
): ColumnDef<GuiaDevolucionListItem>[] => [
  {
    accessorKey: "numero",
    header: "Nro.",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono font-semibold">{row.original.numero}</span>
    ),
  },
  {
    id: "fecha_emision",
    header: "Fecha emisión",
    size: 100,
    cell: ({ row }) => <span>{formatISODate(row.original.fecha_emision)}</span>,
  },
  {
    id: "fecha_traslado",
    header: "Fecha traslado",
    size: 100,
    cell: ({ row }) => <span>{formatISODate(row.original.fecha_traslado)}</span>,
  },
  {
    id: "almacen_origen",
    header: "Origen",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.almacen_origen?.nombre ?? "-"}</span>
    ),
  },
  {
    id: "destinatario",
    header: "Destinatario",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium truncate max-w-50">{row.original.destinatario}</span>
        <span className="text-xs text-muted-foreground">{row.original.ruc_dni}</span>
      </div>
    ),
  },
  {
    id: "motivo_traslado",
    header: "Motivo",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground truncate max-w-40 block">
        {row.original.motivo_traslado}
      </span>
    ),
  },
  {
    id: "cantidad_series",
    header: "Series",
    size: 80,
    cell: ({ row }) => {
      const total = row.original.productos.reduce(
        (acc, p) => acc + p.series.length,
        0,
      );
      return <span className="text-muted-foreground whitespace-nowrap">{total}</span>;
    },
  },
  {
    accessorKey: "usuario",
    header: "Emitido por",
    size: 140,
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.usuario?.persona ?? row.original.usuario?.nombre_usuario ?? "-"}
      </span>
    ),
  },
  {
    id: "estado",
    header: "Estado",
    size: 120,
    cell: ({ row }) =>
      row.original.anulado ? (
        <Badge variant="default" color="red">
          Anulado
        </Badge>
      ) : (
        <Badge variant="default" color="green">
          Vigente
        </Badge>
      ),
  },
  {
    id: "acciones",
    size: 140,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-1">
          <DevolucionDetalleSheet guia={item} />
          <ExportButtons
            pdfEndpoint={`/guias-devolucion/${item.id}/pdf`}
            pdfFileName={`guia-devolucion-${item.numero ?? item.id}.pdf`}
            variant="separate"
          />
          {!item.anulado && (
            <>
              <Button
                size="sm"
                variant="secondary"
                tooltip="Editar guía"
                onClick={() => actions.onEdit(item)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                color="red"
                tooltip="Anular guía"
                onClick={() => actions.onAnular(item)}
              >
                <XCircle className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];
