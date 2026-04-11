import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelect } from "@/components/SearchableSelect";
import SearchInput from "@/components/SearchInput";

interface InventarioMaterialesFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const BOOL_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

export default function InventarioMaterialesFilters({
  params,
  setParams,
}: InventarioMaterialesFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={params.sot ?? ""}
        onChange={(v) => setParams((prev) => ({ ...prev, sot: v, page: "1" }))}
        placeholder="Buscar por SOT..."
      />
      <SearchableSelect
        placeholder="Retirados"
        options={BOOL_OPTIONS}
        value={params.retirados || "all"}
        onChange={(v) =>
          setParams((prev) => ({ ...prev, retirados: v, page: "1" }))
        }
      />
    </FilterWrapper>
  );
}
