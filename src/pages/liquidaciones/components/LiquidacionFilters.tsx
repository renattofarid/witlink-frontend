import { useEffect, useMemo, useState } from "react";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GeneralSheet from "@/components/GeneralSheet";
import { X } from "lucide-react";
import {
  ESTADO_OPERATIVO_OPTIONS,
  ESTADO_LIQUIDACION_OPTIONS,
} from "../lib/liquidaciones.constants";

interface LiquidacionFiltersProps {
  search: string;
  estado: string;
  estadoLiquidacion: string;
  sots: string;
  onSearchChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
  onEstadoLiquidacionChange: (v: string) => void;
  onSotsChange: (v: string) => void;
}

export default function LiquidacionFilters({
  search,
  estado,
  estadoLiquidacion,
  sots,
  onSearchChange,
  onEstadoChange,
  onEstadoLiquidacionChange,
  onSotsChange,
}: LiquidacionFiltersProps) {
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const sotsSeleccionados = sots ? sots.split(",").filter(Boolean) : [];

  // Solo inicializa el textarea la PRIMERA vez que hay SOTs aplicados
  // (por ejemplo al cargar la página con el filtro ya en la URL).
  useEffect(() => {
    if (sotsSeleccionados.length > 0 && bulkText === "") {
      setBulkText(sotsSeleccionados.join(" "));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseBulkText = (text: string): string[] => {
    const raw = text
      .split(/[\s,;]+/) // espacio, tab, salto de línea, coma o punto y coma
      .map((s) => s.trim())
      .filter(Boolean);

    return Array.from(new Set(raw));
  };

  const parsedPreview = useMemo(() => parseBulkText(bulkText), [bulkText]);

  const handleConfirmBulk = () => {
    const parsed = parseBulkText(bulkText);
    onSotsChange(parsed.join(","));
    setBulkOpen(false);
  };

  const handleClearBulk = () => {
    onSotsChange("");
    setBulkText("");
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar SOT, cliente..."
      />
      <SearchableSelect
        options={ESTADO_OPERATIVO_OPTIONS}
        value={estado}
        onChange={onEstadoChange}
        placeholder="Estado operativo"
        withValue={false}
      />
      <SearchableSelect
        options={ESTADO_LIQUIDACION_OPTIONS}
        value={estadoLiquidacion}
        onChange={onEstadoLiquidacionChange}
        placeholder="Estado liquidación"
        withValue={false}
      />

      <div className="flex items-center">
        {/* Solo abre el modal, no pisa el bulkText */}
        <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
          {sotsSeleccionados.length > 0
            ? `Buscar SOTs (${sotsSeleccionados.length})`
            : "Buscar SOTs masivo"}
        </Button>

        {sotsSeleccionados.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearBulk}
            title="Limpiar búsqueda masiva"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Sheet de búsqueda masiva de SOTs */}
      <GeneralSheet
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Búsqueda masiva de SOTs"
        subtitle="Copia y pega los SOTs. Se detectarán automáticamente."
        size="lg"
      >
        <div className="space-y-2">
          <Textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"SOT0001\nSOT0002\n..."}
            rows={10}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {parsedPreview.length > 0
              ? `${parsedPreview.length} SOT(s) detectado(s).`
              : "No se detectaron SOTs aún."}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setBulkOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmBulk}
            disabled={parsedPreview.length === 0}
          >
            Buscar
          </Button>
        </div>
      </GeneralSheet>
    </div>
  );
}
