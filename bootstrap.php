<?php
require_once __DIR__ . '/app/Database.php';
require_once __DIR__ . '/app/TransformerRepository.php';
require_once __DIR__ . '/app/ElectricalConfigRepository.php';
require_once __DIR__ . '/app/ElectricalTestRepository.php';

function json_response(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function demo_transformer(): array {
    return [
        'key' => 'demo-2001158', 'code' => '2001158', 'name' => 'Transformador de potencia',
        'company' => 'EMPRESA DE GENERACION ELECTRICA DE JUNIN S.A.C', 'tag' => 'TP-060-01',
        'voltage' => '60', 'power' => '25', 'year' => '2013', 'brand' => 'ABB',
        'tap_type' => 'DETC', 'num_taps' => null, 'vector_group' => '', 'location' => 'RONATULLO II',
        'phase_count' => 3, 'frequency_hz' => 60, 'insulation_type' => 'Mineral', 'cooling_type' => 'ONAN', 'notes' => '', 'raw' => [],
    ];
}
