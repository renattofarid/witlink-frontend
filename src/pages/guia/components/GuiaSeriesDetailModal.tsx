import { GeneralModal } from "@/components/GeneralModal";
import { Badge } from "@/components/ui/badge";
import type { SerieFormValues } from "../lib/guia.schema";

interface GuiaSeriesDetailModalProps {
  open: boolean;
  onClose: () => void;
  series: SerieFormValues[];
  productoNombre?: string | null;
  necesitaSerie?: boolean | null;
  necesitaMac?: boolean | null;
  necesitaEmtaMac?: boolean | null;
  necesitaUa?: boolean | null;
}

export function GuiaSeriesDetailModal({
  open,
  onClose,
  series,
  productoNombre,
  necesitaSerie,
  necesitaMac,
  necesitaEmtaMac,
  necesitaUa,
}: GuiaSeriesDetailModalProps) {
  const showAll =
    necesitaSerie == null &&
    necesitaMac == null &&
    necesitaEmtaMac == null &&
    necesitaUa == null;

  const showSerie = showAll || !!necesitaSerie;
  const showMac = showAll || !!necesitaMac;
  const showEmtaMac = showAll || !!necesitaEmtaMac;
  const showUa = showAll || !!necesitaUa;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Detalle de series"
      subtitle={productoNombre ?? undefined}
      size="2xl"
    >
      {series.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No hay series registradas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                <th className="py-2 px-3 text-left font-medium w-8">#</th>
                {showSerie && <th className="py-2 px-3 text-left font-medium">Serie</th>}
                {showMac && <th className="py-2 px-3 text-left font-medium">MAC</th>}
                {showEmtaMac && <th className="py-2 px-3 text-left font-medium">EMTA MAC</th>}
                {showUa && <th className="py-2 px-3 text-left font-medium">UA</th>}
                <th className="py-2 px-3 text-left font-medium">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {series.map((s, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                  {showSerie && (
                    <td className="py-2 px-3 font-medium font-mono text-xs">
                      {s.serie || "—"}
                    </td>
                  )}
                  {showMac && (
                    <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                      {s.mac ? (
                        <Badge variant="outline" className="text-xs font-mono font-normal">
                          {s.mac}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                  {showEmtaMac && (
                    <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                      {s.emta_mac ? (
                        <Badge variant="outline" className="text-xs font-mono font-normal">
                          {s.emta_mac}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                  {showUa && (
                    <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                      {s.ua || "—"}
                    </td>
                  )}
                  <td className="py-2 px-3 text-xs text-muted-foreground max-w-48 truncate">
                    {s.observaciones || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GeneralModal>
  );
}
