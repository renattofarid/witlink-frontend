import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useTecnicoDespachoQuery } from "../lib/despacho.hook";
import type { TecnicoResource } from "@/pages/tecnico/lib/tecnico.interface";

interface DespachoFiltersProps {
  tecnicoId: string;
  onTecnicoChange: (value: string) => void;
}

export default function DespachoFilters({
  tecnicoId,
  onTecnicoChange,
}: DespachoFiltersProps) {
  return (
    <FilterWrapper>
      <div className="flex items-center gap-2 min-w-60">
        <SearchableSelectAsync
          value={tecnicoId}
          onChange={onTecnicoChange}
          placeholder="Seleccionar técnico..."
          useQueryHook={useTecnicoDespachoQuery}
          mapOptionFn={(item: TecnicoResource) => ({
            value: String(item.id),
            label: item.persona
              ? `${item.persona.nombre} ${item.persona.apellido_paterno}`
              : `Técnico #${item.id}`,
          })}
          perPage={20}
        />
      </div>
    </FilterWrapper>
  );
}
