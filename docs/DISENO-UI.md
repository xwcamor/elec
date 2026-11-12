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

### Espaciado

Usar una escala base de múltiplos de 4 px:

`4, 8, 12, 16, 20, 24, 32` px.

| Contexto | Valor base |
|---|---:|
| Padding de tarjeta principal | 20–24 px |
| Padding de tarjeta secundaria | 16 px |
| Cabecera de tarjeta | 12–16 px |
| Padding de formulario | 16–20 px |
| Separación entre campos | 12–16 px |
| Separación entre tarjetas | 16 px |
| Separación entre secciones | 24 px |
| Separación icono-texto | 8 px |

Los componentes pueden adaptarse a móvil conservando la escala. No introducir valores arbitrarios sin motivo.

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

## 4. Steps: números y checks

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

## 5. Formularios y tarjetas

- Cada campo tiene etiqueta persistente; el placeholder no reemplaza la etiqueta.
- La unidad se coloca en la etiqueta o junto al valor de forma consistente.
- Campos relacionados se agrupan en una tarjeta o sección con un título claro.
- Todas las tarjetas de un mismo nivel comparten padding, borde, radio y estilo de cabecera.
- No anidar tarjetas sin necesidad. Si una sección necesita separación, preferir un encabezado interno o un separador.
- Los errores aparecen junto al campo o sección afectada y explican cómo corregirlos.
- Mantener alineación de columnas, alturas y espacios de controles.
- Formularios de Configuración y Pruebas comparten la misma gramática visual aunque sus campos y estructura funcional sean distintos.

## 6. Acordeones y acciones destructivas

Para bobinados, conmutadores u otros elementos repetibles:

1. La cabecera del acordeón contiene nombre, resumen breve y estado.
2. Las acciones frecuentes y no destructivas pueden permanecer en la cabecera si no la saturan.
3. **Eliminar no va junto al título ni como icono ambiguo en la cabecera.**
4. La acción de eliminación va al final del contenido expandido, separada mediante un divisor horizontal.
5. Mostrar texto explícito, por ejemplo: **Eliminar bobinado**, acompañado de icono rojo discreto.
6. Solicitar confirmación antes de eliminar y explicar qué elemento será eliminado.
7. Si el acordeón está cerrado, el usuario debe abrirlo para encontrar la acción destructiva. No ocultar la acción en menús sin indicación.

La acción debe permanecer visible al final del contenido incluso cuando la sección contenga tablas extensas; no debe ser sticky.

## 7. Encabezados, navegación y comportamiento sticky

- Encabezado de página: título, descripción breve y acciones principales alineadas; sin ocupar altura excesiva.
- El encabezado de Configuración eléctrica y el de Pruebas eléctricas usan el mismo patrón.
- No fijar encabezados, stepper, tarjetas ni botones al viewport por defecto.
- Antes de proponer sticky, demostrar que resuelve un problema de navegación real, comprobar que no tapa contenido y solicitar aprobación si cambia el comportamiento acordado.
- Evitar barras translúcidas con blur si no aportan una ventaja clara.

## 8. CSS y arquitectura de estilos

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

## 9. Metodología obligatoria para cada cambio de interfaz

1. **Inspeccionar:** leer `AGENTS.md`, esta guía y la skill de design engineering. Revisar HTML/PHP, CSS y JS afectados.
2. **Inventariar:** identificar componentes compartidos, estados, responsive y dependencias; comprobar si el mismo componente aparece en otros módulos.
3. **Definir el alcance:** separar cambios visuales de cambios funcionales. No tocar backend, fórmulas ni validaciones si no se solicitó.
4. **Proponer:** resumir qué se unificará y qué se mantendrá específico. Para rediseños amplios, mostrar antes/después o una referencia visual antes de aplicar cambios masivos.
5. **Implementar en común:** corregir primero tokens y componentes compartidos; después ajustar la composición de cada pantalla.
6. **Limpiar:** retirar estilos antiguos o duplicados relacionados; no dejar una cadena de overrides.
7. **Verificar:** revisar Configuración y Pruebas, escritorio y móvil, estados normal/activo/completado/incompleto/error/vacío/disabled/loading, teclado y foco.
8. **Comprobar regresiones:** verificar navegación, guardado, autoguardado, validaciones, edición, eliminación y datos existentes cuando la pantalla afectada los utilice.
9. **Informar:** indicar archivos cambiados, comportamiento preservado, pruebas ejecutadas y pruebas que no pudieron ejecutarse. No afirmar que se probó en Laragon si no se hizo.

## 10. Criterios de aceptación visual

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

## 11. Regla de trabajo del repositorio

- Trabajar directamente sobre `main`.
- No crear ramas ni Pull Requests salvo instrucción expresa del usuario.
- No hacer merge ni cambiar la estrategia de publicación por iniciativa propia.
- Mantener cambios acotados, verificables y documentados.
