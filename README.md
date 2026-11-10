# ELEC — Mini demo de pruebas eléctricas

Proyecto independiente para registrar pruebas eléctricas. **No forma parte de TR Health y no comparte código ni base de datos con ese proyecto.**

## Entorno
- PHP 8.3.26
- MySQL / MariaDB
- Laragon (Windows)
- HTML, CSS y JavaScript

## Instalación local
1. Clonar en `C:\laragon\www\elec`.
2. Iniciar Apache y MySQL desde Laragon.
3. Crear una base de datos llamada `elec_demo`.
4. Importar `database/schema.sql` desde HeidiSQL o phpMyAdmin.
5. Configurar las credenciales en `config/database.php`.
6. Abrir `http://elec.test` o `http://localhost/elec`.

## Estructura
```
elec/
├── assets/css/app.css
├── assets/js/app.js
├── config/database.php
├── database/schema.sql
├── index.php
└── README.md
```

## Modelo de datos inicial
- `elec_transformers`: equipos registrados.
- `elec_test_types`: catálogo configurable de pruebas.
- `elec_test_executions`: ejecuciones individuales e historial.
- `elec_test_measurements`: lecturas vinculadas a cada ejecución.

Las mediciones admiten parámetros, fases, tomas y unidades diferentes. No se imponen fórmulas ni límites de aceptación: se definirán únicamente con los protocolos técnicos que se acuerden.

## Estado
Base inicial del mini demo. Las pantallas y operaciones de registro/consulta se desarrollarán sobre este esquema.
