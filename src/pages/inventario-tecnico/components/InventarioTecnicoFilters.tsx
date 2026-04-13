import { format } from "date-fns";
import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import DatePicker from "@/components/DatePicker";
import { useTecnicoInventarioQuery } from "../lib/inventario-tecnico.hook";
import type { TecnicoResource } from "@/pages/tecnico/lib/tecnico.interface";

interface InventarioTecnicoFiltersProps {
  tecnicoId: string;
  onTecnicoChange: (value: string) => void;
  fecha: string;
  onFechaChange: (value: string) => void;
}

export default function InventarioTecnicoFilters({
  tecnicoId,
  onTecnicoChange,
  fecha,
  onFechaChange,
}: InventarioTecnicoFiltersProps) {
  return (
    <FilterWrapper>
      <div className="flex items-center gap-2 min-w-60">
        <SearchableSelectAsync
          value={tecnicoId}
          onChange={onTecnicoChange}
          placeholder="Seleccionar técnico..."
          useQueryHook={useTecnicoInventarioQuery}
          mapOptionFn={(item: TecnicoResource) => ({
            value: String(item.id),
            label: item.persona
              ? `${item.persona.nombre} ${item.persona.apellido_paterno}`
              : `Técnico #${item.id}`,
          })}
          perPage={20}
        />
      </div>
      <DatePicker
        value={fecha}
        onChange={(date) =>
          onFechaChange(date ? format(date, "yyyy-MM-dd") : "")
        }
        placeholder="Filtrar por fecha"
        showClearButton
      />
    </FilterWrapper>
  );
}
