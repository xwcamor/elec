## v1.5.18
- Reorganiza la pantalla de Pruebas eléctricas en dos vistas independientes: Historial de ejecuciones y Evolución de las pruebas.
- El historial deja de mostrar estados manuales de Borrador/Completado; lista cada visita con sus ensayos, responsable y cantidad de datos registrados.
- Cambia las tarjetas de resumen para mostrar visitas, ensayos incluidos, tipos utilizados y última visita.
- Retira el selector manual de estado de cada ensayo; el valor interno se deriva de los campos mínimos requeridos.
- Incorpora guardado automático después de escribir, pegar desde Excel, añadir o quitar filas.
- Mantiene el formulario abierto después de guardar; el botón Guardar ahora fuerza el guardado sin salir del formulario.
- Los planes incompletos también se guardan y el indicador informa cuántos datos faltan. Al volver al historial se intenta completar el guardado pendiente; solo se pregunta antes de salir si la conexión impide guardar.
- Conserva valores internos BORRADOR/COMPLETADA en la base de datos por compatibilidad con registros anteriores; ya no son opciones del usuario.

## v1.5.17
- Ajusta el porcentaje de avance: un plan sin pruebas seleccionadas ya no puede mostrar 100% solo por tener completos los datos generales.

## v1.5.16
- Sincroniza indicadores y pendientes al agregar filas, pegar desde Excel y cambiar datos generales.
- Actualiza los recursos CSS y JavaScript con una nueva versión de caché para que el navegador reciba los colores y mensajes nuevos.

## v1.5.15
- Añade panel de avance general con porcentaje y lista dinámica de pendientes.
- Distingue estados por ensayo: sin datos, en curso, lista para revisar y completada.
- Colorea en verde los campos registrados, en ámbar los campos obligatorios pendientes y en gris los cálculos automáticos.
- Muestra el progreso de cada formulario y el estado de sus filas.
- Revisa campos mínimos por tipo de prueba y datos del instrumento (equipo, marca, modelo y serie).
- Evita marcar una prueba como completada cuando faltan campos mínimos o datos generales obligatorios.
- Al guardar un plan incompleto, informa que queda como borrador y cuántos pendientes conserva.
- Actualiza el estado en vivo al escribir, cambiar estados o pegar bloques desde Excel.

## v1.5.14
- Corrige la precarga de Protecciones propias según la hoja LAP: 18 verificaciones con accesorios, bornes, contactos, condición y ajustes de temperatura/nivel que aparecen en el Excel.
- Actualiza la caché del formulario de planes.

## v1.5.13
- El historial vuelve a cargar los planes después de guardar o actualizar uno.
- Las filas de resumen, filtros, tarjetas por tipo y estadísticas cuentan las pruebas contenidas en cada plan.
- El formulario de bushings toma los bornes marcados como capacitivos en la configuración eléctrica del transformador.
- La navegación antigua también oculta correctamente la nueva página de plan.
- Actualiza la caché de app.js y plan.js.

## v1.5.12
- Incorpora un plan por visita: fecha, responsable, supervisor y condiciones ambientales se ingresan una sola vez.
- Permite elegir varias pruebas y genera un formulario independiente por ensayo.
- Equipo, marca, modelo, serie, norma, estado y observaciones se registran por prueba.
- Ajusta los formularios al protocolo LAP: FP/capacitancia, aislamiento, devanados AT/BT, excitación, bushings, SFRA, pararrayos y protecciones.
- Precarga seis modos de FP, tres configuraciones de aislamiento, fases/taps de excitación, secciones AT/MT de pararrayos y contactos LAP de protecciones.
- Calcula relación TTR e índice de absorción; no calcula FP corregido ni variación de bushings donde el Excel no define fórmula.
- Guarda el plan dentro del JSON de la ejecución existente; no requiere tablas nuevas ni reimportar el esquema.
- Permite editar el plan completo y conserva apertura de registros históricos individuales.
- Añade pegado desde Excel por grilla.
## v1.5.11
- Elimina un bloque duplicado que había quedado después del cierre del módulo JavaScript.
- Retira la segunda declaración antigua del catálogo para conservar las 10 pruebas LAP desde el inicio.
- Valida la sintaxis del archivo JavaScript completo antes de publicar.

## v1.5.10
- Repara la expresión regular de reconstrucción de filas del protocolo; el archivo JavaScript vuelve a ser sintácticamente válido y puede abrir/editar ejecuciones específicas.

## v1.5.9
- Corrige el patrón de lectura del historial para reconstruir filas de plantillas específicas al editar una ejecución.
- El índice de absorción queda vacío mientras falte la lectura a 30 s o a 1 min; solo se calcula con ambas lecturas válidas.

## v1.5.8
- Amplía el catálogo a los protocolos presentes en el Excel LAP: FP del transformador, excitación, TTR, resistencia de devanados, aislamiento, bushings, SFRA, pararrayos y protecciones propias.
- Añade al aislamiento las tres configuraciones del protocolo y las lecturas a 15 s, 30 s, 45 s y 1 min.
- Calcula el índice de absorción como R(1 min) / R(30 s), tal como está en la hoja LAP.
- Añade campos LAP de resistencia de devanados AT/BT, corriente de excitación por fase, factor de potencia, bushings, pararrayos y SFRA.
- El historial muestra «Editar» de forma explícita; editar conserva el ID y actualiza esa ejecución en vez de crear otra.
- Retira el panel lateral duplicado del transformador en el formulario de ejecución y libera el ancho de trabajo.
- Sin cambios en la estructura de las tablas de ejecución: las plantillas siguen almacenadas en el payload de mediciones.
- El catálogo se sincroniza al abrir Pruebas eléctricas para bases de datos existentes, sin tener que reimportar el SQL.

## v1.5.7
- Elimina mensajes internos de conexión y referencias visibles a tablas de base de datos dentro de Configuración eléctrica.
- Cambia el menú lateral de cuatro pasos por una barra horizontal compacta y fija durante el desplazamiento.
- Amplía el área de trabajo y mantiene el desplazamiento horizontal dentro de las grillas de datos.
- Compacta y reorganiza los campos de bobinados para aprovechar el ancho disponible.
- Al agregar un bobinado, desplaza la vista hasta la nueva tarjeta y enfoca su nombre.
- Mantiene las advertencias visibles cuando realmente falta conexión o preparación del esquema.

## v1.5.6
- Corrige el mapeo del arreglo de conmutadores en `normalizeConfig`; el nombre de la propiedad de salida ahora apunta a la variable correcta.
- Evita que un `ReferenceError` durante la carga deje sin inicializar el estado y desactive los controles de configuración y nueva ejecución.

## v1.5.5
- Inicializa el estado eléctrico antes de registrar controles de navegación.
- Mueve las plantillas de pruebas específicas al bloque de inicialización para evitar accesos durante la TDZ.
- Registra la navegación delegada después de inicializar el módulo completo.
- Normaliza configuraciones nulas o con colecciones incompletas sin interrumpir la interfaz.
- Actualiza la versión del recurso JavaScript para invalidar la caché del navegador.

## v1.5.4
- Corrige el acceso prematuro a `localDateTime` al crear una nueva ejecución.
- Inicializa el estado compartido antes de registrar eventos para evitar el error de zona temporal muerta en Configuración eléctrica.
- Actualiza la guía de instalación, alcance y verificación del README.

## v1.4.0
- Copiar bobinados completos a portapapeles en formato TSV compatible con Excel.
- Copiar bornes y ficha de bushing con encabezados de columnas.
- Compatibilidad de copia con Clipboard API y alternativa para navegadores que no la ofrecen.
- Pegado TSV desde Excel mantiene columnas vacías y reconoce Sí/No para neutro y bushing.
- Al marcar «No» en bushing capacitivo, limpia los datos de ficha asociados para evitar información huérfana.
- Se mantienen botones de copiar posiciones de taps y pegado en grillas.
- Sin cambios de esquema SQL.

## v1.3.1
- Bobinados: el campo «¿Tiene neutro?» ahora es un selector explícito Sí/No.
- Bornes: el campo «¿Tiene bushing capacitivo?» ahora es un selector explícito Sí/No.
- Se conserva el almacenamiento booleano en la configuración y compatibilidad con valores anteriores.
- Pegado desde Excel acepta Sí/No, Si/No, Yes/No, 1/0, true/false y X.
- No requiere cambios ni reimportación de SQL.

## v1.3.0
- Panel de análisis histórico por transformador.
- Gráfico de ejecuciones mensuales (últimos 8 meses con actividad).
- Distribución de ejecuciones por tipo de prueba.
- Cálculo desde el historial existente; no mezcla unidades ni mediciones de distinta naturaleza.
- Sin cambios de esquema ni migración SQL.

## v1.2.0
- Se completan plantillas estructuradas para resistencia de devanados, resistencia de aislamiento, capacitancia, factor de potencia, excitación, bushings capacitivos y registro SFRA.
- Todas las plantillas admiten filas dinámicas, pegado TSV desde Excel y navegación con teclado.
- Los datos se guardan en `eh_test_execution_data` usando el payload de mediciones existente; no requiere migración.
- Se mantiene TTR y la grilla genérica para tipos futuros.
- No se automatizan cálculos, correcciones ni criterios de aceptación sin protocolo de referencia validado.

## v1.1.0
- Plantilla específica para Resistencia de devanados.
- Grilla con devanado, fase/borne, tap, corriente, resistencia, unidad, temperatura y observación.
- Pegado desde Excel y navegación por teclado.
- Persistencia dentro de la ejecución como mediciones estructuradas WR; sin migración SQL.
- No aplica fórmulas de corrección ni límites automáticos no validados.

## v1.0.0
- Se amplía Editar transformador con datos de placa: fases, frecuencia, aislamiento, refrigeración y observaciones.
- Se muestran los datos nominales resumidos en la ficha principal.
- Se valida la cantidad de fases (1 o 3) y que los valores numéricos de tensión, potencia y frecuencia sean positivos.
- La API informa qué campos no están disponibles en la tabla real configurada para evitar confirmar guardados incompletos.
- Sin cambios en el SQL: los campos adicionales ya están en el esquema base `transformers` del piloto.

## v0.9.0
- Botón Editar transformador abre un modal con datos principales de la ficha.
- Actualización de la tabla configurada `transformers` usando detección de columnas existentes y aliases comunes en español/inglés.
- API `transformer-update` valida el registro y devuelve la ficha actualizada.
- La vista principal actualiza sus datos sin recargar la página.
- No modifica la configuración eléctrica ni los registros de pruebas.

## v0.8.0
- Nueva plantilla específica para TTR con columnas Tap, relación teórica, medidas U/V/W y observaciones.
- Filas iniciales dinámicas basadas en `num_taps` y en las posiciones configuradas; permite agregar filas.
- Pegado de bloques desde Excel y navegación con teclado.
- Los valores TTR se guardan dentro de la ejecución fechada existente, sin sobrescribir otras fechas.
- Se conserva el editor genérico para las otras pruebas hasta validar sus protocolos.

## v0.7.0
- El SQL único ahora crea `transformers` si no existe, con campos de identificación, empresa, tensión, potencia, año, marca, conmutador, `num_taps`, grupo vectorial, fases, frecuencia, ubicación y datos de placa.
- Inserta dos registros de ejemplo basados en las capturas para probar selección, configuración y ejecuciones desde el primer inicio.
- `CREATE TABLE IF NOT EXISTS` no altera una tabla `transformers` que ya exista.
- La barra de estado muestra la base de datos, tabla y transformador activo.
- Documentación de instalación actualizada: volver a importar `database/schema.sql` para crear la tabla faltante.

## v0.6.0
- Corregida la búsqueda del transformador: ahora prioriza PK, código, tag, serie y busca en todas las columnas de texto detectadas, no solo las primeras 18.
- Barra visible de diagnóstico de conexión, base de datos, identificación del transformador y disponibilidad de tablas.
- API devuelve errores JSON claros y el cliente detecta respuestas PHP/HTML inesperadas.
- Validación de existencia del transformador antes de guardar configuración o ejecuciones.
- Se verifica la existencia de las tres tablas necesarias para historial de pruebas.
- Conserva el SQL único `database/schema.sql`; no requiere reimportarlo si ya existen todas las tablas.

## v0.5.0
- Eliminada la etiqueta “Próximamente” de los módulos deshabilitados.
- Grupo vectorial inicial Yd11 editable en configuración eléctrica.
- Navegación de respaldo para abrir Configuración eléctrica y Pruebas eléctricas.
- Caché de JavaScript invalidada con versión 0.5.0.

# Historial de versiones

## 0.3 — Registro de pruebas por fecha
- Añadido el panorama independiente de Pruebas eléctricas desde la ficha del transformador.
- Catálogo de las ocho pruebas, tarjetas de acceso, contadores e historial por transformador.
- Formulario de ejecución con fecha y hora del ensayo (editable, permite fechas pasadas), técnico, supervisor, instrumento, norma, temperaturas, humedad y observaciones.
- Cada ejecución se guarda con ID propio, tipo de prueba, fecha de realización y estado BORRADOR/COMPLETADA. Se permite editar una ejecución sin sobrescribir otras fechas o ejecuciones.
- Los datos capturados se guardan junto a la ejecución; configuración eléctrica vigente se referencia como snapshot.
- Grilla tipo Excel con filas dinámicas, pegado TSV desde Excel y navegación de celdas.
- El SQL inicial y la actualización incremental quedaron reunidos en el esquema completo del piloto (consolidado en v0.4).
- Se aclara que las columnas y cálculos específicos de cada protocolo se desarrollarán individualmente tras validar sus hojas fuente.

# Historial de versiones

## 0.2 — Configuración eléctrica ampliada
- Ampliada la ficha de bushings capacitivos con modelo, tensión de placa y notas.
- Añadida normalización de decimales con coma al pegar desde Excel.
- Mejorada navegación de la grilla con flechas, Enter, Tab y Shift+Tab, con filas automáticas.
- Sustituido el `prompt()` para generar posiciones de tap por un modal de la aplicación.
- Añadida comparación informativa con `transformers.num_taps`.
- Añadidas validaciones previas al guardado para bobinados, bornes y posiciones.
- Se conserva intacta la tabla `transformers` y el campo `num_taps`.

## 0.1 — Base del piloto
- Ficha visual inspirada en TR Health.
- Lectura dinámica de `transformers`.
- Configuración de bobinados, bornes, conmutadores y taps.
- Versionado de configuraciones.


## v0.4
- Navegación de Pruebas eléctricas y Configuración eléctrica convertida a botones para evitar el salto a `#`.
- Se deshabilitaron las secciones que no forman parte del piloto.
- Se añadió versión de caché a CSS/JS para forzar la descarga de los archivos actualizados.
- Las llamadas AJAX ahora resuelven `api.php` desde la carpeta real de instalación, incluso bajo `/pe/`.
- Se consolidó el esquema SQL en un único archivo: `database/schema.sql`.

## 1.5.0 — TTR calculado según protocolo LAP
- Se amplió la plantilla TTR con tensión nominal AT y BT por posición.
- Se implementó la relación teórica `V AT / (V BT × √3)` observada en la hoja `protocolos`.
- Se implementó la desviación por fase U/V/W: `(relación medida − relación teórica) × 100 / relación medida`.
- Los resultados calculados son de solo lectura y se recalculan al modificar entradas.
- Se conserva el pegado TSV desde Excel; las columnas calculadas se ignoran al pegar y se recalculan.
- Se guardan entradas y resultados calculados en el payload de la ejecución para conservar trazabilidad.
- No se añade aprobación automática ni tolerancias: el Excel revisado no sustenta un criterio general que podamos aplicar a todos los transformadores.
- No hay cambios de esquema SQL.

## 1.5.1
- Corregida la respuesta de los controles “Continuar a bobinados” y “Nueva ejecución” mediante delegación temprana de eventos.
- “Continuar a bobinados” ya no bloquea la navegación cuando todavía no hay bobinados; permite entrar y agregarlos desde esa pantalla.
- Actualizada la versión de caché del JavaScript.

## 1.5.2
- Se mueve la carga de `assets/app.js` al final del documento, después de todos los paneles y modales, para que los selectores y eventos se registren cuando el DOM esté completo.
- Se centraliza la atención de los controles de avance y nueva ejecución con delegación y manejo visible de errores.

## 1.5.3
- Corrige `Cannot access 'activeExecutionId' before initialization`: el estado mutable de ejecución se inicializa al principio del módulo, antes de registrar eventos delegados.
- Se aplica el mismo ajuste a `activeExecutionMode` y `activeSpecificCode`.
