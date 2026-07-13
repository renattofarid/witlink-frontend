import { format } from "date-fns";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useTecnicoDesasignacionQuery } from "../lib/desasignacion.hook";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";

interface DesasignacionFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  tecnicoId: string;
  onTecnicoChange: (value: string) => void;
}

export default function DesasignacionFilters({
  params,
  setParams,
  tecnicoId,
  onTecnicoChange,
}: DesasignacionFiltersProps) {
  const dateFrom = params.fecha_inicio
    ? new Date(params.fecha_inicio + "T00:00:00")
    : undefined;
  const dateTo = params.fecha_fin
    ? new Date(params.fecha_fin + "T00:00:00")
    : undefined;

  return (
    <FilterWrapper>
      <SearchInput
        value={params.numero ?? ""}
        onChange={(v) =>
          setParams((prev) => ({ ...prev, numero: v, page: "1" }))
        }
        placeholder="Buscar por número..."
      />
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={(from, to) =>
          setParams((prev) => ({
            ...prev,
            fecha_inicio: from ? format(from, "yyyy-MM-dd") : "",
            fecha_fin: to ? format(to, "yyyy-MM-dd") : "",
            page: "1",
          }))
        }
        className="w-fit"
      />
      <SearchableSelectAsync
        value={tecnicoId}
        onChange={onTecnicoChange}
        placeholder="Seleccionar técnico..."
        useQueryHook={useTecnicoDesasignacionQuery}
        mapOptionFn={(item: PersonaResource) => ({
          value: String(item.id),
          label: `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`,
          description: item.dni,
        })}
        perPage={20}
      />
    </FilterWrapper>
  );
}
