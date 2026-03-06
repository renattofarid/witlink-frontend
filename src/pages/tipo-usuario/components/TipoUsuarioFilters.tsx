import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface TipoUsuarioFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function TipoUsuarioFilters({
  search,
  onSearchChange,
}: TipoUsuarioFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar tipo de usuario..."
      />
    </FilterWrapper>
  );
}
