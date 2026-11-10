<?php
declare(strict_types=1);

/**
 * Configuración local de ELEC.
 * Ajusta estos valores según tu instalación de Laragon.
 */
return [
    'host' => getenv('ELEC_DB_HOST') ?: '127.0.0.1',
    'port' => (int) (getenv('ELEC_DB_PORT') ?: 3306),
    'database' => getenv('ELEC_DB_NAME') ?: 'elec_demo',
    'username' => getenv('ELEC_DB_USER') ?: 'root',
    'password' => getenv('ELEC_DB_PASSWORD') !== false ? getenv('ELEC_DB_PASSWORD') : '',
    'charset' => 'utf8mb4',
];
