<?php
declare(strict_types=1);

$config = require __DIR__ . '/config/database.php';
$pdo = null;
$dbError = null;
$notice = null;
$error = null;

try {
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $config['host'], $config['port'], $config['database'], $config['charset']);
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (Throwable $e) {
    $dbError = $e->getMessage();
}

function h(mixed $value): string {
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
function post(string $key, string $default = ''): string {
    return trim((string)($_POST[$key] ?? $default));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $pdo) {
    try {
        $action = post('action');
        if ($action === 'save_transformer') {
            $code = post('code');
            if ($code === '') throw new RuntimeException('El código del transformador es obligatorio.');
            $stmt = $pdo->prepare('INSERT INTO elec_transformers (code, manufacturer, model, serial_number, rated_power_kva, rated_voltage, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$code, post('manufacturer') ?: null, post('model') ?: null, post('serial_number') ?: null, post('rated_power_kva') ?: null, post('rated_voltage') ?: null, post('notes') ?: null]);
            $notice = 'Transformador registrado correctamente.';
        } elseif ($action === 'save_test_type') {
            $code = strtoupper(post('type_code'));
            $name = post('type_name');
            if ($code === '' || $name === '') throw new RuntimeException('Completa el código y el nombre del tipo de prueba.');
            $stmt = $pdo->prepare('INSERT INTO elec_test_types (code, name, description) VALUES (?, ?, ?)');
            $stmt->execute([$code, $name, post('type_description') ?: null]);
            $notice = 'Tipo de prueba agregado al catálogo.';
        } elseif ($action === 'save_execution') {
            $transformerId = (int)post('transformer_id');
            $typeId = (int)post('test_type_id');
            if (!$transformerId || !$typeId || post('executed_at') === '') throw new RuntimeException('Selecciona el equipo, el tipo de prueba y la fecha.');
            $pdo->beginTransaction();
            $stmt = $pdo->prepare('INSERT INTO elec_test_executions (transformer_id, test_type_id, reference_code, executed_at, operator_name, status, ambient_temperature_c, relative_humidity_pct, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$transformerId, $typeId, post('reference_code') ?: null, post('executed_at'), post('operator_name') ?: null, post('status', 'completed'), post('ambient_temperature_c') ?: null, post('relative_humidity_pct') ?: null, post('observations') ?: null]);
            $executionId = (int)$pdo->lastInsertId();
            $keys = $_POST['measurement_key'] ?? [];
            $labels = $_POST['measurement_label'] ?? [];
            $phases = $_POST['measurement_phase'] ?? [];
            $values = $_POST['measurement_value'] ?? [];
            $units = $_POST['measurement_unit'] ?? [];
            $insert = $pdo->prepare('INSERT INTO elec_test_measurements (execution_id, measurement_key, label, phase, sequence_no, value_numeric, value_text, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            $sequence = 0;
            foreach ($labels as $i => $label) {
                $label = trim((string)$label);
                $value = trim((string)($values[$i] ?? ''));
                if ($label === '' && $value === '') continue;
                if ($label === '') $label = 'Medición ' . ($sequence + 1);
                $numeric = $value !== '' && is_numeric(str_replace(',', '.', $value)) ? (float)str_replace(',', '.', $value) : null;
                $textValue = $value !== '' && $numeric === null ? $value : null;
                $insert->execute([$executionId, trim((string)($keys[$i] ?? '')) ?: 'measurement_' . ($sequence + 1), $label, trim((string)($phases[$i] ?? '')) ?: null, ++$sequence, $numeric, $textValue, trim((string)($units[$i] ?? '')) ?: null]);
            }
            $pdo->commit();
            $notice = 'Ejecución guardada. Se conservó como un registro nuevo del historial.';
        }
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $error = $e instanceof PDOException && (string)$e->getCode() === '23000'
            ? 'Ya existe un registro con ese código o referencia única.'
            : $e->getMessage();
    }
}

$transformers = $testTypes = $executions = [];
if ($pdo) {
    $transformers = $pdo->query('SELECT * FROM elec_transformers ORDER BY code')->fetchAll();
    $testTypes = $pdo->query('SELECT * FROM elec_test_types WHERE is_active = 1 ORDER BY name')->fetchAll();
    $executions = $pdo->query('SELECT e.*, t.code AS transformer_code, t.manufacturer, tt.name AS test_name FROM elec_test_executions e JOIN elec_transformers t ON t.id=e.transformer_id JOIN elec_test_types tt ON tt.id=e.test_type_id ORDER BY e.executed_at DESC, e.id DESC LIMIT 100')->fetchAll();
}
$activeTab = $_GET['tab'] ?? 'overview';
$tabs = ['overview' => 'Resumen', 'transformers' => 'Transformadores', 'tests' => 'Pruebas', 'history' => 'Historial'];
if (!isset($tabs[$activeTab])) $activeTab = 'overview';
?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ELEC · Mini demo de pruebas eléctricas</title>
<link rel="stylesheet" href="assets/css/app.css">
<script src="assets/js/app.js" defer></script>
</head>
<body>
<div class="layout">
    <aside class="sidebar">
        <a class="brand" href="index.php"><span class="brand-icon">E</span><span>ELEC<small>MINI DEMO</small></span></a>
        <div class="side-caption">GESTIÓN TÉCNICA</div>
        <nav class="nav">
            <?php foreach ($tabs as $key => $label): ?>
            <a class="<?= $activeTab === $key ? 'active' : '' ?>" href="?tab=<?= h($key) ?>">
                <span class="nav-mark"><?= ['overview'=>'◫','transformers'=>'▤','tests'=>'⌁','history'=>'◷'][$key] ?></span><?= h($label) ?>
            </a>
            <?php endforeach; ?>
        </nav>
        <div class="sidebar-foot"><span class="live-dot"></span> Proyecto independiente</div>
    </aside>
    <main class="main">
        <header class="topbar"><div><span class="crumb">ELEC / <?= h($tabs[$activeTab]) ?></span><h1><?= h($tabs[$activeTab]) ?></h1></div><span class="version">v0.3.0</span></header>
        <?php if ($notice): ?><div class="alert success"><?= h($notice) ?></div><?php endif; ?>
        <?php if ($error): ?><div class="alert danger"><?= h($error) ?></div><?php endif; ?>
        <?php if ($dbError): ?>
            <section class="db-warning"><strong>No se pudo conectar con MySQL</strong><p><?= h($dbError) ?></p><p>Inicia MySQL en Laragon e importa <code>database/schema.sql</code> en la base <code>elec_demo</code>. Revisa también <code>config/database.php</code>.</p></section>
        <?php else: ?>
        <?php if ($activeTab === 'overview'): ?>
            <section class="welcome-card"><div><span class="eyebrow">CONTROL DE PRUEBAS ELÉCTRICAS</span><h2>Registro técnico,<br>ordenado y trazable.</h2><p>Administra transformadores, define tu catálogo de pruebas y guarda mediciones con su historial.</p></div><div class="hero-symbol">E</div></section>
            <div class="stats">
                <article class="stat-card"><span>Transformadores</span><strong><?= count($transformers) ?></strong><small>Equipos registrados</small></article>
                <article class="stat-card"><span>Tipos de prueba</span><strong><?= count($testTypes) ?></strong><small>En el catálogo activo</small></article>
                <article class="stat-card"><span>Ejecuciones</span><strong><?= count($executions) ?></strong><small>Últimos 100 registros</small></article>
            </div>
            <section class="panel"><div class="panel-heading"><div><h3>Actividad reciente</h3><p>Últimas ejecuciones registradas</p></div><a class="text-link" href="?tab=history">Ver historial →</a></div>
            <?php if (!$executions): ?><div class="empty">Todavía no hay pruebas registradas. Empieza agregando un transformador y un tipo de prueba.</div><?php else: ?><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Equipo</th><th>Prueba</th><th>Estado</th></tr></thead><tbody><?php foreach (array_slice($executions,0,6) as $e): ?><tr><td><?= h($e['executed_at']) ?></td><td><?= h($e['transformer_code']) ?></td><td><?= h($e['test_name']) ?></td><td><span class="tag"><?= h($e['status']) ?></span></td></tr><?php endforeach; ?></tbody></table></div><?php endif; ?></section>
        <?php elseif ($activeTab === 'transformers'): ?>
            <section class="panel"><div class="panel-heading"><div><h3>Registrar transformador</h3><p>Datos generales del equipo</p></div></div>
            <form method="post" class="form-grid"><input type="hidden" name="action" value="save_transformer">
                <label>Código / identificación *<input name="code" required maxlength="80" placeholder="Ej. TR-001"></label>
                <label>Fabricante<input name="manufacturer" maxlength="120"></label>
                <label>Modelo<input name="model" maxlength="120"></label>
                <label>Número de serie<input name="serial_number" maxlength="120"></label>
                <label>Potencia nominal (kVA)<input name="rated_power_kva" type="number" step="0.001" min="0"></label>
                <label>Tensión nominal<input name="rated_voltage" placeholder="Dato de placa"></label>
                <label class="span-2">Observaciones<textarea name="notes" rows="2"></textarea></label>
                <div class="form-actions span-2"><button class="button primary">Guardar transformador</button></div>
            </form></section>
            <section class="panel"><div class="panel-heading"><div><h3>Equipos registrados</h3><p><?= count($transformers) ?> transformadores</p></div></div>
            <?php if (!$transformers): ?><div class="empty">No hay transformadores registrados.</div><?php else: ?><div class="table-wrap"><table><thead><tr><th>Código</th><th>Fabricante</th><th>Modelo</th><th>Serie</th><th>Potencia</th></tr></thead><tbody><?php foreach ($transformers as $t): ?><tr><td><strong><?= h($t['code']) ?></strong></td><td><?= h($t['manufacturer']) ?></td><td><?= h($t['model']) ?></td><td><?= h($t['serial_number']) ?></td><td><?= h($t['rated_power_kva']) ?></td></tr><?php endforeach; ?></tbody></table></div><?php endif; ?></section>
        <?php elseif ($activeTab === 'tests'): ?>
            <section class="panel"><div class="panel-heading"><div><h3>Catálogo de pruebas</h3><p>Define los tipos que necesitas registrar en este demo</p></div></div>
            <form method="post" class="form-grid compact"><input type="hidden" name="action" value="save_test_type">
                <label>Código *<input name="type_code" required maxlength="60" placeholder="Ej. TEST-01"></label><label>Nombre *<input name="type_name" required maxlength="160" placeholder="Nombre de la prueba"></label>
                <label class="span-2">Descripción<input name="type_description" maxlength="500"></label><div class="form-actions span-2"><button class="button secondary">Agregar tipo de prueba</button></div>
            </form>
            <div class="table-wrap"><table><thead><tr><th>Código</th><th>Tipo de prueba</th><th>Descripción</th></tr></thead><tbody><?php foreach ($testTypes as $type): ?><tr><td><?= h($type['code']) ?></td><td><strong><?= h($type['name']) ?></strong></td><td><?= h($type['description']) ?></td></tr><?php endforeach; ?><?php if (!$testTypes): ?><tr><td colspan="3">Catálogo vacío. Agrega el primer tipo de prueba.</td></tr><?php endif; ?></tbody></table></div></section>
            <section class="panel"><div class="panel-heading"><div><h3>Nueva ejecución</h3><p>Registra una prueba y sus mediciones</p></div></div>
            <?php if (!$transformers || !$testTypes): ?><div class="empty">Para registrar una ejecución, primero agrega al menos un transformador y un tipo de prueba.</div><?php else: ?>
            <form method="post" id="executionForm"><input type="hidden" name="action" value="save_execution">
                <div class="form-grid"><label>Transformador *<select name="transformer_id" required><option value="">Seleccionar equipo</option><?php foreach ($transformers as $t): ?><option value="<?= (int)$t['id'] ?>"><?= h($t['code']) ?><?= $t['serial_number'] ? ' · '.h($t['serial_number']) : '' ?></option><?php endforeach; ?></select></label>
                <label>Tipo de prueba *<select name="test_type_id" required><option value="">Seleccionar prueba</option><?php foreach ($testTypes as $type): ?><option value="<?= (int)$type['id'] ?>"><?= h($type['name']) ?></option><?php endforeach; ?></select></label>
                <label>Fecha y hora *<input type="datetime-local" name="executed_at" required value="<?= date('Y-m-d\TH:i') ?>"></label>
                <label>Referencia<input name="reference_code" maxlength="100"></label><label>Operador<input name="operator_name" maxlength="160"></label>
                <label>Estado<select name="status"><option value="completed">Completada</option><option value="draft">Borrador</option><option value="review">En revisión</option></select></label>
                <label>Temperatura ambiente (°C)<input type="number" step="0.001" name="ambient_temperature_c"></label><label>Humedad relativa (%)<input type="number" step="0.001" min="0" max="100" name="relative_humidity_pct"></label>
                <label class="span-2">Observaciones<textarea name="observations" rows="2"></textarea></label></div>
                <div class="measure-heading"><div><h4>Mediciones</h4><p>Agrega filas según los datos de tu protocolo.</p></div><button type="button" class="button small secondary" id="addMeasurement">+ Añadir fila</button></div>
                <div class="table-wrap"><table class="measurement-table"><thead><tr><th>Parámetro</th><th>Clave</th><th>Fase</th><th>Valor</th><th>Unidad</th><th></th></tr></thead><tbody id="measurementRows"><tr><td><input name="measurement_label[]" placeholder="Ej. Lectura 1"></td><td><input name="measurement_key[]" placeholder="lectura_1"></td><td><input name="measurement_phase[]" placeholder="A"></td><td><input name="measurement_value[]" inputmode="decimal"></td><td><input name="measurement_unit[]" placeholder="V, A, Ω..."></td><td><button type="button" class="remove-row" aria-label="Eliminar fila">×</button></td></tr></tbody></table></div>
                <div class="form-actions"><button class="button primary">Guardar ejecución</button></div>
            </form><?php endif; ?></section>
        <?php else: ?>
            <section class="panel"><div class="panel-heading"><div><h3>Historial de pruebas</h3><p>Las ejecuciones se conservan individualmente.</p></div></div>
            <?php if (!$executions): ?><div class="empty">Todavía no existen ejecuciones registradas.</div><?php else: ?><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Equipo</th><th>Prueba</th><th>Operador</th><th>Estado</th><th>Referencia</th></tr></thead><tbody><?php foreach ($executions as $e): ?><tr><td><?= h($e['executed_at']) ?></td><td><?= h($e['transformer_code']) ?></td><td><?= h($e['test_name']) ?></td><td><?= h($e['operator_name']) ?></td><td><span class="tag"><?= h($e['status']) ?></span></td><td><?= h($e['reference_code']) ?></td></tr><?php endforeach; ?></tbody></table></div><?php endif; ?></section>
        <?php endif; ?>
        <?php endif; ?>
        <footer class="page-footer">ELEC · Mini demo independiente de pruebas eléctricas · <?= date('Y') ?></footer>
    </main>
</div>
</body>
</html>
