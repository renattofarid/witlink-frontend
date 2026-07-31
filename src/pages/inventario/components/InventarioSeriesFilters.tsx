import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import FilterWrapper from "@/components/FilterWrapper";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import { SearchableSelect } from "@/components/SearchableSelect";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GeneralSheet from "@/components/GeneralSheet";
import NoRegistradosBanner from "@/components/NoRegistradosBanner";
import { X } from "lucide-react";

interface InventarioSeriesFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  /** Bulk-search terms with no matches under the applied filters. */
  noRegistrados?: string[];
}

export default function InventarioSeriesFilters({
  params,
  setParams,
  noRegistrados = [],
}: InventarioSeriesFiltersProps) {
  const { data: almacenes = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const almacenOptions = useMemo(
    () => almacenes.map((a) => ({ value: String(a.id), label: a.nombre })),
    [almacenes],
  );

  const selectedAlmacenes = params.almacen_id
    ? params.almacen_id.split(",").filter(Boolean)
    : [];

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterWrapper>
        <MultiSelectFilter
          placeholder="Almacenes"
          options={almacenOptions}
          values={selectedAlmacenes}
          onChange={(ids) =>
            setParams((prev) => ({
              ...prev,
              almacen_id: ids.join(","),
              page: "1",
            }))
          }
        />
        <SearchInput
          value={params.producto ?? ""}
          onChange={(v) =>
            setParams((prev) => ({ ...prev, producto: v, page: "1" }))
          }
          placeholder="Buscar producto o SAP..."
        />
        <SearchableSelect
          placeholder="Retirados"
          options={[
            { value: "all", label: "Todos" },
            { value: "true", label: "Retirados" },
            { value: "false", label: "No retirados" },
          ]}
          value={params.retirados || "all"}
          onChange={(v) => set("retirados", v)}
        />
        <div>
          <Button color={"muted"} onClick={() => setBulkOpen(true)}>
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
        </div>
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
