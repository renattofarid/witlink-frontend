Crea el módulo de Despachos siguiendo la arquitectura definida en MEMORY.md.

## Módulo

- Nombre singular: Despacho
- Nombre plural: Despachos
- Ícono (Lucide): List
- URL: /despachos
- Endpoint base: https://develop.garzasoft.com:85/almacen-witlink/public/api/despachos

## Filters

```ts
{
  tecnico_id!: integer
}
```

## Resource (respuesta de la API)

```json
{
  "id": 1,
  "usuario_id": 1,
  "tecnico_id": 1,
  "numero": "NUM-00001",
  "fecha": "2026-04-11",
  "created_at": "2026-04-11T04:19:41.000000Z",
  "updated_at": "2026-04-11T04:19:41.000000Z",
  "deleted_at": null,
  "almacen_id": 2
}
```

```ts
interface RootObject {
  id: number;
  usuario_id: number;
  tecnico_id: number;
  numero: string;
  fecha: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  almacen_id: number;
}
```

## Campos del formulario

### Crear

```json
{
  "tecnico_id": 0,
  "productos": [
    {
      "id": 0,
      "cantidad": 1,
      "series": [
        {
          "serie": "string"
        }
      ]
    }
  ]
}
```

```ts
interface RootObject {
  tecnico_id: number;
  productos: Producto[];
}

interface Producto {
  id: number;
  cantidad: number;
  series: Series[];
}

interface Series {
  serie: string;
}
```


## Adicional

https://develop.garzasoft.com:85/almacen-witlink/public/api/despachos/masivo-series

```json
{
  "tecnico_id": 0,
  "series": [
    "string"
  ]
}
```

```ts
interface RootObject {
  tecnico_id: number;
  series: string[];
}
```