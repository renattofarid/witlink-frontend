import { useState } from "react";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, X } from "lucide-react";
import type { SerieFormValues } from "../lib/guia.schema";

function buildSeries(cantidad: number, numeroInicial: string): SerieFormValues[] {
  const match = numeroInicial.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const startStr = match[2];
    const start = parseInt(startStr, 10);
    const padLen = startStr.length;
    return Array.from({ length: cantidad }, (_, i) => ({
      serie_id: null,
      serie: `${prefix}${String(start + i).padStart(padLen, "0")}`,
      mac: null,
      emta_mac: null,
      ua: null,
      observaciones: null,
    }));
  }
  return Array.from({ length: cantidad }, (_, i) => ({
    serie_id: null,
    serie: `${numeroInicial}${i + 1}`,
    mac: null,
    emta_mac: null,
    ua: null,
    observaciones: null,
  }));
}

interface GuiaGenerarSeriesModalProps {
  open: boolean;
  onClose: () => void;
  onGenerar: (series: SerieFormValues[]) => void;
}

export function GuiaGenerarSeriesModal({ open, onClose, onGenerar }: GuiaGenerarSeriesModalProps) {
  const [cantidad, setCantidad] = useState("");
  const [numeroInicial, setNumeroInicial] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const cantidadNum = parseInt(cantidad, 10);
    if (!cantidadNum || cantidadNum < 1) {
      setError("Ingrese una cantidad válida mayor a 0");
      return;
    }
    if (!numeroInicial.trim()) {
      setError("Ingrese el número inicial");
      return;
    }
    setError(null);
    onGenerar(buildSeries(cantidadNum, numeroInicial.trim().toUpperCase()));
    setCantidad("");
    setNumeroInicial("");
    onClose();
  };

  const handleClose = () => {
    setCantidad("");
    setNumeroInicial("");
    setError(null);
    onClose();
  };

  return (
    <GeneralModal open={open} onClose={handleClose} title="Generar Series" size="sm">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Número inicial</Label>
          <Input
            value={numeroInicial}
            onChange={(e) => setNumeroInicial(e.target.value.toUpperCase())}
            placeholder="Ej. SN001 o 1001"
            className="h-8 text-sm"
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Cantidad de series</Label>
          <Input
            type="number"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="Ej. 10"
            className="h-8 text-sm"
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            <X className="size-3 mr-1" />
            Cancelar
          </Button>
          <Button type="button" size="sm" onClick={handleSubmit}>
            <Wand2 className="size-3 mr-1" />
            Generar
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
