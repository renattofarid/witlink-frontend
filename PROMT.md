Crea el módulo de Guia siguiendo la arquitectura definida en ARCHITECTURE.md.

## Módulo

- Nombre singular: Guia
- Nombre plural: Guias
- Ícono (Lucide): ClipboardList
- URL: /guias
- Endpoint base: https://develop.garzasoft.com:85/almacen-witlink/public/api/proveedores

## Resource (respuesta de la API)

```json
{
      "id": 1,
      "ruc": "20512345678",
      "razon_social": "Cisco Networks Perú S.a.c.",
      "telefono": "01-4567890",
      "direccion": "Av. Javier Prado Este 4200, San Isidro, Lima",
      "created_at": "2026-02-27T16:12:14.000000Z",
      "updated_at": "2026-02-27T16:12:14.000000Z",
      "deleted_at": null
    }
```

```ts
interface RootObject {
  id: number;
  ruc: string;
  razon_social: string;
  telefono: string;
  direccion: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}
```

## Campos del formulario

### Crear

```json
{
  "ruc": "stringstrin",
  "razon_social": "string",
  "telefono": "string",
  "direccion": "string"
}
```

```ts
interface RootObject {
  ruc: string;
  razon_social: string;
  telefono: string;
  direccion: string;
}
```

### Editar

```json
{
  "ruc": "stringstrin",
  "razon_social": "string",
  "telefono": "string",
  "direccion": "string"
}
```

```ts
interface RootObject {
  ruc: string;
  razon_social: string;
  telefono: string;
  direccion: string;
}
```
