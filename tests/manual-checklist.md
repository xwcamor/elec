# Verificación manual del piloto

## Interfaz
- [ ] Abrir el inicio y confirmar que se muestra la ficha TR Health en ancho escritorio.
- [ ] Entrar y salir de Configuración eléctrica.
- [ ] Revisar los cuatro pasos y el estado de guardado.

## Bobinados y bornes
- [ ] Crear un bobinado, modificar tensión/conexión/material y activar neutro.
- [ ] Agregar y eliminar bornes.
- [ ] Marcar y desmarcar bushing capacitivo.
- [ ] Pegar una matriz de Excel con tabulaciones y saltos de línea.
- [ ] Navegar con flechas, Enter y Tab.

## Conmutadores y taps
- [ ] Crear un conmutador y asociarlo a un bobinado.
- [ ] Generar filas usando la cantidad de `num_taps` detectada.
- [ ] Aumentar/reducir posiciones y pegar varias filas desde Excel.
- [ ] Marcar posición neutra y revisar que se conserve.

## Base de datos
- [ ] Confirmar que el piloto lee la fila real desde `transformers`.
- [ ] Importar `database/schema.sql` en la misma base.
- [ ] Guardar configuración y confirmar las filas en tablas `eh_`.
- [ ] Guardar una segunda versión y comprobar que aparecen dos snapshots.
- [ ] Confirmar que la tabla `transformers` y `num_taps` no fueron modificados.

## Alcance de historial
- [ ] En la siguiente fase, crear una ejecución de prueba para dos fechas distintas y comprobar que ambas se mantienen.
- [ ] Validar las estadísticas con valores de protocolo aprobados por el especialista.


## Validaciones v0.2

- [ ] En un borne marcar Bushing = Sí y registrar serie, fabricante, modelo, tensión, capacitancia, FP y notas.
- [ ] Copiar desde Excel una tabla TSV con coma decimal (ej. `0,25`) y verificar que se almacena como decimal `0.25`.
- [ ] Navegar por la grilla con flechas, Enter, Tab y Shift+Tab; al salir de la última celda debe crearse una fila nueva.
- [ ] Generar 27 posiciones desde el modal y comprobar que los datos ya ingresados se conservan al ampliar o reducir filas existentes.
- [ ] Comparar el detalle contra `transformers.num_taps`; la alerta es informativa y no actualiza la columna original.
- [ ] Intentar guardar códigos de bobinado repetidos y bornes repetidos dentro de un mismo bobinado; el guardado debe detenerse.
- [ ] Registrar posiciones duplicadas y verificar que el guardado se detiene.
- [ ] Cambiar el bobinado asociado a un conmutador y comprobar que se conserva al recargar la configuración.
- [ ] Guardar una nueva versión y confirmar que el historial anterior continúa disponible.


## v0.3 — Ejecuciones fechadas
- [ ] Abrir Pruebas eléctricas desde el menú lateral.
- [ ] Crear una ejecución eligiendo uno de los ocho tipos.
- [ ] Cambiar la fecha/hora a una fecha pasada y guardar.
- [ ] Verificar que el historial muestra fecha, tipo, responsable, cantidad de filas y estado.
- [ ] Crear otra ejecución del mismo tipo en otra fecha y comprobar que la primera permanece.
- [ ] Abrir y editar una ejecución existente; verificar que mantiene el mismo ID.
- [ ] Eliminar una visita desde el historial; confirmar que desaparece y que sus mediciones asociadas también se eliminan.
- [ ] Cancelar la confirmación de eliminación y verificar que la visita permanece en el historial.
- [ ] Pegar un bloque de varias filas desde Excel.
- [ ] Confirmar que se conserva `transformers.num_taps` y no se modifican datos de la tabla original.
- [ ] Verificar que la configuración vigente se captura como referencia al crear la ejecución.

## Navegación y carga de interfaz (v1.5.2)
- [ ] Abrir Configuración eléctrica y avanzar con «Continuar a bobinados».
- [ ] Verificar que el panel «Bobinados y bornes» quede visible.
- [ ] Abrir Pruebas eléctricas y pulsar «Nueva ejecución».
- [ ] Verificar que se muestre el formulario de ejecución con tipo TTR.
- [ ] Confirmar que los errores de interfaz se muestran en la barra de estado.

## Estado de ejecución (v1.5.3)
- [ ] Abrir Pruebas eléctricas y pulsar Nueva ejecución.
- [ ] Confirmar que no aparece `Cannot access 'activeExecutionId' before initialization`.
- [ ] Confirmar que se muestra el formulario de ejecución TTR.
- [ ] Cancelar y comprobar que regresa al historial.


## v1.5.32 — protocolos LAP y asistente de planes
- [ ] Confirmar que la acción principal de Pruebas eléctricas dice «Registrar pruebas».
- [ ] Crear un plan y recorrer Datos generales, Ensayos, Mediciones y Resumen.
- [ ] Agregar varios ensayos y comprobar que se muestra una sola tarjeta de medición a la vez.
- [ ] Cambiar entre ensayos, agregar/quitar filas y revisar que se mantenga el ensayo activo correcto.
- [ ] TTR: validar AT, BT, U-0, V-0, W-0, relación teórica y errores por fase.
- [ ] Factor de potencia: validar seis modos, tensión, FP medido/corregido a 20 °C; capacitancia no debe bloquear los modos sin ese dato.
- [ ] Excitación: validar TAP, fase, tensión, frecuencia, corriente de excitación y pérdidas, sin ángulo ni reactancia.
- [ ] Resistencia de devanados: validar AT/BT, corriente de prueba, temperatura medida y resistencias medida/referida a 75 °C.
- [ ] Aislamiento: validar AT-BT, AT-Masa, BT-Masa, lecturas 15/30/45/60 s e índice de absorción.
- [ ] Bushings: validar borne, serie, tensión, FP y capacitancias de placa/medidas; comprobar variación calculada.
- [ ] SFRA: validar tres conexiones del protocolo.
- [ ] Pararrayos: validar AT (1U/1V/1W), MT (2U/2V/2W/2N), GST y salidas sin unidad forzada.
- [ ] Protecciones: validar ítem, accesorio, bornes, contacto, condición, ajuste y resultado, sin terminales precargados.
- [ ] Confirmar que equipo, marca, modelo, serie y referencia por ensayo son opcionales.
- [ ] Guardar, recargar y editar un plan; verificar que se conservan las mediciones.
- [ ] Revisar escritorio y móvil: campos compactos y navegación sin una página excesivamente larga.


## v1.5.33 — Persistencia y diagnóstico
- [ ] Con esquema completo, guardar una configuración y comprobar que la lectura inmediata devuelve la misma versión, bobinados y conmutadores.
- [ ] Recargar la página y confirmar que bobinados, bornes, bushings, conmutadores y posiciones siguen presentes.
- [ ] Retirar temporalmente una tabla eh_ en una base de pruebas y confirmar que el sistema bloquea el guardado indicando su nombre; no realizar esta prueba en una base con datos reales.
- [ ] Simular un error SQL en una base de pruebas y confirmar que la interfaz muestra el detalle técnico devuelto por PHP.

## v1.5.34 — Validación LAP
- [ ] Factor de potencia: seis modos; capacitancia opcional y sin unidad inventada.
- [ ] Excitación: TAP, fase, frecuencia, corriente y pérdidas; sin tensión forzada.
- [ ] Resistencia: corrientes iniciales vacías; resistencias medida y referida 75 °C.
- [ ] Aislamiento: tres puntos, lecturas 15/30/45/60 s e índice R(1 min)/R(30 s).
- [ ] Bushings: bornes desde configuración; variación calculada; sin umbral FP.
- [ ] Pararrayos: campos sin unidades forzadas ni evaluación automática inventada.
- [ ] Abrir datos antiguos y verificar alias históricos.
- [ ] Stepper de cuatro etapas y grillas compactas; pegado TSV.
- [ ] Historial con etiqueta «Ejecuciones».
