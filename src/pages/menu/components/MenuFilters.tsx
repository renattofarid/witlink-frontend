import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface MenuFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function MenuFilters({
  search,
  onSearchChange,
}: MenuFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar menú..."
      />
    </FilterWrapper>
  );
}
