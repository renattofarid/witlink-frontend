import { useMemo } from "react";
import { format } from "date-fns";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import DatePicker from "@/components/DatePicker";
import { useQuery } from "@tanstack/react-query";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getAlmacenFilterOptions } from "@/pages/auth/lib/almacen-options";

interface KardexFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const TIPO_MOVIMIENTO_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "ingreso", label: "Ingreso" },
  { value: "devolucion", label: "Devolución" },
  { value: "liquidacion_instalado", label: "Liquidación instalado" },
  { value: "liquidacion_retirado", label: "Liquidación retirado" },
];

export default function KardexFilters({ params, setParams }: KardexFiltersProps) {
  const user = useAuthStore((s) => s.user);
  const almacen_id = useAuthStore((s) => s.almacen_id);

  const { data: almacenes = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const almacenOptions = useMemo(() => {
    return getAlmacenFilterOptions(user, almacenes);
  }, [user, almacenes]);

  const set = (key: string, value: string) =>
    setParams((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value,
      page: "1",
    }));

  const activeAlmacenVal =
    params.almacen_id !== undefined
      ? params.almacen_id === ""
        ? "all"
        : params.almacen_id
      : almacen_id
      ? String(almacen_id)
      : "all";

  return (
    <FilterWrapper>
      <SearchInput
        value={params.producto ?? ""}
        onChange={(v) => setParams((prev) => ({ ...prev, producto: v, page: "1" }))}
        placeholder="Buscar producto o SAP..."
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
      />
      <SearchableSelect
        placeholder="Almacén"
        options={almacenOptions}
        value={activeAlmacenVal}
        onChange={(v) => set("almacen_id", v)}
      />
      <SearchableSelect
        placeholder="Tipo movimiento"
        options={TIPO_MOVIMIENTO_OPTIONS}
        value={params.tipo_movimiento || "all"}
        onChange={(v) => set("tipo_movimiento", v)}
      />
    </FilterWrapper>
  );
}
