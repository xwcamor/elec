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
| `--ui-border` | `#DFE6ED` | Bordes y separadores |
| `--ui-surface` | `#FFFFFF` | Tarjetas y superficies |
| `--ui-subtle` | `#F7F9FB` | Fondos secundarios |
| `--ui-success` | `#43845F` | Estado correcto/completado |
| `--ui-warning` | `#A16A18` | Pendiente o requiere revisión |
| `--ui-danger` | `#B94A48` | Eliminación y errores |

- Azul para acciones y selección, no para todos los títulos.
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
- Color neutro suave: `var(--ui-border)` (sin azul ni gris oscuro).
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

## 6. Steps: números y checks

Usar el mismo patrón en todos los flujos secuenciales:

- **Pendiente:** número del paso en círculo neutro.
- **Activo:** número del paso con fondo de acento y foco visual claro.
- **Completado:** check dentro de círculo verde suave.
- **Incompleto / requiere corrección:** indicador ámbar acompañado de texto.
- **Bloqueado:** apariencia neutra y explicación accesible.

Reglas:
- No mostrar un check en pasos que solo fueron visitados; solo cuando sus validaciones estén completas.
- El estado activo tiene prioridad visual sobre pendiente.
- No permitir avanzar si el paso actual o sus predecesores obligatorios no validan.
- El texto del paso debe explicar qué contiene y, cuando sea útil, mostrar su estado.
- Los conectores entre pasos reflejan progreso completado.
- No depender exclusivamente del color: usar número, check, icono y/o texto.

## 8. Formularios y tarjetas

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

## 10. CSS y arquitectura de estilos

Organización objetivo:

- `assets/design-tokens.css`: variables de color, tipografía, espaciado, radios, sombras y alturas.
- `assets/components.css`: estilos compartidos de botones, campos, tarjetas, tablas, acordeones, steps, estados y alertas.
- `assets/app.css`: composición y estilos específicos de páginas/módulos.

Si la estructura actual todavía no está dividida en esos archivos, hacer la transición gradualmente. No duplicar reglas ni mover todo en una tarea pequeña sin necesidad.

Reglas CSS:
- Preferir clases de componente y tokens; evitar selectores excesivamente específicos.
- No apilar overrides al final para contradecir reglas anteriores.
- No usar `!important` como mecanismo normal de diseño.
- No aplicar reglas globales a un componente que tenga variantes funcionales distintas sin revisar todas sus pantallas.
- Eliminar reglas obsoletas cuando se sustituya un patrón.
- No añadir dependencias, fuentes remotas ni recursos externos para resolver detalles cosméticos.

## 11. Metodología obligatoria para cada cambio de interfaz

1. **Inspeccionar:** leer `AGENTS.md`, esta guía y la skill de design engineering. Revisar HTML/PHP, CSS y JS afectados.
2. **Inventariar:** identificar componentes compartidos, estados, responsive y dependencias; comprobar si el mismo componente aparece en otros módulos.
3. **Definir el alcance:** separar cambios visuales de cambios funcionales. No tocar backend, fórmulas ni validaciones si no se solicitó.
4. **Proponer:** resumir qué se unificará y qué se mantendrá específico. Para rediseños amplios, mostrar antes/después o una referencia visual antes de aplicar cambios masivos.
5. **Implementar en común:** corregir primero tokens y componentes compartidos; después ajustar la composición de cada pantalla.
6. **Limpiar:** retirar estilos antiguos o duplicados relacionados; no dejar una cadena de overrides.
7. **Verificar:** revisar Configuración y Pruebas, escritorio y móvil, estados normal/activo/completado/incompleto/error/vacío/disabled/loading, teclado y foco.
8. **Comprobar regresiones:** verificar navegación, guardado, autoguardado, validaciones, edición, eliminación y datos existentes cuando la pantalla afectada los utilice.
9. **Informar:** indicar archivos cambiados, comportamiento preservado, pruebas ejecutadas y pruebas que no pudieron ejecutarse. No afirmar que se probó en Laragon si no se hizo.

## 12. Criterios de aceptación visual

Una tarea de diseño no se considera terminada hasta que:

- Configuración y Pruebas parecen parte de la misma aplicación.
- Títulos, etiquetas y ayudas tienen jerarquía clara y colores sobrios.
- Tarjetas del mismo nivel comparten padding, borde y radio.
- Formularios tienen campos alineados, unidades visibles y errores comprensibles.
- Steps muestran correctamente número, activo, check, incompleto y bloqueado.
- Acciones destructivas están al final del acordeón, separadas y confirmadas.
- No hay sticky no solicitado, scroll horizontal accidental ni controles cortados.
- Focus visible, navegación por teclado y `prefers-reduced-motion` funcionan.
- No se introducen errores de consola ni regresiones funcionales conocidas.

## 13. Regla de trabajo del repositorio

- Trabajar directamente sobre `main`.
- No crear ramas ni Pull Requests salvo instrucción expresa del usuario.
- No hacer merge ni cambiar la estrategia de publicación por iniciativa propia.
- Mantener cambios acotados, verificables y documentados.
