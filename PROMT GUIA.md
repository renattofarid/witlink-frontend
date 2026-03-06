Crea el módulo de Guia siguiendo la arquitectura definida en ARCHITECTURE.md.

## Módulo

- Nombre singular: Guia
- Nombre plural: Guias
- Ícono (Lucide): ClipboardList
- URL: /guias
- Endpoint base: https://develop.garzasoft.com:85/almacen-witlink/public/api/guias

## Campos del formulario

### Crear

```json
{
  "numero": "string",
  "fecha": "2019-08-24T14:15:22Z",
  "proveedor_id": 0,
  "productos": [
    {
      "producto_id": 0,
      "categoria_id": 0,
      "sap": "string",
      "nombre": "string",
      "tipo": "consumible",
      "cantidad": 1,
      "observaciones": "string",
      "series": [
        {
          "serie": "string",
          "mac": "stringstringstrin",
          "ua": "stringstringstrin",
          "observaciones": "string"
        }
      ]
    }
  ]
}
```

```ts
interface RootObject {
  numero: string;
  fecha: string;
  proveedor_id: number;
  productos: Producto[];
}

interface Producto {
  producto_id: number;
  categoria_id: number;
  sap: string;
  nombre: string;
  tipo: string;
  cantidad: number;
  observaciones: string;
  series: Series[];
}

interface Series {
  serie: string;
  mac: string;
  ua: string;
  observaciones: string;
}
```

### Editar

```json
{
  "nombre": "string"
}
```

```ts
interface RootObject {
  nombre: string;
}
```

## Resource (respuesta de la API)

```json
{
  "id": 1,
  "nombre": "Routers Y Módems",
  "created_at": "2026-02-27T16:12:14.000000Z",
  "updated_at": "2026-02-27T16:12:14.000000Z",
  "deleted_at": null
}
```

```ts
interface RootObject {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}
```
