import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { getProductosAll } from "@/pages/producto/lib/producto.actions";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getSubalmacenesOperativos } from "@/pages/auth/lib/auth.utils";

interface SerieFiltersProps {
  params: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const SITUACION_OPTIONS = [
  { value: "all", label: "Todas las situaciones" },
  { value: "PE", label: "Pendiente" },
  { value: "DI", label: "Disponible" },
  { value: "DE", label: "Despachado" },
  { value: "LI", label: "Liquidado" },
  { value: "RE", label: "Retirado" },
];

const SORT_OPTIONS = [
  { value: "id", label: "ID" },
  { value: "serie", label: "Serie" },
  { value: "situacion", label: "Situación" },
  { value: "mac", label: "MAC" },
  { value: "emta_mac", label: "EMTA MAC" },
  { value: "ua", label: "UA" },
  { value: "productos.nombre", label: "Producto" },
];

const DIRECTION_OPTIONS = [
  { value: "desc", label: "Descendente" },
  { value: "asc", label: "Ascendente" },
];

export default function SerieFilters({ params, setParams }: SerieFiltersProps) {
  const { data: productos = [] } = useQuery({
    queryKey: ["productos-all"],
    queryFn: () => getProductosAll(),
    refetchOnWindowFocus: false,
  });

  const user = useAuthStore((s) => s.user);
  const isCorporativo = !!user?.is_corporativo;

  // Solo se consulta/muestra el filtro de almacén cuando aplica: el usuario
  // es corporativo (opera sobre varios subalmacenes de su grupo) o tiene
  // subalmacenes asignados en el auth. Para el resto, el backend ya filtra
  // por el almacén de la sesión activa.
  const hasSubalmacenes = (user?.subalmacenes?.length ?? 0) > 0;
  const showAlmacenFilter = isCorporativo || hasSubalmacenes;

  const { data: almacenesAll = [] } = useQuery({
    queryKey: ["almacenes-list"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
    enabled: showAlmacenFilter,
  });

  const almacenes = useMemo(
    () => getSubalmacenesOperativos(user, almacenesAll),
    [user, almacenesAll],
  );

  const almacenOptions = [
    { value: "all", label: "Todos los almacenes" },
    ...almacenes.map((a) => ({ value: String(a.id), label: a.nombre })),
  ];

  const productoOptions = [
    { value: "all", label: "Todos los productos" },
    ...productos.map((p) => ({ value: String(p.id), label: `${p.nombre} (${p.sap})` })),
  ];

  const set = (key: string, value: string) =>
    setParams((prev) => ({ ...prev, [key]: value === "all" ? "" : value, page: "1" }));

  const setText = (key: string, value: string) =>
    setParams((prev) => ({ ...prev, [key]: value, page: "1" }));

  return (
    <FilterWrapper >
      <SearchInput
        value={params.search ?? ""}
        onChange={(v) => setText("search", v)}
        placeholder="Buscar serie, MAC, UA, producto..."
      />
      {showAlmacenFilter && (
        <SearchableSelect
          placeholder="Almacén"
          options={almacenOptions}
          value={params.almacen_id || "all"}
          onChange={(v) => set("almacen_id", v)}
        />
      )}
      <SearchableSelect
        placeholder="Situación"
        options={SITUACION_OPTIONS}
        value={params.situacion || "all"}
        onChange={(v) => set("situacion", v)}
      />
      <SearchInput
        value={params.serie ?? ""}
        onChange={(v) => setText("serie", v)}
        placeholder="Filtrar por serie..."
      />
      <SearchInput
        value={params.mac ?? ""}
        onChange={(v) => setText("mac", v)}
        placeholder="Filtrar por MAC..."
      />
      <SearchInput
        value={params.emta_mac ?? ""}
        onChange={(v) => setText("emta_mac", v)}
        placeholder="Filtrar por EMTA MAC..."
      />
      <SearchInput
        value={params.ua ?? ""}
        onChange={(v) => setText("ua", v)}
        placeholder="Filtrar por UA..."
      />
      <SearchInput
        value={params["producto$nombre"] ?? ""}
        onChange={(v) => setText("producto$nombre", v)}
        placeholder="Filtrar por nombre del producto..."
      />
      <SearchInput
        value={params["producto$sap"] ?? ""}
        onChange={(v) => setText("producto$sap", v)}
        placeholder="Filtrar por SAP del producto..."
      />
      <SearchableSelect
        placeholder="Producto"
        options={productoOptions}
        value={params.producto_id || "all"}
        onChange={(v) => set("producto_id", v)}
      />
      <SearchableSelect
        placeholder="Ordenar por"
        options={SORT_OPTIONS}
        value={params.sort || "id"}
        onChange={(v) => setParams((prev) => ({ ...prev, sort: v, page: "1" }))}
      />
      <SearchableSelect
        placeholder="Dirección"
        options={DIRECTION_OPTIONS}
        value={params.direction || "desc"}
        onChange={(v) => setParams((prev) => ({ ...prev, direction: v, page: "1" }))}
      />
    </FilterWrapper>
  );
}
