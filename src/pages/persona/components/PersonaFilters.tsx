import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface PersonaFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function PersonaFilters({ search, onSearchChange }: PersonaFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar persona..."
      />
    </FilterWrapper>
  );
}
