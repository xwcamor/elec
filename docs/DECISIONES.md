# Diseño funcional acordado — Fase 1

## Fuente del transformador
La entidad fuente sigue siendo `transformers`. El piloto utiliza la PK real como `transformer_key` y no replica datos maestros del transformador en las nuevas tablas.

## `num_taps`
Conservar la columna como cantidad declarada para compatibilidad. No convertirla en una relación ni borrarla. El detalle completo va en `eh_tap_positions`, unido al conmutador y al bobinado. Si el valor declarado no coincide con el número de posiciones configuradas, la interfaz final mostrará una advertencia de consistencia.

## Bornes / bobinados / conexiones
Un transformador tiene 1..N bobinados; cada bobinado tiene 1..N bornes. Cada borne tiene fase/tipo y puede estar enlazado a un bushing capacitivo. Cada bobinado tiene su tipo de conexión y el transformador tiene grupo vectorial; no son atributos intercambiables.

## Fecha e historial
La unidad histórica es una ejecución fechada de una prueba, no un único registro mutable por tipo de prueba. `eh_test_executions` crea la cabecera con tipo de prueba, fecha, responsable, equipo, referencia normativa, condiciones ambientales, versión y snapshot de configuración. Cada familia de prueba tendrá su tabla de mediciones para evitar una tabla de columnas genéricas y mantener la forma de las hojas de protocolo.

## Captura de datos
Los valores se introducirán en grillas de aspecto tabular. Se soportará pegado desde Excel mediante TSV y navegación por teclado. No se propone un modal de pantalla completa: la configuración necesita espacio continuo y contexto. Los modales se reservan para tareas cortas.

## Estadísticas
La fase posterior consultará ejecuciones históricas en orden temporal y agrupará mediciones por dimensión comparable: tap, fase, conexión, borne, modo de prueba y unidad. No debe dibujarse una única curva mezclando dimensiones distintas.


## v0.3 — Fecha e historial de ejecución
- `eh_test_executions.executed_at` es la fecha/hora real del ensayo, editable para registrar pruebas históricas.
- `created_at` y `updated_at` registran cuándo el sistema creó/modificó el registro. Se mantienen independientes de la fecha del ensayo.
- Cada ejecución tiene un `id` propio; el historial permite varias ejecuciones del mismo tipo en fechas distintas. Editar una ejecución conserva su ID y no modifica otras ejecuciones.
- `eh_test_execution_data` almacena inicialmente las filas de captura tipo Excel por `execution_id`. Se migrará hacia tablas específicas por protocolo a medida que se validen sus campos y fórmulas.
- La configuración eléctrica guardada se captura como snapshot de la versión usada en esa ejecución.
