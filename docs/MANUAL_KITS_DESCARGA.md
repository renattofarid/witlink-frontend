# Manual de usuario: Kits de descarga

## Objetivo

El módulo permite definir la composición estándar de materiales y equipos por tipo de trabajo, asociarla a una liquidación y comparar lo instalado contra lo esperado. También permite importar kits desde Excel y descargar reportes de control.

## Acceso

Ingrese a **Gestión → Kits de descarga**. La opción aparece únicamente cuando el backend ha asignado el permiso y el menú correspondiente al usuario. Las operaciones de mantenimiento de catálogos, kits e importación requieren permisos administrativos; los reportes dependen del rol configurado.

## 1. Crear y publicar un kit

1. En la pestaña **Kits**, seleccione **Nuevo kit**.
2. Seleccione el tipo de trabajo.
3. Complete modalidad, paquete, versión y vigencia cuando correspondan.
4. Agregue uno o más productos, indicando cantidad y unidad de medida. No repita el mismo producto dentro del kit.
5. Presione **Guardar borrador**.
6. Revise el kit en la tabla y use **Publicar** cuando la composición esté validada.

Un kit se crea como `BORRADOR`. Solo un kit `PUBLICADO` puede utilizarse para comparar liquidaciones. Un kit publicado puede desactivarse; el historial permite revisar sus cambios y estados.

## 2. Catálogos

La pestaña **Catálogos** permite administrar categorías y tipos de trabajo. Primero cree la categoría y luego el tipo de trabajo asociado. La tecnología del tipo de trabajo ayuda a identificar el kit correcto en los reportes.

## 3. Importar kits desde Excel

1. Abra la pestaña **Importar**.
2. Descargue la plantilla oficial.
3. Complete el archivo sin cambiar los encabezados ni el formato.
4. Seleccione el archivo `.xlsx` o `.xls`.
5. Presione **Validar archivo** y revise los errores informados.
6. Si la validación resulta válida, presione **Importar kits**.

La validación no guarda información. El sistema verifica el archivo antes de crear los kits y sus detalles. Si existen errores, corríjalos en el Excel y vuelva a validar.

## 4. Comparar una liquidación

Abra el detalle de una liquidación. En la sección **Kit de descarga** podrá:

- ver el kit asociado y el origen de la asociación;
- consultar productos conformes, excesos, menor consumo y productos fuera del kit;
- seleccionar un kit publicado y asociarlo a la liquidación;
- quitar la asociación cuando corresponda;
- actualizar la comparación.

La comparación muestra la cantidad estándar, la cantidad real, la diferencia y el resultado por producto. La asignación se realiza usando el identificador de la liquidación y queda validada por el backend.

## 5. Reportes y Excel

En **Reportes** filtre por SOT, tecnología, rango de fechas, resultado o mínimo de recurrencias. Presione **Consultar** para revisar los indicadores y el detalle. Use **Exportar Excel** para descargar exactamente los filtros aplicados.

Los resultados disponibles son:

- `Conforme`: el consumo coincide con el estándar.
- `Exceso`: se consumió más que lo definido.
- `Menor consumo`: se consumió menos que lo definido.
- `Fuera del kit`: el producto no está incluido en el kit asociado.

## Recomendaciones operativas

- Publique una nueva versión cuando cambie la composición; conserve la versión anterior para mantener trazabilidad.
- Valide la vigencia antes de asociar un kit a una liquidación.
- Revise los excesos y productos fuera de kit antes de cerrar el control operativo.
- No edite manualmente la plantilla descargada; mantenga sus columnas y nombres.
- Si aparece un error `403`, solicite al administrador el permiso del módulo. Si aparece `422`, revise los campos indicados por el backend.

## Requisitos de despliegue

El frontend necesita que el backend publicado incluya las rutas del documento **API - Módulo de kits de descarga**, el permiso del menú y los catálogos correspondientes. El módulo no inventa datos ni reemplaza las validaciones del backend; todos los cambios se confirman mediante la API.
