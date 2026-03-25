Crea el módulo de Materiales siguiendo la arquitectura definida en MEMORY.md.

## Módulo

- Nombre singular: Material
- Nombre plural: Materiales
- Ícono (Lucide): List
- URL: /materiales
- Endpoint base: https://develop.garzasoft.com:85/almacen-witlink/public/api/materiales

## Resource (respuesta de la API)

```json
{
  "id": 24,
  "producto": {
    "id": 24,
    "categoria_id": 8,
    "sap": "HER-SILICON",
    "nombre": "Silicona Selladora",
    "tipo": "consumible",
    "created_at": "2026-03-08T20:28:28.000000Z",
    "updated_at": "2026-03-08T20:28:28.000000Z",
    "deleted_at": null,
    "categoria": {
      "id": 8,
      "nombre": "Herramientas De Instalación",
      "created_at": "2026-03-08T20:28:27.000000Z",
      "updated_at": "2026-03-08T20:28:27.000000Z",
      "deleted_at": null
    }
  },
  "cantidad": "80.00",
  "created_at": "2026-03-08T20:28:28.000000Z",
  "updated_at": "2026-03-08T20:28:28.000000Z"
}
```

```ts
interface RootObject {
  id: number;
  producto: Producto;
  cantidad: string;
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
  categoria: Categoria;
}

interface Categoria {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}
```

## Campos del formulario

### Crear

```json
{
  "producto_id": 0,
  "cantidad": 0.01
}
```

```ts
interface RootObject {
  producto_id: number;
  cantidad: number;
}
```

### Editar

```json
{
  "producto_id": 0,
  "cantidad": 0.01
}
```

```ts
interface RootObject {
  producto_id: number;
  cantidad: number;
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
