# Witlink — Guía de Funcionalidades del Sistema

> Documento dirigido al cliente. Describe todos los módulos disponibles, sus funcionalidades y las acciones que puede realizar desde cada pantalla.

---

## Índice

1. [Dashboard (Inicio)](#1-dashboard-inicio)
2. [Productos](#2-productos)
3. [Categorías](#3-categorías)
4. [Series](#4-series)
5. [Materiales](#5-materiales)
6. [Almacenes](#6-almacenes)
7. [Oficinas](#7-oficinas)
8. [Personas](#8-personas)
9. [Usuarios](#9-usuarios)
10. [Tipo de Usuario (Roles)](#10-tipo-de-usuario-roles)
11. [Cuadrillas](#11-cuadrillas)
12. [Menú de Navegación](#12-menú-de-navegación)
13. [Guías de Remisión](#13-guías-de-remisión)
14. [Equipos Retirados](#14-equipos-retirados)
15. [Despachos](#15-despachos)
16. [Traslados](#16-traslados)
17. [Inventario de Almacén](#17-inventario-de-almacén)
18. [Inventario de Técnico](#18-inventario-de-técnico)
19. [Kardex](#19-kardex)
20. [Liquidaciones](#20-liquidaciones)
21. [Generar Cargas](#21-generar-cargas)

---

## 1. Dashboard (Inicio)

El punto de partida del sistema. Al ingresar, usted ve de un vistazo el estado general de sus operaciones a través de **5 tarjetas de resumen**:

| Tarjeta | Qué muestra |
|---|---|
| Equipos en Almacén | Total de equipos disponibles en bodega |
| Equipos con Técnicos | Total de equipos actualmente asignados a técnicos |
| Materiales Disponibles | Stock de materiales en almacén |
| Ingresos Hoy | Cantidad de equipos o materiales ingresados en el día |
| Material Consumido | Total de material utilizado en liquidaciones |

Debajo de las tarjetas encontrará una **tabla de movimientos recientes** que muestra los últimos registros del sistema: fecha, producto, tipo de movimiento, cantidad, ubicación y serie.

---

## 2. Productos

El catálogo maestro de todos los productos del sistema, tanto materiales como equipos.

### ¿Qué puede hacer aquí?

- **Registrar un nuevo producto** con su nombre, código SAP (cuando el origen es Claro), tipo (Material o Equipo), origen, costo y si debe aparecer en los archivos de carga.
- **Configurar qué identificadores requiere cada equipo**: dependiendo del producto, puede definir si necesita número de serie, dirección MAC, EMTA MAC o UA. Estos campos aparecen automáticamente en los formularios de ingreso y despacho según esta configuración.
- **Editar** cualquier producto existente.
- **Eliminar** productos que ya no se usen.
- **Buscar** por nombre o código SAP, y **filtrar** entre Materiales y Equipos.

> **Nota**: El campo SAP solo aparece en el formulario cuando el origen del producto es **Claro**. Para productos de origen Witlink, este campo no es requerido.

---

## 3. Categorías

Agrupación lógica de los productos del catálogo.

### ¿Qué puede hacer aquí?

- **Crear** nuevas categorías con su nombre.
- **Editar** el nombre de una categoría existente.
- **Eliminar** categorías (el sistema permite recuperarlas si se eliminaron por error).
- **Restaurar** una categoría eliminada.
- **Buscar** por nombre.

---

## 4. Series

Registro individual de cada equipo ingresado al sistema. Cada serie representa una unidad física con su identificación única.

### ¿Qué puede hacer aquí?

- **Registrar una nueva serie** seleccionando el producto y completando los identificadores que ese producto requiere (serie, MAC, EMTA MAC, UA). El sistema muestra solo los campos que aplican según el producto elegido.
- **Eliminar** una serie del sistema.
- **Buscar y filtrar** con múltiples criterios:
  - Por número de serie, MAC, EMTA MAC, UA o nombre de producto
  - Por **situación**: Pendiente, Disponible, Despachado, Liquidado, Retirado o Devuelto
  - Por SAP o nombre del producto
  - **Ordenar** por cualquier campo (ID, serie, situación, MAC, etc.) en forma ascendente o descendente

> **Importante**: El campo MAC se valida automáticamente: acepta solo caracteres hexadecimales, los convierte a mayúsculas y tiene un máximo de 12 caracteres.

---

## 5. Materiales

Control del stock de materiales disponibles en almacén.

### ¿Qué puede hacer aquí?

- **Agregar stock** de un material seleccionando el producto y la cantidad disponible.
- **Editar** la cantidad de un material existente.
- **Eliminar** un registro de material (con opción de restaurarlo si fue un error).
- **Restaurar** registros eliminados.
- **Buscar** por nombre de material.

---

## 6. Almacenes

Gestión de los almacenes o bodegas donde se custodia el inventario.

### ¿Qué puede hacer aquí?

- **Registrar un nuevo almacén** con nombre, código y dirección.
- **Editar** los datos de un almacén existente.
- **Eliminar** almacenes que ya no se utilicen.
- **Buscar** por nombre.

---

## 7. Oficinas

Registro de las sedes u oficinas de la empresa.

### ¿Qué puede hacer aquí?

- **Crear** oficinas indicando nombre, ubigeo y dirección.
- **Editar** la información de una oficina.
- **Eliminar** oficinas (recuperables si se eliminaron por error).
- **Restaurar** oficinas eliminadas.
- **Buscar** por nombre.

---

## 8. Personas

Registro de todos los empleados o personas vinculadas al sistema: técnicos, administrativos, supervisores y demás roles.

### ¿Qué puede hacer aquí?

- **Registrar una persona** con sus datos completos: tipo de documento (DNI o Carnet de extranjería), nombre, apellidos, dirección, teléfono y correo.
- **Asignar tipo de empleado**: Sin tipo, Técnico, Administrativo, Supervisor de campo o Corporativo.
- **Asignar cuadrilla** (solo cuando el tipo es Técnico).
- **Editar** los datos de cualquier persona.
- **Eliminar** y **restaurar** personas.
- **Buscar** por nombre y **filtrar** por tipo de empleado.

---

## 9. Usuarios

Gestión de las credenciales de acceso al sistema. Cada usuario está vinculado a una persona, un rol y un almacén de referencia.

### ¿Qué puede hacer aquí?

- **Crear un nuevo usuario** seleccionando la persona, el tipo de usuario (rol), el almacén asignado, y definiendo su nombre de usuario y contraseña.
- **Crear personas, roles y almacenes directamente desde este formulario** sin salir de la pantalla (mediante botones de acceso rápido junto a cada campo).
- **Editar** los datos de un usuario (el campo contraseña es opcional al editar).
- **Eliminar** usuarios.
- **Buscar** por nombre de usuario.

---

## 10. Tipo de Usuario (Roles)

Define los perfiles de acceso del sistema. Cada tipo de usuario controla exactamente a qué secciones puede ingresar cada persona.

### ¿Qué puede hacer aquí?

- **Crear** nuevos tipos de usuario (roles) con su nombre.
- **Editar** el nombre de un rol.
- **Eliminar** y **restaurar** roles.
- **Configurar permisos de menú** por rol: desde un panel lateral puede ver todas las opciones de navegación del sistema agrupadas por sección, y activar o desactivar cada opción con un checkbox. Los cambios se aplican **de forma inmediata** sin necesidad de guardar.
- **Buscar** por nombre de tipo.

---

## 11. Cuadrillas

Agrupación de técnicos por equipos o grupos de trabajo.

### ¿Qué puede hacer aquí?

- **Crear** cuadrillas con su nombre.
- **Editar** el nombre de una cuadrilla.
- **Eliminar** y **restaurar** cuadrillas.
- **Buscar** por nombre.

---

## 12. Menú de Navegación

Administración de la estructura de navegación del sistema: qué menús existen y qué opciones contiene cada uno.

### ¿Qué puede hacer aquí?

- **Crear** menús de navegación con nombre, ícono y posición de orden.
- **Editar** y **eliminar** menús (con opción de restaurar).
- **Gestionar las opciones dentro de cada menú**: ver las opciones en formato visual, crear nuevas opciones indicando nombre, ruta, ícono y orden, o crearlas **de forma masiva** (varias opciones en una sola acción).
- **Editar opciones individuales** de cada menú.
- **Buscar** por nombre de menú.

---

## 13. Guías de Remisión

Vista central de todos los ingresos de mercadería al sistema. Consolida en una sola pantalla las **guías de remisión** y los **equipos retirados** para que tenga una trazabilidad completa de todo lo que entró al almacén.

### ¿Qué puede hacer aquí?

**Desde la tabla principal:**
- **Ver el listado** de guías y equipos retirados con: tipo de registro, número o SOT, fecha, almacén, motivo, usuario responsable, cantidad de materiales y series, y estado.
- **Ver el detalle** de una guía o equipo retirado.
- **Editar** una guía o equipo retirado existente.
- **Confirmar disponibilidad** de una guía que está en estado pendiente (la pone disponible en inventario).
- **Exportar a Excel** una guía específica o **todas las guías** que coincidan con los filtros activos.
- **Eliminar** y **restaurar** registros.

**Al crear o editar una guía:**
- Ingresar número de guía, fecha y adjuntar el **archivo PDF** de la guía física.
- Agregar los **productos de la guía** con su SAP, nombre, tipo, cantidad y observaciones.
- Registrar las **series individuales** de cada equipo, incluyendo MAC, EMTA MAC y UA según corresponda.
- El sistema **valida las series en tiempo real**: le avisa si un número de serie ya existe en el sistema o si está duplicado dentro del mismo formulario.

**Funcionalidades especiales:**
- **Generador automático de series**: para ingresos masivos, puede generar rangos de series de forma automática.
- **Vista de series por producto**: visualice en un modal todas las series ingresadas para un producto específico.
- **Draft automático**: si cierra la pantalla de creación de una guía a mitad de proceso, el sistema guarda automáticamente el borrador para que pueda retomarlo.

**Filtros disponibles:**
- Buscar por número de guía o SOT
- Filtrar por almacén o por equipos retirados
- Filtrar por rango de fechas

---

## 14. Equipos Retirados

Registro de los equipos que fueron retirados de clientes durante órdenes de servicio (SOT), ya sea por post venta, cambio u otro motivo.

### ¿Qué puede hacer aquí?

- **Registrar un retiro** indicando el número de SOT, fecha, tipo de retiro y los productos con sus respectivas series (incluyendo MAC, EMTA MAC, UA y observaciones).
- **Editar** un retiro existente: los datos generales en la cabecera y los productos o series de forma individual.
- **Eliminar** y **restaurar** registros.
- **Buscar** por número de SOT.

> **Nota**: Cuando en el modo edición se desea eliminar un producto que ya tiene series asociadas, el sistema muestra un aviso con el listado de series que se verán afectadas antes de confirmar la eliminación.

---

## 15. Despachos

Registro de la entrega de materiales y equipos desde el almacén hacia los técnicos. Cada despacho genera un número de documento automático y queda registrado con fecha, técnico responsable y detalle de lo despachado.

### ¿Qué puede hacer aquí?

**Desde la tabla principal:**
- **Ver el listado** de despachos con: número, fecha, almacén, técnico, usuario que lo registró, cantidad de productos y estado.
- **Ver el detalle completo** de un despacho.
- **Exportar a PDF** cualquier despacho.
- **Reasignar técnico**: permite transferir los materiales, series y movimientos de un despacho a un técnico diferente.
- **Eliminar** un despacho.

**Al crear un despacho:**
- Seleccionar el **técnico** destinatario.
- Agregar los **productos a despachar** con su cantidad y, en el caso de equipos, las series específicas.
- **Despacho masivo por series**: ingrese múltiples códigos de serie de una sola vez (uno por línea) y el sistema los asocia automáticamente a sus productos correspondientes.
- El borrador del formulario **se guarda automáticamente** si navega a otra pantalla, y se restaura al volver.

**Filtros disponibles:**
- Por número de despacho
- Por técnico
- Por rango de fechas (por defecto muestra desde el 1 de enero del año actual hasta hoy)

---

## 16. Traslados

Registro del movimiento de equipos y materiales entre almacenes. El almacén de origen es siempre el almacén del usuario que registra el traslado.

### ¿Qué puede hacer aquí?

**Desde la tabla principal:**
- **Ver el listado** de traslados con: número, fecha de envío, almacenes origen y destino, productos, cantidades, estado (Pendiente o Confirmado) y usuario que lo registró.
- **Exportar a PDF** cualquier traslado.
- **Confirmar un traslado**: esta acción solo está disponible para el usuario cuyo almacén sea el **destino** del traslado y mientras esté en estado Pendiente. Al confirmar, los materiales y equipos pasan al inventario del almacén destino.

**Al crear un traslado:**
- Seleccionar el **almacén destino**.
- El formulario tiene **dos pestañas independientes**:
  - **Series**: busque y agregue equipos por su número de serie. Si busca un código y hay un único resultado, se agrega automáticamente; si hay varios, el sistema le muestra la lista para elegir.
  - **Materiales**: busque materiales por nombre e indique la cantidad a trasladar.
- El borrador del formulario **se guarda automáticamente** al navegar fuera de la pantalla.

**Filtros disponibles:**
- Por producto o SAP
- Por número de serie
- Por rango de fechas
- Por almacén origen o destino
- Por estado (Pendientes / Confirmados)
- Por tipo de contenido (Equipos / Materiales)

---

## 17. Inventario de Almacén

Vista en tiempo real de todo el inventario disponible en el almacén. Presenta dos vistas separadas: una para equipos (por series individuales) y otra para materiales (por cantidad).

### Pestaña Equipos

**Columnas visibles**: Fecha de ingreso, guía asociada, código SAP, producto, número de serie, MAC, EMTA MAC, UA, ubicación actual, técnico asignado, personal, SOT, motivo, y situación.

**Desde la tabla puede:**
- **Ver el historial completo de movimientos** de cualquier serie en un panel lateral: todos los movimientos que tuvo esa unidad desde que ingresó al sistema.
- **Devolver una serie al almacén**: disponible cuando la serie está en situación "Despachada". Al confirmar, el equipo vuelve al stock disponible.

**Filtros disponibles**: por almacén (multi-selección), por nombre de producto o SAP, por estado de retiro (todos / retirados / no retirados), devoluciones, cliente, externos y técnicos.

### Pestaña Materiales

**Columnas visibles**: Fecha, SAP, producto, cantidad, ubicación, personal, SOT y motivo.

**Filtros disponibles**: por almacén, por nombre de material, por número de SOT, y por estado de retiro.

---

## 18. Inventario de Técnico

Vista dedicada del stock actual asignado a un técnico específico. Permite gestionar las devoluciones de lo que tiene a su cargo.

### ¿Qué puede hacer aquí?

- **Seleccionar un técnico** para ver su inventario actual.
- **Ver sus materiales asignados**: nombre del producto, SAP, cantidad y fecha de asignación.
- **Ver sus series asignadas**: nombre del producto, SAP, número de serie y fecha de asignación.
- **Devolver un material**: indicando la cantidad a devolver (entre 1 y el máximo disponible). Al completarse, el sistema genera un ID de devolución como comprobante.
- **Devolver una serie**: con una confirmación simple. El equipo vuelve al almacén disponible.
- **Ver el historial completo de devoluciones** del técnico seleccionado.
- **Filtrar** por técnico y por rango de fechas.

---

## 19. Kardex

Registro histórico e inmutable de todos los movimientos de productos a través del sistema: ingresos, salidas, devoluciones, liquidaciones y retiros.

### ¿Qué puede hacer aquí?

- **Consultar el historial** con: fecha, SAP, producto, tipo, movimiento, cantidad (positiva en verde para entradas, negativa en rojo para salidas), ubicación y serie.
- **Exportar a Excel** el resultado completo respetando todos los filtros aplicados.

**Filtros disponibles:**
- Por nombre de producto o SAP
- Por rango de fechas
- Por almacén
- Por tipo de movimiento: Ingreso, Devolución, Liquidación instalado, Liquidación retirado

---

## 20. Liquidaciones

Registro del cierre de las órdenes de servicio técnico (SOT). Documenta qué materiales y equipos se utilizaron en cada orden, qué técnicos participaron y el estado de la liquidación.

### ¿Qué puede hacer aquí?

**Desde la tabla principal:**
- **Ver el listado** de liquidaciones con: SOT, cliente (nombre y código), fecha, tipo de trabajo, estado operativo y estado de liquidación.
- **Ver el detalle** de una liquidación.
- **Editar** una liquidación existente.
- **Exportar a Excel** una liquidación específica.
- **Obtener el acta PDF** asociada a una SOT y visualizarla directamente en pantalla.

**Al crear o editar una liquidación:**
1. **Buscar por SOT**: ingrese el número de orden para que el sistema cargue automáticamente los datos de la orden.
2. **Seleccionar técnicos** involucrados (técnico principal y opcionalmente un segundo técnico).
3. **Agregar los productos utilizados** desde el inventario del técnico, incluyendo los equipos con sus series.
4. Ingresar **observaciones** relevantes.

**Funcionalidades adicionales:**
- **Importar liquidaciones masivamente** desde un archivo CSV.
- **Importar actas PDF**: cargue y visualice las actas de servicio directamente en el sistema.
- **Exportar** el listado de liquidaciones con filtros aplicados.

**Filtros disponibles:**
- Por número de SOT o nombre de cliente
- Por estado operativo: Atendida, Pendiente de validar, Rechazado, Reprogramado
- Por estado de liquidación: Liquidada o Pendiente

---

## 21. Generar Cargas

Herramienta para generar y descargar los **archivos de carga (.txt)** del inventario de técnicos, utilizados para sincronización con sistemas externos.

### ¿Qué puede hacer aquí?

- **Seleccionar un técnico** y generar su archivo de carga con un clic. El archivo se descarga automáticamente con el nombre del técnico.
- **Agregar técnicos a una lista de favoritos** para acceso rápido.
- **Generar archivos de todos los favoritos** en una sola acción desde el panel de favoritos.
- **Eliminar técnicos** de la lista de favoritos cuando ya no se necesiten.

---

## Consideraciones generales del sistema

| Característica | Detalle |
|---|---|
| **Eliminación segura** | La mayoría de los módulos cuenta con eliminación lógica (soft delete). Los registros eliminados no se pierden y pueden ser restaurados en cualquier momento. |
| **Borradores automáticos** | En los módulos de Guías, Despachos y Traslados, el sistema guarda automáticamente el trabajo en progreso si usted navega fuera del formulario. Al regresar, el borrador se restaura. |
| **Exportación** | Los módulos de Kardex, Guías, Liquidaciones, Despachos y Traslados permiten exportar los datos a Excel o PDF. |
| **Permisos por rol** | El acceso a cada módulo está controlado por el tipo de usuario. Solo verá en el menú los módulos que tiene habilitados según su rol. |
| **Validaciones en tiempo real** | Las series se validan contra el sistema al momento de ingresarlas, evitando duplicados sin necesidad de guardar primero. |
