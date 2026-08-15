import { useMemo } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useTecnicoDespachoQuery } from "../lib/despacho.hook";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";

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
  const user = useAuthStore((s) => s.user);
  const isCorporativo = !!user?.is_corporativo;

  const { data: almacenesAll = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
    enabled: isCorporativo,
  });

  const almacenOptions = useMemo(
    () => [
      { value: "all", label: "Todos los almacenes" },
      ...almacenesAll.map((a) => ({ value: String(a.id), label: a.nombre })),
    ],
    [almacenesAll],
  );

  const dateFrom = params.fecha_inicio
    ? new Date(params.fecha_inicio + "T00:00:00")
    : undefined;
  const dateTo = params.fecha_fin
    ? new Date(params.fecha_fin + "T00:00:00")
    : undefined;

  return (
    <FilterWrapper>
      <SearchInput
        value={params.numero ?? params.search ?? ""}
        onChange={(v) =>
          setParams((prev) => {
            const next: Record<string, string> = { ...prev, page: "1" };
            if (v) {
              next.numero = v;
            } else {
              delete next.numero;
              delete next.search;
            }
            delete next.sot;
            return next;
          })
        }
        placeholder="Buscar por número o SOT..."
      />
      {isCorporativo && (
        <SearchableSelect
          placeholder="Almacén"
          options={almacenOptions}
          value={params.almacen_id || "all"}
          onChange={(v) =>
            setParams((prev) => ({
              ...prev,
              almacen_id: v === "all" ? "" : v,
              page: "1",
            }))
          }
        />
      )}
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
        useQueryHook={useTecnicoDespachoQuery}
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
