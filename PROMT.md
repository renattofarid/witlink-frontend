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
  "id": 0,
  "sot": "string",
  "fecha": "string",
  "tipo": "string",
  "nombre_tipo": "Post Venta",
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "productos": [
    {
      "id": 0,
      "producto": {
        "id": 0,
        "sap": "string",
        "nombre": "string",
        "tipo": "string",
        "categoria": {
          "property1": null,
          "property2": null
        },
        "necesita_serie": 0,
        "necesita_mac": 0,
        "necesita_emta_mac": "string",
        "necesita_ua": 0,
        "material": {
          "id": 0,
          "producto_id": 0,
          "cantidad": "string",
          "created_at": "2019-08-24T14:15:22Z",
          "updated_at": "2019-08-24T14:15:22Z",
          "deleted_at": "2019-08-24T14:15:22Z",
          "almacen_id": 0
        },
        "series": [
          {
            "id": 0,
            "producto_id": 0,
            "serie": "string",
            "situacion": "string",
            "mac": "string",
            "ua": "string",
            "created_at": "2019-08-24T14:15:22Z",
            "updated_at": "2019-08-24T14:15:22Z",
            "almacen_id": 0,
            "emta_mac": "string"
          }
        ],
        "created_at": "2019-08-24T14:15:22Z",
        "updated_at": "2019-08-24T14:15:22Z"
      },
      "cantidad": "string",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "series": [
        {
          "serie": {
            "id": 0,
            "serie": "string",
            "situacion": "string",
            "mac": "string",
            "ua": "string",
            "producto": {
              "id": 0,
              "categoria_id": 0,
              "sap": "string",
              "nombre": "string",
              "tipo": "string",
              "created_at": "2019-08-24T14:15:22Z",
              "updated_at": "2019-08-24T14:15:22Z",
              "deleted_at": "2019-08-24T14:15:22Z",
              "origen": "string",
              "serie": 0,
              "mac": 0,
              "emta-mac": 0,
              "ua": 0
            },
            "created_at": "2019-08-24T14:15:22Z",
            "updated_at": "2019-08-24T14:15:22Z"
          },
          "observacion": "string",
          "created_at": "2019-08-24T14:15:22Z",
          "updated_at": "2019-08-24T14:15:22Z"
        }
      ]
    }
  ]
}
```

```ts
interface RootObject {
  id: number;
  sot: string;
  fecha: string;
  tipo: string;
  nombre_tipo: string;
  created_at: string;
  updated_at: string;
  productos: Producto3[];
}

interface Producto3 {
  id: number;
  producto: Producto;
  cantidad: string;
  created_at: string;
  updated_at: string;
  series: Series2[];
}

interface Series2 {
  serie: Serie;
  observacion: string;
  created_at: string;
  updated_at: string;
}

interface Serie {
  id: number;
  serie: string;
  situacion: string;
  mac: string;
  ua: string;
  producto: Producto2;
  created_at: string;
  updated_at: string;
}

interface Producto2 {
  id: number;
  categoria_id: number;
  sap: string;
  nombre: string;
  tipo: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  origen: string;
  serie: number;
  mac: number;
  'emta-mac': number;
  ua: number;
}

interface Producto {
  id: number;
  sap: string;
  nombre: string;
  tipo: string;
  categoria: Categoria;
  necesita_serie: number;
  necesita_mac: number;
  necesita_emta_mac: string;
  necesita_ua: number;
  material: Material;
  series: Series[];
  created_at: string;
  updated_at: string;
}

interface Series {
  id: number;
  producto_id: number;
  serie: string;
  situacion: string;
  mac: string;
  ua: string;
  created_at: string;
  updated_at: string;
  almacen_id: number;
  emta_mac: string;
}

interface Material {
  id: number;
  producto_id: number;
  cantidad: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  almacen_id: number;
}

interface Categoria {
  property1: null;
  property2: null;
}
```

## Campos del formulario

### Crear

```json
{
  "fecha": "2019-08-24",
  "sot": "string",
  "tipo": "P",
  "productos": [
    {
      "producto_id": 0,
      "origen": "claro",
      "necesita_serie": true,
      "necesita_mac": true,
      "necesita_emta_mac": true,
      "necesita_ua": true,
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
  fecha: string;
  sot: string;
  tipo: string;
  productos: Producto[];
}

interface Producto {
  producto_id: number;
  origen: string;
  necesita_serie: boolean;
  necesita_mac: boolean;
  necesita_emta_mac: boolean;
  necesita_ua: boolean;
  cantidad: number;
  series: Series[];
}

interface Series {
  serie_id: number;
  observaciones: string;
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