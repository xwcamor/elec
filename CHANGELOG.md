## v1.5.144
- Corrige la declaración del selector múltiple en JavaScript que impedía analizar y ejecutar el módulo completo.
- Corrige la expresión regular usada para normalizar asteriscos existentes en etiquetas obligatorias.
- Restaura el color azul del paso activo del stepper aunque su estado de validación sea pendiente.
- Recupera la interacción de los pasos y la carga de Configuración eléctrica.

## v1.5.143
- Unifica el asterisco rojo para todos los campos con atributo required en Configuración eléctrica, Pruebas eléctricas y formularios.
- Añade el indicador a encabezados de columnas dinámicas declaradas como obligatorias.
- Los formularios generados dinámicamente reciben el indicador automáticamente sin duplicar asteriscos existentes.
- No modifica reglas de validación ni convierte campos opcionales en obligatorios.

## v1.5.142
- Corrige el marcado HTML del texto de estado del stepper: cada etiqueta ahora cierra correctamente como elemento strong.
- Recupera la distribución horizontal y alineación de los tres indicadores circulares sin modificar la lógica ni los colores de validación.

## v1.5.141
- Elimina la acción «Copiar tabla» de las posiciones TAP y su manejador asociado.
- Unifica en Configuración eléctrica la escala de tipografía, espaciado, radios, controles, tablas y mensajes.
- Presenta «Completo», «Faltan datos» y los estados del stepper como texto directo, sin badges ni etiquetas tipo píldora.
- Homologa foco visible, estados hover/active y movimiento reducido sin añadir dependencias ni alterar reglas eléctricas.

## v1.5.139
- Corrige la numeración del stepper: cada etapa conserva su número ordinal y solo muestra el check cuando está validada; evita reutilizar un número ya sustituido por el check.
- Resalta en ámbar los campos obligatorios vacíos de nombre y tensión del bobinado.
- Elimina el comportamiento sticky del encabezado de Configuración eléctrica; ahora se desplaza normalmente con la página.

## v1.5.138
- Cambia los estados de los bobinados a texto simple: «Completo» y «Faltan datos», sin badges ni fondos tipo píldora.
- El resumen indica explícitamente cuántos bobinados tienen datos pendientes.
- El indicador circular del stepper muestra un check verde cuando la etapa queda validada, incluso si continúa seleccionada.
- El estado de cada bobinado y del stepper se recalcula mientras se editan los campos nominales, sin esperar a perder el foco.
- Separa la tarjeta «Datos del bobinado» del contenedor con márgenes exteriores, siguiendo el espaciado de Pruebas eléctricas.

## v1.5.136
- Reduce el tamaño del título «Bobinados y bornes» para equilibrarlo con el resto del formulario.
- Elimina el rótulo redundante «Conexiones del bobinado» sobre la grilla de bornes.
- Convierte «Datos del bobinado» en una tarjeta con cabecera visual igual a «Equipo y referencia» en Pruebas eléctricas.
- Mueve «Quitar bobinado» al pie de la tarjeta, separado por una línea horizontal.
- Corrige los selectores de colección del resumen y estado de bobinados: ahora recorren todos los elementos y la validación inicial se actualiza al abrir, sin esperar al guardado.

## v1.5.135
- Amplía el título «Bobinados y bornes» y añade un subtítulo dinámico con total, completos y pendientes.
- Elimina la acción redundante «Copiar» del encabezado del módulo.
- Iguala los estados visuales a las tarjetas de ensayos: completado en gris neutro e incompleto en amarillo.
- El estado y el resumen se recalculan al editar datos del bobinado o sus bornes.

## v1.5.134
- Simplifica la tabla de posiciones TAP: elimina las columnas Etiqueta, Neutro y Observaciones; conserva Posición y la acción de eliminar.
- Añade eliminación individual de filas mediante el control de papelera.
- Impide eliminar la última fila: siempre debe quedar al menos una posición.
- Actualiza la ayuda y la acción «Copiar tabla» para trabajar únicamente con la columna Posición.

## v1.5.133
- En la cabecera de cada bobinado, sustituye el contador de bornes por el estado «Completo» o «Pendiente».
- Mantiene la cantidad de bornes y capacitivos en el encabezado de la sección «Bornes y terminales».
- Cambia el número de bobinado al estilo neutral usado en las tarjetas de ensayos.
- Separa nombre y tensión en una sección blanca titulada «Datos del bobinado», con campos alineados como los metadatos del formulario de pruebas.

## v1.5.132
- Integra el indicador de pasos y el panel del formulario dentro de una sola tarjeta continua, eliminando la separación entre secciones.
- Reduce los círculos a 44 px en escritorio, siguiendo la escala del stepper del formulario de pruebas.
- Conserva la línea de progreso, el estado azul activo y los estados verdes completados; mantiene adaptación móvil.

## v1.5.131
- Adapta el indicador de Configuración eléctrica al diseño del asistente de pruebas: círculos grandes, línea de progreso, paso activo azul y pasos completados verdes.
- Mantiene únicamente los números, sin títulos ni contadores dentro del indicador.
- Conserva el contenido de cada panel debajo de la navegación y adapta el stepper a móvil.

## v1.5.130
- El indicador de Configuración eléctrica muestra únicamente los tres círculos numerados, sin títulos, contadores ni conectores.
- Corrige la navegación de los paneles: utiliza selectores de colección para actualizar todos los botones y mostrar el panel correspondiente. Antes se intentaba iterar el resultado de querySelector, lo que impedía abrir el contenido.
- Actualiza la caché de recursos.

## v1.5.129
- Corrige el colapso visual del segundo paso de Configuración eléctrica reemplazando la distribución de columnas por una fila flex con conectores de ancho fijo.
- Garantiza que los tres pasos conserven espacio para el círculo, título, contador y estado en escritorio y móvil.

## v1.5.128
- Corrige la visualización del título y los contadores del paso «Conmutadores y TAP» en el indicador de Configuración eléctrica.
- Refuerza la distribución de los tres pasos para mantener visibles y alineados sus textos en escritorio y móvil.

# v1.5.127
- Configuración eléctrica adopta el stepper numerado con círculos, conectores y estados del formulario de pruebas.
- Elimina el bloque redundante «Qué se guarda» y el aviso repetitivo de bornes capacitivos.
- Simplifica encabezados, instrucciones y botones de navegación.
- Agrega etiquetas visibles y campos requeridos para nombre y tensión de cada bobinado; etiqueta todos los parámetros del conmutador.
- Sustituye los botones de borrar por acciones de texto «Quitar bobinado» y «Quitar conmutador».
- Mantiene los contadores de bobinados y posiciones en el stepper.

## v1.5.126
- Corrige definitivamente los selectores de las pestañas de configuración para usar la colección de elementos y evitar errores al iniciar o navegar.
- Actualiza la caché de recursos frontend.

## v1.5.125
- Corrige el uso de querySelectorAll en las pestañas horizontales de configuración para que los tres apartados se puedan seleccionar y actualizar visualmente.
- Actualiza la versión de caché de los recursos frontend.

## v1.5.124
- Corrige los selectores JavaScript de las nuevas pestañas horizontales de configuración para que la navegación y el estado activo funcionen correctamente.
- Invalida nuevamente la caché de recursos frontend.

## v1.5.123
- Rediseña la navegación de Configuración eléctrica con pestañas horizontales, siguiendo el patrón visual de Pruebas eléctricas.
- Simplifica la descripción del módulo: «Configura los bobinados, bornes y conmutadores del transformador».
- Al agregar una fila de borne o un bobinado, conserva abierto el acordeón correspondiente y no devuelve la vista al primer bobinado.
- Actualiza las referencias de caché de CSS y JavaScript.

## v1.5.122
- Restaura el resaltado amarillo de las celdas obligatorias de Borne cuando están vacías, tanto al cargar como al agregar filas nuevas.
- Al escribir un código de borne, el resaltado amarillo desaparece; si se borra el valor, vuelve a mostrarse.
- Actualiza las referencias de caché de los recursos frontend.

## v1.5.121
- Al cargar una configuración, descarta filas históricas de bornes cuyo código está vacío. Esas filas antiguas podían seguir apareciendo como incompletas y activar la exclamación aunque no fueran bornes reales.
- Mantiene las filas nuevas vacías como borradores locales: no se incluyen en el payload ni se guardan hasta completar el código del borne.
- Actualiza las versiones de CSS, JavaScript y plan.js en index.php para invalidar la caché del navegador y asegurar que se ejecute el código publicado.

## v1.5.120
- A newly added empty terminal row is a local draft: it does not mark the configuration dirty, trigger an incomplete-state warning, or enter the save payload.
- Editing a draft row turns it into a real change; the normal «Guardar configuración» action is still required to persist it.
- Deleting an untouched draft row does not mark the configuration dirty; deleting a populated row does.
- Winding counters exclude untouched draft rows.
- Aligns the terminal-row delete control to the far-right edge of the table.

## v1.5.119
- Simplifica la tabla de conexiones del bobinado: muestra únicamente Borne y ¿Capacitivo?, sin fase ni función.
- Añade eliminación individual de filas y conserva obligatoriamente una fila como mínimo.
- El nombre del borne es obligatorio en todas las filas; no se permite guardar filas vacías.
- Nombre del bobinado y tensión nominal (kV) se marcan como obligatorios y se validan antes de guardar.
- La validación PHP también exige al menos un borne con código por bobinado y deja de exigir fase/designación.

## v1.5.118
- Simplifica las etiquetas de bornes en el resumen de cada bobinado: muestra únicamente el código/nombre del borne y si es «Capacitivo» o «No capacitivo».
- Elimina de ese resumen la fase y el indicador abreviado «C1».

## v1.5.117
- Simplifica la tabla de bornes: elimina la columna de notas y conserva los datos de los elementos capacitivos existentes.
- Renombra el indicador a «¿Capacitivo?» y la columna «Tipo» a «Función» con opciones Fase, Neutro, Tierra, Auxiliar y Otro.
- La fase/designación pasa a ser editable y admite nomenclaturas personalizadas de hasta 8 caracteres.
- Al escribir U1/V1/W1/A1/B1/C1 se propone automáticamente la fase correspondiente y la función Fase; N1 propone N y Neutro. Designaciones no reconocidas quedan para edición manual.
- El código de borne se normaliza a mayúsculas y admite hasta 20 caracteres; PHP valida los límites y guarda en mayúsculas.
- El copiado de bornes refleja las columnas actuales y omite las notas.

## v1.5.116
- Corriente de excitación se organiza por TAP seleccionado: una fila por TAP y tres grupos de fase U-0, V-0 y W-0, cada uno con corriente de excitación (mA) y pérdidas (W).
- Tensión de prueba y frecuencia quedan visibles por TAP; la frecuencia se propone desde la configuración del transformador y la tensión se registra en el ensayo.
- Los TAP se seleccionan desde las posiciones del conmutador configurado; se evita generar automáticamente todas las posiciones y se valida que no se repita un TAP.
- La evaluación por fila es manual: PENDIENTE, CONFORME, OBSERVADO o NO CONCLUYENTE. No se infiere conformidad por completar campos ni por asumir un tipo de núcleo.
- Se añade el tipo de núcleo como dato opcional con valor inicial «No especificado» y se conserva en el detalle del ensayo.
- Se adapta la exportación PDF a la misma tabla agrupada y se mantiene la lectura de registros antiguos con mediciones por fase.

## v1.5.115
- La exportación deja de abrir el diálogo de impresión del navegador: ahora solicita el PDF al servidor PHP y descarga el archivo directamente.
- Se agrega el endpoint `action=test-pdf`, que genera el documento A4 mediante Dompdf y devuelve `application/pdf`.
- Se declara `dompdf/dompdf` en composer.json; el servidor debe ejecutar Composer para instalar la dependencia y disponer de `vendor/autoload.php`.

## v1.5.114
- Cada ensayo comienza en una hoja nueva al imprimir o guardar el informe como PDF.
- Los ensayos extensos pueden continuar automáticamente en páginas adicionales; no se recortan ni se fuerzan a caber en una sola hoja.
- Las filas de las tablas evitan dividirse entre páginas y los encabezados de tabla se repiten cuando hay continuación.

## v1.5.113
- La exportación PDF conserva la estructura de las grillas específicas: encabezados originales y una fila por medición, en lugar de convertir cada campo en una fila separada.
- Factor de potencia: el PDF muestra modo, tensión, FP medido/corregido, capacitancia fuente, capacitancia medida y estado en sus columnas originales.
- Guarda la unidad elegida para capacitancia medida (pF, nF, µF, mF o F) y la respeta al generar el PDF. Los registros antiguos usan nF como valor predeterminado.

## v1.5.112
- Corrige el enlace de acciones del historial para que «Exportar PDF» y «Eliminar» se registren correctamente en todos los botones.
- Refuerza el informe PDF imprimible: referencia normativa por ensayo, presentación A4 y guía visible para guardar como PDF.
- Los ensayos con datos registrados usan estados visuales neutros; el color verde ya no se aplica solo por tener campos llenos. Los pendientes conservan su advertencia ámbar.

## v1.5.111
- Añade «Exportar PDF» por registro en el historial.
- El informe incluye identificación del transformador, datos generales de ejecución, cada ensayo, su estado, todas las mediciones, unidades, notas y observaciones.
- Compatible con registros agrupados (PLAN) y ejecuciones individuales heredadas. El navegador permite imprimir o guardar como PDF.

## v1.5.110
- Encabezados de factor de potencia: «Factor de Potencia medido (%)» y «Factor de Potencia corregido (%)».
- Los seis modos iniciales ahora se pueden reducir; solo se impide eliminar la última fila.
- Selector de unidad en el encabezado «Capacitancia medida»: pF, nF, µF, mF y F. Cambia la presentación calculada desde el valor fuente en F sin alterar el valor canónico ni la fórmula.
- La observación automática considera todas las filas que permanezcan en el ensayo.

## v1.5.109
- Elimina el campo «Norma / referencia» de la sección Equipo y referencia.
- Hace obligatorios para todos los ensayos: equipo, marca, modelo y número de serie; estos cuatro campos se incluyen en el avance y en las validaciones para continuar y confirmar el registro.

## v1.5.108
- Renombra el encabezado «Capacitancia fuente (F)» a «Capacitancia», conservando el dato interno en F para el cálculo de nF.
- La flecha abajo y Enter ya no crean filas automáticamente al llegar al final de la tabla; la creación de filas queda en el botón «+ Fila».
- Los ensayos completos permanecen abiertos y editables; al modificar un resultado no se cierra automáticamente el formulario.

## v1.5.107
- Corrige navegación por teclado en el plan: ahora se puede entrar y salir de las celdas calculadas «Capacitancia medida» y «Estado» sin quedar atrapado.
- Factor de potencia: unidades explícitas en encabezados: tensión de prueba (V), FP medido (%) y FP corregido (%), sin mostrar 20 °C en el título.
- Añade control para eliminar filas; conserva obligatorios los seis modos LAP de factor de potencia y evita dejar otros ensayos sin filas.

## v1.5.106
- Factor de potencia: encabezados completos y uniformes para FP medido y FP corregido a 20 °C.
- Capacitancia medida calculada automáticamente en nF desde capacitancia fuente en F (× 10⁹), siguiendo el libro LAP.
- Estado calculado: CORRECTO si |FP corregido a 20 °C| < 1%; OBSERVADO si no cumple.
- Observaciones automáticas según los seis modos: conformidad IEEE Std C57.152-2013, cláusula 7.2.14, o «Se encontraron valores observados».

## v1.5.105
- Estandariza navegación por teclado en las tablas de ensayos: flechas, Enter, Tab y Shift+Tab.
- Añade navegación horizontal a las grillas de TTR y ensayos específicos.
- Incorpora navegación por teclado en las tablas del plan de ensayos.
- Conserva el pegado de bloques TSV desde Excel en las grillas de mediciones y configuración.
- Las columnas calculadas permanecen protegidas durante el pegado.

## v1.5.104
- Vincula campos de bobinado, borne, bushing y TAP en plantillas de ensayos con los elementos reales de la configuración eléctrica.
- Precarga filas para resistencia de devanados, aislamiento, excitación, bushings y capacitancia desde bobinados/terminales configurados.
- El selector TAP de TTR utiliza posiciones disponibles en la configuración, no una lista genérica inventada.
- Los formularios de ensayos históricos usan su snapshot eléctrico al editar, manteniendo valores antiguos aunque la configuración actual haya cambiado.
- El servidor conserva config_version y config_snapshot originales al actualizar una ejecución existente.

## v1.5.103
- Corrige validación del servidor: guardar bobinados ya no exige «Conexión», campo retirado de la interfaz en 1.5.102.
- Se mantiene la columna histórica connection_type como opcional; no se elimina ni modifica información previa.

## v1.5.102
- Retira de la edición de bobinados los campos «Conexión» y «¿Tiene neutro?».
- Simplifica el resumen del bobinado y «Copiar bobinados» para mostrar únicamente nombre y tensión.
- Elimina la validación que exigía seleccionar una conexión en esta pantalla.
- Los valores históricos de conexión y neutro se conservan en los datos internos y no se eliminan de la base de datos.

## v1.5.101
- Convierte «Bornes y terminales» en una sección fija dentro de cada bobinado; deja de comportarse como acordeón.
- Reorganiza el encabezado con el contador de registros y acciones «+ Fila» / «Copiar bornes» alineadas.
- Separa visualmente la sección y el contenido de la tabla para mejorar jerarquía, espaciado y adaptación móvil.

## v1.5.100
- Retira los campos «Código» y «Notas» de la edición de bobinados.
- Actualiza «Copiar bobinados» para incluir solo nombre, tensión, conexión y neutro.
- Simplifica el resumen del acordeón para mostrar nombre, tensión y conexión.
- Los códigos internos y notas previamente almacenados se conservan para compatibilidad; ya no se exponen en esta interfaz.

## v1.5.99
- Retira el campo «Material» de la edición de bobinados.
- Actualiza «Copiar bobinados» para excluir el material.
- El resumen de revisión deja de mostrar material del conductor.
- Los valores previamente almacenados se conservan; solo se retiran de la interfaz.

## v1.5.98
- Retira la columna «Serie bushing» de la grilla de bornes en Configuración eléctrica.
- Actualiza «Copiar bornes» para excluir la serie y mantener correspondencia con las columnas visibles.
- Los datos de serie previamente almacenados no se eliminan; solo dejan de mostrarse y editarse en esta grilla.

## v1.5.97
- Elimina los campos editables Tipo y Accionamiento de cada conmutador; se conservan internamente los valores existentes para no alterar datos ni compatibilidad.
- Retira el indicador «Origen: Base de datos» de la tarjeta de ficha técnica.
- Simplifica el mensaje de confirmación de guardado: muestra versión guardada sin mencionar MySQL.

## v1.5.96
- Bobinados: cada acordeón se puede abrir o cerrar independientemente; ya no se cierra automáticamente al abrir otro.
- Conmutadores: adopta la misma estructura visual jerárquica, con un acordeón independiente por conmutador y un subacordeón para sus posiciones TAP.
- El botón eliminar de cada conmutador queda separado de los campos, en la esquina superior derecha.
- El resumen del conmutador refleja nombre, bobinado asociado, tipo y cantidad de posiciones.

## v1.5.95
- Corrige la alineación del botón eliminar del bobinado dentro del acordeón: queda en la parte superior derecha, separado de los campos y sin ocupar una columna incorrecta del formulario.

## v1.5.94
- Presenta cada bobinado como un acordeón independiente con resumen de nombre, código, tensión, conexión y cantidad de bornes.
- Agrupa bornes/terminales en un segundo acordeón dentro de cada bobinado para distinguir claramente ambos niveles.
- Mantiene edición de campos, grillas, pegado desde Excel, copia y acciones existentes.
- Añade al README una lista de pruebas funcionales pendientes para ejecutar posteriormente en Laragon/MySQL.

## v1.5.93
- Corrige el desajuste entre cantidad TAP de la ficha técnica y filas del conmutador: deja de bloquear el avance solo por diferencias de cantidad.
- Añade acción explícita para sincronizar las filas de los conmutadores con la ficha técnica.
- Conserva las filas existentes que caben en la nueva cantidad; solicita confirmación si se eliminarían filas con datos.
- La sincronización modifica solo el borrador actual; las versiones históricas y ensayos guardados permanecen intactos.

## v1.5.92
- Establece un máximo de 150 posiciones TAP por transformador/conmutador.
- Valida cantidades en el formulario de ficha técnica y en el servidor PHP.
- Limita el generador de filas y la adición manual de posiciones.
- Valida en servidor que cada conmutador no supere 150 posiciones y que sus números estén entre 1 y 150.

## v1.5.91
- Simplifica la grilla de posiciones TAP: elimina las columnas de tensión (kV) y variación (%).
- Actualiza la ayuda de pegado desde Excel y la acción «Copiar tabla» para usar únicamente Posición, Etiqueta, Neutro y Observaciones.
- Los campos históricos de tensión y variación se conservan en los datos almacenados; dejan de mostrarse en la grilla.

## v1.5.90
- Simplifica la grilla de bornes/bushings: elimina de la captura visible fabricante, modelo, tensión de placa, capacitancia de placa y FP de placa.
- Ajusta «Copiar bornes» para exportar únicamente las columnas que permanecen visibles.

## v1.5.89
- La configuración eléctrica exige una cantidad de TAP mayor que cero en la ficha del transformador antes de entrar.
- La etapa de conmutadores muestra el tipo detectado (DETC/OLTC) y la cantidad de posiciones como datos de solo lectura provenientes de la base de datos.
- Añade acceso directo para modificar tipo y cantidad desde la ficha técnica, sin duplicar esos datos en la configuración eléctrica.
- Valida que cada conmutador tenga exactamente la cantidad de posiciones indicada en la ficha antes de revisar y guardar una nueva versión.

## v1.5.88
- Elimina la etapa «Datos eléctricos generales»: fases, grupo vectorial y frecuencia se toman de la ficha del transformador y dejan de presentarse como campos configurables.
- Reduce el asistente a tres etapas: Bobinados y bornes, Conmutadores y TAP, y Revisión y versiones.
- Elimina la duplicidad de acciones de guardado: el botón «Guardar configuración» aparece únicamente al final de la revisión.
- La navegación lateral y los botones de avance validan las etapas previas antes de permitir continuar o guardar.
- Refuerza la validación de tensión nominal, conexión y bornes por bobinado tanto en cliente como en servidor.
- Ajusta la navegación al cambiar de transformador para no acceder a campos retirados.

## v1.5.87
- Sustituye los indicadores de salud y resultados de ejemplo por estados reales de configuración y disponibilidad del piloto; no muestra un 100/100 ficticio.
- Mejora la jerarquía de las tarjetas de módulos, los estados de foco y las microinteracciones; respeta la preferencia del sistema por movimiento reducido.

## v1.5.86
- La validación del servidor vuelve a comprobar los campos obligatorios y los valores numéricos de cada ensayo antes de permitir completar un registro.
- Rechaza códigos de ensayo desconocidos, fechas inválidas y cierres sin detalle de ensayos.
- La configuración eléctrica valida en servidor bobinados, códigos duplicados, bornes y posiciones de TAP.
- La carga de configuración agrupa bobinados/bornes/bushings y conmutadores/posiciones para reducir consultas SQL repetitivas.
- Se agrupan las comprobaciones de tablas del esquema en una consulta por carga.
- Se reduce el trabajo del DOM al editar ensayos y se actualizan los cálculos TTR por fila sin reconstruir toda la grilla.

## v1.5.79
- Nueva ejecución inicia en modo preparación temporal: abrir el formulario, seleccionar ensayos y completar datos no crea filas en la base de datos.
- El registro persistente se crea únicamente al pulsar «Iniciar prueba», tras validar fecha, responsable, supervisor y al menos un ensayo.
- Después de iniciar, el autoguardado se activa con debounce, al salir de campos y al cambiar de etapa; el estado de guardado queda visible.
- Al abandonar una preparación no iniciada, se pregunta si se desea descartar; los registros ya iniciados conservan la protección ante cambios pendientes.
- La revisión finaliza la ejecución con «Finalizar prueba» y mantiene la validación de campos obligatorios.

## 1.5.78
- Permite navegar directamente a una etapa posterior cuando todas las etapas anteriores ya cumplen sus validaciones.
- Mantiene el bloqueo y los avisos cuando cualquier etapa previa tiene datos pendientes; ya no exige pulsar «Continuar» varias veces.

## 1.5.77
- Impone navegación secuencial: no permite saltar etapas desde el indicador y valida la etapa actual antes de avanzar.
- Bloquea el paso 4 mientras existan ensayos incompletos en el paso 3 y muestra los nombres de los ensayos pendientes.
- Permite retroceder para corregir información; el guardado automático de borradores se mantiene independiente de la navegación.

## 1.5.76
- Evita bloquear silenciosamente el botón de avance/confirmación cuando faltan datos: permite el clic para ejecutar la validación y mostrar la alerta contextual con los campos pendientes.

## 1.5.75
- Corrige la carga inicial del resumen: al terminar de recuperar los registros se actualizan «Registros que requieren atención» y «Actividad de ensayos» sin tener que cambiar de pestaña.
- Refresca ambos paneles también después de enriquecer los nombres con el catálogo de ensayos.

## 1.5.74
- Define el registro de pruebas como una jornada que agrupa varios ensayos; unifica los términos visibles: registro, ensayo, mediciones y resultados.
- Renombra las etapas del asistente: Datos generales, Ensayos a realizar, Registro de resultados y Revisión del registro. Usa números simples (1–4) y oculta «Anterior» en el primer paso.
- Permite guardar automáticamente borradores incluso antes de seleccionar ensayos.
- Separa el guardado automático de la confirmación final: los registros guardados quedan como BORRADOR o EN_PROCESO; solo pasan a COMPLETADA mediante «Confirmar registro».
- Permite revisar datos pendientes y deshabilita la confirmación hasta que los datos generales y todos los ensayos estén completos.
- El servidor valida que un registro confirmado tenga ensayos, mediciones, responsable y supervisor.
- Actualiza historial, filtros, estadísticas, mensajes y acciones para usar la terminología acordada.
- Los borradores guardados antes de seleccionar ensayos aparecen como registros sin ensayos, sin contarse como un procedimiento en el historial o las estadísticas.

## 1.5.73
- Cambia el título del paso 2 a «Ensayos a realizar».
- Fuerza una alineación consistente a la izquierda para títulos y subtítulos de todas las etapas, incluida la descripción de datos compartidos y el encabezado del selector de ensayos.
- Evita que estilos heredados de tarjetas o grids desplacen los subtítulos hacia el centro o la derecha.

## 1.5.72
- Elimina los identificadores de etapa en azul dentro de los encabezados; deja título y subtítulo alineados a la izquierda.
- Homologa el tamaño de los cuatro indicadores numéricos y reemplaza el contorno rectangular de foco por un halo circular.
- Alinea el resumen de resultados debajo del título, a la izquierda, manteniendo el contador de pendientes a la derecha.

## 1.5.71
- Corrige un error JavaScript al actualizar las líneas del stepper: se reemplaza el selector de elemento único por `querySelectorAll` y se define localmente la secuencia de etapas.
- Evita que el error interrumpa la carga y navegación de los registros.

## 1.5.70
- Compacta el stepper: los conectores ahora llegan directamente a los círculos y reflejan el progreso completado/activo.
- Reorganiza los encabezados de las etapas en dos líneas principales: título y descripción alineados verticalmente, con el identificador pequeño encima.
- En pantallas pequeñas, el encabezado vuelve a una columna para conservar legibilidad.

## 1.5.69
- Unifica la navegación numérica, el contenido de cada etapa y las acciones en una sola superficie de asistente.
- Mejora la jerarquía visual del stepper, con conectores, estados claros y foco azul para la etapa activa.
- Añade una transición breve y discreta entre etapas, respetando la preferencia de movimiento reducido.

## 1.5.68
- Simplifica el stepper progresivo: muestra únicamente los cuatro números, sin títulos ni descripciones permanentes.
- Los títulos y el contexto permanecen dentro del contenido de cada etapa activa.
- Centra los indicadores numéricos y reduce la altura de la navegación, también en móvil.

## 1.5.67
- Corrige un fragmento residual `ion>` que quedó visible al retirar el panel de avance del plan.

## 1.5.66
- Simplifica el aviso al intentar pasar al resumen con ensayos incompletos: ahora muestra únicamente el nombre de la prueba pendiente.

## 1.5.65
- Se oculta el resumen «ensayo(s) en el plan · completos» al agregar pruebas; se conserva el mensaje inicial cuando aún no hay ensayos.
- Se simplifica el encabezado de selección a «Selecciona los ensayos».

## 1.5.64
- Se elimina el panel de alerta y porcentaje de avance para reducir la carga visual del plan.
- El botón «Continuar» queda deshabilitado mientras falten fecha, responsable/técnico o supervisor.
- La validación también bloquea la navegación directa entre etapas si faltan datos obligatorios.
- Se conserva la validación de ensayos incompletos antes de pasar al resumen.

## 1.5.63
- Se elimina el texto descriptivo «Instrumento, marca, modelo, serie y norma» del encabezado de las tarjetas «Equipo y referencia».
- Se conservan los campos y sus etiquetas para registrar norma, equipo, marca, modelo y número de serie.

## 1.5.62
- Retira el título «¿Qué pruebas vas a registrar?» y el texto explicativo de la sección de selección de ensayos para simplificar el formulario.
- Actualiza la caché de recursos.

## 1.5.61
- Recalcula el resumen global de ensayos en tiempo real al editar cualquier campo, no solo al reconstruir los formularios.
- Actualiza inmediatamente el indicador «Todos completos» o la cantidad de pendientes y su estado visual.
- Mantiene sincronizados el resumen global, los estados individuales y los porcentajes.
- Actualiza la caché de recursos.

## 1.5.60
- Actualiza en vivo el estado de cada acordeón de prueba al editar datos de equipo, referencia o medición.
- El indicador cambia inmediatamente entre «Completo», «Faltan datos» y «Sin iniciar», junto con el porcentaje y el color.
- Al completar todos los campos mínimos, el acordeón se contrae automáticamente; si vuelve a quedar incompleto, se expande.
- Conserva el guardado automático y refresca el estado tanto en eventos input como change.
- Actualiza la caché de recursos.

## 1.5.59
- Cierra automáticamente el acordeón de una prueba en cuanto todos sus campos mínimos quedan completos, incluso si estaba abierto antes de completar el último dato.
- Mantiene abiertos los ensayos incompletos por defecto y respeta la apertura/cierre manual mientras sigan incompletos.
- Actualiza la caché de recursos.

## 1.5.58
- Convierte «Equipo y referencia» de cada prueba de acordeón a tarjeta visible y expandida permanentemente.
- Mantiene los campos de norma, equipo, marca, modelo y número de serie dentro de cada formulario.
- Conserva «Observaciones del ensayo» como acordeón independiente para no recargar visualmente cada prueba.
- Actualiza la caché de recursos.

## 1.5.57
- Conserva un ancla interna no visible para compatibilidad con la validación del asistente; no renderiza pestañas ni botones de navegación por ensayo.
- Mantiene los formularios como acordeones individuales visibles.

## 1.5.56
- Elimina por completo las pestañas de selección rápida de ensayos en el paso 03.
- Elimina el acordeón exterior que envolvía todos los formularios.
- Muestra todos los ensayos seleccionados como acordeones individuales, cada uno con su estado y color.
- Los ensayos incompletos se expanden por defecto; los completos aparecen contraídos. Se conserva el estado abierto/cerrado del usuario durante las actualizaciones del formulario.
- Actualiza la caché de recursos.

## 1.5.55
- Convierte «03 · Formularios de prueba / Resultados por ensayo» en un acordeón general que contiene las pestañas y los formularios individuales.
- El acordeón se abre por defecto si existe algún ensayo pendiente y se cierra si todos están completos.
- El usuario puede abrirlo o cerrarlo manualmente; esa preferencia se respeta mientras trabaja en el mismo plan y se reinicia al abrir otro plan.
- Añade un resumen dinámico con cantidad de ensayos seleccionados, completos y pendientes.
- Conserva los acordeones internos de cada formulario y la lógica de mediciones/guardado.
- Actualiza la caché de recursos.

## 1.5.54
- Pestañas de resultados por ensayo con estados visibles: verde para completo, ámbar para incompleto y gris para sin iniciar.
- Selección activa con contorno azul independiente del color de estado.
- Mejora el tamaño y la legibilidad de los nombres, números y porcentajes de cada ensayo; ajustes para pantallas pequeñas.
- Actualiza la caché de recursos.

## 1.5.53
- Elimina el aviso dinámico «Pendiente: responsable / técnico · supervisor» de la sección de datos compartidos.
- Retira el subtítulo «Condiciones ambientales · Temperaturas y humedad durante los ensayos»; los campos ambientales permanecen visibles sin encabezado redundante.
- Actualiza la caché de recursos.

## 1.5.52
- Retira el acordeón de «Condiciones ambientales» y deja temperatura del aceite, temperatura ambiente, humedad y observaciones visibles dentro de Datos compartidos.
- Elimina el mensaje «Datos generales completos»; la banda de estado solo aparece cuando faltan datos obligatorios.
- Actualiza los identificadores de caché.

## 1.5.51
- Reubica «Realizada el» junto a «Responsable / técnico» y «Supervisor» en una fila de tres columnas.
- Elimina la tarjeta independiente de fecha para reducir altura y equilibrar la sección de datos compartidos.
- Ajusta la cuadrícula a dos columnas en tablet y una columna en móvil.
- Renombra el encabezado para retirar la referencia a «visita» y actualizar la fecha pendiente.
- Actualiza la caché de recursos.

## 1.5.50
- Corrige la posición del asterisco obligatorio de Responsable/técnico y Supervisor para que permanezca junto al texto.
- Elimina el resaltado verde de los campos compartidos cuando están completos; solo se resaltan en ámbar los campos obligatorios pendientes.
- Los campos completados vuelven al estilo neutro habitual.
- Actualiza recursos de caché.

## 1.5.49
- Condiciones ambientales queda desplegada por defecto al abrir el plan.
- Fecha de realización, responsable/técnico y supervisor pasan a ser obligatorios para completar el registro.
- Los tres campos muestran asterisco de obligatorio y estado visual ámbar cuando faltan datos y verde cuando están registrados.
- El avance y la validación del paso Datos generales incluyen ahora el supervisor.
- Actualiza recursos de caché.

## 1.5.48
- En Configuración eléctrica, tipo de transformador (fases), grupo vectorial y frecuencia nominal se toman de la ficha del transformador y se muestran como datos de solo lectura.
- Al abrir Configuración eléctrica se sincronizan esos valores desde el registro del transformador; la estructura de bobinados y bornes se mantiene editable.
- Retira la etiqueta redundante «Configuración base» y simplifica la nota sobre grupo vectorial y conexiones por bobinado.
- Corrige la superposición del stepper sobre la cabecera: las acciones superiores quedan por encima y el stepper deja de fijarse sobre ellas.
- Actualiza la caché de CSS y JavaScript.
## 1.5.47
- Unifica la apertura de registros desde Resumen e Historial: ambos accesos abren el editor de planes por etapas.
- Elimina el enlace del Resumen al formulario antiguo de edición y evita el manejador duplicado del Historial.
- El botón de acceso desde los registros de atención se denomina «Abrir plan».
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
