import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface MaterialesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function MaterialesFilters({
  search,
  onSearchChange,
}: MaterialesFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar material..."
      />
    </FilterWrapper>
  );
}
