import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";

interface EquipoRetiradoFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function EquipoRetiradoFilters({
  search,
  onSearchChange,
}: EquipoRetiradoFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar equipo retirado..."
      />
    </FilterWrapper>
  );
}
