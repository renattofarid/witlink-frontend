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
    <div className="grid grid-cols-1 md:grid-cols-[3.5rem_1fr_9rem_7rem_6rem_8rem_6rem] items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors text-sm">
      {/* Index */}
      <div className="flex items-center justify-center">
        <span className="font-semibold text-xs text-muted-foreground/80 bg-muted/70 px-2.5 py-0.5 rounded-full font-mono">
          {index + 1}
        </span>
      </div>

      {/* Name */}
      <div className="flex flex-col min-w-0 pr-2">
        <span className="font-semibold text-foreground text-sm leading-snug truncate" title={producto.nombre ?? ""}>
          {producto.nombre || producto.sap || "Sin nombre"}
          {isSaving && !producto.productos_guia_id && (
            <Loader2 className="inline ml-2 size-3.5 animate-spin text-primary" />
          )}
        </span>
        {/* On mobile screens show SAP code */}
        <span className="text-xs text-muted-foreground md:hidden font-mono mt-0.5">
          SAP: {producto.sap || "—"}
        </span>
      </div>

      {/* SAP (Desktop) */}
      <div className="hidden md:flex items-center">
        <code className="text-xs font-mono bg-muted/60 px-2 py-1 rounded text-foreground/80 border border-border/40 font-medium">
          {producto.sap || "—"}
        </code>
      </div>

      {/* Type badge */}
      <div className="flex justify-center">
        {producto.tipo === "EQUIPO" ? (
          <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 font-semibold text-xs border-sky-300/40 dark:border-sky-800/60 px-2.5 py-0.5">
            EQUIPO
          </Badge>
        ) : producto.tipo === "MATERIAL" ? (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 font-semibold text-xs border-amber-300/40 dark:border-amber-800/60 px-2.5 py-0.5">
            MATERIAL
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </div>

      {/* Quantity */}
      <div className="flex justify-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted/80 text-foreground border border-border/50 font-mono">
          {producto.cantidad}
        </span>
      </div>

      {/* Series count */}
      <div className="flex justify-center items-center">
        {displaySeriesCount > 0 ? (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-400/40 dark:border-emerald-800/60 font-semibold text-xs px-2.5 py-0.5">
              {displaySeriesCount} {displaySeriesCount === 1 ? "serie" : "series"}
            </Badge>
            {series.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted"
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
                <List className="size-4" />
              </Button>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60 italic">Sin series</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Editar producto"
          onClick={() => onEdit(index)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Eliminar producto"
          onClick={() => {
            if (editingIndex === index) onCloseEditDialog();
            onDelete(index);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
