Crea el módulo de Series siguiendo la arquitectura definida en MEMORY.md.

## Módulo

- Nombre singular: Serie
- Nombre plural: Series
- Ícono (Lucide): List
- URL: /serie
- Endpoint base: https://develop.garzasoft.com:85/almacen-witlink/public/api/series

## Resource (respuesta de la API)

```json
{
  "id": 40,
  "serie": "121",
  "situacion": "DI",
  "mac": "11111111111111111",
  "ua": "11111111111111111",
  "producto": {
    "id": 25,
    "categoria_id": 1,
    "sap": "RTR-ONT-GPON",
    "nombre": "Ont Gpon Huawei Hg8546m",
    "tipo": "equipo",
    "created_at": "2026-03-08T20:28:28.000000Z",
    "updated_at": "2026-03-08T20:28:28.000000Z",
    "deleted_at": null
  },
  "created_at": "2026-03-09T06:18:44.000000Z",
  "updated_at": "2026-03-09T06:18:44.000000Z"
}
```

```ts
interface RootObject {
  id: number;
  serie: string;
  situacion: string;
  mac: string;
  ua: string;
  producto: Producto;
  created_at: string;
  updated_at: string;
}

interface Producto {
  id: number;
  categoria_id: number;
  sap: string;
  nombre: string;
  tipo: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
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
