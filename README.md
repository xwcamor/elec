# ELEC — Mini demo de pruebas eléctricas

Aplicación web independiente para registrar equipos, definir tipos de pruebas, guardar ejecuciones y capturar mediciones manuales. No forma parte de TR Health ni comparte código o base de datos con ese proyecto.

## Requisitos
- PHP 8.3.26 o compatible
- MySQL / MariaDB
- Laragon

## Instalación
1. Clonar el repositorio en `C:\laragon\www\elec`.
2. Iniciar Apache y MySQL desde Laragon.
3. Importar `database/schema.sql` en phpMyAdmin o HeidiSQL.
4. Revisar credenciales en `config/database.php` (por defecto: host 127.0.0.1, base elec_demo, usuario root, contraseña vacía).
5. Abrir `http://elec.test` o `http://localhost/elec`.

## Funcionalidades implementadas
- Panel resumen con conteo y actividad reciente.
- Registro y listado de transformadores.
- Catálogo editable de tipos de prueba.
- Registro de ejecuciones con fecha, equipo, prueba, operador, estado, temperatura, humedad y observaciones.
- Filas dinámicas para capturar parámetros, fase, valor y unidad.
- Historial de ejecuciones conservado como registros separados.

## Alcance técnico
Las mediciones numéricas se almacenan como valores numéricos; las no numéricas se conservan como texto. No se calculan relaciones, tolerancias ni veredictos automáticos. Esas reglas deben definirse con los protocolos técnicos propios del demo.

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
