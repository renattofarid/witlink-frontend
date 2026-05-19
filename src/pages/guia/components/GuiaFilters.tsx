import { format } from "date-fns";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import DatePicker from "@/components/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GuiaFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function GuiaFilters({ params, setParams }: GuiaFiltersProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={params.search ?? ""}
        onChange={(v) => setParams((prev) => ({ ...prev, search: v, page: "1" }))}
        placeholder="Buscar guía..."
      />
      <Select
        value={params.almacen ?? "todos"}
        onValueChange={(v) =>
          setParams((prev) => {
            const next = { ...prev, page: "1" };
            if (v === "todos") delete next.almacen;
            else next.almacen = v;
            return next;
          })
        }
      >
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue placeholder="Almacén" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos" className="text-xs">Todos</SelectItem>
          <SelectItem value="retirados" className="text-xs">Retirados</SelectItem>
        </SelectContent>
      </Select>
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
