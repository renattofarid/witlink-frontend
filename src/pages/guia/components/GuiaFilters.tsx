import { useMemo } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import DatePicker from "@/components/DatePicker";
import { SearchableSelect } from "@/components/SearchableSelect";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getAlmacenFilterOptions } from "@/pages/auth/lib/almacen-options";

interface GuiaFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const TIPOS_OPTIONS = [
  { value: "todos", label: "TODOS" },
  { value: "P", label: "P" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "O", label: "O" },
  { value: "POST VENTA", label: "POST VENTA" },
  { value: "CAMBIO POR INCIDENCIA", label: "CAMBIO POR INCIDENCIA" },
  { value: "DESMONTAJE", label: "DESMONTAJE" },
  { value: "OTRO", label: "OTRO" },
];

const SORT_OPTIONS = [
  { value: "fecha", label: "Fecha" },
  { value: "numero", label: "Número" },
  { value: "almacen", label: "Almacén" },
  { value: "sot", label: "SOT" },
  { value: "motivo", label: "Motivo" },
  { value: "usuario", label: "Usuario" },
  { value: "cantidad_materiales", label: "Cantidad de materiales" },
  { value: "cantidad_series", label: "Cantidad de series" },
];

const DIRECTION_OPTIONS = [
  { value: "desc", label: "Descendente" },
  { value: "asc", label: "Ascendente" },
];

export default function GuiaFilters({ params, setParams }: GuiaFiltersProps) {
  const user = useAuthStore((s) => s.user);

  const { data: almacenesAll = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const almacenOptions = useMemo(() => {
    const base = [
      { value: "todos", label: "Todos" },
      { value: "retirados", label: "Retirados" },
    ];
    return [
      ...base,
      ...getAlmacenFilterOptions(user, almacenesAll)
        .filter((a) => a.value !== "all"),
    ];
  }, [user, almacenesAll]);

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
        options={almacenOptions}
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

      <SearchableSelect
        placeholder="Ordenar por"
        options={SORT_OPTIONS}
        value={params.sort ?? "fecha"}
        onChange={(v) =>
          setParams((prev) => ({ ...prev, sort: v, page: "1" }))
        }
      />
      <SearchableSelect
        placeholder="Dirección"
        options={DIRECTION_OPTIONS}
        value={params.direction ?? "desc"}
        onChange={(v) =>
          setParams((prev) => ({ ...prev, direction: v, page: "1" }))
        }
      />
    </FilterWrapper>
  );
}
