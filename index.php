<?php
require_once __DIR__ . '/bootstrap.php';
function h($v): string { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
$identifier = trim((string)($_GET['t'] ?? '2001158'));
$transformer = demo_transformer();
$config = null;
$dbConnected = false;
$schemaReady = false;
$testsSchemaReady = false;
$dbMessage = '';
$transformerFound = false;
$dbName = '';
try {
    $pdo = Database::connection();
    $dbConnected = true;
    $dbCfg = require __DIR__ . '/config/database.php';
    $dbName = (string)($dbCfg['database'] ?? '');
    $repo = new TransformerRepository($pdo);
    $found = $repo->find($identifier);
    if ($found) { $transformer = $found; $transformerFound = true; }
    else $dbMessage = 'No se encontró el registro indicado; se muestra el transformador de demostración.';
    $requiredConfigTables = [
        'eh_electrical_configs', 'eh_windings', 'eh_terminals', 'eh_bushings',
        'eh_tap_changers', 'eh_tap_positions', 'eh_electrical_config_versions'
    ];
    $tableCheck = $pdo->prepare('SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1');
    $missingConfigTables = [];
    foreach ($requiredConfigTables as $tableName) {
        $tableCheck->execute([$tableName]);
        if (!$tableCheck->fetchColumn()) $missingConfigTables[] = $tableName;
    }
    $schemaReady = count($missingConfigTables) === 0;

    $requiredTestTables = ['eh_test_types','eh_test_executions','eh_test_execution_data'];
    $missingTestTables = [];
    foreach ($requiredTestTables as $tableName) {
        $tableCheck->execute([$tableName]);
        if (!$tableCheck->fetchColumn()) $missingTestTables[] = $tableName;
    }
    $testsSchemaReady = count($missingTestTables) === 0;
    if ($schemaReady) {
        $configRepo = new ElectricalConfigRepository($pdo);
        if ($found) $config = $configRepo->get($found['key']);
    } else {
        $dbMessage = 'Faltan tablas del piloto: ' . implode(', ', $missingConfigTables) . '. Importa database/schema.sql en la base ' . $dbName . '.';
    }
} catch (Throwable $e) {
    $dbMessage = 'Modo demostración: configura MySQL en config/database.php. ' . $e->getMessage();
}
$displayCode = $transformer['code'] ?: $transformer['key'];
$voltage = $transformer['voltage'] ?: '—';
$power = $transformer['power'] ?: '—';
$year = $transformer['year'] ?: '—';
$brand = $transformer['brand'] ?: '—';
$tapType = $transformer['tap_type'] ?: '—';
$vector = $transformer['vector_group'] ?: '—';
$location = $transformer['location'] ?: '—';
$initialConfig = $config ?: [
  'phase_count' => 3, 'vector_group' => $transformer['vector_group'] ?? '', 'frequency_hz' => 60, 'notes' => '', 'version_no' => 0,
  'windings' => [], 'tap_changers' => [], 'versions' => []
];
$hasSavedElectricalConfig = is_array($config)
    && (int)($config['version_no'] ?? 0) > 0
    && !empty($config['windings']);
if (!$transformerFound) {
    $testsAccessBlockReason = 'Selecciona un transformador real para habilitar las pruebas eléctricas.';
} elseif (!$schemaReady) {
    $testsAccessBlockReason = 'Falta preparar el almacenamiento de la configuración eléctrica.';
} elseif (!$hasSavedElectricalConfig) {
    $testsAccessBlockReason = 'Primero completa y guarda la Configuración eléctrica del transformador.';
} elseif (!$testsSchemaReady) {
    $testsAccessBlockReason = 'Faltan las tablas del módulo de pruebas eléctricas.';
} else {
    $testsAccessBlockReason = '';
}
$canAccessElectricalTests = $testsAccessBlockReason === '';

?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>TR Health | Piloto de configuración eléctrica</title>
<link rel="stylesheet" href="./assets/app.css?v=1.5.47">
</head>
<body>
<svg aria-hidden="true" class="svg-sprite" xmlns="http://www.w3.org/2000/svg">
 <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></symbol>
 <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></symbol>
 <symbol id="i-bell" viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></symbol>
 <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></symbol>
 <symbol id="i-grid" viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></symbol>
 <symbol id="i-chevron" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></symbol>
 <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></symbol>
 <symbol id="i-zap" viewBox="0 0 24 24"><path d="m13 2-9 12h7l-1 8 10-13h-7z"/></symbol>
 <symbol id="i-gauge" viewBox="0 0 24 24"><path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 14 4-4M6 18h12"/></symbol>
 <symbol id="i-tag" viewBox="0 0 24 24"><path d="M20 13 11 22l-9-9V2h11z"/><circle cx="7" cy="7" r="1"/></symbol>
 <symbol id="i-edit" viewBox="0 0 24 24"><path d="m4 16-.8 4.8L8 20l11-11-4-4zM13.5 6.5l4 4"/></symbol>
 <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></symbol>
 <symbol id="i-lock" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></symbol>
 <symbol id="i-file" viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6"/></symbol>
 <symbol id="i-share" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4m-6.6 9.4 6.6 2.6"/></symbol>
 <symbol id="i-history" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5m4-1v5l3 2"/></symbol>
 <symbol id="i-activity" viewBox="0 0 24 24"><path d="M3 12h4l3-8 4 16 3-8h4"/></symbol>
 <symbol id="i-flask" viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-6 10a1.5 1.5 0 0 0 1.3 2h13.4a1.5 1.5 0 0 0 1.3-2L14 9V3M8 15h8"/></symbol>
 <symbol id="i-droplet" viewBox="0 0 24 24"><path d="M12 2C8 8 5 11 5 15a7 7 0 0 0 14 0c0-4-3-7-7-13z"/></symbol>
 <symbol id="i-percent" viewBox="0 0 24 24"><path d="m19 5-14 14"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></symbol>
 <symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.6v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.3v-2.6h.2A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2H15v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.5 1z"/></symbol>
 <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
 <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></symbol>
 <symbol id="i-copy" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></symbol>
 <symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4"/></symbol>
 <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></symbol>
 <symbol id="i-terminal" viewBox="0 0 24 24"><path d="m4 7 5 5-5 5m7 0h9"/></symbol>
 <symbol id="i-layers" viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/></symbol>
 <symbol id="i-cpu" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4"/></symbol>
 <symbol id="i-chevron-down" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
</svg>
<header class="topbar">
  <button class="icon-btn dark" aria-label="Menú"><svg><use href="#i-menu"/></svg></button>
  <div class="brand-mark">T</div><strong>TR Health</strong>
  <div class="global-search"><svg><use href="#i-search"/></svg><input id="globalSearch" placeholder="Escribe para ir a un módulo o buscar un trafo..."><kbd>⌘K</kbd><div id="searchResults" class="search-results"></div></div>
  <div class="topbar-transformer-tools">
    <label class="topbar-transformer-select" aria-label="Cambiar transformador">
      <svg><use href="#i-layers"/></svg>
      <select id="transformerSwitcher" aria-label="Seleccionar transformador"><option value="">Cargando trafos…</option></select>
    </label>
    <button type="button" class="btn primary topbar-create-transformer" id="createTransformerBtn" title="Crear transformador" aria-label="Crear transformador"><svg><use href="#i-plus"/></svg><span>Crear trafo</span></button>
  </div>
  <div class="top-actions"><button class="icon-btn dark" title="Aplicaciones"><svg><use href="#i-grid"/></svg></button><button class="icon-btn dark notification" title="Notificaciones"><svg><use href="#i-bell"/></svg><i>1</i></button><button class="icon-btn dark notification" title="Mensajes"><svg><use href="#i-mail"/></svg><i>1</i></button><div class="user-chip"><span>H</span> Hector G⌄</div></div>
</header>
<main class="page-shell">
  <section class="record-heading">
    <button class="back-btn" title="Volver"><svg><use href="#i-chevron"/></svg></button>
    <div class="record-icon"><svg><use href="#i-calendar"/></svg></div>
    <div class="record-title"><h1 id="transformerCode"><?=h($displayCode)?></h1><div id="companyName"><?=h($transformer['company'])?></div></div>
    <div class="heading-actions">
      
      
      <button class="btn primary" id="editTransformerBtn" type="button"><svg><use href="#i-edit"/></svg>Editar transformador</button>
      
      
    </div>
  </section>
  <nav class="record-tabs"><button class="active"><svg><use href="#i-file"/></svg>Detalles</button><button><svg><use href="#i-history"/></svg>Historial <small>1</small></button></nav>
  <section class="general-card">
    <div class="card-title"><span>♧ &nbsp;Información general</span><button class="btn small" id="changeView"><svg><use href="#i-grid"/></svg>Cambiar vista</button></div>
    <div class="transformer-card">
      <div class="transformer-illustration"><div class="coil-dots"><i></i><i></i><i></i></div><div class="transformer-symbol"><svg><use href="#i-zap"/></svg></div></div>
      <div class="transformer-data">
        <h2 id="summaryCode"><?=h($displayCode)?></h2>
        <div class="muted-line"><span id="summaryTag">TAG <?=h($transformer['tag'] ?: '—')?></span> · Potencia · Mineral</div>
        <div class="metrics-row">
          <span class="metric"><svg><use href="#i-zap"/></svg><b id="summaryVoltage"><?=h($voltage)?></b> kV</span>
          <span class="metric"><svg><use href="#i-gauge"/></svg><b id="summaryPower"><?=h($power)?></b> MVA</span>
          <span class="metric"><svg><use href="#i-calendar"/></svg><b id="summaryYear"><?=h($year)?></b> <small>año</small></span>
          <span class="metric"><svg><use href="#i-tag"/></svg><b id="summaryBrand"><?=h($brand)?></b></span>
          <span class="metric"><svg><use href="#i-cpu"/></svg><b id="summaryTapType"><?=h($tapType)?></b></span>
          <span class="metric"><svg><use href="#i-layers"/></svg><b id="summaryVector"><?=h($vector)?></b></span>
        </div>
        <div class="location-line"><span>⌖</span><b id="summaryCompany"><?=h($transformer['company'])?></b> &nbsp;|&nbsp; → → <span id="summaryLocation"><?=h($location)?></span></div>
        <div class="transformer-spec-line" id="summaryTechnicalDetails"><?=h(implode(' · ', array_filter([$transformer['phase_count'] ? $transformer['phase_count'].' fases' : '', $transformer['frequency_hz'] ? $transformer['frequency_hz'].' Hz' : '', $transformer['insulation_type'], $transformer['cooling_type']])))?></div>
      </div>
      <div class="health-box"><div class="health-ring"><strong>100</strong><small>%</small></div><b><i></i> Excelente</b><small>ÍNDICE DE SALUD</small><span class="stable-pill">▰ ESTABLE</span></div>
    </div>
  </section>

  <section class="workspace" id="overviewPage">
    <aside class="side-nav">
      <div class="nav-caption">DIAGNÓSTICO</div>
      <span class="nav-disabled nav-current" aria-disabled="true" title="Vista actual del piloto"><svg><use href="#i-activity"/></svg>Resumen</span>
      <button class="nav-disabled" type="button" disabled title="Módulo fuera del alcance de este piloto"><svg><use href="#i-flask"/></svg>Análisis Cromatográfico</button>
      <button class="nav-disabled" type="button" disabled title="Módulo fuera del alcance de este piloto"><svg><use href="#i-droplet"/></svg>Fisicoquímico</button>
      <button class="nav-disabled" type="button" disabled title="Módulo fuera del alcance de este piloto"><svg><use href="#i-file"/></svg>Furanos</button>
      <button class="nav-disabled" type="button" disabled title="Módulo fuera del alcance de este piloto"><svg><use href="#i-percent"/></svg>Factor de Potencia</button>
      <button class="nav-action electrical-tests-link<?= $canAccessElectricalTests ? '' : ' is-locked' ?>" id="openElectricalTests" type="button" <?= $canAccessElectricalTests ? '' : 'disabled aria-disabled="true"' ?> title="<?=h($testsAccessBlockReason ?: 'Abrir pruebas eléctricas')?>">
        <svg><use href="#i-zap"/></svg>Pruebas eléctricas
        <svg class="nav-lock-icon<?= $canAccessElectricalTests ? ' hidden' : '' ?>" id="testsNavLock" aria-label="Bloqueado" role="img"><use href="#i-lock"/></svg>
      </button>
      <div class="nav-caption sub-caption">REGISTRO</div>
      <button class="nav-disabled" type="button" disabled title="Bitácora fuera del alcance de este piloto"><svg><use href="#i-history"/></svg>Bitácora</button>
      <div class="nav-caption sub-caption">CONFIGURACIÓN</div>
      <button class="nav-action config-link" id="openConfig" type="button">
        <svg><use href="#i-settings"/></svg>Configuración eléctrica
        <span class="config-nav-indicator" id="configNavState" data-state="<?= $hasSavedElectricalConfig ? 'partial' : 'missing' ?>" aria-label="Configuración pendiente">!</span>
      </button>
    </aside>
    <div class="overview-content">
      <div class="info-banner"><svg><use href="#i-info"/></svg> Diagnóstico parcial: faltan pruebas. El índice se calcula solo con las que tienen datos.</div>
      <div class="conclusion-box"><strong>CONCLUSIÓN DEL ÍNDICE DE SALUD</strong><p>Índice de salud 100/100 → estado Excelente.</p><p>Todas las pruebas realizadas están en buen estado; ninguna reduce el índice de forma significativa.</p><p>Acción sugerida: monitoreo de rutina, mantener la frecuencia de muestreo habitual.</p></div>
      <div class="health-cards">
        <article class="health-card"><h3>Cromatografía (DGA)</h3><div class="mini-health"><div class="mini-gauge"><span></span></div><div><b>Excelente</b><small>Peso de la prueba 47.6%</small><em>▢ Última muestra: 2026-04-05</em></div></div><hr><strong>● Sin falla activa: gases bajo sus valores típicos (IEC 60599).</strong><p>CO₂/CO = 11 → oxidación/envejecimiento del papel a baja temperatura; bajo riesgo.</p></article>
        <article class="health-card"><h3>Fisicoquímico</h3><div class="mini-health"><div class="mini-gauge"><span></span></div><div><b>Excelente</b><small>Peso de la prueba 28.6%</small><em>▢ Última muestra: 2026-04-05</em></div></div><hr><strong>● Todos los parámetros medidos están dentro de rango.</strong></article>
        <article class="health-card"><h3>Furanos</h3><div class="mini-health"><div class="mini-gauge"><span></span></div><div><b>Excelente</b><small>Peso de la prueba 23.8%</small><em>▢ Última muestra: 2026-04-05</em></div></div><hr><strong>● Papel aislante en buen estado</strong><p>DP ≈ 1140<br>0% de vida del papel consumida</p></article>
        <article class="health-card muted-card"><h3>Factor de Potencia</h3><p><em>Sin registro</em></p></article>
      </div>
    </div>
  </section>

  <section class="test-page hidden" id="testPage">
    <div class="config-toolbar">
      <div><div class="breadcrumbs">Transformador <span>/</span> Pruebas eléctricas</div><h2>Pruebas eléctricas</h2><p>Registra los ensayos de este transformador y consulta sus resultados históricos.</p></div>
      <div class="toolbar-actions"><button class="btn" id="backFromTests">Volver al transformador</button><button class="btn primary" id="newTestExecution"><svg><use href="#i-plus"/></svg>Registrar pruebas</button></div>
    </div>
    <div class="test-view-switcher" role="tablist" aria-label="Secciones de pruebas eléctricas">
      <button class="test-view-tab active" type="button" id="showTestSummary" data-test-view="summary" role="tab" aria-selected="true" aria-controls="testSummaryPanel"><svg><use href="#i-grid"/></svg>Resumen</button>
      <button class="test-view-tab" type="button" id="showTestTable" data-test-view="table" role="tab" aria-selected="false" aria-controls="testHistoryPanel"><svg><use href="#i-file"/></svg>Historial</button>
      <button class="test-view-tab" type="button" id="showTestGraph" data-test-view="graph" role="tab" aria-selected="false" aria-controls="testAnalyticsPanel"><svg><use href="#i-activity"/></svg>Gráfico</button>
    </div>
    <section id="testSummaryPanel" class="test-view-panel" role="tabpanel" aria-labelledby="showTestSummary">
      <div class="test-stats" id="testStats"></div>
      <section class="test-attention-card" aria-label="Registros que requieren atención">
        <div class="test-attention-head"><div><span class="eyebrow">SEGUIMIENTO</span><h3>Registros que requieren atención</h3><p>Revisa los registros pendientes o continúa los borradores.</p></div></div>
        <div id="testAttentionList" class="test-attention-list"><div class="test-attention-empty">Cargando registros...</div></div>
      </section>
      <div class="test-summary-intro">
        <div><span class="eyebrow">SEGUIMIENTO DEL TRANSFORMADOR</span><h3>Actividad de ensayos</h3><p>Consulta el historial o revisa la evolución sin mezclar magnitudes eléctricas distintas.</p></div>
        <div class="test-summary-latest" id="testSummaryLatest"><span>Último registro</span><strong>Sin registros</strong></div>
      </div>
    </section>
    <section id="testHistoryPanel" class="test-view-panel hidden" role="tabpanel" aria-labelledby="showTestTable">
      <div class="test-history-card">
        <div class="test-history-head"><div><span class="eyebrow">HISTORIAL DE PRUEBAS ELÉCTRICAS</span><h3>Pruebas eléctricas registradas</h3><p>Consulta los registros de pruebas eléctricas y abre uno para revisar o completar sus resultados.</p></div><div class="test-history-controls"><label class="test-status-filter"><span>Estado</span><select id="testHistoryStatusFilter"><option value="ALL">Todos</option><option value="COMPLETE">Completo</option><option value="INCOMPLETE">Incompleto</option><option value="DRAFT">En borrador</option></select></label><div class="test-filter"><svg><use href="#i-search"/></svg><input id="testHistoryFilter" placeholder="Filtrar por prueba o responsable..."></div></div></div>
        <div class="test-table-wrap"><table class="test-history-table"><thead><tr><th>Fecha de registro</th><th>Pruebas incluidas</th><th>N.º de pruebas</th><th>Responsable</th><th>Estado</th><th>Acción</th></tr></thead><tbody id="testHistoryBody"><tr><td colspan="6" class="test-empty">Aún no hay registros. Selecciona una prueba para crear tu primer plan.</td></tr></tbody></table></div>
      </div>
    </section>
    <section id="testAnalyticsPanel" class="test-view-panel hidden" role="tabpanel" aria-labelledby="showTestGraph">
      <section class="analytics-card" aria-label="Evolución histórica">
        <div class="analytics-heading"><div><span class="eyebrow">LECTURA VISUAL</span><h3>Actividad de ensayos</h3><p>Compara la cantidad de visitas por mes y la distribución de los tipos de prueba.</p></div><span class="analytics-period" id="analyticsPeriod">—</span></div>
        <div class="analytics-grid">
          <div class="analytics-chart-panel"><b>Visitas registradas por mes</b><div id="monthlyExecutionChart" class="analytics-chart"></div></div>
          <div class="analytics-chart-panel"><b>Distribución por tipo de prueba</b><div id="testTypeAnalytics" class="type-analytics"></div></div>
        </div>
        <div class="analytics-footnote">La vista es estadística: no combina valores eléctricos distintos ni reemplaza la evaluación del protocolo de cada ensayo.</div>
      </section>
    </section>
  </section>

  <section class="execution-page hidden" id="executionPage">
    <div class="config-toolbar">
      <div><div class="breadcrumbs">Transformador <span>/</span> Pruebas eléctricas <span>/</span> Registro</div><h2 id="executionTitle">Nueva ejecución de prueba</h2><p>La fecha que ingreses identifica cuándo se realizó esta medición en campo.</p></div>
      <div class="toolbar-actions"><button class="btn" id="cancelExecution">Cancelar</button><button class="btn primary" id="saveExecution"><svg><use href="#i-check"/></svg>Guardar registro</button></div>
    </div>
    <div class="execution-date-card">
      <div class="date-emblem"><svg><use href="#i-calendar"/></svg></div>
      <div class="date-copy"><strong>Fecha y hora de la prueba</strong><small>Es la fecha del ensayo, no la fecha en que se guardó en el sistema.</small></div>
      <label class="execution-date-field"><span>Realizada el *</span><input id="executionDate" type="datetime-local" required></label>
    </div>
    <div class="execution-layout">
      <div class="execution-main">
        <section class="execution-card">
          <div class="execution-card-title"><span class="eyebrow">01 · IDENTIFICACIÓN</span><h3>Datos generales de la ejecución</h3></div>
          <div class="form-grid execution-meta-grid">
            <label>Tipo de prueba<select id="executionType" required></select></label>
            <label>Responsable / técnico<input id="executionOperator" placeholder="Nombre del técnico"></label>
            <label>Supervisor<input id="executionSupervisor" placeholder="Nombre del supervisor"></label>
            <label>Norma / referencia<input id="executionStandard" placeholder="Ej. IEC / IEEE / protocolo interno"></label>
          </div>
        </section>
        <section class="execution-card">
          <div class="execution-card-title"><span class="eyebrow">02 · INSTRUMENTO</span><h3>Equipo de medición</h3></div>
          <div class="form-grid">
            <label>Equipo<input id="executionEquipment" placeholder="Nombre del instrumento"></label>
            <label>Marca<input id="executionEquipmentBrand" placeholder="Marca"></label>
            <label>Modelo<input id="executionEquipmentModel" placeholder="Modelo"></label>
            <label>Número de serie<input id="executionEquipmentSerial" placeholder="Serie del equipo"></label>
            <label>Temperatura de aceite (°C)<input id="executionOilTemp" inputmode="decimal" placeholder="—"></label>
            <label>Temperatura ambiente (°C)<input id="executionAmbientTemp" inputmode="decimal" placeholder="—"></label>
            <label>Humedad relativa (%)<input id="executionHumidity" inputmode="decimal" placeholder="—"></label>
          </div>
        </section>
        <section class="execution-card" id="measurementGenericCard">
          <div class="execution-card-title execution-measurement-title"><div><span class="eyebrow">03 · RESULTADOS</span><h3>Datos y mediciones</h3><p>Grilla inicial tipo Excel. Pega bloques desde Excel y conserva cada valor en esta ejecución.</p></div><button class="btn primary" id="addMeasurementRow"><svg><use href="#i-plus"/></svg>Agregar fila</button></div>
          <div id="ttrEditor" class="ttr-editor hidden">
  <div class="ttr-editor-head"><div><b>Plantilla TTR · Relación de transformación</b><small>Una fila por posición de tap. Puedes pegar rangos directamente desde Excel.</small></div><button type="button" class="btn small" id="ttrAddRows">＋ Agregar 5 filas</button></div>
  <div class="measurement-sheet-wrap"><table class="measurement-sheet ttr-sheet"><thead><tr><th>Tap</th><th>V AT nominal (kV)</th><th>V BT nominal (kV)</th><th>Relación teórica</th><th>Medida U</th><th>Error U (%)</th><th>Medida V</th><th>Error V (%)</th><th>Medida W</th><th>Error W (%)</th><th>Observación</th></tr></thead><tbody id="ttrRows"></tbody></table></div>
  <div class="sheet-hint">Flechas y Tab para navegar · Ctrl+V para pegar desde Excel. Cálculo del protocolo: Rt = V AT / (V BT × √3). Error por fase = (R medida − Rt) × 100 / R medida. No se aplica criterio de aprobación automático.</div>
</div>
<div id="specificTestEditor" class="ttr-editor hidden">
  <div class="ttr-editor-head"><div><b id="specificTestTitle">Plantilla de prueba</b><small id="specificTestHint">Registra los resultados según el procedimiento aplicado.</small></div><button type="button" class="btn small" id="specificAddRows">＋ Agregar 5 filas</button></div>
  <div class="measurement-sheet-wrap"><table class="measurement-sheet ttr-sheet"><thead id="specificTestHead"></thead><tbody id="specificTestRows"></tbody></table></div>
  <div class="sheet-hint">Plantilla basada en el protocolo de referencia. Los campos calculados se identifican en la propia tabla; los demás valores se registran tal como los entrega el instrumento.</div>
</div>
<div class="measurement-sheet-wrap" id="measurementGenericWrap"><table class="measurement-sheet"><thead><tr><th>#</th><th>Parámetro / punto</th><th>Valor medido</th><th>Unidad</th><th>Observación</th><th></th></tr></thead><tbody id="measurementRows"></tbody></table></div>
          <div class="sheet-hint">Atajos: Ctrl+V para pegar una tabla desde Excel · Flechas para moverte entre celdas · Tab para avanzar.</div>
          <div class="execution-warning"><svg><use href="#i-info"/></svg>Las plantillas específicas registran los valores indicados por el protocolo aplicado. No se calculan desviaciones, compensaciones ni límites automáticos sin validar la norma y el procedimiento correspondiente.</div>
        </section>
        <section class="execution-card"><div class="execution-card-title"><span class="eyebrow">04 · TRAZABILIDAD</span><h3>Observaciones</h3></div><textarea id="executionObservations" rows="3" placeholder="Condiciones de prueba, conexiones utilizadas, incidencias..." class="execution-observations"></textarea></section>
      </div>

    </div>
  </section>

  <section class="execution-page hidden" id="planPage">
    <div class="config-toolbar">
      <div><div class="breadcrumbs">Transformador <span>/</span> Pruebas eléctricas <span>/</span> Plan</div><h2 id="planTitle">Nuevo registro de pruebas</h2><p>Organiza los datos generales, selecciona los ensayos y completa cada protocolo por separado.</p></div>
      <div class="plan-toolbar-actions"><span id="planSaveStatus" class="plan-save-status" data-state="idle" aria-live="polite"><i></i><span>Se guardará automáticamente al modificar datos</span></span><div class="toolbar-actions"><button class="btn" id="cancelPlan">Volver al historial</button><button class="btn primary" id="saveTestPlan"><svg><use href="#i-check"/></svg>Guardar ahora</button></div></div>
    </div>
    <nav class="plan-stepper" id="planStepper" aria-label="Etapas del registro de pruebas">
      <button type="button" class="plan-step" data-plan-step="shared" data-state="missing" aria-current="step"><span class="plan-step-number">01</span><span class="plan-step-copy"><b>Datos generales</b><small>Fecha y responsables</small></span></button>
      <span class="plan-step-connector" aria-hidden="true"></span>
      <button type="button" class="plan-step" data-plan-step="selection" data-state="missing"><span class="plan-step-number">02</span><span class="plan-step-copy"><b>Ensayos</b><small>Seleccionar pruebas</small></span></button>
      <span class="plan-step-connector" aria-hidden="true"></span>
      <button type="button" class="plan-step" data-plan-step="results" data-state="missing"><span class="plan-step-number">03</span><span class="plan-step-copy"><b>Mediciones</b><small>Un ensayo a la vez</small></span></button>
      <span class="plan-step-connector" aria-hidden="true"></span>
      <button type="button" class="plan-step" data-plan-step="review" data-state="missing"><span class="plan-step-number">04</span><span class="plan-step-copy"><b>Resumen</b><small>Revisión y guardado</small></span></button>
    </nav>
    <section class="plan-progress-panel" id="planProgressPanel" data-state="warning" aria-live="polite">
      <div class="plan-progress-main"><strong>Preparando resumen de avance…</strong></div>
    </section>
    <section class="execution-card plan-shared-card plan-step-panel" id="planSharedSection" data-plan-panel="shared">
      <div class="execution-card-title"><span class="eyebrow">01 · DATOS COMPARTIDOS</span><h3>Datos de la visita y condiciones ambientales</h3><p>Se ingresan una sola vez y se comparten con todos los ensayos del plan.</p></div>
      <div class="execution-date-card plan-date-inline"><div class="date-emblem"><svg><use href="#i-calendar"/></svg></div><div class="date-copy"><strong>Fecha y hora de las pruebas</strong><small>Fecha real de realización de los ensayos.</small></div><label class="execution-date-field"><span>Realizada el *</span><input id="planDate" type="datetime-local" required></label></div>
      <div class="plan-shared-status is-pending" id="planSharedStatus" aria-live="polite">Pendiente: fecha de la visita · responsable / técnico</div>
      <div class="plan-core-grid">
        <label>Responsable / técnico<input id="planOperator" placeholder="Nombre del técnico"></label>
        <label>Supervisor<input id="planSupervisor" placeholder="Nombre del supervisor"></label>
      </div>
      <details class="plan-optional-details">
        <summary><span>Condiciones ambientales</span><small>Temperaturas, humedad y observaciones</small></summary>
        <div class="form-grid execution-meta-grid plan-shared-grid">
          <label>Temperatura del aceite (°C)<input id="planOilTemp" inputmode="decimal" placeholder="Ej. 35.5"></label>
          <label>Temperatura ambiente (°C)<input id="planAmbientTemp" inputmode="decimal" placeholder="Ej. 22"></label>
          <label>Humedad relativa (%)<input id="planHumidity" inputmode="decimal" placeholder="Ej. 74"></label>
        </div>
        <label class="plan-shared-notes">Observaciones generales<textarea id="planObservations" rows="2" placeholder="Condiciones del servicio, ubicación e incidencias generales..."></textarea></label>
      </details>
    </section>
    <section class="execution-card plan-step-panel" id="planSelectionSection" data-plan-panel="selection" hidden>
      <div class="execution-card-title"><span class="eyebrow">02 · SELECCIÓN DE ENSAYOS</span><h3>¿Qué pruebas vas a registrar?</h3><p>Selecciona una o varias. Cada prueba genera su propio formulario con los campos del protocolo de referencia.</p></div>
      <div class="plan-test-picker-head">
        <div><strong>Selecciona los ensayos que necesitas</strong><small>Marca una o varias pruebas. Puedes cambiar la selección cuando quieras.</small></div>
        <span id="planPickerCount" class="plan-picker-count">0 seleccionados</span>
      </div>
      <div id="planTestPicker" class="plan-test-picker" role="group" aria-label="Catálogo de ensayos"></div>
      <div class="plan-selection-status" id="planSelectionStatus" aria-live="polite">Aún no has añadido ensayos al plan.</div>
    </section>
    <section class="execution-card plan-tests-section plan-step-panel" id="planResultsSection" data-plan-panel="results" hidden>
      <div class="execution-card-title"><span class="eyebrow">03 · FORMULARIOS DE PRUEBA</span><h3>Resultados por ensayo</h3><p>Marca, modelo, serie, norma y observaciones se registran por prueba, ya que el instrumento puede cambiar entre ensayos.</p></div>
      <div id="planTestNav" class="plan-test-nav" aria-label="Ensayos seleccionados"></div>
      <div id="planTestCards"><div class="empty-state">Selecciona los ensayos para que aparezcan aquí sus formularios.</div></div>
    </section>
    <section class="execution-card plan-step-panel" id="planReviewSection" data-plan-panel="review" hidden>
      <div class="execution-card-title"><span class="eyebrow">04 · RESUMEN</span><h3>Revisa el registro antes de guardarlo</h3><p>Comprueba los ensayos incluidos, el avance y los datos pendientes.</p></div>
      <div id="planReviewSummary"></div>
    </section>
    <div class="plan-step-actions" id="planStepActions">
      <button class="btn" type="button" id="planStepBack" disabled>Anterior</button>
      <span id="planStepHint">Etapa 1 de 4 · Datos generales</span>
      <button class="btn primary" type="button" id="planStepNext">Continuar</button>
    </div>
  </section>

  <section class="config-page hidden" id="configPage">
    <div class="config-toolbar">
      <div><div class="breadcrumbs">Transformador <span>/</span> Configuración eléctrica</div><h2>Configuración eléctrica</h2><p>Define la estructura física y eléctrica que utilizarán las pruebas del transformador.</p></div>
      <div class="toolbar-actions"><span class="save-status" id="saveStatus"><i></i>Sin guardar</span><button class="btn" id="backOverview">Volver a detalles</button><button class="btn primary" id="saveConfig"><svg><use href="#i-check"/></svg>Guardar configuración</button></div>
    </div>
    <div class="config-alert <?= $dbMessage === '' ? 'hidden' : '' ?>" id="dbAlert" role="status"><svg><use href="#i-info"/></svg><span><?=h($dbMessage)?></span></div>
    <div class="config-layout">
      <nav class="config-sidebar" aria-label="Pasos de configuración">
        <button class="config-tab active" data-tab="general"><span class="tab-number">01</span><span><b>Datos generales</b><small>Fases y grupo vectorial</small></span></button>
        <button class="config-tab" data-tab="windings"><span class="tab-number">02</span><span><b>Bobinados y bornes</b><small><em id="windingCount">0</em> bobinados configurados</small></span></button>
        <button class="config-tab" data-tab="taps"><span class="tab-number">03</span><span><b>Conmutadores y taps</b><small><em id="tapCount">0</em> posiciones registradas</small></span></button>
        <button class="config-tab" data-tab="review"><span class="tab-number">04</span><span><b>Resumen y versiones</b><small>Revisión antes de guardar</small></span></button>
      </nav>
      <div class="config-main">
        <section class="config-panel" data-panel="general">
          <div class="panel-heading"><div><span class="eyebrow">PASO 01</span><h3>Datos eléctricos generales</h3><p>Información común del sistema de bobinados.</p></div><span class="step-state"><i></i>Configuración base</span></div>
          <div class="form-grid">
            <label>Tipo de transformador<select id="phaseCount"><option value="1">Monofásico</option><option value="3" selected>Trifásico</option></select><small>Se utiliza para orientar la estructura de fases.</small></label>
            <label>Grupo vectorial<input id="vectorGroup" placeholder="Ej. Yd11, YNd5, Dyn11"><small>Registrar tal como aparece en placa.</small></label>
            <label>Frecuencia nominal<input id="frequency" type="number" step="0.1" value="60"><small>Hz</small></label>
            <label>Observaciones generales<input id="generalNotes" placeholder="Notas de configuración, placa o diseño..."><small>Información de referencia.</small></label>
          </div>
          <div class="callout"><svg><use href="#i-info"/></svg><div><b>Importante: conexiones por bobinado y grupo vectorial son datos distintos.</b><p>Se registran por separado. El grupo vectorial no se utilizará para inventar conexiones de medición: las combinaciones se definirán y validarán al desarrollar cada prueba.</p></div></div>
          <div class="panel-footer"><button class="btn primary" data-next="windings">Continuar a bobinados <span>→</span></button></div>
        </section>

        <section class="config-panel hidden" data-panel="windings">
          <div class="panel-heading"><div><span class="eyebrow">PASO 02</span><h3>Bobinados y bornes</h3><p>Agrega cada bobinado y configura sus terminales. Puedes copiar los bobinados o pegar tablas desde Excel con Ctrl+V. No existe un límite fijo de bobinados o bornes.</p></div><button class="btn" id="copyWindings"><svg><use href="#i-copy"/></svg>Copiar bobinados</button><button class="btn primary" id="addWinding"><svg><use href="#i-plus"/></svg>Agregar bobinado</button></div>
          <div id="windingsContainer" class="windings-container"></div>
          <div class="callout compact"><svg><use href="#i-info"/></svg><div><b>Bornes capacitivos</b><p>Marca el borne cuando tenga bushing capacitivo. La ficha del bushing se asociará al terminal para reutilizarlo en su futura prueba.</p></div></div>
          <div class="panel-footer"><button class="btn" data-prev="general">← Anterior</button><span>Usa las celdas como Excel: flechas, Tab, Enter y pegado de rangos.</span><button class="btn primary" data-next="taps">Continuar a taps <span>→</span></button></div>
        </section>

        <section class="config-panel hidden" data-panel="taps">
          <div class="panel-heading"><div><span class="eyebrow">PASO 03</span><h3>Conmutadores y posiciones de tap</h3><p>Asocia cada conmutador al bobinado correspondiente y registra las posiciones de placa.</p></div><button class="btn primary" id="addTapChanger"><svg><use href="#i-plus"/></svg>Agregar conmutador</button></div>
          <div id="tapChangersContainer" class="tap-changers-container"></div>
          <div class="panel-footer"><button class="btn" data-prev="windings">← Anterior</button><span>Las posiciones pueden pegarse directamente desde Excel.</span><button class="btn primary" data-next="review">Revisar configuración <span>→</span></button></div>
        </section>

        <section class="config-panel hidden" data-panel="review">
          <div class="panel-heading"><div><span class="eyebrow">PASO 04</span><h3>Resumen de configuración</h3><p>Comprueba los datos antes de guardar la versión actual.</p></div><span class="review-badge">Previsualización</span></div>
          <div id="reviewSummary" class="review-summary"></div>
          <div class="version-history"><div class="history-heading"><div><h4>Versiones guardadas</h4><p>La configuración previa se conserva como fotografía histórica.</p></div><span id="versionBadge" class="version-badge">Versión 0</span></div><div id="versionList"><div class="empty-history">Todavía no hay versiones guardadas.</div></div></div>
          <div class="callout"><svg><use href="#i-info"/></svg><div><b>Qué se guarda</b><p>Datos eléctricos generales, bobinados, bornes, bushings y posiciones de los conmutadores.</p></div></div>
          <div class="panel-footer"><button class="btn" data-prev="taps">← Anterior</button><span>Al guardar se crea una nueva versión de configuración.</span><span class="config-save-hint">Usa «Guardar configuración» en la parte superior para crear la versión.</span></div>
        </section>
      </div>
    </div>
  </section>
</main>
<div class="modal-backdrop hidden" id="tapRowsModal" role="dialog" aria-modal="true" aria-labelledby="tapRowsTitle">
  <div class="modal-card">
    <div class="modal-card-head"><div><span class="eyebrow">CONMUTADOR</span><h3 id="tapRowsTitle">Generar posiciones de tap</h3><p>Conserva los datos existentes dentro de la cantidad seleccionada.</p></div><button class="modal-close" type="button" id="cancelTapRows" aria-label="Cerrar">×</button></div>
    <label class="modal-field">Cantidad de posiciones<input id="tapRowsCount" type="number" min="1" max="1000" step="1" value="27"></label>
    <div class="modal-hint"><svg><use href="#i-info"/></svg><span>Indica la cantidad de posiciones que necesitas registrar. Ajusta el valor según la placa del conmutador.</span></div>
    <div class="modal-actions"><button class="btn" type="button" id="cancelTapRowsAlt">Cancelar</button><button class="btn primary" type="button" id="confirmTapRows"><svg><use href="#i-check"/></svg>Generar filas</button></div>
  </div>
</div>
<div class="toast" id="toast"></div>
<script>
window.PILOT = <?=json_encode([
  'apiUrl' => rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/api.php',
  'transformer' => ['key'=>$transformer['key'], 'code'=>$transformer['code'], 'company'=>$transformer['company'], 'tag'=>$transformer['tag'], 'voltage'=>$transformer['voltage'], 'power'=>$transformer['power'], 'year'=>$transformer['year'], 'brand'=>$transformer['brand'], 'tap_type'=>$transformer['tap_type'], 'num_taps'=>$transformer['num_taps'], 'vector_group'=>$transformer['vector_group'], 'location'=>$transformer['location'], 'phase_count'=>$transformer['phase_count'], 'frequency_hz'=>$transformer['frequency_hz'], 'insulation_type'=>$transformer['insulation_type'], 'cooling_type'=>$transformer['cooling_type'], 'notes'=>$transformer['notes']],
  'config' => $initialConfig,
  'configReady' => $hasSavedElectricalConfig,
  'testsAccessBlockReason' => $testsAccessBlockReason,
  'dbConnected' => $dbConnected, 'dbName' => $dbName, 'dbMessage' => $dbMessage, 'transformerFound' => $transformerFound, 'schemaReady' => $schemaReady, 'testsSchemaReady' => $testsSchemaReady, 'demo' => !$dbConnected || !$transformerFound
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)?>;
</script>
<script>
/* Navegación de respaldo: mantiene accesibles las pantallas del piloto aunque falle/cargue tarde el JS principal. */
(function(){
  function show(id){
    ['overviewPage','configPage','testPage','executionPage'].forEach(function(key){
      var el=document.getElementById(key);
      if(el) el.classList.toggle('hidden',key!==id);
    });
  }
  var cfg=document.getElementById('openConfig');
  var tests=document.getElementById('openElectricalTests');
  var backCfg=document.getElementById('backOverview');
  var backTests=document.getElementById('backFromTests');
  if(cfg) cfg.addEventListener('click',function(e){e.preventDefault();show('configPage');});
  if(tests) tests.addEventListener('click',function(e){e.preventDefault();show('testPage');});
  if(backCfg) backCfg.addEventListener('click',function(e){e.preventDefault();show('overviewPage');});
  if(backTests) backTests.addEventListener('click',function(e){e.preventDefault();show('overviewPage');});
})();
</script>


<div class="modal-backdrop hidden" id="transformerEditModal" role="dialog" aria-modal="true" aria-labelledby="editTransformerTitle">
  <div class="modal-panel transformer-edit-panel">
    <div class="modal-header"><div><h2 id="editTransformerTitle">Editar transformador</h2><p id="editTransformerSubtitle">Modifica los datos principales de la ficha.</p></div><button type="button" class="modal-close" id="closeTransformerModal" aria-label="Cerrar">×</button></div>
    <form id="transformerEditForm">
      <div class="transformer-edit-grid">
        <label>TAG / Código<input name="code" id="editTrafoCode" required maxlength="80"></label>
        <label>Nombre / Descripción<input name="name" id="editTrafoName" maxlength="180"></label>
        <label>Empresa<input name="company" id="editTrafoCompany" maxlength="220"></label>
        <label>Tensión nominal (kV)<input name="voltage" id="editTrafoVoltage" inputmode="decimal"></label>
        <label>Potencia (MVA)<input name="power" id="editTrafoPower" inputmode="decimal"></label>
        <label>Año de fabricación<input name="year" id="editTrafoYear" inputmode="numeric"></label>
        <label>Marca<input name="brand" id="editTrafoBrand"></label>
        <label>Tipo de conmutador<select name="tap_type" id="editTrafoTapType"><option value="">Seleccionar</option><option>DETC</option><option>OLTC</option></select></label>
        <label>Número de taps<input name="num_taps" id="editTrafoNumTaps" inputmode="numeric"></label>
        <label>Grupo vectorial<input name="vector_group" id="editTrafoVector" placeholder="Ej. Yd11"></label>
        <label class="wide">Ubicación / Subestación<input name="location" id="editTrafoLocation"></label>
        <div class="edit-section-title">Datos de placa y características nominales</div>
        <label>Número de fases<select name="phase_count" id="editTrafoPhaseCount" required><option value="">Seleccionar</option><option value="1">Monofásico (1)</option><option value="3">Trifásico (3)</option></select></label>
        <label>Frecuencia nominal (Hz)<input name="frequency_hz" id="editTrafoFrequency" inputmode="decimal" placeholder="60"></label>
        <label>Tipo de aislamiento<input name="insulation_type" id="editTrafoInsulation" placeholder="Ej. Aceite mineral"></label>
        <label>Tipo de refrigeración<input name="cooling_type" id="editTrafoCooling" placeholder="Ej. ONAN"></label>
        <label class="wide">Observaciones de placa<textarea name="notes" id="editTrafoNotes" rows="3" placeholder="Información adicional de la placa..."></textarea></label>
      </div>
      <div class="modal-footer"><span id="editTransformerStatus" class="form-status"></span><button type="button" class="btn" id="cancelTransformerEdit">Cancelar</button><button type="submit" class="btn primary" id="saveTransformerEdit">Guardar cambios</button></div>
    </form>
  </div>
</div>

<script src="./assets/app.js?v=1.5.47"></script>
<script src="./assets/plan.js?v=1.5.47"></script>
</body></html>
