import { format } from "date-fns";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";

interface SalidaAntiguamientoFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function SalidaAntiguamientoFilters({
  params,
  setParams,
}: SalidaAntiguamientoFiltersProps) {
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
    </FilterWrapper>
  );
}
