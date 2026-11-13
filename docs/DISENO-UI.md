# Sistema de diseño y metodología de interfaz — ELEC

**Estado:** estándar obligatorio para cambios nuevos y mantenimiento visual.  
**Ámbito:** toda la aplicación, especialmente Configuración eléctrica y Pruebas eléctricas.  
**Objetivo:** que ELEC se perciba como un único producto técnico, coherente, sobrio, accesible y fácil de operar.

Este documento es la fuente de verdad para decisiones de interfaz. Si una pantalla existente contradice este estándar, no se debe copiar la inconsistencia: se debe corregir de forma controlada y sin romper su comportamiento.

## 1. Principios no negociables

1. **Un solo sistema visual:** Configuración eléctrica, Pruebas eléctricas, formularios, tablas, historial y asistentes comparten tokens y componentes.
2. **Claridad antes que decoración:** cada color, borde, icono o animación debe comunicar jerarquía, estado o acción.
3. **Consistencia antes que excepciones:** no solucionar diferencias añadiendo parches CSS al final del archivo. Corregir el token o componente compartido.
4. **Primero comportamiento, luego presentación:** una mejora visual no cambia cálculos, fórmulas, validaciones, persistencia, snapshots ni reglas eléctricas.
5. **Diseñar con el contenido real:** mantener etiquetas, unidades, advertencias, validaciones y acciones técnicas.
6. **Sin sticky por defecto:** encabezados de página, barras de pasos y acciones no se fijan al hacer scroll salvo que exista una necesidad funcional demostrable y aprobada. El encabezado de Configuración eléctrica debe desplazarse normalmente.

## 2. Tokens visuales

Usar variables CSS centralizadas. Los valores pueden evolucionar mediante una decisión de diseño, pero no deben redefinirse de forma aislada por pantalla.

### Color

| Token | Valor inicial | Uso |
|---|---|---|
| `--ui-ink` | `#263B50` | Títulos y texto principal |
| `--ui-muted` | `#718398` | Texto secundario y ayuda |
| `--ui-accent` | `#2879B5` | Acción principal, foco y selección |
| `--ui-line` | `#DCE4EB` | Bordes y separadores (token real del proyecto) |
| `--ui-surface` | `#FFFFFF` | Tarjetas y superficies |
| `--ui-subtle` | `#F7F9FB` | Fondos secundarios |
| `--ui-success` | `#43845F` | Estado correcto/completado |
| `--ui-warning` | `#A16A18` | Pendiente o requiere revisión |
| `--ui-danger` | `#B94A48` | Eliminación y errores |

- Azul para acciones y selección, no para todos los títulos.
- En pestañas de navegación, solo la pestaña activa usa el color de acento; las inactivas usan texto neutro y el hover no debe mantener un azul llamativo.
- Las etiquetas de contexto/eyebrow usan texto secundario neutro; no deben competir con títulos ni simular enlaces.
- Títulos en tinta oscura; no convertir cada encabezado en un elemento azul.
- Rojo solo para errores o acciones destructivas.
- Verde y ámbar siempre acompañados de texto o iconografía; nunca comunicar estado solo por color.
- Evitar gradientes, brillos, sombras fuertes y fondos saturados en formularios técnicos.

### Tipografía

| Nivel | Tamaño orientativo | Peso |
|---|---:|---:|
| Título de página | 24 px | 700 |
| Título de sección | 17–19 px | 650–700 |
| Título de tarjeta | 13–14 px | 650 |
| Texto de formulario | 12–13 px | 500–600 |
| Ayuda / metadatos | 11 px | 400 |
| Etiqueta técnica | 12 px | 600 |

- Mantener una familia tipográfica consistente con la existente.
- Usar mayúsculas solo en etiquetas cortas o metadatos cuando ayuden a escanear.
- Evitar que títulos, etiquetas y descripciones compitan por atención.
- Unidades como kV, A, %, nF y °C deben permanecer visibles.

### Espaciado y alineación

Usar una escala base de múltiplos de 4 px. Estos valores son tokens del producto y deben reutilizarse; no elegir márgenes o paddings al ojo.

| Token | Valor |
|---|---:|
| `--ui-space-1` | 4 px |
| `--ui-space-2` | 8 px |
| `--ui-space-3` | 12 px |
| `--ui-space-4` | 16 px |
| `--ui-space-5` | 20 px |
| `--ui-space-6` | 24 px |
| `--ui-space-7` | 32 px |

| Contexto | Estándar |
|---|---:|
| Margen horizontal de página (escritorio) | 24 px |
| Margen horizontal de página (móvil) | 12 px |
| Padding de tarjeta principal | 20 px |
| Padding de tarjeta secundaria | 16 px |
| Cabecera de tarjeta | 12–16 px |
| Padding de formulario | 16–20 px |
| Separación entre campos | 12–16 px |
| Separación entre tarjetas | 16 px |
| Separación entre secciones principales | 24 px |
| Separación icono-texto | 8 px |
| Separación entre título y descripción | 4–8 px |
| Separación entre encabezado y contenido | 16 px |

Reglas de layout:
- Configuración eléctrica, Pruebas eléctricas y el formulario de registro usan el mismo ancho de página y gutter: 24 px en escritorio y 12 px en móvil.
- Sus encabezados usan el mismo componente visual `.config-toolbar`, la misma altura/alineación vertical, el mismo padding horizontal y el mismo espaciado entre título, descripción y acciones.
- El contenido principal comienza con el mismo ritmo vertical. No añadir padding-top o margin-top exclusivo a un módulo sin una razón funcional documentada.
- Los botones y enlaces de acción del encabezado se alinean en una misma fila, centrados verticalmente y anclados al mismo borde derecho. La cantidad de acciones no debe desplazar el grupo fuera de esa línea.
- Las barras de navegación/steps de cada módulo pueden tener distinta función, pero deben compartir el mismo gutter, alineación inicial, separación respecto al encabezado y ritmo de espaciado.
- Para separar elementos hermanos, preferir `gap` en el contenedor antes que márgenes individuales acumulados.
- El margen exterior controla la distancia entre componentes; el padding controla el espacio interno. No usar ambos para resolver la misma separación.
- Los componentes pueden adaptarse a móvil conservando la escala. No introducir valores arbitrarios sin motivo.

### Bordes, radios y controles

- Radio pequeño para inputs y botones: 5–6 px.
- Radio de tarjetas: 8–10 px.
- Borde fino y neutro; evitar bordes de color en todos los elementos.
- Altura de controles de formulario: 36–40 px, coherente dentro de un mismo formulario.
- Botones de una misma fila deben compartir altura, alineación y jerarquía.
- Sombras ligeras y discretas; no usar sombras para sustituir una jerarquía de layout.

## 3. Componentes compartidos

Los componentes siguientes deben verse y comportarse igual en Configuración y Pruebas eléctricas:

- Encabezado de página y encabezado de sección.
- Tarjetas y cabeceras de tarjetas.
- Campos, etiquetas, ayudas, errores y unidades.
- Botones primarios, secundarios, terciarios y destructivos.
- Tablas y grillas tipo Excel.
- Badges y estados.
- Separadores.
- Acordeones.
- Steps y navegación entre etapas.
- Alertas, confirmaciones, estados vacíos y mensajes.

Si un componente necesita una variante, declararla de forma explícita y documentarla. No crear selectores globales que alteren accidentalmente otros módulos.

## 4. Separadores horizontales (`hr`)

Sí se estandarizan. El separador es un elemento de jerarquía y agrupación, no un adorno. Debe tener una apariencia común y usarse solo cuando ayude a distinguir bloques.

### Estilo base

- Línea de 1 px.
- Color neutro suave: `var(--ui-line)` (sin azul ni gris oscuro).
- Sin sombra, degradado ni radio.
- Espaciado vertical controlado por el contexto, no por márgenes predeterminados del navegador.
- Implementar mediante una clase reutilizable (`.ui-divider`) o el borde del componente contenedor; evitar estilos distintos para cada `hr`.

### Dónde utilizarlo

1. **Debajo del encabezado de página:** separa el título/estado/acciones del contenido principal. Debe recorrer el ancho de la zona de contenido, como en el encabezado de Configuración eléctrica. Usar el mismo patrón en Pruebas eléctricas y en el encabezado del registro.
2. **Entre grupos de contenido dentro de una tarjeta:** por ejemplo, entre datos generales y opciones avanzadas, o entre una tabla y un bloque de observaciones cuando pertenecen a la misma tarjeta.
3. **Antes de acciones destructivas:** al final de un acordeón expandido, separa el formulario de «Eliminar bobinado» o «Eliminar conmutador».
4. **Entre bloques de resumen relacionados:** solo cuando la separación visual aporte más claridad que el espacio en blanco.

### Dónde no utilizarlo

- Entre cada campo de un formulario; usar espaciado.
- Entre cada tarjeta; usar el gap del layout.
- Para separar filas de una tabla; usar los bordes propios de la tabla.
- Después de cada título o párrafo.
- Como línea decorativa repetida sin una función de agrupación.

### Variantes permitidas

- `.ui-divider--page`: separador de encabezado, ancho completo del contenido, con margen inferior consistente.
- `.ui-divider--section`: separador dentro de una tarjeta, con margen vertical moderado.
- `.ui-divider--danger-zone`: mismo color neutro y grosor; no pintar toda la línea de rojo. El texto/acción destructiva comunica el peligro.

No crear más variantes salvo que exista una necesidad de interacción claramente distinta. Si el contenedor ya utiliza un `border-bottom` para cumplir la misma función, no agregar además un `hr` duplicado.

## 4.1. Separador del encabezado de página

Los encabezados de Configuración eléctrica, la vista principal de Pruebas eléctricas y el formulario de Registro de pruebas deben mostrar siempre el mismo separador horizontal inferior.

- Línea de 1 px con el token neutro `var(--ui-border)`.
- Mismo ancho que el área de contenido.
- 16 px entre la línea y el contenido siguiente en escritorio; 12 px en móvil.
- Se implementa como borde inferior del encabezado compartido, no como un `hr` aislado que pueda faltar en una pantalla.
- No duplicar el borde con un `hr` adicional.

## 5. Padding y márgenes de formularios por steps

Los formularios de los asistentes de Configuración eléctrica y Registro de pruebas deben compartir el mismo contenedor visual y el mismo ritmo de espaciado.

- Padding interior de cada panel de step: **20 px en escritorio** y **16 px en móvil**.
- Margen exterior de los paneles: **0**; el contenedor del wizard controla la separación.
- Separación entre título/encabezado del panel y sus campos: **16 px**.
- Separación entre campos: **16 px**.
- Padding inferior del contenido: **16 px**; las barras de acciones mantienen el mismo gutter del panel.
- Los pies de formulario pueden llegar al borde del contenedor solo cuando sean barras de navegación compartidas; no deben crear sangrías laterales distintas.
- No añadir márgenes o paddings específicos a un módulo para corregir una diferencia que debe resolverse en el patrón compartido.
- En móvil se conservan las mismas reglas con el token de 16 px y sin desbordamiento horizontal.

La implementación debe reutilizar `--ui-step-panel-padding`, `--ui-step-panel-padding-mobile` y `--ui-step-panel-content-gap`. Si se cambia un valor, ambos módulos deben actualizarse juntos.

## 6. Steps: icono, nombre y estado

Usar el mismo patrón en todos los flujos secuenciales: **icono semántico, nombre breve y estado debajo**. No usar números grandes ni sustituir el icono por un check al completar.

- **Activo:** icono en círculo de acento, nombre oscuro y foco accesible.
- **Completado:** conservar el icono propio de la etapa; círculo verde suave y texto «Completo».
- **En curso / requiere corrección:** círculo ámbar y estado textual «En curso» o «Revisar datos».
- **Pendiente:** círculo neutro y estado «Pendiente».
- **No aplica:** estado neutro y explicación breve, sin marcarlo como error.

Reglas:
- El icono identifica la función de la etapa; el color y el texto identifican su estado.
- Debajo del icono debe aparecer un nombre corto y comprensible; debajo, una leyenda breve de estado.
- Configuración eléctrica usa «Bobinados y bornes», «Conmutadores y TAP» y «Revisión y versiones».
- Registro de pruebas usa «Datos generales», «Ensayos», «Resultados» y «Revisión».
- El mismo componente y las mismas dimensiones se usan en ambos asistentes; cambia únicamente el número de etapas y su contenido.
- No permitir avanzar si el paso actual o sus predecesores obligatorios no validan.
- Los conectores reflejan únicamente las etapas completadas.
- No depender exclusivamente del color: conservar icono, nombre, estado textual, aria-label y aria-current.

## 7. Formularios y tarjetas

- Cada campo tiene etiqueta persistente; el placeholder no reemplaza la etiqueta.
- La unidad se coloca en la etiqueta o junto al valor de forma consistente.
- Campos relacionados se agrupan en una tarjeta o sección con un título claro.
- Todas las tarjetas de un mismo nivel comparten padding, borde, radio y estilo de cabecera.
- No anidar tarjetas sin necesidad. Si una sección necesita separación, preferir un encabezado interno o un separador.
- Los errores aparecen junto al campo o sección afectada y explican cómo corregirlos.
- Mantener alineación de columnas, alturas y espacios de controles.
- Formularios de Configuración y Pruebas comparten la misma gramática visual aunque sus campos y estructura funcional sean distintos.

## 8. Acordeones y acciones destructivas

Para bobinados, conmutadores u otros elementos repetibles:

1. La cabecera del acordeón contiene nombre, resumen breve y estado.
2. Las acciones frecuentes y no destructivas pueden permanecer en la cabecera si no la saturan.
3. **Eliminar no va junto al título ni como icono ambiguo en la cabecera.**
4. La acción de eliminación va al final del contenido expandido, separada mediante un divisor horizontal.
5. Mostrar texto explícito, por ejemplo: **Eliminar bobinado**, acompañado de icono rojo discreto.
6. Solicitar confirmación antes de eliminar y explicar qué elemento será eliminado.
7. Si el acordeón está cerrado, el usuario debe abrirlo para encontrar la acción destructiva. No ocultar la acción en menús sin indicación.

La acción debe permanecer visible al final del contenido incluso cuando la sección contenga tablas extensas; no debe ser sticky.

## 9. Encabezados, navegación y comportamiento sticky

### Estado y acción de retorno en barras de herramientas
- Cuando un encabezado muestre un estado contextual (guardado, autoguardado, error o advertencia) junto a una acción de retorno, el estado se coloca **inmediatamente a la izquierda del botón**.
- Usar una sola fila de acciones compartida: `toolbar-actions`. No apilar el estado encima del botón en escritorio.
- Reutilizar el mismo tamaño de texto, indicador circular, separación y alineación que el estado de Configuración eléctrica (`.save-status`).
- En pantallas estrechas, permitir que la fila envuelva elementos si es necesario, sin superponer ni ocultar el estado o el botón.
- El estado debe seguir siendo accesible mediante `aria-live` y no debe depender solo del color.


- Encabezado de página: título, descripción breve y acciones principales alineadas; sin ocupar altura excesiva.
- El encabezado de Configuración eléctrica y el de Pruebas eléctricas usan el mismo patrón.
- No fijar encabezados, stepper, tarjetas ni botones al viewport por defecto.
- Antes de proponer sticky, demostrar que resuelve un problema de navegación real, comprobar que no tapa contenido y solicitar aprobación si cambia el comportamiento acordado.
- Evitar barras translúcidas con blur si no aportan una ventaja clara.

## 10. Validación, mensajes y lógica de formularios

La validación se aplica en dos capas coherentes: cliente para guiar al usuario y servidor como autoridad final.

### Configuración eléctrica
- Las reglas del navegador deben corresponder con ElectricalConfigRepository::save().
- Nombre, código y tensión de bobinado; códigos de bornes únicos y al menos un borne por bobinado; asociación de conmutadores válida; posiciones TAP enteras, únicas y dentro del límite de 1 a 150.
- La tensión y la frecuencia aceptan coma decimal de forma equivalente en cliente y servidor. Los códigos de borne tienen un máximo de 20 caracteres.
- Los campos de posición mínima, máxima, neutra y actual son opcionales; si se informan, deben ser enteros entre 1 y 150. La mínima no puede superar a la máxima y la neutra/actual, cuando hay ambos límites, debe quedar dentro del rango.
- Las filas TAP vacías y los metadatos de posición no enteros deben producir un mensaje de fila concreto y llevar el foco al campo correspondiente.
- Las reglas técnicas que no estén definidas por el protocolo no deben convertirse en umbrales inventados.
- Al bloquear un paso o guardar, mostrar un mensaje que nombre el dato pendiente, abrir el panel correspondiente y llevar el foco al primer campo que requiere corrección.

### Pruebas eléctricas
- requiredByTest y numericByTest en el cliente deben mantenerse sincronizados con validateCompletedPlanTest() en PHP.
- Los campos numéricos deben aceptar coma decimal y validar como número finito; los campos calculados conservan su fórmula actual y son de solo lectura.
- Los equipos (nombre, marca, modelo y serie) son obligatorios para completar cada ensayo y deben estar señalados visualmente como tales.
- Excitación valida los campos reales de su formulario por TAP y por fase (U-0, V-0 y W-0); el servidor no debe usar nombres de campos heredados que ya no existen en la interfaz.
- Una jornada EN_PROCESO requiere fecha, responsable, supervisor y al menos un ensayo. El autoguardado no puede degradar silenciosamente una jornada iniciada a BORRADOR.
- Completar exige que todos los ensayos tengan sus campos obligatorios, valores numéricos válidos y resultados distintos de PENDIENTE.

### Presentación y recuperación del error
- El campo inválido debe recibir aria-invalid="true", estilo de error, foco y desplazamiento visible.
- Los mensajes deben indicar qué falta o qué valor es inválido y qué acción lo corrige; evitar mensajes genéricos como «revisa la conexión» cuando el servidor devuelve una validación concreta.
- Los avisos compartidos usan el mismo toast con variantes semánticas (éxito, advertencia y error) y estados de guardado accesibles por aria-live.
- Una validación bloqueada no debe borrar valores válidos ni crear registros adicionales.

### Regla de paridad
Al agregar, renombrar o hacer obligatorio un campo técnico, actualizar en el mismo cambio:
1. renderizado y marca de obligatorio;
2. validación de cliente y resumen del paso;
3. serialización de mediciones;
4. validación del repositorio PHP;
5. checklist manual de cierre.

## 11. CSS y arquitectura de estilos

Organización actual y responsabilidades:

- `assets/design-system.css`: fuente de verdad para tokens, encabezados, steps, tarjetas, formularios, botones, acordeones, separadores, estados y mensajes compartidos. Se carga después de `app.css`.
- `assets/app.css`: reglas heredadas y composición específica de módulos. No añadir aquí nuevos estilos que deban compartirse entre Configuración y Pruebas.
- `assets/app.js`: estado y comportamiento exclusivo de Configuración eléctrica; comunica su progreso al stepper y expone el bridge.
- `assets/electrical-tests.js`: catálogo, historial y formularios de pruebas.
- `assets/plan.js`: asistente por etapas del registro de pruebas.

No crear archivos de tokens/componentes paralelos que dupliquen `design-system.css`. Los componentes compartidos se corrigen allí; los estilos exclusivos de un módulo se mantienen locales y no deben contradecir el estándar.

Reglas CSS:
- Preferir clases de componente y tokens; evitar selectores excesivamente específicos.
- No apilar overrides al final para contradecir reglas anteriores.
- No usar `!important` como mecanismo normal de diseño.
- No aplicar reglas globales a un componente que tenga variantes funcionales distintas sin revisar todas sus pantallas.
- Eliminar reglas obsoletas cuando se sustituya un patrón.
- No añadir dependencias, fuentes remotas ni recursos externos para resolver detalles cosméticos.

## 12. Metodología obligatoria para cada cambio de interfaz

1. **Inspeccionar:** leer `AGENTS.md`, esta guía y la skill de design engineering. Revisar HTML/PHP, CSS y JS afectados.
2. **Inventariar:** identificar componentes compartidos, estados, responsive y dependencias; comprobar si el mismo componente aparece en otros módulos.
3. **Definir el alcance:** separar cambios visuales de cambios funcionales. No tocar backend, fórmulas ni validaciones si no se solicitó.
4. **Proponer:** resumir qué se unificará y qué se mantendrá específico. Para rediseños amplios, mostrar antes/después o una referencia visual antes de aplicar cambios masivos.
5. **Implementar en común:** corregir primero tokens y componentes compartidos; después ajustar la composición de cada pantalla.
6. **Limpiar:** retirar estilos antiguos o duplicados relacionados; no dejar una cadena de overrides.
7. **Verificar:** revisar Configuración y Pruebas, escritorio y móvil, estados normal/activo/completado/incompleto/error/vacío/disabled/loading, teclado y foco.
8. **Comprobar regresiones:** verificar navegación, guardado, autoguardado, validaciones, edición, eliminación y datos existentes cuando la pantalla afectada los utilice.
9. **Informar:** indicar archivos cambiados, comportamiento preservado, pruebas ejecutadas y pruebas que no pudieron ejecutarse. No afirmar que se probó en Laragon si no se hizo.

## 13. Criterios de aceptación visual

Una tarea de diseño no se considera terminada hasta que:

- Configuración y Pruebas parecen parte de la misma aplicación.
- Títulos, etiquetas y ayudas tienen jerarquía clara y colores sobrios.
- Tarjetas del mismo nivel comparten padding, borde y radio.
- Formularios tienen campos alineados, unidades visibles y errores comprensibles.
- Steps muestran icono semántico, nombre, estado activo/completo/en curso/pendiente y conectores coherentes.
- Acciones destructivas están al final del acordeón, separadas y confirmadas.
- No hay sticky no solicitado, scroll horizontal accidental ni controles cortados.
- Focus visible, navegación por teclado y `prefers-reduced-motion` funcionan.
- No se introducen errores de consola ni regresiones funcionales conocidas.

## 14. Regla de trabajo del repositorio

- Trabajar directamente sobre `main`.
- No crear ramas ni Pull Requests salvo instrucción expresa del usuario.
- No hacer merge ni cambiar la estrategia de publicación por iniciativa propia.
- Mantener cambios acotados, verificables y documentados.
