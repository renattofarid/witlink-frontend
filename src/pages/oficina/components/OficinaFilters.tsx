import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface OficinaFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function OficinaFilters({
  search,
  onSearchChange,
}: OficinaFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar oficina..."
      />
    </FilterWrapper>
  );
}
