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

### Editar

```json
{
  "sot": "string",
  "tipo": "P",
  "fecha": "2019-08-24"
}
```

```ts
interface RootObject {
  sot: string;
  tipo: string;
  fecha: string;
}
```

### Adicional

La api para agregar series de equipo retirado
POST
https://develop.garzasoft.com:85/almacen-witlink/public/api/series-documento-equipo-retirado

```json
{
  "detalle_producto_documento_equipo_retirado_id": 0,
  "series": [
    {
      "serie_id": 0,
      "observaciones": "string"
    }
  ]
}
```

```ts
interface RootObject {
  detalle_producto_documento_equipo_retirado_id: number;
  series: Series[];
}

interface Series {
  serie_id: number;
  observaciones: string;
}
```

Y para eliminarla
DELETE
https://develop.garzasoft.com:85/almacen-witlink/public/api/series-documento-equipo-retirado/{serieId}/{detailProductId}

APIS para los productos de equipos retirados
POST
https://develop.garzasoft.com:85/almacen-witlink/public/api/productos-documento-equipo-retirado

```json
{
  "documento_equipo_retirado_id": 0,
  "productos": [
    {
      "producto_id": 0,
      "cantidad": 1,
      "series": [
        {
          "serie_id": 0,
          "observaciones": "string"
        }
      ]
    }
  ]
}
```

```ts
interface RootObject {
  documento_equipo_retirado_id: number;
  productos: Producto[];
}

interface Producto {
  producto_id: number;
  cantidad: number;
  series: Series[];
}

interface Series {
  serie_id: number;
  observaciones: string;
}
```

PUT
https://develop.garzasoft.com:85/almacen-witlink/public/api/productos-documento-equipo-retirado/{id}

Solo actualizamos la cantidad para productos que sean de tipo material

```json
{
  "cantidad": 0
}
```

```ts
interface RootObject {
  cantidad: number;
}
```

DELETE
Elimina un producto que esta retirado. Si el producto es un material, se actualiza el stock del material. Si el producto es serie, se eliminan las series asociadas
https://develop.garzasoft.com:85/almacen-witlink/public/api/productos-documento-equipo-retirado/{id}
Nota: Puedes forzar la eliminación de las series que estan asociadas al detalle de los productos. La primera llamada debería de ser sin forzar para que obtengas las series asociadas al detalle del producto de la guía. Si el producto de la guía es de tipo material, es decir no tiene series asociadas, entonces se eliminará aún si no se fuerza la eliminación.

forzar: boolean
