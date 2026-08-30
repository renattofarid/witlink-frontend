import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GeneralSheet from "@/components/GeneralSheet";
import { X } from "lucide-react";
import { getProductosAll } from "@/pages/producto/lib/producto.actions";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getAlmacenFilterOptions } from "@/pages/auth/lib/almacen-options";

interface SerieFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const SITUACION_OPTIONS = [
  { value: "all", label: "Todas las situaciones" },
  { value: "PE", label: "Pendiente" },
  { value: "DI", label: "Disponible" },
  { value: "DE", label: "Despachado" },
  { value: "LI", label: "Liquidado" },
  { value: "RE", label: "Retirado" },
];

const SORT_OPTIONS = [
  { value: "id", label: "ID" },
  { value: "serie", label: "Serie" },
  { value: "situacion", label: "Situación" },
  { value: "mac", label: "MAC" },
  { value: "emta_mac", label: "EMTA MAC" },
  { value: "ua", label: "UA" },
  { value: "productos.nombre", label: "Producto" },
];

const DIRECTION_OPTIONS = [
  { value: "desc", label: "Descendente" },
  { value: "asc", label: "Ascendente" },
];

export default function SerieFilters({ params, setParams }: SerieFiltersProps) {
  const { data: productos = [] } = useQuery({
    queryKey: ["productos-all"],
    queryFn: () => getProductosAll(),
    refetchOnWindowFocus: false,
  });

  const user = useAuthStore((s) => s.user);

  // Solo se consulta/muestra el filtro de almacén cuando aplica: para
  // usuarios no corporativos, el backend ya filtra por el almacén de la
  // sesión activa.

  const { data: almacenesAll = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const almacenOptions = getAlmacenFilterOptions(user, almacenesAll);

  const productoOptions = [
    { value: "all", label: "Todos los productos" },
    ...productos.map((p) => ({ value: String(p.id), label: `${p.nombre} (${p.sap})` })),
  ];

  const set = (key: string, value: string) =>
    setParams((prev) => ({ ...prev, [key]: value === "all" ? "" : value, page: "1" }));

  const setText = (key: string, value: string) =>
    setParams((prev) => ({ ...prev, [key]: value, page: "1" }));

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const seriesSeleccionadas = params.series
    ? params.series.split(",").filter(Boolean)
    : [];

  const parseBulkText = (text: string): string[] =>
    Array.from(
      new Set(
        text
          .split(/[\s,;]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    );

  const parsedPreview = useMemo(() => parseBulkText(bulkText), [bulkText]);

  const handleOpenBulk = () => {
    setBulkText(seriesSeleccionadas.join("\n"));
    setBulkOpen(true);
  };

  const handleConfirmBulk = () => {
    const parsed = parseBulkText(bulkText);
    setParams((prev) => ({
      ...prev,
      series: parsed.join(","),
      serie: "",
      page: "1",
    }));
    setBulkOpen(false);
  };

  const handleClearBulk = () => {
    setParams((prev) => ({ ...prev, series: "", page: "1" }));
    setBulkText("");
  };

  return (
    <>
    <FilterWrapper >
      <SearchInput
        value={params.search ?? ""}
        onChange={(v) => setText("search", v)}
        placeholder="Buscar serie, MAC, UA, producto..."
      />

      <div className="flex items-center gap-1">
        <Button color="muted" onClick={handleOpenBulk}>
          {seriesSeleccionadas.length > 0
            ? `Varias series (${seriesSeleccionadas.length})`
            : "Filtrar por varias series"}
        </Button>
        {seriesSeleccionadas.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearBulk}
            title="Limpiar filtro de varias series"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

        <SearchableSelect
          placeholder="Almacén"
          options={almacenOptions}
          value={params.almacen_id || "all"}
          onChange={(v) => set("almacen_id", v)}
        />
      
      <SearchableSelect
        placeholder="Situación"
        options={SITUACION_OPTIONS}
        value={params.situacion || "all"}
        onChange={(v) => set("situacion", v)}
      />
      <SearchInput
        value={params.serie ?? ""}
        onChange={(v) => setText("serie", v)}
        placeholder="Filtrar por serie..."
      />
      <SearchInput
        value={params.mac ?? ""}
        onChange={(v) => setText("mac", v)}
        placeholder="Filtrar por MAC..."
      />
      <SearchInput
        value={params.emta_mac ?? ""}
        onChange={(v) => setText("emta_mac", v)}
        placeholder="Filtrar por EMTA MAC..."
      />
      <SearchInput
        value={params.ua ?? ""}
        onChange={(v) => setText("ua", v)}
        placeholder="Filtrar por UA..."
      />
      <SearchInput
        value={params["producto$nombre"] ?? ""}
        onChange={(v) => setText("producto$nombre", v)}
        placeholder="Filtrar por nombre del producto..."
      />
      <SearchInput
        value={params["producto$sap"] ?? ""}
        onChange={(v) => setText("producto$sap", v)}
        placeholder="Filtrar por SAP del producto..."
      />
      <SearchableSelect
        placeholder="Producto"
        options={productoOptions}
        value={params.producto_id || "all"}
        onChange={(v) => set("producto_id", v)}
      />
      <SearchableSelect
        placeholder="Ordenar por"
        options={SORT_OPTIONS}
        value={params.sort || "id"}
        onChange={(v) => setParams((prev) => ({ ...prev, sort: v, page: "1" }))}
      />
      <SearchableSelect
        placeholder="Dirección"
        options={DIRECTION_OPTIONS}
        value={params.direction || "desc"}
        onChange={(v) => setParams((prev) => ({ ...prev, direction: v, page: "1" }))}
      />
    </FilterWrapper>

    <GeneralSheet
      open={bulkOpen}
      onClose={() => setBulkOpen(false)}
      title="Filtrar por varias series"
      subtitle="Copia y pega las series. Se detectan por espacios, comas o saltos de línea."
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
        <Button onClick={handleConfirmBulk}>
          {parsedPreview.length > 0 ? `Filtrar (${parsedPreview.length})` : "Limpiar filtro"}
        </Button>
      </div>
    </GeneralSheet>
    </>
  );
}
