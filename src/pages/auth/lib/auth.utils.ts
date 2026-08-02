import type { AuthUsuario } from "./auth.interface";
import type { AlmacenResource } from "@/pages/almacenes/lib/almacen.interface";

/**
 * Un usuario corporativo solo puede operar sobre los almacenes de su propio
 * grupo (`user.subalmacenes`, ya resuelto por el backend). Usuarios no
 * corporativos pueden operar sobre cualquier almacén de la lista.
 */
export function getAlmacenesPermitidos(
  user: AuthUsuario | null,
  almacenes: AlmacenResource[],
): AlmacenResource[] {
  if (!user?.is_corporativo) return almacenes;
  const permitidos = new Set(user.subalmacenes.map((s) => s.id));
  return almacenes.filter((a) => permitidos.has(a.id));
}
