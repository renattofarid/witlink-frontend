# Gap analysis: Almacén Corporativo (backend `almacen-witlink` vs frontend `witlink-frontend`)

Generado el 2026-08-02 comparando el estado real del backend (rama `hector`, últimos
commits hasta `5ccfc95`) contra el código actual de `E:\front\witlink-frontend`.

El backend ya trae documentado el contrato completo en
`almacen-witlink/docs/guia_frontend_modulo_almacen.md`. Este documento **no la repite**:
se enfoca en los **deltas** — qué cambió recientemente en el backend, qué ya existe en el
frontend, qué está roto, y qué falta.

## Cómo leer esto

- **P0**: rompe el flujo corporativo hoy. Arreglar antes que cualquier otra cosa.
- **P1**: inconsistencia real entre contrato y código; funciona "por accidente" o de forma incompleta.
- **P2**: deuda técnica que va a estorbar al seguir integrando el módulo.
- **P3**: mejoras opcionales / limpieza de tipos.

---

## P0 — El selector de almacén para usuarios corporativos está roto

**Archivo:** [WarehouseSelect.tsx:41-46](../../witlink-frontend/src/pages/auth/components/WarehouseSelect.tsx)

```ts
// Usuarios corporativos solo pueden operar sobre sus subalmacenes del grupo
const almacenes = useMemo(() => {
  if (!user?.is_corporativo) return almacenesAll;
  const permitidos = user.subalmacenes_operativos ?? [];
  return almacenesAll.filter((a) => permitidos.includes(a.id));
}, [almacenesAll, user]);
```

El campo `user.subalmacenes_operativos` **nunca llega en la respuesta real de
`/auth/login` ni de `/auth/me`**. Esos dos endpoints devuelven `LoginResource`
(`app/Http/Resources/LoginResource.php`), que expone:

```json
{
  "almacen_id": 12,
  "is_corporativo": true,
  "subalmacenes": [{ "id": 12, "nombre": "Planta Externa", "codigo": "ALMACEN_PEXT" }, ...],
  "almacen_padre_id": null,
  "es_subalmacen_corporativo": false
}
```

`subalmacenes_operativos` (array de solo IDs) es un campo de **`UsuarioResource`**, un
recurso distinto que se usa en el CRUD de usuarios, no en login/me. Como
`user.subalmacenes_operativos` siempre es `undefined`, `permitidos` siempre es `[]`, el
`filter` siempre devuelve un arreglo vacío, y **todo usuario corporativo ve el diálogo
"Sin almacenes disponibles" apenas inicia sesión** — nunca puede completar
`selectAlmacen()`.

Esto es más grave que un problema de UI: como el backend ahora deriva el almacén activo
del **ability `almacen_id` del token de Sanctum** (ver sección siguiente), un usuario
corporativo que nunca pasa por `/almacenes/seleccionar` jamás obtiene un token con esa
ability, y **cualquier endpoint que use `get_almacen_id()` le devolverá 401/error**
("No autorizado: no se encontró el almacén asociado al token"). En la práctica: un
usuario PINT/PEXT no puede usar el sistema en absoluto en el estado actual del frontend.

**Fix sugerido:**

1. En `src/pages/auth/lib/auth.interface.ts`, reemplazar/agregar en `AuthUsuario`:
   ```ts
   almacen_id: number;
   subalmacenes: { id: number; nombre: string; codigo: string }[];
   almacen_padre_id: number | null;
   es_subalmacen_corporativo: boolean;
   ```
   y eliminar `subalmacenes_operativos`, `grupo_corporativo`, `oficina_id`,
   `almacen_retirados_id` (ver [P1](#p1--campos-muertos-en-authusuario), ninguno existe en la respuesta real).
2. En `WarehouseSelect.tsx`, usar directamente `user.subalmacenes` (ya trae
   `id`/`nombre`/`codigo`, no hace falta cruzarlo con `getAlmacenes()`):
   ```ts
   const almacenes = useMemo(() => {
     if (!user?.is_corporativo) return almacenesAll;
     const permitidos = new Set((user.subalmacenes ?? []).map((s) => s.id));
     return almacenesAll.filter((a) => permitidos.has(a.id));
   }, [almacenesAll, user]);
   ```

---

## P1 — `team-switcher.tsx` no filtra por grupo corporativo

**Archivo:** [team-switcher.tsx:32-38](../../witlink-frontend/src/components/team-switcher.tsx)

El dropdown de cambio de almacén en el sidebar lista **todos** los almacenes que
devuelve `GET /almacenes` (que el backend devuelve sin filtrar, es un CRUD genérico),
sin aplicar el mismo filtro que `WarehouseSelect`. Un usuario corporativo puede así
intentar cambiarse a un almacén fuera de su grupo (p.ej. un usuario PINT eligiendo
`ALMACEN_ORIENTE`). El backend no lo bloqueará en `/almacenes/seleccionar` (ese endpoint
no valida pertenencia al grupo, solo que el almacén exista — ver
`AlmacenController::seleccionar`), así que el usuario terminaría operando fuera de su
grupo sin ningún aviso, hasta que un endpoint corporativo con middleware
`admin.corporativo` o validación de grupo le devuelva 403/404 en una acción puntual.

**Fix sugerido:** extraer el filtro de `WarehouseSelect` a un helper compartido
(`getAlmacenesPermitidos(user, almacenesAll)`) y usarlo también en `team-switcher.tsx`.

---

## P1 — Campos muertos/inexistentes en `AuthUsuario`

**Archivo:** [auth.interface.ts:15-26](../../witlink-frontend/src/pages/auth/lib/auth.interface.ts)

| Campo declarado | Estado real |
|---|---|
| `oficina_id` | Ya no existe en `LoginResource` desde el commit `b9c1762` (25-jun): se reemplazó por `almacen_id`. Campo muerto. |
| `grupo_corporativo` | Nunca existió en `LoginResource` (solo en `UsuarioResource`, un endpoint distinto). No usado en ningún componente (`grep` confirmó 0 usos fuera de la definición del tipo). |
| `subalmacenes_operativos` | Nunca existió en `LoginResource`. Usado solo en el bug P0. |
| `almacen_retirados_id` | Nunca existió en `LoginResource`. 0 usos. |
| `almacen_id` (activo) | **Sí** viene en `LoginResource`, pero el frontend no lo lee del usuario — lo mantiene aparte en `useAuthStore().almacen_id` (poblado manualmente tras `selectAlmacen`). Funciona, pero significa que `authenticate()` (GET /auth/me) nunca sincroniza el `almacen_id` real del token con el store; si se llama `/auth/me` después de un login viejo (localStorage con `user` cacheado), el store podría quedar desalineado del que realmente resuelve el backend. |

**Fix sugerido:** alinear el tipo a la respuesta real (ver bloque de código en P0) y,
opcionalmente, hacer que `authenticate()` también actualice `useAuthStore.almacen_id`
con `data.data.almacen_id` para que ambas fuentes de verdad no diverjan.

---

## P1 — Los tipos de `AlmacenResource` no tienen los campos corporativos nuevos

El backend agregó estos campos a `AlmacenResource` (commit `7643a3a`, 1-ago, sin
documentar en la guía existente):

```json
{
  "id": 12, "nombre": "...", "codigo": "ALMACEN_ORIENTE", "direccion": "...",
  "almacen_padre_id": 8,
  "almacen_padre_codigo": "ALMACEN_PEXT",
  "is_corporativo": false,
  "es_subalmacen_corporativo": true
}
```

El frontend tiene **dos** definiciones distintas de `AlmacenResource` y ninguna incluye
estos campos:

- [auth.interface.ts:51-56](../../witlink-frontend/src/pages/auth/lib/auth.interface.ts) — `{ id, nombre, direccion, deleted_at }`
- [almacenes/lib/almacen.interface.ts:3-10](../../witlink-frontend/src/pages/almacenes/lib/almacen.interface.ts) — `{ id, nombre, codigo, direccion, created_at, updated_at }`

**Fix sugerido:** unificar en un solo tipo compartido (p.ej. mover a
`src/lib/core.interface.ts` o a un nuevo `src/pages/almacenes/lib/almacen.interface.ts`
usado por ambos módulos) agregando `almacen_padre_id`, `almacen_padre_codigo`,
`is_corporativo`, `es_subalmacen_corporativo`. Esto habilita mostrar en la UI, por
ejemplo, una etiqueta "Sub-almacén de Planta Externa" en el listado de almacenes o en el
selector.

---

## P1 — Config corporativa: PEXT ahora incluye su propio almacén como operable

`config/almacenes.php` (commit `7643a3a`) cambió:

```diff
 'ALMACEN_PEXT' => [
     'nombre' => 'Planta Externa',
-    'subalmacenes' => ['ALMACEN_ORIENTE', 'ALMACEN_NORTE'],
+    'subalmacenes' => ['ALMACEN_PEXT', 'ALMACEN_ORIENTE', 'ALMACEN_NORTE'],
```

Antes, un usuario cuyo `almacen_id` fuera literalmente `ALMACEN_PEXT` no se consideraba
parte de ningún grupo corporativo (`isCorporativo` fallaba). Ahora sí: el almacén padre
PEXT es su propio subalmacén operativo y puede operar inventario/despachos
directamente, igual que ya podía `ALMACEN_PINT` (que ya se incluía a sí mismo).

No se encontraron en el frontend listas hardcodeadas de "PINT"/"PEXT" ni de sus
subalmacenes (todo es data-driven desde `/auth/me` y `/almacenes`), así que no debería
requerir cambios de código — pero conviene una prueba manual con un usuario cuyo almacén
base sea `ALMACEN_PEXT` directamente (antes de este cambio ese caso no era
"corporativo" y ahora sí lo es: aparecerá el selector de subalmacén, el botón de
Diagnóstico de reservas, etc.).

---

## P1 — Inventario del técnico ahora está estrictamente aislado por almacén activo

Commit `85555a7` (`TecnicoApplicationService.php`, `TecnicoService.php`):

- `TecnicoApplicationService::inventario()` (usado para mostrar el inventario del
  técnico en la liquidación) ahora filtra materiales con
  `whereHas('material', fn($q) => $q->where('almacen_id', $almacenId))` — antes
  mostraba todos los materiales del técnico sin importar el almacén.
- `TecnicoService::validarProductoEnInventario()` y `actualizarInventario()` ahora
  resuelven y descuentan el material **por `get_almacen_id()`** (el almacén activo del
  token), con `lockForUpdate()`, y lanzan
  `BadRequestException('El técnico no tiene suficiente cantidad del material en su
  inventario')` (HTTP 400) si no encuentran el material en ese almacén específico o la
  cantidad no alcanza.

**Implicación para el frontend:** si un administrador corporativo procesa una
liquidación de un técnico cuyo material fue despachado desde un subalmacén distinto al
que está actualmente activo en su token (p.ej. token activo = `ALMACEN_ORIENTE` pero el
material del técnico quedó registrado bajo `ALMACEN_NORTE`), la liquidación fallará con
un 400 aunque el técnico "sí tenga" el material en otro subalmacén del mismo grupo. No
se encontró en el frontend ningún manejo específico de este mensaje ni ninguna
advertencia al usuario sobre "verifica que el subalmacén activo coincida con el origen
del despacho del técnico antes de liquidar".

**Fix sugerido:**
1. Capturar el 400 de guardar productos de liquidación y mostrar el mensaje del backend
   tal cual (ya debería pasar por el patrón genérico `error.response?.data?.message`,
   confirmar que `saveProductosLiquidacion`/`updateProductosLiquidacion` en
   `liquidaciones.actions.ts` lo hacen).
2. Considerar mostrar en la pantalla de liquidación qué subalmacén está activo
   (`team-switcher` ya lo hace en el sidebar, pero podría reforzarse con un badge en el
   formulario de liquidación) para que el operador corporativo sepa que debe cambiar de
   subalmacén si el técnico corresponde a otro.

---

## P2 — Manejo de errores 403/409 sin centralizar

El interceptor global (`src/lib/config.ts:32-53`) solo maneja `401`. Los flujos
corporativos dependen fuertemente de:

- `403` — acciones exclusivas de administrador corporativo (`admin.corporativo`
  middleware): reservar/liberar SOT, cambiar SOT de una serie, cambio masivo de
  ubicación.
- `409` — conflictos de inventario/SOT/estado (serie ya reservada por otra SOT, guía sin
  stock disponible, etc.), donde el backend además devuelve datos útiles en el body
  (`advertencias_reserva`, estado actual) que hoy solo se manejan puntualmente en el
  módulo de Guías (`GuiaForm.tsx`, `GuiaEquipoRetiradoForm.tsx`).

**Fix sugerido:** un helper `getApiErrorMessage(error)` reusable que:
- para 403 muestre un mensaje fijo ("No tienes permisos de administrador corporativo
  para esta acción") en vez de lo que venga en el body;
- para 409 extraiga y muestre el `message` del backend tal cual (suele traer el detalle
  exacto: SOT que bloquea, estado actual de la serie);
- se use en los nuevos flujos de reserva SOT / cambio masivo de ubicación en
  `InventarioPage.tsx`, que hoy probablemente solo hacen `errorToast("mensaje genérico")`
  en el `onError` de las mutations (confirmar al implementar).

---

## P2 — `createDespachoMasivoSeriesCorporativo` sin UI

`POST /corporativo/despachos/masivo-series` está implementado en
`corporativo.actions.ts:59-67` pero no se invoca desde ningún componente. Si el despacho
masivo por series es un requisito del corporativo (documentado en el backend en la
sección 9 de `guia_frontend_modulo_almacen.md`), falta construir la pantalla/diálogo que
lo use (probablemente un modo alterno dentro de `DespachoForm.tsx` para pegar una lista
de series en vez de armar productos uno por uno).

---

## P2 — Módulos "equipo-retirado" y "equipos-retirados" duplicados y sin ruta

Existen dos carpetas de features casi idénticas apuntando al mismo endpoint
`/equipos-retirados` (`src/pages/equipo-retirado/` y `src/pages/equipos-retirados/`), y
**ninguna está registrada como ruta navegable** en `router/index.tsx`. El flujo
corporativo de retiro de equipos (`POST /equipos-retirados`, con `sot` obligatorio y
documento registrado en `ALMACEN_RETCORP` para usuarios corporativos, según la sección
12 de la guía del backend) no tiene entrada de UI utilizable hoy.

**Fix sugerido:** decidir cuál de las dos carpetas es la vigente (por fecha de
modificación, `equipos-retirados/` es la más reciente), eliminar la otra, y agregar la
ruta correspondiente al router antes de construir la parte corporativa de este flujo
(SOT obligatorio, mostrar que el destino es `ALMACEN_RETCORP` para corporativos).

---

## P3 — Filtro `almacen_id` no expuesto en Liquidaciones

El backend acepta `almacen_id` como filtro de listado en `GET /liquidaciones` (sección
10 de la guía), y resuelve automáticamente el grupo completo del usuario vía
`getOperativosIds(get_almacen_id())` en varias consultas (`LiquidacionService.php`).
El frontend (`liquidaciones.actions.ts`) no expone ese filtro en la UI. No es
bloqueante (el listado ya se limita implícitamente al almacén/grupo activo del token),
pero un administrador corporativo que quiera ver liquidaciones de un subalmacén
específico dentro de su grupo, distinto del que tiene activo, no tiene forma de
filtrarlo sin cambiar de almacén activo primero. Mejora opcional: agregar un filtro de
subalmacén (poblado desde `user.subalmacenes`) al listado de liquidaciones.

---

## P3 — Limpieza general de tipos duplicados

Unificar `AlmacenResource` (ver P1) y considerar mover los tipos corporativos
compartidos (`GrupoCorporativo`, forma de `subalmacenes`) a un módulo común
(`src/pages/corporativo/lib/corporativo.interface.ts` ya existe y sería el lugar
natural) en vez de tenerlos repartidos entre `auth.interface.ts` y `almacen.interface.ts`.

---

## Checklist de implementación sugerido (orden)

1. [x] Corregir `AuthUsuario` (tipos) y `WarehouseSelect.tsx` para leer `subalmacenes`
   real en vez de `subalmacenes_operativos` — **desbloquea todo lo demás**.
   Implementado vía helper compartido `getAlmacenesPermitidos` en
   [auth.utils.ts](../src/pages/auth/lib/auth.utils.ts).
2. [x] Aplicar el mismo filtro de grupo corporativo en `team-switcher.tsx`
   (usa el mismo helper).
3. [x] Agregar `almacen_padre_id`, `almacen_padre_codigo`, `is_corporativo`,
   `es_subalmacen_corporativo` a los tipos de `AlmacenResource` y `AuthUsuario`.
   Se unificó `AlmacenResource` en un solo lugar
   ([almacen.interface.ts](../src/pages/almacenes/lib/almacen.interface.ts));
   `auth.interface.ts` ahora re-exporta ese mismo tipo en vez de duplicarlo.
   De paso, `authenticate()` ahora también sincroniza `almacen_id` en el store
   (ver P1 "campo `almacen_id` (activo)").
4. [ ] Probar de punta a punta con un usuario cuyo almacén base sea `ALMACEN_PEXT`
   directamente (nuevo caso corporativo tras el cambio de config).
5. [ ] Confirmar/mejorar el manejo del 400
   "El técnico no tiene suficiente cantidad del material en su inventario" en el flujo
   de liquidaciones, y comunicar en la UI qué subalmacén está activo.
6. [ ] Centralizar manejo de 403/409 para las pantallas corporativas nuevas.
7. [ ] Resolver duplicidad `equipo-retirado` vs `equipos-retirados` y enrutarlo antes de
   construir su parte corporativa.
8. [ ] (Opcional) UI para despacho masivo por series corporativo.
9. [ ] (Opcional) Filtro de subalmacén en Liquidaciones.

## Referencia

Contrato completo de API (rutas, payloads, reglas de negocio, checklist de QA) en:
`almacen-witlink/docs/guia_frontend_modulo_almacen.md`.
