import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getAlmacenesPermitidos } from "@/pages/auth/lib/auth.utils";
import FilterWrapper from "@/components/FilterWrapper";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import { SearchableSelect } from "@/components/SearchableSelect";
import SearchInput from "@/components/SearchInput";

interface InventarioMaterialesFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const BOOL_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

export default function InventarioMaterialesFilters({
  params,
  setParams,
}: InventarioMaterialesFiltersProps) {
  const user = useAuthStore((s) => s.user);
  const { data: almacenesAll = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const almacenes = useMemo(
    () => getAlmacenesPermitidos(user, almacenesAll),
    [almacenesAll, user],
  );

  const almacenOptions = useMemo(
    () => almacenes.map((a) => ({ value: String(a.id), label: a.nombre })),
    [almacenes],
  );

  const selectedAlmacenes = params.almacen_id
    ? params.almacen_id.split(",").filter(Boolean)
    : [];

  return (
    <FilterWrapper>
      <MultiSelectFilter
        placeholder="Almacenes"
        options={almacenOptions}
        values={selectedAlmacenes}
        onChange={(ids) =>
          setParams((prev) => ({ ...prev, almacen_id: ids.join(","), page: "1" }))
        }
      />
      <SearchInput
        value={params.search ?? ""}
        onChange={(v) => setParams((prev) => ({ ...prev, search: v, page: "1" }))}
        placeholder="Buscar material..."
      />
      <SearchInput
        value={params.sot ?? ""}
        onChange={(v) => setParams((prev) => ({ ...prev, sot: v, page: "1" }))}
        placeholder="Buscar por SOT..."
      />
      <SearchableSelect
        placeholder="Retirados"
        options={BOOL_OPTIONS}
        value={params.retirados || "all"}
        onChange={(v) =>
          setParams((prev) => ({ ...prev, retirados: v === "all" ? "" : v, page: "1" }))
        }
      />
    </FilterWrapper>
  );
}
