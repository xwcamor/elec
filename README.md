# ELEC — Prototipo de pruebas eléctricas

Aplicación web independiente para configurar transformadores y registrar pruebas eléctricas. Es un prototipo PHP + MySQL pensado para ejecutarse localmente con Laragon.

## Versión
**1.5.31**

## Funcionalidades

- Consulta y cambio de transformadores desde el selector superior, además de búsqueda en la tabla `transformers`.
- Alta de nuevos transformadores desde el botón «Crear trafo» del topbar, compatible con las columnas reconocidas de la tabla configurada.
- Edición de datos principales del transformador cuando la estructura de la tabla lo permite.
- Configuración eléctrica: fases, grupo vectorial, frecuencia, bobinados, bornes y fichas de bushings capacitivos.
- Configuración de conmutadores y posiciones de taps.
- Grillas tipo Excel: edición, navegación con teclado, pegado TSV desde Excel y copia de tablas.
- Versionado de configuraciones eléctricas.
- Catálogo de ocho pruebas: TTR, capacitancia, factor de potencia, excitación, resistencia de devanados, resistencia de aislamiento, SFRA y bushings.
- Registro de ejecuciones con fecha/hora, responsable, equipo, condiciones ambientales, observaciones y mediciones.
- Historial por transformador, edición y eliminación de visitas con sus mediciones, y panel de análisis de ejecuciones.
- Plantillas específicas para TTR y los protocolos que ya están implementados en el prototipo.

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

Las tablas propias del prototipo usan el prefijo `eh_`. La configuración y las ejecuciones se guardan separadas de la tabla original `transformers`. El campo legado `transformers.num_taps` se consulta como referencia; no se utiliza para reemplazar el detalle de posiciones.

## Uso

1. Abre el prototipo y selecciona un transformador mediante el selector superior o el buscador; usa «Crear trafo» para registrar uno nuevo.
2. Entra a **Configuración eléctrica** y completa los pasos de datos generales, bobinados/bornes y conmutadores/taps.
3. Revisa y guarda una versión de la configuración.
4. Entra a **Pruebas eléctricas** y pulsa **Nueva ejecución** o elige un tipo de prueba.
5. Completa la fecha real del ensayo, los datos del registro y las mediciones; guarda para añadirlo al historial.
6. Abre una visita existente desde el historial para revisar o editar ese registro; también puedes eliminarla con confirmación.

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
