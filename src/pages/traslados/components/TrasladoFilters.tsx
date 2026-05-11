import { format } from "date-fns";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import DatePicker from "@/components/DatePicker";
import { useQuery } from "@tanstack/react-query";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";

interface TrasladoFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const TIPO_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "serie", label: "Equipos" },
  { value: "material", label: "Materiales" },
];

export default function TrasladoFilters({ params, setParams }: TrasladoFiltersProps) {
  const { data: almacenes = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const almacenOptions = [
    { value: "all", label: "Todos los almacenes" },
    ...almacenes.map((a) => ({ value: String(a.id), label: a.nombre })),
  ];

  const set = (key: string, value: string) =>
    setParams((prev) => ({ ...prev, [key]: value === "all" ? "" : value, page: "1" }));

  return (
    <FilterWrapper>
      <SearchInput
        value={params.producto ?? ""}
        onChange={(v) => setParams((prev) => ({ ...prev, producto: v, page: "1" }))}
        placeholder="Buscar producto o código SAP..."
      />
      <SearchInput
        value={params.serie ?? ""}
        onChange={(v) => setParams((prev) => ({ ...prev, serie: v, page: "1" }))}
        placeholder="Buscar serie..."
      />
      <DatePicker
        value={params.fecha_desde ?? ""}
        onChange={(date) =>
          setParams((prev) => ({
            ...prev,
            fecha_desde: date ? format(date, "yyyy-MM-dd") : "",
            page: "1",
          }))
        }
        placeholder="Desde"
        showClearButton
      />
      <DatePicker
        value={params.fecha_hasta ?? ""}
        onChange={(date) =>
          setParams((prev) => ({
            ...prev,
            fecha_hasta: date ? format(date, "yyyy-MM-dd") : "",
            page: "1",
          }))
        }
        placeholder="Hasta"
        showClearButton
      />
      <SearchableSelect
        placeholder="Almacén origen"
        options={almacenOptions}
        value={params.almacen_id || "all"}
        onChange={(v) => set("almacen_id", v)}
      />
      <SearchableSelect
        placeholder="Tipo"
        options={TIPO_OPTIONS}
        value={params.tipo || "all"}
        onChange={(v) => set("tipo", v)}
      />
    </FilterWrapper>
  );
}
