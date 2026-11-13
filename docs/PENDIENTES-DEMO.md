# Pendientes de definición del demo ELEC

Este documento reúne preguntas funcionales y técnicas que deben validarse con el responsable del proyecto antes de modificar la generación de las tablas de Registro de pruebas.

**Estado general:** pendiente de consulta y aprobación.  
**Regla de trabajo:** mantener el comportamiento actual hasta contar con una definición confirmada.

## 1. Relación entre configuración eléctrica y Registro de pruebas

- [ ] Confirmar qué datos de la Configuración eléctrica deben alimentar automáticamente cada ensayo.
- [ ] Definir si los nombres y tipos de bobinados configurados deben aparecer directamente en las filas, columnas y selectores de las pruebas.
- [ ] Definir cómo se representan transformadores con un solo bobinado configurado (por ejemplo, solo AT) y cómo se manejan los devanados requeridos por cada protocolo.

## 2. Fases, conexiones y bornes

- [ ] Confirmar si las columnas de medición deben generarse según las fases y bornes reales configurados.
- [ ] Definir el comportamiento para transformadores monofásicos frente a trifásicos.
- [ ] Aclarar casos con una sola conexión/terminal disponible (por ejemplo, U-0) y si corresponde mostrar únicamente esa medición.
- [ ] Definir qué hacer cuando una prueba normativa requiere puntos de medición que no existen en la configuración del transformador.

## 3. TAP y conmutadores

- [ ] Confirmar si la cantidad de filas TAP debe corresponder exactamente a las posiciones configuradas para el conmutador asociado.
- [ ] Definir cómo se identifica qué bobinado está asociado a cada conmutador y cómo se refleja esa relación en cada ensayo.
- [ ] Definir el tratamiento de transformadores sin conmutador o sin posiciones TAP configuradas.

## 4. Reglas de aplicación por ensayo

- [ ] Identificar qué ensayos deben adaptar dinámicamente sus filas y columnas a la configuración eléctrica.
- [ ] Confirmar qué campos son obligatorios, opcionales o no aplicables según el diseño del transformador y el protocolo de ensayo.
- [ ] Definir cómo se calculan y validan los resultados cuando una fase, borne, bobinado o posición TAP no aplica.

## 5. Criterios para cerrar estas decisiones

Antes de implementar:
1. Revisar los casos con el responsable técnico.
2. Registrar la regla aprobada para cada caso.
3. Identificar los ensayos afectados y sus fórmulas/validaciones.
4. Probar con configuraciones representativas (monofásico, trifásico, uno o varios bobinados, con y sin TAP).
5. Actualizar este documento con las decisiones finales y su fecha.

> Estos puntos son preguntas abiertas, no requisitos aprobados. No se debe ocultar ni crear columnas, filas o mediciones automáticamente hasta validar el criterio técnico correspondiente.
