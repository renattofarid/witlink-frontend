import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductoFormValues, SerieFormValues } from "../lib/guia.schema";

export interface SeriesDetailData {
  series: SerieFormValues[];
  nombre: string | null;
  necesitaSerie: boolean | null;
  necesitaMac: boolean | null;
  necesitaEmtaMac: boolean | null;
  necesitaUa: boolean | null;
}

interface GuiaProductoColumnActions {
  editingIndex: number | null;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onViewSeries: (data: SeriesDetailData) => void;
  onCloseEditDialog: () => void;
}

export function getGuiaProductoColumns({
  editingIndex,
  onEdit,
  onDelete,
  onViewSeries,
  onCloseEditDialog,
}: GuiaProductoColumnActions): ColumnDef<ProductoFormValues>[] {
  return [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.index + 1}</span>
      ),
    },
    {
      id: "producto",
      header: "Producto",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.nombre || row.original.sap || "Sin nombre"}
        </span>
      ),
    },
    {
      id: "sap",
      header: "SAP",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.sap || "Sin codigo SAP"}
        </span>
      ),
    },
    {
      id: "tipo",
      header: "Tipo",
      cell: ({ row }) =>
        row.original.tipo ? (
          <Badge variant="default" className="text-xs capitalize">
            {row.original.tipo}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "cantidad",
      header: "Cant.",
      cell: ({ row }) => row.original.cantidad,
    },
    {
      id: "series",
      header: "Series",
      cell: ({ row }) => {
        const series = row.original.series ?? [];
        if (!series.length)
          return (
            <span className="text-muted-foreground text-xs">Sin series</span>
          );
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant="default" className="text-xs">
              {series.length} serie{series.length !== 1 ? "s" : ""}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              title="Ver detalle de series"
              onClick={() =>
                onViewSeries({
                  series: series as SerieFormValues[],
                  nombre: row.original.nombre ?? row.original.sap ?? null,
                  necesitaSerie: row.original.necesita_serie ?? null,
                  necesitaMac: row.original.necesita_mac ?? null,
                  necesitaEmtaMac: row.original.necesita_emta_mac ?? null,
                  necesitaUa: row.original.necesita_ua ?? null,
                })
              }
            >
              <List className="size-3" />
            </Button>
          </div>
        );
      },
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1 justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onEdit(row.index)}
          >
            <Pencil className="size-2" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => {
              if (editingIndex === row.index) onCloseEditDialog();
              onDelete(row.index);
            }}
          >
            <Trash2 className="size-2" />
          </Button>
        </div>
      ),
    },
  ];
}
