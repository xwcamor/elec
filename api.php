<?php
require_once __DIR__ . '/bootstrap.php';
$action = $_GET['action'] ?? '';
try {
    $pdo = Database::connection();
    $transformers = new TransformerRepository($pdo);
    $configs = new ElectricalConfigRepository($pdo);
    $tests = new ElectricalTestRepository($pdo);

    if ($action === 'health') {
        $cfg = require __DIR__ . '/config/database.php';
        $table = $cfg['transformers_table'] ?? 'transformers';
        $cols = $pdo->query('SHOW COLUMNS FROM `' . preg_replace('/[^A-Za-z0-9_]/','',$table) . '`')->fetchAll();
        json_response(['ok'=>true,'database'=>$cfg['database'],'transformers_table'=>$table,'transformers_columns'=>array_column($cols,'Field')]);
    }
    if ($action === 'search') {
        $q = trim((string)($_GET['q'] ?? ''));
        json_response(['ok' => true, 'items' => $transformers->search($q)]);
    }
    if ($action === 'load') {
        $key = trim((string)($_GET['key'] ?? ''));
        $transformer = $transformers->find($key);
        if (!$transformer) json_response(['ok' => false, 'message' => 'No se encontró el transformador en la tabla transformers.'], 404);
        $hasSchema = $pdo->query("SHOW TABLES LIKE 'eh_electrical_configs'")->fetch();
        $config = $hasSchema ? $configs->get($transformer['key']) : null;
        $hasTestSchema = $pdo->query("SHOW TABLES LIKE 'eh_test_execution_data'")->fetch();
        json_response(['ok' => true, 'transformer' => $transformer, 'config' => $config, 'schemaReady' => (bool)$hasSchema, 'testsSchemaReady' => (bool)$hasTestSchema]);
    }
    if ($action === 'transformer-update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = json_decode(file_get_contents('php://input'), true) ?: [];
        $key = trim((string)($payload['transformer_key'] ?? ''));
        if ($key === '') json_response(['ok'=>false,'message'=>'Falta identificar el transformador.'], 422);
        $result = $transformers->updateMain($key, $payload);
        json_response(['ok'=>true,'message'=>'Datos principales actualizados.','transformer'=>$result['transformer'],'updated_fields'=>$result['updated_fields'],'unsupported_fields'=>$result['unsupported_fields']]);
    }
    if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = json_decode(file_get_contents('php://input'), true) ?: [];
        $key = trim((string)($payload['transformer_key'] ?? ''));
        if (!$transformers->find($key)) json_response(['ok'=>false,'message'=>'El transformador ya no se encuentra en transformers. Vuelve a buscarlo y selecciónalo.'], 422);
        $result = $configs->save($key, $payload);
        json_response(['ok' => true, 'message' => 'Configuración guardada correctamente.', 'result' => $result]);
    }

    if ($action === 'test-types') {
        json_response(['ok' => true, 'items' => $tests->types()]);
    }
    if ($action === 'test-list') {
        $key = trim((string)($_GET['key'] ?? ''));
        json_response(['ok' => true, 'items' => $tests->listForTransformer($key)]);
    }
    if ($action === 'test-get') {
        $key = trim((string)($_GET['key'] ?? ''));
        $id = (int)($_GET['id'] ?? 0);
        $item = $tests->get($id, $key);
        if (!$item) json_response(['ok' => false, 'message' => 'No se encontró la ejecución solicitada.'], 404);
        json_response(['ok' => true, 'item' => $item]);
    }
    if ($action === 'test-save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = json_decode(file_get_contents('php://input'), true) ?: [];
        $key = trim((string)($payload['transformer_key'] ?? ''));
        if (!$transformers->find($key)) json_response(['ok'=>false,'message'=>'No se identificó el transformador en transformers. Búscalo y selecciónalo antes de guardar.'], 422);
        $result = $tests->save($payload);
        json_response(['ok' => true, 'message' => 'Registro de prueba guardado.', 'result' => $result]);
    }
    if ($action === 'test-delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = json_decode(file_get_contents('php://input'), true) ?: [];
        $key = trim((string)($payload['transformer_key'] ?? ''));
        $id = (int)($payload['id'] ?? 0);
        if ($key === '' || $id < 1) json_response(['ok'=>false,'message'=>'Falta identificar la visita que deseas eliminar.'], 422);
        if (!$transformers->find($key)) json_response(['ok'=>false,'message'=>'No se identificó el transformador. Vuelve a seleccionarlo.'], 422);
        if (!$tests->delete($id, $key)) json_response(['ok'=>false,'message'=>'La visita no existe o no pertenece al transformador seleccionado.'], 404);
        json_response(['ok'=>true,'message'=>'Visita y mediciones eliminadas.','result'=>['id'=>$id]]);
    }
    json_response(['ok' => false, 'message' => 'Acción no válida.'], 400);
} catch (PDOException $e) {
    json_response(['ok' => false, 'message' => 'No se pudo conectar o consultar MySQL. Revisa config/database.php y que el esquema del piloto esté instalado.', 'detail' => $e->getMessage()], 500);
} catch (Throwable $e) {
    json_response(['ok' => false, 'message' => $e->getMessage()], 422);
}
