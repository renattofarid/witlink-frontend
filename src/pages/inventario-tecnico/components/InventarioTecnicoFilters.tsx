import { format } from "date-fns";
import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import DatePicker from "@/components/DatePicker";
import { useTecnicoInventarioQuery } from "../lib/inventario-tecnico.hook";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";

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
      <div className="flex items-center gap-2">
        <SearchableSelectAsync
          value={tecnicoId}
          onChange={onTecnicoChange}
          placeholder="Seleccionar técnico..."
          useQueryHook={useTecnicoInventarioQuery}
          mapOptionFn={(item: PersonaResource) => ({
            value: String(item.id),
            label: `${item.nombre} ${item.apellido_paterno}`,
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
      />
    </FilterWrapper>
  );
}
