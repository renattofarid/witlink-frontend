import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface ProductoFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function ProductoFilters({
  search,
  onSearchChange,
}: ProductoFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar producto..."
      />
    </FilterWrapper>
  );
}
