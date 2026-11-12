# ELEC — Prototipo de pruebas eléctricas

Aplicación web independiente para configurar transformadores y registrar pruebas eléctricas. Es un prototipo PHP + MySQL pensado para ejecutarse localmente con Laragon.

## Versión
**1.5.138**

## Funcionalidades

- Consulta y cambio de transformadores desde el selector superior, además de búsqueda en la tabla `transformers`.
- Alta de nuevos transformadores desde el botón «Crear trafo» del topbar, compatible con las columnas reconocidas de la tabla configurada.
- Edición de datos principales del transformador cuando la estructura de la tabla lo permite.
- Configuración eléctrica: fases, grupo vectorial, frecuencia, bobinados, bornes y fichas de bushings capacitivos.
- Configuración de conmutadores y posiciones de taps, con lectura del tipo/cantidad desde la ficha técnica y validación de correspondencia.
- Grillas tipo Excel: edición, navegación con teclado (incluidas celdas calculadas de solo lectura), pegado TSV desde Excel, copia de tablas y eliminación controlada de filas.
- Versionado de configuraciones eléctricas.
- Catálogo LAP: TTR, factor de potencia, excitación, resistencia de devanados, aislamiento, bushings, SFRA, pararrayos y protecciones; capacitancia complementaria permanece como ensayo adicional.
- Registro de ejecuciones con fecha/hora, responsable, equipo, condiciones ambientales, observaciones y mediciones.
- Historial de visitas por transformador, edición y eliminación de planes con sus mediciones, exportación imprimible a PDF con detalle de ensayos/resultados y panel de estadísticas de ejecuciones.
- Formularios alineados con los encabezados LAP; cuando el libro no fija un criterio numérico, la evaluación queda para revisión técnica manual.
- Registro por etapas: datos generales, selección de ensayos, registro de resultados y revisión final. El registro se crea al confirmar el inicio y luego se guarda automáticamente.

## Requisitos

- Laragon (Apache o Nginx).
- PHP 8.1 o superior.
- MySQL o MariaDB.
- Una base de datos que contenga la tabla `transformers`, o la tabla de demostración incluida en el esquema.

## Instalación local

1. Clona el repositorio en `C:\\laragon\\www\\elec` o copia allí el contenido del proyecto.
2. Inicia Apache y MySQL desde Laragon.
3. Abre `config/database.php` y configura host, base de datos, usuario y contraseña.
4. En phpMyAdmin, selecciona esa misma base de datos e importa **una sola vez** `database/schema.sql` si aún no existen las tablas `eh_*` del prototipo.
5. Abre [http://localhost/elec/](http://localhost/elec/).

> El esquema utiliza `CREATE TABLE IF NOT EXISTS`. Antes de importarlo en una base existente, revisa el SQL y confirma que estás seleccionando la base correcta. No reemplaza ni migra automáticamente la estructura de tu tabla `transformers`.

## Configuración de la base de datos

Edita `config/database.php`. El prototipo detecta la clave primaria y nombres habituales de columnas de `transformers`. Si tu esquema utiliza nombres diferentes, revisa los candidatos de columnas en `app/TransformerRepository.php` y la opción `transformers_primary_key`.

Las tablas propias del prototipo usan el prefijo `eh_`. La configuración y las ejecuciones se guardan separadas del registro maestro `transformers`. El campo legado `transformers.num_taps` se consulta como referencia; no se utiliza para reemplazar el detalle de posiciones.

## Uso

1. Abre el prototipo y selecciona un transformador mediante el selector superior o el buscador; usa «Crear trafo» para registrar uno nuevo.
2. Entra a **Configuración eléctrica** y completa los pasos de datos generales, bobinados/bornes y conmutadores/taps.
3. Revisa y guarda una versión de la configuración.
4. Entra a **Pruebas eléctricas** y pulsa **Registrar pruebas** o elige un tipo de ensayo.
5. Completa los datos generales y selecciona los ensayos. Esta preparación es temporal y no crea filas en la base de datos.
6. Confirma la creación del registro al pasar a **Registro de resultados**. Desde ese momento se activa el autoguardado al editar campos, salir de ellos y cambiar de etapa.
7. Completa las mediciones, revisa los pendientes y pulsa **Finalizar registro** cuando todos los campos obligatorios estén completos.
8. Abre una ejecución existente desde el historial para revisar o editar ese registro; también puedes eliminarla con confirmación.

Cada ejecución tiene su propio identificador. Editar una ejecución existente no debe crear otra ni sobrescribir registros de fechas distintas.

## Archivos principales

```
elec/
├── app/                  # Acceso a datos y repositorios
├── assets/
│   ├── app.css           # Estilos
│   └── app.js            # Interfaz y lógica del cliente
├── config/
│   └── database.php      # Conexión y mapeo de transformers
├── database/
│   └── schema.sql        # Esquema único de tablas del prototipo
├── docs/                 # Decisiones y capturas de referencia
├── tests/                # Lista de verificación manual
├── api.php               # API del prototipo
├── bootstrap.php
└── index.php
```

## Verificación y solución de problemas

- Si la interfaz muestra **Modo demostración**, revisa la conexión en `config/database.php` y confirma que el transformador existe en la tabla configurada.
- Si faltan tablas del prototipo, importa `database/schema.sql` en la misma base indicada en la configuración.
- Para comprobar el estado de conexión, abre `api.php?action=health` desde la URL local del proyecto.
- Después de actualizar archivos, fuerza la recarga del navegador con **Ctrl + F5**.
- Si aparece un error JavaScript, revisa la consola del navegador (F12) y la versión cargada de `assets/app.js`.

La lista de pruebas manuales está en `tests/manual-checklist.md`.

## Alcance y seguridad

Este repositorio contiene un prototipo local, no una aplicación lista para producción. Antes de exponerlo en una red o internet se requiere integrar autenticación y autorización, protección CSRF, auditoría, gestión de secretos, copias de seguridad y revisión de seguridad. Las fórmulas y criterios de aceptación deben validarse contra el protocolo técnico aplicable; el prototipo no debe interpretarse como certificación automática de un transformador.

## Historial

Consulta [CHANGELOG.md](CHANGELOG.md) para el detalle de cambios por versión.


### Límite de posiciones TAP
La aplicación admite entre 1 y 150 posiciones TAP por conmutador. El límite se valida en interfaz, generador de filas y servidor PHP para proteger la base de datos y evitar cargas excesivas.


La cantidad de posiciones indicada en la ficha técnica se compara con los conmutadores configurados. Si difiere, el usuario puede sincronizar las filas conservando las existentes y confirmando antes de descartar filas con datos. La sincronización afecta únicamente el borrador de configuración; las versiones y ensayos anteriores permanecen intactos.


## Pendientes para pruebas de cierre (Laragon + MySQL)

Esta lista queda como guía para la siguiente ronda de pruebas funcionales. Marcar cada punto solo después de comprobarlo en el entorno local.

- [ ] Crear una configuración eléctrica inicial y verificar que se guarde en MySQL.
- [ ] Crear un ensayo en borrador con la versión 1 (por ejemplo, 5 TAP).
- [ ] Crear después una versión 2 con otra cantidad de TAP (por ejemplo, 20).
- [ ] Reabrir el borrador de la versión 1 y comprobar que conserva su versión y fotografía original.
- [ ] Completar el ensayo antiguo y verificar que no adopta los TAP de la versión 2.
- [ ] Sincronizar una configuración con menos posiciones; confirmar que conserva las filas existentes que caben.
- [ ] Comprobar que solicita confirmación antes de eliminar filas sobrantes con datos.
- [ ] Verificar que las versiones históricas y ensayos anteriores no se modifican tras sincronizar.
- [ ] Probar varios conmutadores asociados a bobinados distintos.
- [ ] Probar pegado desde Excel y copia de tablas de bornes y posiciones TAP.
- [ ] Intentar guardar 0, negativos, decimales, 151 y 100000000 TAP desde la interfaz.
- [ ] Enviar una petición directa a la API con una cantidad superior a 150 y confirmar el rechazo del servidor.
- [ ] Probar los mensajes de validación al intentar avanzar con bobinados, bornes o TAP incompletos.
- [ ] Revisar en el navegador que no haya errores JavaScript y comprobar el flujo completo de alta, edición, guardado y reapertura.

**Criterio de cierre:** todos los puntos anteriores comprobados con datos de prueba en Laragon/MySQL, sin alterar registros reales.


## Catálogo contextual de ensayos

Los formularios de ensayos específicos toman sus opciones de la configuración eléctrica vigente al iniciar el registro: bobinados, bornes, bushings capacitivos y posiciones TAP. Las listas no deben inventar bobinados o posiciones que no existan en la configuración. Si se edita un ensayo histórico, se utiliza su fotografía de configuración guardada cuando está disponible. Al actualizar un ensayo existente, el servidor conserva su versión y fotografía originales.


## Edición de mediciones con teclado y Excel

Las grillas de configuración y de ensayos permiten desplazarse entre celdas con flechas, Enter y Tab (Shift+Tab para retroceder), además de pegar rangos tabulados copiados desde Excel. Las grillas de TTR y de ensayos específicos conservan sus campos calculados y permiten navegar sin sobrescribirlos.


## Factor de potencia (v1.5.106)
- Registrar la capacitancia fuente en faradios; la aplicación calcula la capacitancia medida en nF con `F × 10^9`, como en la fórmula del libro LAP (`archivo fuente` → `protocolos`).
- Estado calculado con FP corregido a 20 °C: `|FP corregido| < 1%` = `CORRECTO`; de lo contrario = `OBSERVADO`.
- Las observaciones se generan automáticamente a partir del estado de los seis modos.
