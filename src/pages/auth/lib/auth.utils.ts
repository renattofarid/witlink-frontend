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

/**
 * Subalmacenes operativos reales del grupo del usuario corporativo: excluye  
 * el almacén "padre" (p.ej. PINT/PEXT), que solo agrupa y nunca contiene
 * stock propio, por lo que jamás es un destino válido para una operación
 * (ingreso, despacho, traslado) que requiera un almacén físico específico.
 */
export function getSubalmacenesOperativos(
  user: AuthUsuario | null,
  almacenes: AlmacenResource[],
): AlmacenResource[] {
  return getAlmacenesPermitidos(user, almacenes);
}
