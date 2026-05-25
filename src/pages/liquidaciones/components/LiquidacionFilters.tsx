import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  ESTADO_OPERATIVO_OPTIONS,
  ESTADO_LIQUIDACION_OPTIONS,
} from "../lib/liquidaciones.constants";

interface LiquidacionFiltersProps {
  search: string;
  estado: string;
  estadoLiquidacion: string;
  onSearchChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
  onEstadoLiquidacionChange: (v: string) => void;
}

export default function LiquidacionFilters({
  search,
  estado,
  estadoLiquidacion,
  onSearchChange,
  onEstadoChange,
  onEstadoLiquidacionChange,
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
        placeholder="Estado operativo"
        withValue={false}
      />
      <SearchableSelect
        options={ESTADO_LIQUIDACION_OPTIONS}
        value={estadoLiquidacion}
        onChange={onEstadoLiquidacionChange}
        placeholder="Estado liquidación"
        withValue={false}
      />
    </div>
  );
}
