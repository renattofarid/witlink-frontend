import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface SerieFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function SerieFilters({
  search,
  onSearchChange,
}: SerieFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar serie..."
      />
    </FilterWrapper>
  );
}
