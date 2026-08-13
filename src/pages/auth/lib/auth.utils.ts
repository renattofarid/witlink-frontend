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

function normalizeAlmacenText(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

export function isCorporateAlmacen(almacen: AlmacenResource): boolean {
  if (almacen.is_corporativo || almacen.es_subalmacen_corporativo) return true;
  const code = normalizeAlmacenText(almacen.codigo);
  const name = normalizeAlmacenText(almacen.nombre);

  if (code && CORPORATE_CODES.has(code)) return true;
  if (
    code &&
    (code.startsWith("CORP_") || code.includes("CORP"))
  ) {
    return true;
  }
  if (name.includes("CORPORATIVO") || name.includes("PLANTA INTERNA") || name.includes("PLANTA EXTERNA")) {
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
