import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { SearchableSelect } from "@/components/SearchableSelect";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";

interface DevolucionFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const ANULADO_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "false", label: "Vigentes" },
  { value: "true", label: "Anulados" },
];

export default function DevolucionFilters({ params, setParams }: DevolucionFiltersProps) {
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

  const emisionDesde = params.fecha_emision_desde
    ? new Date(params.fecha_emision_desde + "T00:00:00")
    : undefined;
  const emisionHasta = params.fecha_emision_hasta
    ? new Date(params.fecha_emision_hasta + "T00:00:00")
    : undefined;
  const trasladoDesde = params.fecha_traslado_desde
    ? new Date(params.fecha_traslado_desde + "T00:00:00")
    : undefined;
  const trasladoHasta = params.fecha_traslado_hasta
    ? new Date(params.fecha_traslado_hasta + "T00:00:00")
    : undefined;

  return (
    <FilterWrapper>
      <SearchInput
        value={params.search ?? ""}
        onChange={(v) => setParams((prev) => ({ ...prev, search: v, page: "1" }))}
        placeholder="Buscar por número, destinatario, RUC/DNI, guía o motivo..."
      />
      <DateRangePickerFilter
        dateFrom={emisionDesde}
        dateTo={emisionHasta}
        onDateChange={(from, to) =>
          setParams((prev) => ({
            ...prev,
            fecha_emision_desde: from ? format(from, "yyyy-MM-dd") : "",
            fecha_emision_hasta: to ? format(to, "yyyy-MM-dd") : "",
            page: "1",
          }))
        }
        placeholder="Emisión"
        className="w-fit"
      />
      <DateRangePickerFilter
        dateFrom={trasladoDesde}
        dateTo={trasladoHasta}
        onDateChange={(from, to) =>
          setParams((prev) => ({
            ...prev,
            fecha_traslado_desde: from ? format(from, "yyyy-MM-dd") : "",
            fecha_traslado_hasta: to ? format(to, "yyyy-MM-dd") : "",
            page: "1",
          }))
        }
        placeholder="Traslado"
        className="w-fit"
      />
      <SearchableSelect
        placeholder="Almacén origen"
        options={almacenOptions}
        value={params.almacen_origen_id || "all"}
        onChange={(v) => set("almacen_origen_id", v)}
      />
      <SearchableSelect
        placeholder="Almacén destino"
        options={almacenOptions}
        value={params.almacen_destino_id || "all"}
        onChange={(v) => set("almacen_destino_id", v)}
      />
      <SearchableSelect
        placeholder="Estado"
        options={ANULADO_OPTIONS}
        value={params.anulado || "all"}
        onChange={(v) => set("anulado", v)}
      />
    </FilterWrapper>
  );
}
