Crea el módulo de Grupo de Menus y Opcion de Menu siguiendo la arquitectura definida en MEMORY.md.

## Módulo

- Nombre singular: Menu
- Nombre plural: Menu
- Ícono (Lucide): List
- URL: /menu
- Endpoint base: https://develop.garzasoft.com:85/almacen-witlink/public/api/grupo-menus y https://develop.garzasoft.com:85/almacen-witlink/public/api/opciones-menu

## Resource (respuesta de la API)

```json
[
  {
    "id": 0,
    "nombre": "string",
    "icono": "string",
    "orden": "string",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "deleted_at": "2019-08-24T14:15:22Z"
  }
]
```

```ts
interface RootObject {
  id: number;
  nombre: string;
  icono: string;
  orden: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
```

## Campos del formulario

### Crear

```json
{
  "nombre": "string",
  "icono": "string",
  "orden": 0
}
```

```ts
interface RootObject {
  nombre: string;
  icono: string;
  orden: number;
}
```

### Editar

```json
{
  "nombre": "string",
  "icono": "string",
  "orden": 0
}
```

```ts
interface RootObject {
  nombre: string;
  icono: string;
  orden: number;
}
```

### Adicional
La api que se usara para ver sus opciones
https://develop.garzasoft.com:85/almacen-witlink/public/api/grupo-menus/{id}/opciones-menu

```json
[
  {
    "id": 1,
    "nombre": "Dashboard",
    "ruta": "/dashboard",
    "orden": "1",
    "icono": "dashboard",
    "grupo_menu_id": 1,
    "created_at": "2026-03-08T20:28:27.000000Z",
    "updated_at": "2026-03-08T20:28:27.000000Z",
    "deleted_at": null
  },
  {
    "id": 2,
    "nombre": "Usuarios",
    "ruta": "/usuarios",
    "orden": "2",
    "icono": "people",
    "grupo_menu_id": 1,
    "created_at": "2026-03-08T20:28:28.000000Z",
    "updated_at": "2026-03-08T20:28:28.000000Z",
    "deleted_at": null
  }
]
```

```ts
interface RootObject {
  id: number;
  nombre: string;
  ruta: string;
  orden: string;
  icono: string;
  grupo_menu_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}
```

La idea es que en el modulo podamos listar los menu y ademas podamos crear las opciones de menu que es con las siguientes apis

### Crear

```json
{
  "nombre": "string",
  "ruta": "string",
  "icono": "string",
  "orden": "string",
  "grupo_menu_id": 0
}
```

```ts
interface RootObject {
  nombre: string;
  ruta: string;
  icono: string;
  orden: string;
  grupo_menu_id: number;
}
```

### Editar

```json
{
  "nombre": "string",
  "ruta": "string",
  "icono": "string",
  "orden": "string",
  "grupo_menu_id": 0
}
```

```ts
interface RootObject {
  nombre: string;
  ruta: string;
  icono: string;
  orden: string;
  grupo_menu_id: number;
}
```