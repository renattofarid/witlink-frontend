import { format } from "date-fns";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import DatePicker from "@/components/DatePicker";

interface GuiaFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function GuiaFilters({ params, setParams }: GuiaFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={params.search ?? ""}
        onChange={(v) =>
          setParams((prev) => ({ ...prev, search: v, page: "1" }))
        }
        placeholder="Buscar guía..."
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
    </FilterWrapper>
  );
}
