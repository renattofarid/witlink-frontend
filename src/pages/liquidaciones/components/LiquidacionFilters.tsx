import { useEffect, useMemo, useState } from "react";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GeneralSheet from "@/components/GeneralSheet";
import NoRegistradosBanner from "@/components/NoRegistradosBanner";
import ExportExcelButton from "@/components/ExportExcelButton";
import { X } from "lucide-react";
import {
  ESTADO_OPERATIVO_OPTIONS,
  ESTADO_LIQUIDACION_OPTIONS,
} from "../lib/liquidaciones.constants";
import { getLiquidaciones } from "../lib/liquidaciones.actions";
import { excelFileName } from "@/lib/exportExcel";
import type { LiquidacionResource } from "../lib/liquidaciones.interface";

interface LiquidacionFiltersProps {
  search: string;
  estado: string;
  estadoLiquidacion: string;
  sots: string;
  onSearchChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
  onEstadoLiquidacionChange: (v: string) => void;
  onSotsChange: (v: string) => void;
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
  onSearchChange,
  onEstadoChange,
  onEstadoLiquidacionChange,
  onSotsChange,
  noRegistrados = [],
  exportParams = {},
  totalResults = 0,
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

  const formatFecha = (fecha: string) => {
    if (!fecha) return "";
    const raw = fecha.includes("T") ? fecha : `${fecha}T12:00:00`;
    return new Date(raw).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Fetches every row under the current filter (a single page of `totalResults`)
  // and flattens it to the columns shown on screen for the Excel export.
  const getExportRows = async () => {
    const res = await getLiquidaciones({
      ...exportParams,
      page: "1",
      per_page: String(totalResults),
    });
    return res.data.map((r: LiquidacionResource) => ({
      SOT: r.sot,
      Cliente: r.nombre || "",
      Código: r.codigo || "",
      Fecha: formatFecha(r.fecha),
      "Tipo trabajo": r.tipo_trabajo || "",
      Estado: r.estado || "",
      "Liq. estado": r.estado_liquidacion || "",
      Distrito: r.distrito || "",
      Dirección: r.direccion || "",
      Paquete: r.paquete || "",
      Contacto: r.contacto || "",
    }));
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

      <ExportExcelButton
        show={totalResults > 0}
        getRows={getExportRows}
        fileName={excelFileName("liquidaciones")}
        sheetName="Liquidaciones"
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
