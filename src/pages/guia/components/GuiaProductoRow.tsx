import { Pencil, Trash2, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductoFormValues, SerieFormValues } from "../lib/guia.schema";
import type { SeriesDetailData } from "./GuiaProductoColumns";

interface GuiaProductoRowProps {
  producto: ProductoFormValues;
  index: number;
  editingIndex: number | null;
  confirmedSeriesCount?: number;
  isSaving?: boolean;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onViewSeries: (data: SeriesDetailData) => void;
  onCloseEditDialog: () => void;
}

export function GuiaProductoRow({
  producto,
  index,
  editingIndex,
  confirmedSeriesCount,
  isSaving,
  onEdit,
  onDelete,
  onViewSeries,
  onCloseEditDialog,
}: GuiaProductoRowProps) {
  const series = producto.series ?? [];
  const displaySeriesCount =
    confirmedSeriesCount !== undefined ? confirmedSeriesCount : series.length;

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm">
      {/* Index */}
      <span className="text-muted-foreground text-xs w-5 shrink-0 text-right">
        {index + 1}
      </span>

      {/* Name */}
      <span className="font-medium flex-1 min-w-0 truncate">
        {producto.nombre || producto.sap || "Sin nombre"}
        {isSaving && !producto.productos_guia_id && (
          <Loader2 className="inline ml-1.5 size-3 animate-spin text-muted-foreground" />
        )}
      </span>

      {/* SAP */}
      <span className="text-xs text-muted-foreground w-24 truncate hidden sm:block">
        {producto.sap || "—"}
      </span>

      {/* Type badge */}
      <div className="w-16 shrink-0">
        {producto.tipo ? (
          <Badge variant="default" className="text-xs capitalize">
            {producto.tipo}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </div>

      {/* Quantity */}
      <span className="text-xs w-8 shrink-0 text-center">{producto.cantidad}</span>

      {/* Series count */}
      <div className="w-20 shrink-0">
        {displaySeriesCount > 0 ? (
          <div className="flex items-center gap-1">
            <Badge variant="default" className="text-xs">
              {displaySeriesCount} serie{displaySeriesCount !== 1 ? "s" : ""}
            </Badge>
            {series.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6"
                title="Ver detalle de series"
                onClick={() =>
                  onViewSeries({
                    series: series as SerieFormValues[],
                    nombre: producto.nombre ?? producto.sap ?? null,
                    necesitaSerie: producto.necesita_serie ?? null,
                    necesitaMac: producto.necesita_mac ?? null,
                    necesitaEmtaMac: producto.necesita_emta_mac ?? null,
                    necesitaUa: producto.necesita_ua ?? null,
                  })
                }
              >
                <List className="size-3" />
              </Button>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">Sin series</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onEdit(index)}
        >
          <Pencil className="size-2" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          onClick={() => {
            if (editingIndex === index) onCloseEditDialog();
            onDelete(index);
          }}
        >
          <Trash2 className="size-2" />
        </Button>
      </div>
    </div>
  );
}
