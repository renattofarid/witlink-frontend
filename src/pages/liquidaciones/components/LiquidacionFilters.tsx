import { useEffect, useMemo, useState } from "react";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GeneralSheet from "@/components/GeneralSheet";
import NoRegistradosBanner from "@/components/NoRegistradosBanner";
import ExportExcelButton from "@/components/ExportExcelButton";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getAlmacenFilterOptions } from "@/pages/auth/lib/almacen-options";
import {
  ESTADO_OPERATIVO_OPTIONS,
  ESTADO_LIQUIDACION_OPTIONS,
} from "../lib/liquidaciones.constants";
import { exportarBusquedaLiquidacionesExcel } from "../lib/liquidaciones.actions";
import { downloadExcelFromBase64 } from "@/lib/exportExcel";

interface LiquidacionFiltersProps {
  search: string;
  estado: string;
  estadoLiquidacion: string;
  sots: string;
  almacenId?: string;
  onSearchChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
  onEstadoLiquidacionChange: (v: string) => void;
  onSotsChange: (v: string) => void;
  onAlmacenChange?: (v: string) => void;
  /** Bulk-search SOTs with no matches under the applied filters. */
  noRegistrados?: string[];
  /** Filters currently applied to the list, used to export the filtered set. */
  exportParams?: Record<string, string>;
  /** Total results under the current filter; the export button shows only when > 0. */
  totalResults?: number;
}

export default function LiquidacionFilters({
  search,
  estado,
  estadoLiquidacion,
  sots,
  almacenId,
  onSearchChange,
  onEstadoChange,
  onEstadoLiquidacionChange,
  onSotsChange,
  onAlmacenChange,
  noRegistrados = [],
  exportParams = {},
  totalResults = 0,
}: LiquidacionFiltersProps) {
  const user = useAuthStore((s) => s.user);

  const { data: almacenes = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const almacenOptions = useMemo(() => {
    return getAlmacenFilterOptions(user, almacenes);
  }, [almacenes, user]);

  const activeAlmacenVal = !almacenId ? "all" : almacenId;
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

  // The backend generates the Excel from the same filters as the table (bulk
  // SOTs included) with no date range required, so it exports exactly the
  // filtered set and not just the visible page.
  const handleExport = async () => {
    const res = await exportarBusquedaLiquidacionesExcel(exportParams);
    downloadExcelFromBase64(res);
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
      <SearchableSelect
        placeholder="Almacén"
        options={almacenOptions}
        value={activeAlmacenVal}
        onChange={(v) => onAlmacenChange?.(v === "all" ? "" : v)}
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

      <ExportExcelButton
        show={totalResults > 0}
        onExport={handleExport}
        label="Exportar filtrado"
      />

      <NoRegistradosBanner
        items={noRegistrados}
        descripcion="los SOTs buscados"
      />

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
