import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface TecnicoFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function TecnicoFilters({
  search,
  onSearchChange,
}: TecnicoFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar técnico..."
      />
    </FilterWrapper>
  );
}
