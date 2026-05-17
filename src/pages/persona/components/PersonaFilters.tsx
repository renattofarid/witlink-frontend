import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";

interface PersonaFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  tipoEmpleado: string;
  onTipoEmpleadoChange: (value: string) => void;
}

const TIPO_EMPLEADO_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "Técnico", label: "Técnico" },
  { value: "Administrativo", label: "Administrativo" },
  { value: "Supervisor de campo", label: "Supervisor de campo" },
  { value: "Corporativo", label: "Corporativo" },
];

export default function PersonaFilters({
  search,
  onSearchChange,
  tipoEmpleado,
  onTipoEmpleadoChange,
}: PersonaFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar persona..."
      />
      <SearchableSelect
        placeholder="Tipo empleado"
        options={TIPO_EMPLEADO_OPTIONS}
        value={tipoEmpleado}
        onChange={onTipoEmpleadoChange}
      />
    </FilterWrapper>
  );
}
