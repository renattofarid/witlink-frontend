import { format } from "date-fns";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import DatePicker from "@/components/DatePicker";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useTecnicoDespachoQuery } from "../lib/despacho.hook";
import type { TecnicoResource } from "@/pages/tecnico/lib/tecnico.interface";

interface DespachoFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  tecnicoId: string;
  onTecnicoChange: (value: string) => void;
}

export default function DespachoFilters({
  params,
  setParams,
  tecnicoId,
  onTecnicoChange,
}: DespachoFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={params.numero ?? ""}
        onChange={(v) =>
          setParams((prev) => ({ ...prev, numero: v, page: "1" }))
        }
        placeholder="Buscar por número..."
      />
      <DatePicker
        value={params.fecha_inicio ?? ""}
        onChange={(date) =>
          setParams((prev) => ({
            ...prev,
            fecha_inicio: date ? format(date, "yyyy-MM-dd") : "",
            page: "1",
          }))
        }
        placeholder="Desde"
      />
      <DatePicker
        value={params.fecha_fin ?? ""}
        onChange={(date) =>
          setParams((prev) => ({
            ...prev,
            fecha_fin: date ? format(date, "yyyy-MM-dd") : "",
            page: "1",
          }))
        }
        placeholder="Hasta"
      />
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
    </FilterWrapper>
  );
}
