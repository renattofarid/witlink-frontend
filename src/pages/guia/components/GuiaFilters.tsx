import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface GuiaFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function GuiaFilters({ search, onSearchChange }: GuiaFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar guia..."
      />
    </FilterWrapper>
  );
}
