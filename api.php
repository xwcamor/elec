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
    if ($action === 'transformer-list') {
        json_response(['ok'=>true,'items'=>$transformers->all(500)]);
    }
    if ($action === 'transformer-create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = json_decode(file_get_contents('php://input'), true) ?: [];
        $created = $transformers->create($payload);
        json_response(['ok'=>true,'message'=>'Transformador creado correctamente.','transformer'=>$created], 201);
    }
    if ($action === 'load') {
        $key = trim((string)($_GET['key'] ?? ''));
        $transformer = $transformers->find($key);
        if (!$transformer) json_response(['ok' => false, 'message' => 'No se encontró el transformador en la tabla transformers.'], 404);
        $requiredConfigTables = [
            'eh_electrical_configs', 'eh_windings', 'eh_terminals', 'eh_bushings',
            'eh_tap_changers', 'eh_tap_positions', 'eh_electrical_config_versions'
        ];
        $requiredTestTables = ['eh_test_types', 'eh_test_executions', 'eh_test_execution_data'];
        $allRequiredTables = array_merge($requiredConfigTables, $requiredTestTables);
        $placeholders = implode(',', array_fill(0, count($allRequiredTables), '?'));
        $tableCheck = $pdo->prepare('SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN (' . $placeholders . ')');
        $tableCheck->execute($allRequiredTables);
        $existingTables = array_fill_keys($tableCheck->fetchAll(PDO::FETCH_COLUMN), true);
        $missingConfigTables = array_values(array_filter($requiredConfigTables, static fn($name) => !isset($existingTables[$name])));
        $missingTestTables = array_values(array_filter($requiredTestTables, static fn($name) => !isset($existingTables[$name])));
        $schemaReady = count($missingConfigTables) === 0;
        $config = $schemaReady ? $configs->get($transformer['key']) : null;
        json_response([
            'ok' => true, 'transformer' => $transformer, 'config' => $config,
            'schemaReady' => $schemaReady, 'missingConfigTables' => $missingConfigTables,
            'testsSchemaReady' => count($missingTestTables) === 0, 'missingTestTables' => $missingTestTables
        ]);
    }
    if ($action === 'transformer-update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = json_decode(file_get_contents('php://input'), true) ?: [];
        $key = trim((string)($payload['transformer_key'] ?? ''));
        if ($key === '') json_response(['ok'=>false,'message'=>'Falta identificar el transformador.'], 422);
        $result = $transformers->updateMain($key, $payload);
        json_response(['ok'=>true,'message'=>'Datos principales actualizados.','transformer'=>$result['transformer'],'updated_fields'=>$result['updated_fields'],'unsupported_fields'=>$result['unsupported_fields']]);
    }
    if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = json_decode(file_get_contents('php://input'), true);
        if (!is_array($payload)) json_response(['ok'=>false,'message'=>'El servidor recibió un JSON vacío o inválido.'], 400);
        $key = trim((string)($payload['transformer_key'] ?? ''));
        if ($key === '') json_response(['ok'=>false,'message'=>'No se recibió el identificador del transformador.'], 422);
        if (!$transformers->find($key)) json_response(['ok'=>false,'message'=>'El transformador ya no se encuentra en transformers. Vuelve a buscarlo y selecciónalo.'], 422);

        $requiredConfigTables = [
            'eh_electrical_configs', 'eh_windings', 'eh_terminals', 'eh_bushings',
            'eh_tap_changers', 'eh_tap_positions', 'eh_electrical_config_versions'
        ];
        $placeholders = implode(',', array_fill(0, count($requiredConfigTables), '?'));
        $tableCheck = $pdo->prepare('SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN (' . $placeholders . ')');
        $tableCheck->execute($requiredConfigTables);
        $existingTables = array_fill_keys($tableCheck->fetchAll(PDO::FETCH_COLUMN), true);
        $missingConfigTables = array_values(array_filter($requiredConfigTables, static fn($name) => !isset($existingTables[$name])));
        if ($missingConfigTables) {
            json_response([
                'ok'=>false,
                'message'=>'No se puede guardar la configuración: faltan tablas en la base de datos.',
                'detail'=>'Tablas faltantes: ' . implode(', ', $missingConfigTables)
            ], 409);
        }

        $result = $configs->save($key, $payload);
        json_response(['ok' => true, 'message' => 'Configuración guardada correctamente.', 'result' => $result]);
    }

    if ($action === 'test-types') {
        json_response(['ok' => true, 'items' => $tests->types()]);
    }
    if ($action === 'test-list') {
        $key = trim((string)($_GET['key'] ?? ''));
        if ($key === '') json_response(['ok'=>false,'message'=>'Falta identificar el transformador para consultar el historial.'], 422);
        if (!$transformers->find($key)) json_response(['ok'=>false,'message'=>'El transformador solicitado ya no existe o no está disponible.'], 404);
        $items = $tests->listForTransformer($key);
        json_response(['ok'=>true,'transformer_key'=>$key,'total'=>count($items),'items'=>$items]);
    }
    if ($action === 'test-get') {
        $key = trim((string)($_GET['key'] ?? ''));
        $id = (int)($_GET['id'] ?? 0);
        $item = $tests->get($id, $key);
        if (!$item) json_response(['ok' => false, 'message' => 'No se encontró el registro solicitado.'], 404);
        json_response(['ok' => true, 'item' => $item]);
    }
    if ($action === 'test-save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = json_decode(file_get_contents('php://input'), true) ?: [];
        $key = trim((string)($payload['transformer_key'] ?? ''));
        if (!$transformers->find($key)) json_response(['ok'=>false,'message'=>'No se identificó el transformador en transformers. Búscalo y selecciónalo antes de guardar.'], 422);
        // Garantiza que exista el tipo interno de registro antes de persistir la jornada.
        $tests->types();
        $result = $tests->save($payload);
        json_response(['ok' => true, 'message' => 'Registro de pruebas guardado.', 'result' => $result]);
    }
    if ($action === 'test-delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = json_decode(file_get_contents('php://input'), true) ?: [];
        $key = trim((string)($payload['transformer_key'] ?? ''));
        $id = (int)($payload['id'] ?? 0);
        if ($key === '' || $id < 1) json_response(['ok'=>false,'message'=>'Falta identificar el registro que deseas eliminar.'], 422);
        if (!$transformers->find($key)) json_response(['ok'=>false,'message'=>'No se identificó el transformador. Vuelve a seleccionarlo.'], 422);
        if (!$tests->delete($id, $key)) json_response(['ok'=>false,'message'=>'El registro no existe o no pertenece al transformador seleccionado.'], 404);
        json_response(['ok'=>true,'message'=>'Registro y mediciones eliminados.','result'=>['id'=>$id]]);
    }
    json_response(['ok' => false, 'message' => 'Acción no válida.'], 400);
} catch (PDOException $e) {
    json_response(['ok' => false, 'message' => 'No se pudo conectar o consultar MySQL. Revisa config/database.php y que el esquema del piloto esté instalado.', 'detail' => $e->getMessage()], 500);
} catch (Throwable $e) {
    json_response(['ok' => false, 'message' => $e->getMessage()], 422);
}
