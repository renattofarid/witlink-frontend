import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface CategoriaFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function CategoriaFilters({
  search,
  onSearchChange,
}: CategoriaFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar categoría..."
      />
    </FilterWrapper>
  );
}
