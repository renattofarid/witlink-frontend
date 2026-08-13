import type { AuthUsuario } from "./auth.interface";
import type { AlmacenResource } from "@/pages/almacenes/lib/almacen.interface";

const CORPORATE_CODES = new Set([
  "CORP_LALIB",
  "CORP_LAMB",
  "CORP_LIMA",
  "ALMACEN_PMO",
  "ALMACEN_PINT",
  "ALMACEN_PEXT",
  "ALMACEN_NORTE",
  "ALMACEN_ORIENTE",
  "ALMACEN_RETCORP",
  "ALMACEN_TRANCORP",
  "ALMACEN_CENTRAL_CORP",
]);

export function isCorporateAlmacen(almacen: AlmacenResource): boolean {
  if (almacen.is_corporativo || almacen.es_subalmacen_corporativo) return true;
  if (almacen.codigo && CORPORATE_CODES.has(almacen.codigo)) return true;
  if (
    almacen.codigo &&
    (almacen.codigo.startsWith("CORP_") || almacen.codigo.includes("CORP"))
  ) {
    return true;
  }
  return false;
}

/**
 * Un usuario corporativo solo puede operar sobre los almacenes de su propio
 * grupo (`user.subalmacenes`, ya resuelto por el backend).
 * Usuarios NO corporativos NO ven ningún almacén ni subalmacén corporativo.
 */
export function getAlmacenesPermitidos(
  user: AuthUsuario | null,
  almacenes: AlmacenResource[],
): AlmacenResource[] {
  if (!user?.is_corporativo) {
    return almacenes.filter((a) => !isCorporateAlmacen(a));
  }
  const permitidos = new Set(user.subalmacenes.map((s) => s.id));
  return almacenes.filter((a) => permitidos.has(a.id));
}

/**
 * Subalmacenes operativos reales del grupo del usuario corporativo
 */
export function getSubalmacenesOperativos(
  user: AuthUsuario | null,
  almacenes: AlmacenResource[],
): AlmacenResource[] {
  return getAlmacenesPermitidos(user, almacenes);
}
