import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { ESTADO_OPERATIVO_OPTIONS } from "../lib/liquidaciones.constants";

interface LiquidacionFiltersProps {
  search: string;
  estado: string;
  onSearchChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
}

export default function LiquidacionFilters({
  search,
  estado,
  onSearchChange,
  onEstadoChange,
}: LiquidacionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar SOT, cliente..."
      />
      <SearchableSelect
        options={ESTADO_OPERATIVO_OPTIONS}
        value={estado}
        onChange={onEstadoChange}
        placeholder="Estado"
        withValue={false}
      />
    </div>
  );
}
