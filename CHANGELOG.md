## 1.5.46
- El botón de salida de Pruebas eléctricas ahora dice «Volver al transformador».
- El Resumen elimina el banner explicativo y muestra un bloque de registros que requieren atención, con acceso directo para abrirlos.
- Distingue Pendiente (el ensayo ya tiene mediciones, observaciones o datos de equipo, pero no está completo) de Borrador (sin datos de ensayo).
- El resumen conserva cuatro indicadores principales: registros guardados, completos, pendientes y borradores; la fecha del último registro permanece como dato discreto.
- La API incluye un indicador de datos iniciados por ensayo para clasificar correctamente los registros guardados.
## 1.5.45
- El Resumen reemplaza «Ensayos incluidos» y «Tipos utilizados» por contadores de registros Completos, Pendientes y Borradores.
- Conserva el total de registros y la fecha del último registro.
- Sustituye las referencias a visitas por registros y jornadas en el mensaje informativo del Resumen.
- Actualiza los identificadores de caché de CSS y JavaScript.

## 1.5.44
- Renombra el historial como «Pruebas eléctricas registradas» y reemplaza las referencias a visitas por registros de pruebas.
- Cambia «Datos registrados» por «N.º de pruebas», que muestra el número de ensayos incluidos en cada registro.
- Actualiza los identificadores de caché de CSS y JavaScript.

## 1.5.43
- En el Historial, «Datos registrados» muestra únicamente la cantidad de pruebas y queda inmediatamente después de «Pruebas incluidas».
- Retira el identificador «Ejecución #...» debajo de la fecha de visita.
- Actualiza los identificadores de caché de CSS y JavaScript.

# CHANGELOG

## 1.5.42
- La vista Resumen, Historial y Gráfico de Pruebas eléctricas utiliza modo de enfoque, igual que Configuración y los formularios de planes: oculta la ficha general del transformador y libera el ancho de trabajo.
- Al volver a Detalles se restablece la ficha del transformador; al abrir Configuración o los formularios se conserva su modo de enfoque independiente.

## 1.5.41
- Añade columna Estado calculada en el historial: Completo, Incompleto o En borrador, sin crear columnas ni modificar registros en MySQL.
- Añade filtro de historial por estado y mantiene el filtro de texto por prueba y responsable.

## 1.5.40
- Corrige iteraciones DOM en las pestañas, acciones del historial y lectura de celdas de ensayos; evita que la navegación se interrumpa antes de consultar la API.

## 1.5.39
- Actualiza los identificadores de caché de CSS y JavaScript a 1.5.39 para evitar que el navegador reutilice recursos antiguos y mantener sincronizada la carga del historial.

## 1.5.38
- El paso «Resultados por ensayo» bloquea el avance al resumen mientras exista al menos un ensayo con campos obligatorios o filas incompletas.
- Al intentar continuar, se enfoca automáticamente el primer ensayo pendiente y se informa el primer dato faltante.
- El guardado automático de borradores se mantiene activo para no perder avances incompletos.

# CHANGELOG

## 1.5.37
- El historial consulta primero los registros guardados y ya no depende de que el catálogo de ensayos responda.
- Al abrir la pestaña Historial se vuelve a consultar MySQL, evitando mostrar una lista local desactualizada.
- Se conserva el último resultado visible si falla una consulta y se muestra el error real en vez de indicar falsamente que no existen registros.
- La API devuelve el transformador consultado y el total de filas para facilitar el diagnóstico.
- El listado mantiene el orden por fecha de visita descendente y desempata por ID.

# CHANGELOG

## 1.5.36
- Reemplaza el selector desplegable de ensayos por un catálogo visible de casillas de verificación.
- Permite agregar y quitar varios ensayos directamente desde la selección, con actualización automática del plan.
- Indica visualmente qué ensayos están seleccionados y el total elegido.

## v1.5.35
- Completa el formulario individual de bushings con el resultado calculado de capacitancia.
- Normaliza claves históricas de resistencia, factor de potencia, excitación, bushings y pararrayos para mostrarlas en las columnas LAP nuevas.
- Actualiza la versión de caché de app.js y plan.js.

## v1.5.34
- Alinea formularios de plan y ejecución individual con los protocolos LAP.
- Elimina unidades no declaradas y campos de resultado ajenos a ciertos encabezados.
- Retira corrientes de muestra como defaults y bornes no configurados.
- Mantiene alias de campos antiguos para que registros históricos sigan visibles.
- Conserva el cálculo de variación de capacitancia de bushings (<5%) sin inventar umbral de FP.
- Corrige el stepper de cuatro etapas y compacta grillas de captura.
- Usa «Ejecuciones» en el historial.

# CHANGELOG

## 1.5.33
- Verifica la persistencia de la configuración eléctrica mediante una lectura posterior a la escritura en MySQL.
- Comprueba todas las tablas requeridas antes de habilitar o ejecutar el guardado de configuración.
- Expone el detalle técnico de errores API para facilitar el diagnóstico en Laragon.
- Actualiza la versión de recursos para evitar que el navegador conserve JavaScript anterior en caché.

## v1.5.32
- Alinea las plantillas de TTR, factor de potencia, excitación, resistencia de devanados, aislamiento, bushings, SFRA, pararrayos y protecciones con los campos visibles en el libro LAP.
- Retira campos no presentes en las tablas LAP principales y evita forzar unidades que el encabezado no especifica para las salidas del pararrayos.
- Mantiene capacitancia independiente como ensayo complementario: en LAP aparece dentro de los bloques de factor de potencia y bushings, no como protocolo separado.
- Deja opcionales los metadatos de equipo por ensayo para que no bloqueen el registro de mediciones.
- Convierte el plan en un asistente de cuatro etapas y muestra una sola tarjeta de ensayo a la vez; añade resumen, selector de ensayo y navegación.
- Compacta grillas y controles; conserva al volver a guardar claves de mediciones antiguas que ya no se muestran en los formularios.
- Cambia «Nueva visita» por «Registrar pruebas» y actualiza versión de caché y documentación.

## v1.5.31
- Incorpora en el topbar un selector para cambiar de transformador sin volver al buscador.
- Añade «Crear trafo» en la barra superior y reutiliza el formulario técnico de alta/edición.
- La creación escribe únicamente columnas reconocidas en la tabla configurada, respeta valores por defecto y genera la clave primaria cuando la tabla requiere un ID manual.
- Después de crear, selecciona el nuevo transformador y carga su configuración eléctrica e historial asociados.
- Añade el listado de transformadores y la acción de alta en la API; no requiere cambios en el esquema SQL.

## v1.5.30
- Retira el nombre de la empresa de las referencias a la base de protocolos; la interfaz ahora habla de protocolo u hoja de referencia.
- Añade la acción Eliminar en el historial de Pruebas eléctricas para borrar una visita completa.
- La eliminación pide confirmación, valida que el registro pertenezca al transformador seleccionado y elimina sus mediciones asociadas mediante la relación en cascada.
- Actualiza la lista de verificación y la documentación a la versión 1.5.30.

## v1.5.29
- Configuración eléctrica deja de colorear el botón del menú: muestra solo «!» rojo si no está configurada o ámbar si está incompleta; al completarse desaparece el indicador.
- Pruebas eléctricas evita añadir el mismo tipo de ensayo más de una vez por visita; la validación también se aplica al guardar en el servidor.
- Al abrir/editar un plan histórico con ensayos repetidos, reúne sus mediciones en un único formulario por tipo para conservar los datos.
- El formulario de visita oculta la ficha superior del transformador y presenta un Stepper de tres etapas con estados de color y navegación a cada sección.
- Actualiza la versión de caché de los recursos a 1.5.29.

## v1.5.28
- Hace opcional el listener del botón inferior de guardado, que ahora se oculta para evitar duplicar la acción principal.

## v1.5.27
- Reorganiza Pruebas eléctricas en tres vistas: Resumen, Tabla y Gráfico.
- El Resumen reduce los accesos visibles a una sola acción principal: Nueva visita.
- La selección de ensayos en un plan pasa de una cuadrícula de botones a un selector compacto.
- Los datos ambientales, de supervisión, instrumento y observaciones se agrupan en secciones opcionales plegadas.
- Los formularios de cada ensayo se presentan como paneles desplegables; solo se abre el primero por defecto.
- Rediseña Configuración eléctrica con los cuatro pasos en una barra horizontal, formularios más sobrios y una sola acción principal de guardado.
- Añade microinteracciones rápidas y accesibles: feedback de pulsación, transición breve entre paneles y soporte para movimiento reducido.

## v1.5.26
- En bushings separa «Evaluación FP» (manual, sin umbral inventado) de «Resultado capacitancia» (automático por variación menor a 5%).
- El FP de placa y el FP medido son datos obligatorios para conservar la comparación completa del protocolo.

## v1.5.25
- Factor de potencia ya no exige capacitancia en cada modo: el Excel de referencia solo contiene valores de capacitancia para CL+CLH, CL y CLH.
- Colorea los resultados automáticos de TTR y bushings según estén correctos/conformes, observados o pendientes.

## v1.5.24
- Los formularios incorporan un campo Resultado/Evaluación obligatorio; en ensayos sin umbral explícito, la evaluación queda a cargo del técnico.
- TTR calcula relación teórica, errores por fase y resultado CORRECTO/FUERA DE TOLERANCIA usando ±0,5%.
- Bushings calcula variación absoluta entre capacitancia medida y de placa y marca CONFORME cuando es menor a 5%.
- Resistencia de devanados solicita el resultado del comparativo entre fases (≤5%) sin inventar una fórmula que el Excel no documenta.
- Retira el límite erróneo de FP <1%; el protocolo de referencia registra seis modos y FP corregido, pero no define ese umbral.
- Añade notas para diferenciar evaluaciones manuales y criterios numéricos presentes en la referencia técnica.

## v1.5.23
- Al abrir Configuración eléctrica, la interfaz pasa a un modo independiente: oculta la barra superior, la ficha general, las pestañas del transformador y el resto del módulo.
- Se retira el bloque técnico de conexión que mostraba «Base de datos conectada», base de datos, tabla y código del transformador.
- Se eliminan de la ficha los botones Exportar, Compartir, Eliminar y Bloquear; se conserva Editar transformador.
- Pruebas eléctricas queda bloqueada hasta guardar una configuración eléctrica; el acceso muestra candado en lugar de etiquetas de estado y no muestra «Disponible» cuando está habilitado.

## v1.5.22
- Al cambiar de transformador, recarga también los valores visibles de datos generales para que los indicadores de los pasos correspondan al transformador seleccionado.
- Un bobinado solo se marca completo si tiene nombre, código, tensión nominal, conexión y bornes identificados con fase.
- Si el transformador tiene tipo o número de taps en sus datos de placa, el paso de conmutadores ya no se muestra como "No aplica" cuando aún no está configurado.
- Los indicadores rojos distinguen los bobinados pendientes o con identificadores duplicados.

## v1.5.21
- Retira las etiquetas visibles de estado en las tarjetas de cada prueba y en el selector de ensayos; conserva el porcentaje de campos mínimos y las alertas de datos faltantes.
- La misma vista simplificada se aplica al crear una visita nueva y al editar una existente.
- Elimina el texto "Formato de referencia" de las tarjetas de selección de prueba y lo reemplaza por "Datos de ensayo".
- Colorea los números de los pasos de Configuración eléctrica según su avance: verde completo, ámbar pendiente/incompleto, rojo cuando faltan bobinados y gris cuando los taps no aplican.
- Añade una etiqueta breve bajo cada paso: Completo, Revisar datos, Agregar bobinados, No aplica o Listo para revisar.
- Los indicadores se actualizan al editar los campos, agregar/quitar bobinados o taps, abrir la configuración y guardar.
- Evita sugerir Yd11 automáticamente cuando no existe un grupo vectorial registrado; el campo queda vacío hasta que se confirme.

## v1.5.20
- La ficha del transformador se mantiene como cabecera común al navegar por el piloto; no se duplica dentro de Pruebas eléctricas.
- El acceso a Configuración eléctrica muestra un indicador rojo "Sin configurar" hasta que exista una versión guardada con al menos un bobinado.
- Pruebas eléctricas queda realmente deshabilitada si no existe configuración eléctrica guardada o si faltan las tablas del módulo.
- La navegación del módulo y la creación/edición de planes validan también el prerrequisito, no solo el aspecto del botón.
- Al guardar correctamente la configuración, se actualizan el estado del sidebar y el acceso a Pruebas eléctricas inmediatamente.
- Al cambiar de transformador, el estado de acceso se recalcula con la configuración propia de ese registro.

## v1.5.19
- Quita el selector de estado también del formulario legado de una sola prueba.
- Antes de cambiar a Configuración, Inicio o Pruebas desde el menú, intenta guardar los cambios pendientes del plan actual.
- Si el guardado falla, solicita confirmación antes de abandonar el formulario.

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
- Corrige la precarga de Protecciones propias según la hoja de referencia: 18 verificaciones con accesorios, bornes, contactos, condición y ajustes de temperatura/nivel que aparecen en el Excel.
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
- Ajusta los formularios al protocolo de referencia: FP/capacitancia, aislamiento, devanados AT/BT, excitación, bushings, SFRA, pararrayos y protecciones.
- Precarga seis modos de FP, tres configuraciones de aislamiento, fases/taps de excitación, secciones AT/MT de pararrayos y contactos de la plantilla de protecciones.
- Calcula relación TTR e índice de absorción; no calcula FP corregido ni variación de bushings donde el Excel no define fórmula.
- Guarda el plan dentro del JSON de la ejecución existente; no requiere tablas nuevas ni reimportar el esquema.
- Permite editar el plan completo y conserva apertura de registros históricos individuales.
- Añade pegado desde Excel por grilla.
## v1.5.11
- Elimina un bloque duplicado que había quedado después del cierre del módulo JavaScript.
- Retira la segunda declaración antigua del catálogo para conservar las 10 pruebas del catálogo desde el inicio.
- Valida la sintaxis del archivo JavaScript completo antes de publicar.

## v1.5.10
- Repara la expresión regular de reconstrucción de filas del protocolo; el archivo JavaScript vuelve a ser sintácticamente válido y puede abrir/editar ejecuciones específicas.

## v1.5.9
- Corrige el patrón de lectura del historial para reconstruir filas de plantillas específicas al editar una ejecución.
- El índice de absorción queda vacío mientras falte la lectura a 30 s o a 1 min; solo se calcula con ambas lecturas válidas.

## v1.5.8
- Amplía el catálogo a los protocolos presentes en el Excel de referencia: FP del transformador, excitación, TTR, resistencia de devanados, aislamiento, bushings, SFRA, pararrayos y protecciones propias.
- Añade al aislamiento las tres configuraciones del protocolo y las lecturas a 15 s, 30 s, 45 s y 1 min.
- Calcula el índice de absorción como R(1 min) / R(30 s), tal como está en la hoja de referencia.
- Añade campos de la plantilla de resistencia de devanados AT/BT, corriente de excitación por fase, factor de potencia, bushings, pararrayos y SFRA.
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

## 1.5.0 — TTR calculado según protocolo de referencia
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
