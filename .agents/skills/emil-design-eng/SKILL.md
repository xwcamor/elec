---
name: emil-design-eng-elec
description: Guía de design engineering inspirada en la filosofía pública de Emil Kowalski, adaptada exclusivamente a la interfaz de ELEC.
---

# Design Engineering — ELEC

## Alcance
Esta skill se aplica únicamente al repositorio ELEC y a tareas de interfaz, experiencia de usuario, componentes, estados y animaciones. No cambia reglas de negocio, cálculos eléctricos, fórmulas, estructura de datos ni persistencia salvo petición expresa.

ELEC es una herramienta técnica para configurar transformadores y registrar pruebas eléctricas. La interfaz debe sentirse precisa, sobria, clara y rápida; nunca como una landing page ni como un experimento visual.

## Principios
1. Claridad antes que decoración: cada elemento ayuda a identificar datos, comprender estados o completar tareas.
2. Consistencia: reutiliza tokens, escalas de espaciado, tipografía, radios, colores y patrones existentes. No inventes un segundo sistema visual.
3. Cuida alineaciones, jerarquía, estados vacíos, mensajes, foco, contraste, densidad y pantallas pequeñas.
4. Antes de cambiar una pantalla, inspecciona su estructura y componentes. Conserva patrones que funcionan.
5. Nunca ocultes unidades, etiquetas, validaciones, advertencias ni estados importantes para ganar espacio.

## Decisión de animación
Antes de añadir movimiento, determina si evita un cambio brusco, comunica posición o estado, confirma una acción o ayuda a comprender una transición. Si no aporta comprensión o respuesta, no la añadas. No animes acciones de teclado frecuentes, cálculos, tablas densas ni actualizaciones repetitivas.

## Movimiento y tiempos
- Entradas y salidas breves; prioriza transform y opacity.
- Referencias: feedback de pulsación 100–160 ms; tooltip/popover 125–200 ms; dropdown 150–250 ms; modal/drawer 200–300 ms.
- Para entradas, prioriza ease-out; para movimiento dentro de pantalla, ease-in-out; para cambios simples de color, ease.
- Evita transition: all; declara solo las propiedades que cambian.
- Evita entradas desde scale(0). Si aporta claridad, usa una escala inicial sutil junto con opacidad.
- Los popovers deben originarse cerca de su disparador; los modales permanecen centrados.
- Prefiere transiciones CSS para estados que puedan cambiar rápidamente. Añade librerías solo si el proyecto ya las utiliza o hay una necesidad real.
- Evita rebotes, parallax, cursores decorativos, brillos y animaciones infinitas en pantallas operativas.

## Componentes y estados
- Botones: estados hover, focus-visible, active, disabled y loading coherentes; feedback de pulsación discreto.
- Formularios: etiquetas persistentes, unidades visibles, errores junto al campo, validación comprensible y conservación de valores válidos.
- Tabs y pasos: dimensiones, alineación y jerarquía uniformes. El estado activo no debe distinguirse solo por color.
- Modales y drawers: apertura/cierre previsibles, Escape cuando corresponda, foco accesible y sin pérdida accidental de datos.
- Tablas y registros: prioriza lectura, escaneo, alineación numérica y acciones evidentes.
- Mensajes: diferencia éxito, información, advertencia y error; explica qué ocurrió y qué puede hacer el usuario.
- Estados vacíos y de carga: indica qué falta o qué está sucediendo; nunca simules progreso real.

## Reglas específicas de ELEC
- Mantén visibles nombres técnicos, unidades, fases, bobinados, bornes, taps y datos del transformador cuando sean relevantes.
- No cambies fórmulas, tolerancias, validaciones eléctricas, datos guardados ni el flujo de pruebas durante una mejora puramente visual.
- No sustituyas valores técnicos por iconos o abreviaturas ambiguas.
- El color no debe ser el único indicador de estado; acompáñalo con texto o iconografía accesible.
- Conserva el comportamiento de guardar, editar, navegar y abrir registros.
- Prioriza rendimiento en equipos modestos: evita sombras grandes, blur extenso, animaciones de layout, listeners innecesarios y dependencias pesadas.
- No agregues bibliotecas, fuentes externas ni recursos remotos sin justificar beneficio e impacto.

## Accesibilidad y dispositivos
- Respeta prefers-reduced-motion: elimina desplazamientos y escalados no esenciales; conserva cambios discretos que ayuden a comprender.
- Limita hover a dispositivos compatibles mediante @media (hover: hover) and (pointer: fine).
- Mantén foco visible, contraste suficiente, objetivos táctiles adecuados y controles utilizables con teclado.
- Comprueba escritorio y anchos reducidos; evita scroll horizontal accidental y controles cortados.

## Rendimiento y calidad
- Anima preferentemente transform y opacity; evita animar dimensiones si provocan relayout y existe alternativa.
- No uses timers para simular estados que el backend no confirmó.
- No bloquees la interacción mientras termina una animación.
- Respeta la arquitectura y tecnologías existentes de ELEC (PHP, JavaScript y CSS).
- No conviertas una tarea visual en una refactorización extensa.

## Revisión obligatoria
Antes de terminar una modificación de interfaz:
- Comprueba estados normal, hover, focus, active, disabled, loading, error y vacío cuando correspondan.
- Verifica que botones, tabs, modales, formularios y registros sigan funcionando.
- Comprueba que no haya errores nuevos en consola ni regresiones de navegación.
- Revisa alineación, tamaños de títulos, espaciado, contraste y consistencia entre pasos.
- Prueba movimiento reducido y un viewport estrecho.
- Resume qué cambió y qué pruebas se ejecutaron; declara lo que no se pudo probar.

## Formato de revisión visual
Cuando encuentres defectos, presenta una tabla con columnas Antes, Después y Motivo. Sé selectivo y directo. Si una parte ya está bien, no la cambies solo para dejar tu huella.

## Estándar visual de ELEC

La fuente de verdad para reglas está en `docs/DISENO-UI.md` y la implementación CSS compartida está en `assets/design-system.css`. Esta hoja se carga después de `assets/app.css`; no dupliques reglas compartidas en la hoja heredada. El estándar también incluye validaciones y mensajes de error. Es obligatorio leerlo y aplicarlo antes de editar estilos o formularios. No dupliques ni contradigas sus reglas; si una regla necesita cambiar, actualiza primero la documentación y luego los componentes.

En especial:
- Configuración eléctrica y Pruebas eléctricas deben compartir el mismo lenguaje visual.
- Los títulos usan tinta oscura; el azul se reserva para acciones y selección.
- Tarjetas equivalentes comparten padding, borde, radio y cabecera.
- Los steps usan icono semántico, nombre corto y estado textual; no números grandes ni checks que reemplacen el icono. Configuración y Registro comparten componente y dimensiones.
- Las acciones destructivas de acordeones se ubican al final del contenido expandido, tras un divisor y con confirmación.
- Sticky no es el comportamiento predeterminado; no introducirlo sin necesidad funcional y aprobación.
- No apilar overrides CSS: corregir tokens o componentes compartidos en `assets/design-system.css` y retirar reglas obsoletas de `assets/app.css`.
- Mantener las reglas numéricas y obligatorias de cada ensayo sincronizadas entre `assets/plan.js` y `app/ElectricalTestRepository.php`.
- Si se inicia una jornada EN_PROCESO, no permitir que un autoguardado la degrade a BORRADOR; preservar el ID y el estado.
