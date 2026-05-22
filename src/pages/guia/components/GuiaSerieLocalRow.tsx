import { AlertCircle, CheckCircle2, Loader2, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SerieLocal } from "../lib/guia.interface";

interface GuiaSerieLocalRowProps {
  serie: SerieLocal;
  index: number;
  necesitaSerie: boolean;
  necesitaMac: boolean;
  necesitaEmtaMac: boolean;
  necesitaUa: boolean;
  onEliminar: (productoGuiaId: number, serieId: number, localId: string) => void;
  onRetry: (localId: string) => void;
  isDeleting: boolean;
}

export function GuiaSerieLocalRow({
  serie,
  index,
  necesitaSerie,
  necesitaMac,
  necesitaEmtaMac,
  necesitaUa,
  onEliminar,
  onRetry,
  isDeleting,
}: GuiaSerieLocalRowProps) {
  const containerClass = cn(
    "flex items-start gap-2 rounded px-2 py-1.5 border text-xs font-mono",
    serie.status === "pending" &&
      "border-dashed border-amber-400/70 bg-amber-50/40 dark:bg-amber-950/20",
    serie.status === "confirmed" &&
      "border-solid border-green-400/60 bg-green-50/30 dark:bg-green-950/20",
    serie.status === "error" &&
      "border-solid border-destructive/60 bg-destructive/5",
  );

  return (
    <div className={containerClass}>
      {/* Status icon */}
      <div className="mt-0.5 shrink-0">
        {serie.status === "pending" && (
          <Loader2 className="size-3 text-amber-500 animate-spin" />
        )}
        {serie.status === "confirmed" && (
          <CheckCircle2 className="size-3 text-green-500" />
        )}
        {serie.status === "error" && (
          <AlertCircle className="size-3 text-destructive" />
        )}
      </div>

      {/* Index */}
      <span className="shrink-0 text-muted-foreground w-4 text-right mt-0.5">
        {index + 1}.
      </span>

      {/* Fields */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 flex-1 min-w-0">
        {necesitaSerie && serie.serie && (
          <span>
            <span className="text-muted-foreground">S/N:</span>{" "}
            <span>{serie.serie}</span>
          </span>
        )}
        {necesitaMac && serie.mac && (
          <span>
            <span className="text-muted-foreground">MAC:</span>{" "}
            <span>{serie.mac}</span>
          </span>
        )}
        {necesitaEmtaMac && serie.emtaMac && (
          <span>
            <span className="text-muted-foreground">EMTA:</span>{" "}
            <span>{serie.emtaMac}</span>
          </span>
        )}
        {necesitaUa && serie.ua && (
          <span>
            <span className="text-muted-foreground">UA:</span>{" "}
            <span>{serie.ua}</span>
          </span>
        )}
        {serie.status === "error" && serie.errorMessage && (
          <span className="text-destructive w-full">{serie.errorMessage}</span>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex gap-1">
        {serie.status === "error" && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-5 text-destructive hover:text-destructive"
            title="Reintentar"
            onClick={() => onRetry(serie.localId)}
          >
            <RotateCcw className="size-3" />
          </Button>
        )}
        {serie.status === "confirmed" && serie.servidorId && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-5 text-muted-foreground hover:text-destructive"
            title="Eliminar serie"
            disabled={isDeleting}
            onClick={() =>
              onEliminar(serie.productoGuiaId, serie.servidorId!, serie.localId)
            }
          >
            {isDeleting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
