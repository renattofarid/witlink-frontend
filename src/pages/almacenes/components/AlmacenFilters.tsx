import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface AlmacenFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function AlmacenFilters({
  search,
  onSearchChange,
}: AlmacenFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar Almacén..."
      />
    </FilterWrapper>
  );
}
