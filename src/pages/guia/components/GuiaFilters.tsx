import { format } from "date-fns";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import DatePicker from "@/components/DatePicker";
import { SearchableSelect } from "@/components/SearchableSelect";

interface GuiaFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const ALMACEN_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "retirados", label: "Retirados" },
];

const TIPOS_OPTIONS = [
  { value: "todos", label: "TODOS" },
  { value: "POST VENTA", label: "POST VENTA" },
  { value: "CAMBIO POR INCIDENCIA", label: "CAMBIO POR INCIDENCIA" },
  { value: "OTRO", label: "OTRO" },
];

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
      <SearchableSelect
        placeholder="Almacén"
        options={ALMACEN_OPTIONS}
        value={params.almacen ?? "todos"}
        onChange={(v) =>
          setParams((prev) => {
            const next: Record<string, string> = { ...prev, page: "1" };
            if (v === "todos") {
              delete next.almacen;
              delete next.tipo;
            } else next.almacen = v;
            return next;
          })
        }
      />
      {params.almacen === "retirados" ? (
        <>
          <SearchableSelect
            placeholder="Tipo"
            options={TIPOS_OPTIONS}
            value={params.tipo ?? "todos"}
            onChange={(v) =>
              setParams((prev) => {
                const next: Record<string, string> = { ...prev, page: "1" };
                if (v === "todos") delete next.tipo;
                else next.tipo = v;
                return next;
              })
            }
          />
        </>
      ) : null}

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
