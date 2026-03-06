import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface CuadrillaFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function CuadrillaFilters({
  search,
  onSearchChange,
}: CuadrillaFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar cuadrilla..."
      />
    </FilterWrapper>
  );
}
