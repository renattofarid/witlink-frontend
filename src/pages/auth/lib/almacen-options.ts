import type { Option } from "@/lib/core.interface";
import type { AuthUsuario } from "./auth.interface";
import { getAlmacenesPermitidos } from "./auth.utils";
import type { AlmacenResource } from "@/pages/almacenes/lib/almacen.interface";

export function getAlmacenFilterOptions(
  user: AuthUsuario | null,
  almacenes: AlmacenResource[],
  allLabel = "Todos los almacenes",
): Option[] {
  const permitidos = getAlmacenesPermitidos(user, almacenes);
  const operativos = user?.is_corporativo
    ? permitidos.filter((a) => a.es_subalmacen_corporativo)
    : permitidos;

  return [
    { value: "all", label: allLabel },
    ...operativos.map((a) => ({
      value: String(a.id),
      label: a.nombre_display || a.nombre,
      description: a.codigo,
    })),
  ];
}

export function getAlmacenDestinoTrasladoOptions(
  almacenes: AlmacenResource[],
  origenId?: number | string | null,
): Option[] {
  const origen = origenId === undefined || origenId === null || origenId === ""
    ? null
    : Number(origenId);

  return almacenes
    .filter((a) => Number(a.id) !== origen)
    .filter((a) => !(a.is_corporativo && !a.es_subalmacen_corporativo))
    .map((a) => ({
      value: String(a.id),
      label: a.nombre_display || a.nombre,
      description: a.codigo,
      searchCode: a.codigo,
    }));
}
