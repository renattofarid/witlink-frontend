import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface UsuariosFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function UsuariosFilters({
  search,
  onSearchChange,
}: UsuariosFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar usuario..."
      />
    </FilterWrapper>
  );
}
