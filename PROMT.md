Crea el módulo de Técnico siguiendo la arquitectura definida en ARCHITECTURE.md.

## Módulo

- Nombre singular: Técnico
- Nombre plural: Técnicos
- Ícono (Lucide): User
- URL: /tecnicos
- Endpoint base: https://develop.garzasoft.com:85/almacen-witlink/public/api/tecnicos

## Resource (respuesta de la API)

```json
{
      "id": 1,
      "cuadrilla_id": 1,
      "persona_id": 5,
      "created_at": "2026-02-27T16:12:14.000000Z",
      "updated_at": "2026-02-27T16:12:14.000000Z",
      "deleted_at": null,
      "cuadrilla": {
        "id": 1,
        "nombre": "Cuadrilla Zona Sur",
        "created_at": "2026-02-27T16:12:14.000000Z",
        "updated_at": "2026-02-27T16:12:14.000000Z",
        "deleted_at": null
      },
      "persona": {
        "id": 5,
        "nombre": "Luis",
        "apellido_paterno": "Quispe",
        "apellido_materno": "Huamán",
        "dni": "22334455",
        "direccion": "Jr. Huancavelica 150, Huancayo",
        "telefono": "944556677",
        "correo": "luis.quispe@example.com",
        "created_at": "2026-02-27T16:12:13.000000Z",
        "updated_at": "2026-02-27T16:12:13.000000Z",
        "deleted_at": null
      }
    }
```

```ts
interface RootObject {
  id: number;
  cuadrilla_id: number;
  persona_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  cuadrilla: Cuadrilla;
  persona: Persona;
}

interface Persona {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string;
  direccion: string;
  telefono: string;
  correo: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

interface Cuadrilla {
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
  "cuadrilla_id": 0,
  "persona_id": 0
}
```

```ts
interface RootObject {
  cuadrilla_id: number;
  persona_id: number;
}
```

### Editar

```json
{
  "cuadrilla_id": 0
}
```

```ts
interface RootObject {
  cuadrilla_id: number;
}
```
