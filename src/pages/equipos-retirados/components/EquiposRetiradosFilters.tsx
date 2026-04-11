import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface EquiposRetiradosFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function EquiposRetiradosFilters({
  search,
  onSearchChange,
}: EquiposRetiradosFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar por SOT..."
      />
    </FilterWrapper>
  );
}
