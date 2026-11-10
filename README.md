# TR Health — Piloto de configuración eléctrica

Piloto en PHP + MySQL para Laragon. Versión 0.4: configuración eléctrica más registro histórico de ejecuciones con fecha y hora. Replica la ficha del transformador y el lenguaje visual de las capturas compartidas. Esta entrega incorpora el panorama **Pruebas eléctricas**, la cabecera de registro por ejecución fechada y la navegación limitada a las dos áreas disponibles en el piloto. Los formularios técnicos específicos de cada protocolo se desarrollarán individualmente en las siguientes fases.

## Incluye

- Barra superior, ficha del transformador, botones, iconos, panel de salud y menú lateral inspirados en la referencia.
- Búsqueda de transformadores en la tabla existente `transformers`.
- Autodetección de la clave primaria y de campos habituales (tag/código, cliente, tensión, potencia, año, marca, tipo de conmutador y grupo vectorial). La lectura del esquema original es dinámica.
- Configuración de cantidad de fases, grupo vectorial y frecuencia.
- Bobinados dinámicos: nombre, código, tensión, tipo de conexión, neutro y material.
- Bornes dinámicos por bobinado; identificación de fase, tipo y ficha del bushing (serie, fabricante, modelo, tensión, capacitancia, FP y notas).
- Uno o más conmutadores vinculados a un bobinado, con posiciones de tap dinámicas. La generación de filas usa un modal propio en lugar del prompt del navegador.
- Tablas editables tipo Excel: edición de celdas, navegación con flechas, Enter, Tab y Shift+Tab, pegado de bloques TSV desde Excel y copia de tabla. Los números pegados con coma decimal se normalizan antes de guardar.
- Versionado de la configuración. Cada guardado conserva una fotografía JSON de esa versión. Antes de guardar se validan códigos duplicados y asociaciones de conmutadores.
- Panorama de Pruebas eléctricas con catálogo de ocho pruebas y listado histórico por transformador.
- Registro individual de cada ejecución: fecha y hora real del ensayo, tipo, técnico, supervisor, equipo, referencia normativa, ambiente, observaciones y estado.
- Grilla común tipo Excel para capturar filas de mediciones y conservarlas por ejecución.
- La fecha de ejecución se puede fijar en el pasado; la fecha de creación del registro queda auditada aparte por MySQL.
- Snapshot de la configuración eléctrica utilizada al momento de registrar la ejecución.
- Modo demostración para visualizar la interfaz sin conexión a MySQL. Los datos de ejemplo no se guardan.

## Requisitos

- Laragon con Apache/Nginx, PHP 8.1+ y MySQL/MariaDB.
- Tu base de datos TR APP (o la base que contenga `transformers`).
- La tabla original debe llamarse `transformers` o se debe ajustar el nombre en `config/database.php`.

## Instalación en Laragon

1. Descomprime esta carpeta en `C:\laragon\www\tr-health-electrical-pilot`.
2. Abre `config/database.php` y coloca el nombre real de la base que contiene `transformers`. Por defecto está `tr_app_development`, usuario `root`, contraseña vacía (valores habituales de Laragon; confirmar en tu instalación).
3. Abre phpMyAdmin desde Laragon y selecciona ESA misma base de datos.
4. Importa únicamente `database/schema.sql` en la base de datos de TR Health. El archivo contiene todas las tablas del piloto y usa `CREATE TABLE IF NOT EXISTS`, por lo que también agrega las tablas faltantes si ya habías instalado una versión anterior.
5. Abre `http://localhost/tr-health-electrical-pilot/` (o `http://localhost/pe/` si instalaste la carpeta con el nombre `pe`).
6. Busca el transformador por código, tag o un valor identificable de su registro.
7. Abre **Configuración eléctrica**, completa los pasos y guarda.
8. Entra a **Pruebas eléctricas** para registrar cada ejecución con su fecha y mediciones. Las opciones de Cromatografía, Fisicoquímico, Furanos, Factor de Potencia y Bitácora quedan deshabilitadas durante el piloto.

### Importante sobre `transformers` y `num_taps`

- No se altera la tabla `transformers`.
- No se elimina ni cambia la columna `num_taps`.
- `num_taps` se detecta si existe y se usa como referencia para sugerir la cantidad de filas del conmutador.
- La tabla nueva `eh_tap_positions` guarda el detalle de cada tap: número, tensión, variación, neutro y observaciones. De esta forma el prototipo no depende de un máximo fijo de 20.
- Para mantener compatibilidad, las tablas nuevas usan `transformer_key` como texto que almacena la clave primaria real de `transformers`. No se impone una FK sobre la tabla preexistente, porque no se conoce todavía su tipo exacto ni su motor/esquema.

## Mapeo de columnas de `transformers`

El piloto inspecciona `SHOW COLUMNS` y busca nombres comunes. La clave primaria se obtiene con `SHOW KEYS`. Si tu tabla usa nombres inusuales, ajusta la lista de candidatos en `app/TransformerRepository.php`. Si la PK no se detecta bien, indica su columna en `config/database.php` → `transformers_primary_key`.

Campos detectados automáticamente (cuando existen):

| Dato visible | Posibles nombres |
|---|---|
| Código/tag | `tag`, `transformer_number`, `number`, `codigo`, `code`, `serial_number`, `serie`, `id` |
| Cliente | `company_name`, `customer_name`, `company`, `empresa`, `cliente`, `customer` |
| Tensión | `voltage_kv`, `tension_kv`, `voltage`, `tension`, `hv_voltage` |
| Potencia | `power_mva`, `potencia_mva`, `mva`, `power`, `potencia` |
| Año | `manufacturing_year`, `year_manufacture`, `year`, `anio_fabricacion` |
| Marca | `brand`, `marca`, `manufacturer`, `fabricante` |
| Conmutador | `tap_changer_type`, `tap_type`, `tipo_conmutador`, `conmutador` |
| Cantidad de taps | `num_taps`, `number_of_taps`, `cantidad_taps` |

No modifica registros ni columnas de `transformers`; consulta registros para mostrarlos y guarda la configuración eléctrica en tablas `eh_`.

## Comportamiento del editor tipo Excel

- Pega un rango de Excel con `Ctrl+V` estando enfocada la primera celda.
- Usa flechas para moverte entre celdas; `Enter` baja una fila y `Tab` avanza a la siguiente celda.
- Las posiciones de taps son filas normales de base de datos, no columnas ni campos `tap1...tap20`.
- La interfaz permite generar hasta 1,000 filas por operación para evitar bloqueos accidentales del navegador; la base de datos no tiene un límite fijo de 20 posiciones.
- Para columnas de booleanos, usa `Sí/No`, `1/0`, `true/false` o `x` al pegar.

## Decisiones funcionales de esta fase

1. Configuración en vista completa: hay varios bloques y tablas largas, por eso no se usa un modal enorme. Los modales pequeños se reservarán para acciones puntuales.
2. Cada bushing capacitivo está asociado al borne que lo porta. Sus datos de placa se capturan en la misma fila extendida del editor.
3. Cada bobinado conserva su propio tipo de conexión. El grupo vectorial se guarda aparte; el sistema no inferirá combinaciones de prueba solo por el grupo vectorial.
4. `num_taps` se mantiene como dato resumen legado; `eh_tap_positions` contiene los detalles por posición y por conmutador.
5. Cada prueba futura tendrá un registro en `eh_test_executions`, con fecha/hora y fotografía de la configuración empleada. Las mediciones específicas se guardarán en tablas de detalle conectadas por `execution_id`; las ejecuciones anteriores no se sobrescribirán.

## Cómo registrar una prueba por fecha (v0.4)

1. Desde la ficha del transformador entra a **Pruebas eléctricas**.
2. Pulsa **Nueva ejecución** o selecciona una tarjeta (TTR, capacitancia, FP, excitación, resistencia de devanados, aislamiento, SFRA o bushings).
3. En **Fecha y hora de la prueba** selecciona cuándo se realizó el ensayo. La fecha no se genera automáticamente como fecha de hoy sin posibilidad de cambio: se propone la fecha/hora actual como valor inicial, pero puedes registrar pruebas históricas.
4. Completa el responsable, supervisor, equipo de medición, condiciones ambientales y observaciones.
5. Registra las lecturas en la grilla y pulsa **Guardar registro**. Cada ejecución obtiene su propio ID y aparece en el historial, ordenada por fecha.
6. Abre una ejecución desde el historial para editarla. Editar actualiza ese ID; crear otra ejecución crea otro registro y conserva el anterior.

**Alcance de la grilla v0.4:** es un contenedor común para capturar y guardar datos por ejecución. No reemplaza todavía las plantillas técnicas específicas de cada protocolo; estas se crearán por separado para respetar columnas y fórmulas de tus Excel y protocolos, sin inventar límites.

## Novedades de la versión 0.2

- La ficha de cada bushing ahora permite registrar serie, fabricante, modelo, tensión de placa, capacitancia, factor de potencia y notas.
- Las grillas conservan los decimales con coma al pegar desde Excel y los normalizan para el almacenamiento numérico.
- `Generar filas` abre un modal propio, conserva los valores existentes y permite definir la cantidad de posiciones.
- El sistema muestra si el detalle de posiciones coincide con el valor de referencia `transformers.num_taps`; no altera ese campo.
- Se agregaron validaciones de códigos repetidos y de numeración de posiciones antes de guardar.

## Alcance pendiente (siguientes fases)

- Botón **Pruebas eléctricas** desde el panorama principal y su nueva vista.
- Crear plan, resumen de las ocho pruebas y formularios de protocolo.
- Aterrizar las fórmulas y límites contra los protocolos originales; las celdas con errores de Excel no se migrarán sin validación.
- Importación de archivos SFRA y curvas.
- Estadística de evolución por fecha, tap, fase, borne y prueba.
- Generación de informe PDF.

## Seguridad / despliegue

Es un piloto local, no una aplicación lista para producción. Antes de integrarlo: añadir autenticación/permisos del sistema anfitrión, CSRF, auditoría de cambios, validación de roles, copias de seguridad, restricciones de red y revisión de fórmulas por especialista. No publicar este directorio en internet sin esos controles.

## Vistas previas

La carpeta `docs/previews/` incluye imágenes de referencia de los pasos 01, 02 y 03 para revisar la distribución sin ejecutar Laragon. Las capturas de pasos 02 y 03 son ilustrativas y usan datos de ejemplo.

## Verificación de esta entrega

- Se verificó la sintaxis de todos los archivos PHP con `php -l`.
- Se verificó la sintaxis de `assets/app.js` con `node --check`.
- Se verificó la salida HTML del modo demostración.
- Se probaron cuatro casos de normalización numérica para datos pegados desde Excel, incluyendo coma decimal.
- La conexión real a MySQL y el guardado sobre tu tabla `transformers` deben comprobarse en tu Laragon, porque este entorno de construcción no tiene disponible el controlador PDO MySQL ni acceso a tu base local.


## Actualización v0.5.0
Reemplaza los archivos del proyecto por esta versión conservando `config/database.php`. No vuelvas a importar el SQL si ya instalaste el esquema v0.4: esta entrega corrige navegación y presentación, no cambia la estructura de datos. Recarga Chrome con Ctrl+F5 para invalidar caché.


## Actualización v0.6.0: guardado e historial
1. Reemplaza los archivos del proyecto por esta versión y conserva `config/database.php`.
2. Revisa que `database` apunte a la BD que realmente contiene `transformers` (por defecto `tr_app_development`).
3. Abre `/pe/` y revisa la barra de estado superior. Debe indicar **Base de datos conectada** y el transformador debe estar identificado.
4. Si aparece **Transformador no identificado**, escribe su código/tag en la búsqueda superior y selecciónalo. La nueva búsqueda prueba PK, código, tag, serie y columnas de texto de la tabla.
5. Si aparece **Faltan tablas del piloto**, importa una sola vez `database/schema.sql` en la misma BD indicada en la barra de estado.
6. Después de guardar una configuración, ve a **Pruebas eléctricas > Nueva ejecución**. Completa la fecha, tipo, responsable y mediciones; guarda. Cada ejecución queda en su propio ID e historial.

**Diagnóstico:** abre `http://localhost/pe/api.php?action=health` para ver qué base de datos y tabla está leyendo el piloto. No compartas públicamente credenciales ni volcados completos de la base de datos.


## v0.7.0: tabla `transformers` incluida
El error `Table 'tr_app_development.transformers' doesn't exist` significa que la base configurada no tenía la tabla que el piloto consulta. Esta versión resuelve el arranque del prototipo incluyendo en el único archivo `database/schema.sql`:
- La tabla `transformers` con campos de placa, empresa, tensiones, potencia, marca, año, `num_taps`, grupo vectorial, fases y ubicación.
- Dos registros de ejemplo (2001158 y 59606) basados en las capturas de referencia.
- Todas las tablas `eh_*` para configuración, versiones y ejecuciones fechadas.

**Instalación v0.7.0**
1. Reemplaza el proyecto por este ZIP. Conserva `config/database.php` si ya ajustaste usuario/clave.
2. Abre phpMyAdmin y selecciona `tr_app_development` (o la base que figure en `config/database.php`).
3. Vuelve a importar `database/schema.sql`. Es seguro para las tablas del piloto: usa `CREATE TABLE IF NOT EXISTS` e `INSERT IGNORE`; no borra datos existentes.
4. Abre `http://localhost/pe/`. El prototipo debe cargar el transformador de ejemplo 2001158. También puedes buscar 59606.
5. En Configuración eléctrica agrega al menos un bobinado y bornes, luego guarda. En Pruebas eléctricas crea una ejecución, registra fecha y mediciones y guarda.

**Nota de datos:** si `transformers` no existía, la tabla creada y sus dos filas son datos de demostración para validar el prototipo. No representan registros certificados ni sustituyen la tabla real de producción. Cuando integres el piloto, apunta `config/database.php` a la base que contenga tu tabla `transformers` real.


## v0.8.0: primera plantilla técnica TTR
En Nueva ejecución, al seleccionar **Relación de transformación**, aparece una grilla dedicada con Tap, relación teórica, mediciones U/V/W y observaciones. El número inicial de filas toma la mayor cantidad entre `transformers.num_taps` y las posiciones de taps configuradas. Se pueden agregar filas y pegar rangos desde Excel.
Los datos se guardan como mediciones de la ejecución con fecha. Se conservan el registro histórico y el resto de pruebas. La desviación porcentual todavía no se calcula automáticamente: debe validarse la fórmula del protocolo aplicable antes de automatizarla.


## v0.9.0: edición de datos principales
El botón **Editar transformador** abre un modal para editar TAG/código, nombre, empresa, tensión, potencia, año, marca, tipo de conmutador, número de taps, grupo vectorial y ubicación. Guarda en la tabla `transformers` ya configurada en `config/database.php`, detectando los nombres de columnas habituales en español e inglés. No cambia bobinados, bornes, taps detallados ni ejecuciones históricas. No requiere importar SQL.


## v1.0.0: ampliación de datos de placa
El modal de edición incorpora número de fases, frecuencia nominal, tipo de aislamiento, tipo de refrigeración y observaciones. Estos datos se guardan en las columnas existentes de la tabla `transformers` cuando están disponibles. La ficha principal presenta fases, Hz, aislamiento y refrigeración. La edición no modifica la configuración detallada (`eh_electrical_configs`) ni las ejecuciones históricas. No requiere importar SQL.


## v1.1.0: resistencia de devanados
Se añade una plantilla de captura independiente para `WINDING_RESISTANCE`. Los valores se guardan en el payload de la ejecución existente, identificados por `WR|fila|campo`; no requiere modificar ni importar `database/schema.sql`. La plantilla registra los datos tal como se midieron y no calcula compensación por temperatura, estabilidad ni criterios de aceptación sin un protocolo de referencia validado.


## v1.2.0: plantillas de pruebas eléctricas
Se incluyen grillas dedicadas para:
- Resistencia de devanados: devanado, fase/borne, tap, corriente, resistencia, unidad y temperatura.
- Resistencia de aislamiento: terminales, tensión, tiempo, lectura y temperatura.
- Capacitancia: punto, conexión, tensión, capacitancia y frecuencia.
- Factor de potencia: punto, modo, tensión, capacitancia, FP, factor de disipación y corriente.
- Excitación: devanado, fase, tap, tensión, corriente y potencia.
- Bushings: borne, serie, modo, capacitancia, FP y tensión.
- SFRA: devanado, fase, conexión, rango de frecuencia, puntos y referencia del archivo exportado.

Las plantillas almacenan datos como mediciones con claves internas prefijadas y filas numeradas dentro del JSON existente de cada ejecución. No requieren cambiar `database/schema.sql`. Para SFRA se registra la referencia del archivo exportado; la carga y análisis de archivos de curvas queda pendiente de una fase específica.


## v1.3.0: análisis histórico
En la sección Pruebas eléctricas se muestra un panel de evolución mensual y distribución por tipo. Los indicadores cuentan ejecuciones guardadas en `eh_test_executions`; no agregan valores físicos incompatibles. No requiere SQL adicional.


## v1.3.1: indicadores Sí/No en bobinados y bornes
En cada bobinado, `¿Tiene neutro?` se presenta como selector Sí/No. En cada borne, `¿Tiene bushing capacitivo?` también se presenta como selector Sí/No. El estado se conserva como booleano en el modelo; el pegado desde Excel reconoce valores afirmativos y negativos. Al marcar que un borne tiene bushing, se pueden completar los campos de identificación y datos de placa del bushing. No requiere SQL.


## v1.4.0: copiar y pegar
- `Copiar bobinados` copia una tabla TSV con encabezados y los datos generales de cada bobinado.
- `Copiar bornes` copia los bornes y su ficha de bushing capacitivo, también con encabezados.
- En las grillas de bornes y taps, pega directamente desde Excel con Ctrl+V o menú contextual. El pegado es por columnas, conserva celdas vacías y acepta Sí/No en los campos booleanos.
- La copia usa Clipboard API y fallback compatible con navegadores sin `navigator.clipboard.writeText`.

### TTR — cálculo de relación y desviación (v1.5.0)
La plantilla TTR solicita por toma las tensiones nominales AT y BT en kV, además de las relaciones medidas U, V y W. Calcula la relación teórica como `V_AT / (V_BT × √3)` y la desviación de cada fase como `(R_medida − R_teórica) × 100 / R_medida`, reproduciendo las fórmulas visibles en la hoja `protocolos` del Excel LAP revisado. Los cálculos se muestran como campos de solo lectura y se guardan junto con las entradas. No se determina aprobación/rechazo ni se aplican tolerancias automáticamente.

Versión 1.5.2: corrección de navegación y apertura de nueva ejecución.
