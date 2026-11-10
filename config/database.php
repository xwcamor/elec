<?php
/**
 * Configuración local para Laragon.
 * Ajusta DB_NAME y credenciales para apuntar a la base de datos que contiene `transformers`.
 */
return [
    'host' => getenv('DB_HOST') ?: '127.0.0.1',
    'port' => getenv('DB_PORT') ?: '3306',
    'database' => getenv('DB_NAME') ?: 'tr_app_development',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASS') ?: '',
    'charset' => 'utf8mb4',
    'transformers_table' => 'transformers',
    // Si la autodetección no coincide con tu esquema, define aquí el nombre real de la PK.
    'transformers_primary_key' => '',
];
