import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelect } from "@/components/SearchableSelect";
import SearchInput from "@/components/SearchInput";
interface InventarioSeriesFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function InventarioSeriesFilters({
  params,
  setParams,
}: InventarioSeriesFiltersProps) {
  const set = (key: string, value: string) =>
    setParams((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value,
      page: "1",
    }));

  return (
    <FilterWrapper>
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
  );
}
