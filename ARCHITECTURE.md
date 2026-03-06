# Arquitectura de Módulos — witlink-frontend

Este documento es la guía de referencia para crear nuevos módulos en el proyecto. Seguir esta estructura es obligatorio para mantener consistencia.

---

## Estructura de carpetas por módulo

Cada módulo vive en `src/pages/[modulo]/` con tres subcarpetas:

```
src/pages/[modulo]/
├── pages/
│   ├── [Modulo]Page.tsx          # Página principal con listado (SIEMPRE existe)
│   ├── [Modulo]AddPage.tsx       # Página de creación (solo si >6 campos en el form)
│   └── [Modulo]EditPage.tsx      # Página de edición (solo si >6 campos en el form)
├── components/
│   ├── [Modulo]Filters.tsx       # Filtros del listado
│   ├── [Modulo]Buttons.tsx       # Botones de acción (ej: "Agregar")
│   ├── [Modulo]Columns.tsx       # Definición de columnas para DataTable
│   ├── [Modulo]Form.tsx          # Formulario con React Hook Form (recibe prop `mode`)
│   └── [Modulo]Modal.tsx         # Modal (solo si ≤6 campos en el form)
└── lib/
    ├── [modulo].constants.ts     # CompleteModel del módulo
    ├── [modulo].schema.ts        # Schema Zod para el formulario
    ├── [modulo].actions.ts       # Llamadas a la API
    ├── [modulo].interface.ts     # Interfaces TypeScript del módulo
    └── [modulo].hook.ts          # Hooks con useQuery (siempre con refetchOnWindowFocus)
```

> **Convención de nombres:**
> - Archivos en `components/` → PascalCase: `[Modulo]Form.tsx`
> - Archivos en `lib/` → camelCase con punto: `[modulo].constants.ts`

---

## Regla del formulario: Modal vs Páginas

| Cantidad de campos | Estrategia |
|--------------------|------------|
| **≤ 6 campos** | Crear `[Modulo]Modal.tsx` en `components/`. Usarlo en `[Modulo]Page.tsx` tanto para agregar como editar. No se crean `AddPage` ni `EditPage`. |
| **> 6 campos** | Crear `[Modulo]AddPage.tsx` y `[Modulo]EditPage.tsx` en `pages/`. Ambas renderizan `[Modulo]Form.tsx` pasando el `mode` correspondiente. Registrar ambas rutas en `router/index.tsx`. |

---

## Manejo del `mode`

El `mode: 'create' | 'edit'` se define en la capa que contiene el formulario:

- **Con modal**: el `mode` se define en `[Modulo]Page.tsx` al abrir el modal (pasado al `[Modulo]Modal.tsx`)
- **Con páginas**: el `mode` se define en `[Modulo]AddPage.tsx` (`'create'`) y `[Modulo]EditPage.tsx` (`'edit'`)

El `mode` se pasa a:
1. `[Modulo]Form.tsx` — para saber si es creación o edición
2. `GeneralModal` (via prop `mode`) — para que `TitleFormComponent` muestre el título correcto

---

## Responsabilidad de cada archivo

### `pages/[Modulo]Page.tsx`
- Página principal del módulo
- Une todos los componentes siguiendo esta estructura de layout fija:

```
PageWrapper
  TitleComponent (title, subtitle, icon)
    ActionsWrapper                   ← children de TitleComponent
      [Modulo]Filters                ← filtros de búsqueda
      [Modulo]Buttons                ← botón Agregar
  DataTable
  DataTablePagination
  [Modulo]Modal                      ← solo si ≤6 campos
  SimpleDeleteDialog                 ← confirmación de eliminación
```

```tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

export default function [Modulo]Page() {
  const queryClient = useQueryClient();

  // Estado de params (paginación + filtros)
  const [params, setParams] = useState<Record<string, string>>({
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
  });

  // Estado del modal (solo si ≤6 campos)
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<[Modulo]Resource | null>(null);

  // Estado del diálogo de eliminación
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<[Modulo]Resource | null>(null);

  const { data, isLoading } = use[Modulo]Query(params);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: () => delete[Modulo](toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [[Modulo]Complete.QUERY_KEY] });
      successToast("[Modulo] eliminado correctamente.");
    },
    onError: () => errorToast("Error al eliminar."),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restore[Modulo](id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [[Modulo]Complete.QUERY_KEY] });
      successToast("[Modulo] restaurado correctamente.");
    },
    onError: () => errorToast("Error al restaurar."),
  });

  // Handlers
  const handleAdd = () => { setSelected(null); setMode("create"); setModalOpen(true); };
  const handleEdit = (row: [Modulo]Resource) => { setSelected(row); setMode("edit"); setModalOpen(true); };
  const handleDelete = (row: [Modulo]Resource) => { setToDelete(row); setDeleteOpen(true); };
  const handleRestore = (row: [Modulo]Resource) => restoreMutation.mutate(row.id);

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));
  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));
  // Filtros: setParams((prev) => ({ ...prev, search: value, page: "1" }))

  const columns = get[Modulo]Columns({ onEdit: handleEdit, onDelete: handleDelete, onRestore: handleRestore });

  return (
    <PageWrapper>
      <TitleComponent title={[Modulo]Complete.name} subtitle="..." icon="...">
        <ActionsWrapper>
          <[Modulo]Filters params={params} setParams={setParams} />
          <[Modulo]Buttons onAdd={handleAdd} />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} />

      <DataTablePagination
        page={Number(params.page)}
        per_page={Number(params.per_page)}
        totalPages={data?.last_page ?? 1}
        totalData={data?.total ?? 0}
        onPageChange={handlePageChange}
        setPerPage={handlePerPageChange}
      />

      <[Modulo]Modal open={modalOpen} onClose={() => setModalOpen(false)} mode={mode} selected={selected} />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar [Modulo]"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        onConfirm={async () => { await deleteMutation.mutateAsync(); }}
      />
    </PageWrapper>
  );
}
```

### `pages/[Modulo]AddPage.tsx` y `[Modulo]EditPage.tsx`
- Solo existen si el form tiene >6 campos
- Definen el `mode` correspondiente
- Renderizan `[Modulo]Form` pasándole el `mode`

### `components/[Modulo]Filters.tsx`
- Barra de filtros del listado

### `components/[Modulo]Buttons.tsx`
- Botones de acción del listado (ej: botón "Agregar" que abre modal o navega al AddPage)

### `components/[Modulo]Columns.tsx`
- Array de columnas para pasar al componente `DataTable`
- **Siempre** incluye una columna `acciones` al final con `ButtonAction`
- Las acciones estándar son **editar**, **eliminar** y **restaurar**
- El estado de eliminado se detecta con `deleted_at` del resource (`null` = activo, fecha = eliminado)
- Se usa `canRender` de `ButtonAction` para mostrar u ocultar botones según el estado

```tsx
import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { [Modulo]Resource } from "../lib/[modulo].interface";

interface ColumnActions {
  onEdit: (row: [Modulo]Resource) => void;
  onDelete: (row: [Modulo]Resource) => void;
  onRestore: (row: [Modulo]Resource) => void;
}

export const get[Modulo]Columns = ({
  onEdit,
  onDelete,
  onRestore,
}: ColumnActions): ColumnDef<[Modulo]Resource>[] => [
  // ...columnas de datos...
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;
      const isDeleted = !!item.deleted_at;
      return (
        <div className="flex gap-1">
          <ButtonAction
            icon={Pencil}
            canRender={!isDeleted}
            onClick={() => onEdit(item)}
          />
          <ButtonAction
            icon={Trash2}
            color="danger"
            canRender={!isDeleted}
            onClick={() => onDelete(item)}
          />
          <ButtonAction
            icon={RotateCcw}
            color="warning"
            canRender={isDeleted}
            onClick={() => onRestore(item)}
          />
        </div>
      );
    },
  },
];
```

> Las columnas se definen como función (`get[Modulo]Columns(...)`) para poder pasar los handlers desde el Page.

### `components/[Modulo]Form.tsx`
- Formulario completo usando `react-hook-form` + Zod
- Recibe `mode: 'create' | 'edit'`
- Usa los componentes de formulario disponibles: `FormInput`, `FormSelect`, `FormSelectAsync`, `FormSwitch`, `DatePicker`, etc.
- Está envuelto en `FormWrapper`

> **Regla de campos `_id`:** Si un campo del formulario termina en `_id` (ej: `tipo_usuario_id`, `oficina_id`), es muy probable que requiera un `FormSelectAsync`. **Antes de implementarlo, preguntar al usuario** qué endpoint usa para cargar las opciones y qué campo mostrar como label.

### `components/[Modulo]Modal.tsx`
- Solo existe si el form tiene ≤6 campos
- Envuelve `GeneralModal` y renderiza `[Modulo]Form` adentro
- Se usa en `[Modulo]Page.tsx` para crear y editar

### `lib/[modulo].constants.ts`
- Exporta `[Modulo]Complete` tipado con `ModelComplete` de `@/lib/core.constants`
- **Es la fuente de verdad** para el router, el sidebar, las actions y los hooks

```typescript
import { Users } from "lucide-react";
import type { ModelComplete } from "@/lib/core.constants";

export const UsuariosComplete: ModelComplete = {
  MODEL: {
    name: "Usuario",        // singular — usado en mensajes y títulos
    plural: "Usuarios",     // plural (opcional)
    gender: false,          // false = masculino ("el"/"un"), true = femenino ("la"/"una")
  },
  ICON: Users,              // LucideIcon — usado en sidebar y TitleComponent
  ENDPOINT: "/usuarios",    // usado en [modulo].actions.ts
  QUERY_KEY: "usuarios",    // usado en [modulo].hook.ts como queryKey
  ROUTE: "usuarios",        // ruta relativa (sin /) — referencia interna
  ABSOLUTE_ROUTE: "/usuarios",       // ruta absoluta — usada en router y sidebar
  ROUTE_ADD: "/usuarios/agregar",    // ruta de creación (solo si >6 campos)
  ROUTE_UPDATE: "/usuarios/editar",  // ruta de edición (solo si >6 campos)
};
```

> `ModelComplete` y `ModelInterface` están definidos en `src/lib/core.constants.ts`.
> Los campos en el router y sidebar deben referenciarse desde `[Modulo]Complete.ABSOLUTE_ROUTE` e `[Modulo]Complete.MODEL.plural`.

### `lib/[modulo].schema.ts`
- Schema Zod para validación del formulario
- Exporta el tipo inferido del schema

### `lib/[modulo].actions.ts`
- Funciones que llaman a la API usando el cliente `api` de `@/lib/config`
- El `endpoint` base viene del CompleteModel (`[Modulo]Complete.endpoint`)
- 6 operaciones estándar: **listar** (paginado), **mostrar uno**, **guardar**, **actualizar**, **eliminar** (soft delete), **restaurar**

```typescript
import { api } from "@/lib/config";
import { [Modulo]Complete } from "./[modulo].constants";
import type { [Modulo]Response, [Modulo]Resource } from "./[modulo].interface";

export const get[Modulo]s = async (params: Record<string, string>): Promise<[Modulo]Response> => {
  const { data } = await api.get([Modulo]Complete.ENDPOINT, { params });
  return data;
};

export const get[Modulo]sAll = async (): Promise<[Modulo]Resource[]> => {
  const { data } = await api.get([Modulo]Complete.ENDPOINT);
  return data;
};

export const get[Modulo] = async (id: number): Promise<[Modulo]Resource> => {
  const { data } = await api.get(`${[Modulo]Complete.ENDPOINT}/${id}`);
  return data;
};

export const create[Modulo] = async (body: [Modulo]Body) => {
  const { data } = await api.post([Modulo]Complete.ENDPOINT, body);
  return data;
};

export const update[Modulo] = async (id: number, body: [Modulo]Body) => {
  const { data } = await api.put(`${[Modulo]Complete.ENDPOINT}/${id}`, body);
  return data;
};

export const delete[Modulo] = async (id: number) => {
  const { data } = await api.delete(`${[Modulo]Complete.ENDPOINT}/${id}`);
  return data;
};

export const restore[Modulo] = async (id: number) => {
  const { data } = await api.post(`${[Modulo]Complete.ENDPOINT}/${id}/restaurar`);
  return data;
};
```

### `lib/[modulo].interface.ts`
- Interfaces TypeScript usadas en todo el módulo
- **`[Modulo]Resource`** — el objeto individual que devuelve la API (el `Datum`)
- **`[Modulo]Response`** — alias de `PaginatedResponse<[Modulo]Resource>` para respuestas paginadas

```typescript
import type { PaginatedResponse } from "@/lib/core.interface";

export interface [Modulo]Resource {
  id: number;
  // ...campos del modelo
}

export type [Modulo]Response = PaginatedResponse<[Modulo]Resource>;
```

> La interfaz `PaginatedResponse<T>` y `PaginationLink` viven en `src/lib/core.interface.ts` y son reutilizadas por todos los módulos.

### `lib/[modulo].hook.ts`
- Hooks con `useQuery` de TanStack Query
- **Siempre** incluir `refetchOnWindowFocus: true`
- Llaman a las funciones de `[modulo].actions.ts`

```typescript
// Ejemplo — el hook recibe params como Record<string,string> para soportar filtros y paginación
export const use[Modulo]Query = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [[Modulo]Complete.QUERY_KEY, params], // params en queryKey = refetch automático al cambiar
    queryFn: () => get[Modulo]s(params),
    refetchOnWindowFocus: true,
  });
};
```

> Si la llamada no es paginada (sin `?page=`), el hook no recibe params y `queryFn` llama directo a la action sin argumentos.

---

## Registro del módulo

### 1. `src/router/index.tsx`
Importar la(s) Page(s) y agregar rutas usando `ABSOLUTE_ROUTE` del CompleteModel:

```typescript
import [Modulo]Page from "@/pages/[modulo]/pages/[Modulo]Page";
// Si tiene Add/Edit (>6 campos):
import [Modulo]AddPage from "@/pages/[modulo]/pages/[Modulo]AddPage";
import [Modulo]EditPage from "@/pages/[modulo]/pages/[Modulo]EditPage";

// En el JSX:
<Route path={[Modulo]Complete.ABSOLUTE_ROUTE} element={<ProtectedRoute><[Modulo]Page /></ProtectedRoute>} />
<Route path={[Modulo]Complete.ROUTE_ADD} element={<ProtectedRoute><[Modulo]AddPage /></ProtectedRoute>} />
<Route path={`${[Modulo]Complete.ROUTE_UPDATE}/:id`} element={<ProtectedRoute><[Modulo]EditPage /></ProtectedRoute>} />
```

### 2. `src/components/app-sidebar.tsx`
Agregar el módulo al array `data.navMain` usando el CompleteModel:

```typescript
import { [Modulo]Complete } from "@/pages/[modulo]/lib/[modulo].constants";

const data = {
  navMain: [
    { title: "Inicio", url: "/inicio", icon: LayoutGrid },
    {
      title: [Modulo]Complete.MODEL.plural ?? [Modulo]Complete.MODEL.name,
      url: [Modulo]Complete.ABSOLUTE_ROUTE,
      icon: [Modulo]Complete.ICON,
    },
  ],
};
```

---

## Componentes compartidos disponibles

Todos en `src/components/`:

| Componente | Uso |
|-----------|-----|
| `TitleComponent` | Header de página con title, subtitle, icon y children (ActionsWrapper) |
| `ActionsWrapper` | Contenedor flex para filtros y botones dentro del TitleComponent |
| `SimpleDeleteDialog` | Dialog de confirmación de eliminación (soft delete) |
| `ButtonAction` | Botón icono para columnas de tabla (acepta `canRender` para visibilidad condicional) |
| `FormInput` | Input de texto/número con label, tooltip, addons |
| `FormSelect` | Select tipo combobox con búsqueda |
| `FormSelectAsync` | Select con carga asíncrona de opciones |
| `FormSwitch` | Toggle booleano |
| `DatePicker` | Selector de fecha |
| `GeneralModal` | Modal responsivo (Dialog en desktop, Drawer en móvil) |
| `DataTable` | Tabla de datos con paginación/filtros |
| `PageWrapper` | Contenedor de página |
| `FormWrapper` | Contenedor de formulario (max-width, padding) |
| `BackButton` | Botón de navegación hacia atrás |
| `EmptyState` | Estado vacío para listados |

### `GeneralModal` — props principales

```typescript
<GeneralModal
  open={open}
  onClose={() => setOpen(false)}
  title="Título"
  mode="create" // 'create' | 'edit' | 'detail'
  icon="Users"  // nombre del icono Lucide
  size="md"     // 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'
>
  <[Modulo]Form mode="create" onSuccess={() => setOpen(false)} />
</GeneralModal>
```

---

## Checklist para crear un nuevo módulo

- [ ] Crear estructura de carpetas `src/pages/[modulo]/{pages,components,lib}`
- [ ] `[modulo].constants.ts` — definir CompleteModel
- [ ] `[modulo].interface.ts` — definir interfaces
- [ ] `[modulo].schema.ts` — definir schema Zod
- [ ] `[modulo].actions.ts` — implementar llamadas a API
- [ ] `[modulo].hook.ts` — implementar hooks con `refetchOnWindowFocus: true`
- [ ] `[Modulo]Columns.tsx` — definir columnas para DataTable
- [ ] `[Modulo]Filters.tsx` — implementar filtros
- [ ] `[Modulo]Buttons.tsx` — implementar botones de acción
- [ ] `[Modulo]Form.tsx` — implementar formulario
- [ ] Si ≤6 campos: `[Modulo]Modal.tsx` con `GeneralModal`
- [ ] Si >6 campos: `[Modulo]AddPage.tsx` y `[Modulo]EditPage.tsx`
- [ ] `[Modulo]Page.tsx` — unir todos los componentes
- [ ] Registrar ruta(s) en `src/router/index.tsx`
- [ ] Agregar entrada en `src/components/app-sidebar.tsx`
