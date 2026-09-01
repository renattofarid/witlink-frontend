import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getAlmacenFilterOptions } from "@/pages/auth/lib/almacen-options";
import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelect } from "@/components/SearchableSelect";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GeneralSheet from "@/components/GeneralSheet";
import NoRegistradosBanner from "@/components/NoRegistradosBanner";
import ExportExcelButton from "@/components/ExportExcelButton";
import { X } from "lucide-react";
import { exportarInventarioSeriesExcel } from "../lib/inventario.actions";
import { downloadExcelFromBase64 } from "@/lib/exportExcel";

interface InventarioSeriesFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  /** Bulk-search terms with no matches under the applied filters. */
  noRegistrados?: string[];
  /** Total results under the current filter; the export button shows only when > 0. */
  totalResults?: number;
}

export default function InventarioSeriesFilters({
  params,
  setParams,
  noRegistrados = [],
  totalResults = 0,
}: InventarioSeriesFiltersProps) {
  const user = useAuthStore((s) => s.user);

  const { data: almacenesAll = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const almacenOptions = useMemo(
    () => getAlmacenFilterOptions(user, almacenesAll, "Todos"),
    [user, almacenesAll],
  );

  const productosSeleccionados = params.productos
    ? params.productos.split(",").filter(Boolean)
    : [];

  useEffect(() => {
    if (productosSeleccionados.length > 0 && bulkText === "") {
      setBulkText(productosSeleccionados.join(" "));
    }
  }, []);

  const set = (key: string, value: string) =>
    setParams((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value,
      page: "1",
    }));

  const parseBulkText = (text: string): string[] => {
    const raw = text
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    return Array.from(new Set(raw));
  };

  const parsedPreview = useMemo(() => parseBulkText(bulkText), [bulkText]);

  const handleConfirmBulk = () => {
    const parsed = parseBulkText(bulkText);
    setParams((prev) => ({
      ...prev,
      productos: parsed.join(","),
      producto: "",
      page: "1",
    }));
    setBulkOpen(false);
  };

  const handleClearBulk = () => {
    setParams((prev) => ({ ...prev, productos: "", page: "1" }));
    setBulkText("");
  };

  // The backend generates the Excel from the same filters as the table, so it
  // contains every match and not just the visible page.
  const handleExport = async () => {
    const res = await exportarInventarioSeriesExcel(params);
    downloadExcelFromBase64(res);
  };

  const activeExtraCount = [
    params.devuelto,
    params.cliente,
    params.externos,
    params.tecnicos,
  ].filter((v) => v && v !== "all").length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterWrapper activeExtraCount={activeExtraCount}>
        <SearchableSelect
          placeholder="Almacenes"
          options={almacenOptions}
          value={params.almacen_id || "all"}
          onChange={(v) =>
            setParams((prev) => ({
              ...prev,
              almacen_id: v === "all" ? "" : v,
              page: "1",
            }))
          }
        />
        <SearchInput
          value={params.serie ?? ""}
          onChange={(v) =>
            setParams((prev) => ({ ...prev, serie: v, page: "1" }))
          }
          placeholder="Filtrar por serie..."
        />
        <SearchInput
          value={params.producto ?? ""}
          onChange={(v) =>
            setParams((prev) => ({ ...prev, producto: v, page: "1" }))
          }
          placeholder="Buscar producto o SAP..."
        />
        <SearchableSelect
          placeholder="Filtrar Retirados"
          options={[
            { value: "all", label: "Todos" },
            { value: "true", label: "Retirados" },
            { value: "false", label: "No retirados" },
          ]}
          value={params.retirados || "all"}
          onChange={(v) => set("retirados", v)}
        />
        <SearchableSelect
          placeholder="Devueltos"
          options={[
            { value: "all", label: "Todos" },
            { value: "true", label: "Devueltos" },
            { value: "false", label: "No devueltos" },
          ]}
          value={params.devuelto || "all"}
          onChange={(v) => set("devuelto", v)}
        />
        <SearchableSelect
          placeholder="Cliente"
          options={[
            { value: "all", label: "Todos" },
            { value: "true", label: "Cliente" },
            { value: "false", label: "Sin cliente" },
          ]}
          value={params.cliente || "all"}
          onChange={(v) => set("cliente", v)}
        />
        <SearchableSelect
          placeholder="Externos"
          options={[
            { value: "all", label: "Todos" },
            { value: "true", label: "Externos" },
            { value: "false", label: "No externos" },
          ]}
          value={params.externos || "all"}
          onChange={(v) => set("externos", v)}
        />
        <SearchableSelect
          placeholder="Técnicos"
          options={[
            { value: "all", label: "Todos" },
            { value: "true", label: "Técnicos" },
            { value: "false", label: "No técnicos" },
          ]}
          value={params.tecnicos || "all"}
          onChange={(v) => set("tecnicos", v)}
        />
      </FilterWrapper>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
          {productosSeleccionados.length > 0
            ? `Buscar masivo (${productosSeleccionados.length})`
            : "Buscar masivo"}
        </Button>

        {productosSeleccionados.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearBulk}
            title="Limpiar búsqueda masiva"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <ExportExcelButton
          show={totalResults > 0}
          onExport={handleExport}
          label="Descargar base"
        />
      </div>

      <NoRegistradosBanner
        items={noRegistrados}
        descripcion="las series buscadas"
      />

      <GeneralSheet
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Búsqueda masiva de series"
        subtitle="Copia y pega las series. Se detectarán automáticamente."
        size="lg"
      >
        <div className="space-y-2">
          <Textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"9162N967G201858\nZTEYH8TRBV17067\n..."}
            rows={10}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {parsedPreview.length > 0
              ? `${parsedPreview.length} serie(s) detectada(s).`
              : "No se detectaron series aún."}
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
