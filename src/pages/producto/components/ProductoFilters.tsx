import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelect } from "@/components/SearchableSelect";
import SearchInput from "@/components/SearchInput";

interface ProductoFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
}

export default function ProductoFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
}: ProductoFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar producto..."
      />
      <SearchableSelect
        placeholder="Filtrar por tipo"
        value={type}
        onChange={onTypeChange}
        options={[
          { label: "Todos", value: "" },
          { label: "Material", value: "MATERIAL" },
          { label: "Equipo", value: "EQUIPO" },
        ]}
      />
    </FilterWrapper>
  );
}
