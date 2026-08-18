import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getAlmacenFilterOptions } from "@/pages/auth/lib/almacen-options";
import FilterWrapper from "@/components/FilterWrapper";
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

  const almacenOptions = useMemo(
    () => getAlmacenFilterOptions(user, almacenesAll, "Todos"),
    [user, almacenesAll],
  );

  return (
    <FilterWrapper>
      <SearchableSelect
        placeholder="Almacenes"
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
      <SearchInput
        value={params.search ?? ""}
        onChange={(v) =>
          setParams((prev) => ({ ...prev, search: v, page: "1" }))
        }
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
          setParams((prev) => ({
            ...prev,
            retirados: v === "all" ? "" : v,
            page: "1",
          }))
        }
      />
    </FilterWrapper>
  );
}
