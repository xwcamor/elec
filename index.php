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
    $tables = $pdo->query("SHOW TABLES LIKE 'eh_electrical_configs'")->fetchAll();
    $schemaReady = count($tables) > 0;
    $requiredTestTables = ['eh_test_types','eh_test_executions','eh_test_execution_data'];
    $testsSchemaReady = true;
    foreach ($requiredTestTables as $tableName) {
        $check = $pdo->query("SHOW TABLES LIKE " . $pdo->quote($tableName))->fetchColumn();
        if (!$check) $testsSchemaReady = false;
    }
    if ($schemaReady) {
        $configRepo = new ElectricalConfigRepository($pdo);
        if ($found) $config = $configRepo->get($found['key']);
    } else {
        $dbMessage = 'Conexión MySQL correcta. Falta importar database/schema.sql para habilitar el guardado del piloto.';
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
?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>TR Health | Piloto de configuración eléctrica</title>
<link rel="stylesheet" href="./assets/app.css?v=1.5.0">
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
  <div class="top-actions"><button class="icon-btn dark" title="Aplicaciones"><svg><use href="#i-grid"/></svg></button><button class="icon-btn dark notification" title="Notificaciones"><svg><use href="#i-bell"/></svg><i>1</i></button><button class="icon-btn dark notification" title="Mensajes"><svg><use href="#i-mail"/></svg><i>1</i></button><div class="user-chip"><span>H</span> Hector G⌄</div></div>
</header>
<div class="pilot-status <?=(!$dbConnected || !$transformerFound || !$schemaReady || !$testsSchemaReady) ? 'warning' : 'ready'?>" id="pilotStatus">
  <strong><?=h(!$dbConnected ? 'Sin conexión a MySQL' : (!$transformerFound ? 'Transformador no identificado' : (!$schemaReady || !$testsSchemaReady ? 'Faltan tablas del piloto' : 'Base de datos conectada')))?></strong>
  <span><?=h($dbMessage ?: ('BD: '.$dbName.' · Tabla: transformers · Transformador: '.$displayCode))?></span>
  <?php if (!$transformerFound): ?><small>Busca el transformador en la barra superior y selecciónalo antes de guardar. Verifica también DB_NAME en config/database.php.</small><?php endif; ?>
</div>
<main class="page-shell">
  <section class="record-heading">
    <button class="back-btn" title="Volver"><svg><use href="#i-chevron"/></svg></button>
    <div class="record-icon"><svg><use href="#i-calendar"/></svg></div>
    <div class="record-title"><h1 id="transformerCode"><?=h($displayCode)?></h1><div id="companyName"><?=h($transformer['company'])?></div></div>
    <div class="heading-actions">
      <button class="btn primary"><svg><use href="#i-file"/></svg>Exportar informe</button>
      <button class="btn"><svg><use href="#i-share"/></svg>Compartir</button>
      <button class="btn primary" id="editTransformerBtn" type="button"><svg><use href="#i-edit"/></svg>Editar transformador</button>
      <button class="btn danger"><svg><use href="#i-trash"/></svg>Eliminar</button>
      <button class="btn"><svg><use href="#i-lock"/></svg>Bloquear</button>
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
      <button class="nav-action electrical-tests-link" id="openElectricalTests" type="button"><svg><use href="#i-zap"/></svg>Pruebas eléctricas <i class="dot blue"></i></button>
      <div class="nav-caption sub-caption">REGISTRO</div>
      <button class="nav-disabled" type="button" disabled title="Bitácora fuera del alcance de este piloto"><svg><use href="#i-history"/></svg>Bitácora</button>
      <div class="nav-caption sub-caption">CONFIGURACIÓN</div>
      <button class="nav-action config-link" id="openConfig" type="button"><svg><use href="#i-settings"/></svg>Configuración eléctrica</button>
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
      <div><div class="breadcrumbs">Transformador <span>/</span> Pruebas eléctricas</div><h2>Pruebas eléctricas</h2><p>Historial de ejecuciones. Cada registro corresponde a una prueba realizada en una fecha y hora determinadas.</p></div>
      <div class="toolbar-actions"><button class="btn" id="backFromTests">Volver a detalles</button><button class="btn primary" id="newTestExecution"><svg><use href="#i-plus"/></svg>Nueva ejecución</button></div>
    </div>
    <div class="test-info-banner"><svg><use href="#i-info"/></svg><div><b>Un registro por ejecución, no por transformador.</b><span>Selecciona la fecha real en que se efectuó la prueba. Puedes registrar varias ejecuciones del mismo tipo en fechas distintas; ninguna sobrescribe las anteriores.</span></div></div>
    <div class="test-stats" id="testStats"></div>
    <div class="test-type-grid" id="testTypeGrid"></div>
    <section class="analytics-card" aria-label="Resumen histórico">
      <div class="analytics-heading"><div><span class="eyebrow">ANÁLISIS HISTÓRICO</span><h3>Evolución de las pruebas</h3><p>Resumen calculado a partir de las ejecuciones registradas para este transformador.</p></div><span class="analytics-period" id="analyticsPeriod">—</span></div>
      <div class="analytics-grid">
        <div class="analytics-chart-panel"><b>Ejecuciones por mes</b><div id="monthlyExecutionChart" class="analytics-chart"></div></div>
        <div class="analytics-chart-panel"><b>Distribución por tipo de prueba</b><div id="testTypeAnalytics" class="type-analytics"></div></div>
      </div>
      <div class="analytics-footnote">Los gráficos cuentan ejecuciones; no mezclan magnitudes físicas diferentes ni sustituyen la evaluación técnica de cada protocolo.</div>
    </section>

    <div class="test-history-card">
      <div class="test-history-head"><div><h3>Historial de pruebas</h3><p>Ordenado desde la ejecución más reciente.</p></div><div class="test-filter"><svg><use href="#i-search"/></svg><input id="testHistoryFilter" placeholder="Filtrar por prueba..."></div></div>
      <div class="test-table-wrap"><table class="test-history-table"><thead><tr><th>Fecha de ejecución</th><th>Prueba</th><th>Responsable</th><th>Mediciones</th><th>Estado</th><th></th></tr></thead><tbody id="testHistoryBody"><tr><td colspan="6" class="test-empty">Aún no hay registros. Usa “Nueva ejecución” para registrar la primera prueba.</td></tr></tbody></table></div>
    </div>
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
            <label>Estado<select id="executionStatus"><option value="BORRADOR">Borrador</option><option value="COMPLETADA">Completada</option></select></label>
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
  <div class="sheet-hint">Pegado desde Excel · Navegación con Tab y flechas. Los datos se conservan en la ejecución sin aplicar fórmulas o límites no validados.</div>
</div>
<div class="measurement-sheet-wrap" id="measurementGenericWrap"><table class="measurement-sheet"><thead><tr><th>#</th><th>Parámetro / punto</th><th>Valor medido</th><th>Unidad</th><th>Observación</th><th></th></tr></thead><tbody id="measurementRows"></tbody></table></div>
          <div class="sheet-hint">Atajos: Ctrl+V para pegar una tabla desde Excel · Flechas para moverte entre celdas · Tab para avanzar.</div>
          <div class="execution-warning"><svg><use href="#i-info"/></svg>Las plantillas específicas registran los valores indicados por el protocolo aplicado. No se calculan desviaciones, compensaciones ni límites automáticos sin validar la norma y el procedimiento correspondiente.</div>
        </section>
        <section class="execution-card"><div class="execution-card-title"><span class="eyebrow">04 · TRAZABILIDAD</span><h3>Observaciones</h3></div><textarea id="executionObservations" rows="3" placeholder="Condiciones de prueba, conexiones utilizadas, incidencias..." class="execution-observations"></textarea></section>
      </div>
      <aside class="execution-side"><div class="execution-side-card"><span class="eyebrow">TRANSFORMADOR</span><h3 id="executionTrafoCode">—</h3><p id="executionTrafoCompany">—</p><div class="side-divider"></div><div class="execution-side-note"><b>Historial independiente</b><span>Al guardar se crea o actualiza un registro con su ID propio. La configuración eléctrica vigente se guarda como referencia de esta ejecución.</span></div><div class="execution-side-note"><b>Fecha de registro</b><span id="systemSavedAt">Se asignará automáticamente al guardar.</span></div></div></aside>
    </div>
  </section>

  <section class="config-page hidden" id="configPage">
    <div class="config-toolbar">
      <div><div class="breadcrumbs">Transformador <span>/</span> Configuración eléctrica</div><h2>Configuración eléctrica</h2><p>Define la estructura física y eléctrica que utilizarán las pruebas del transformador.</p></div>
      <div class="toolbar-actions"><span class="save-status" id="saveStatus"><i></i>Sin guardar</span><button class="btn" id="backOverview">Volver a detalles</button><button class="btn primary" id="saveConfig"><svg><use href="#i-check"/></svg>Guardar configuración</button></div>
    </div>
    <div class="config-alert" id="dbAlert"><svg><use href="#i-info"/></svg><span><?=h($dbMessage ?: ($schemaReady ? 'Conectado a MySQL. La configuración se guarda en tablas nuevas del piloto.' : 'Vista demostrativa.'))?></span></div>
    <div class="config-layout">
      <aside class="config-sidebar">
        <div class="side-summary"><div class="small-transformer"><svg><use href="#i-zap"/></svg></div><div><strong id="configTrafoCode"><?=h($displayCode)?></strong><small id="configCompany"><?=h($transformer['company'])?></small></div></div>
        <button class="config-tab active" data-tab="general"><span class="tab-number">01</span><span><b>Datos generales</b><small>Fases y grupo vectorial</small></span></button>
        <button class="config-tab" data-tab="windings"><span class="tab-number">02</span><span><b>Bobinados y bornes</b><small><em id="windingCount">0</em> bobinados configurados</small></span></button>
        <button class="config-tab" data-tab="taps"><span class="tab-number">03</span><span><b>Conmutadores y taps</b><small><em id="tapCount">0</em> posiciones registradas</small></span></button>
        <button class="config-tab" data-tab="review"><span class="tab-number">04</span><span><b>Resumen y versiones</b><small>Revisión antes de guardar</small></span></button>
        <div class="config-sidebar-note"><svg><use href="#i-info"/></svg><span>La configuración es la referencia de las futuras pruebas. Los resultados históricos conservarán una copia de la configuración utilizada.</span></div>
      </aside>
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
          <div class="panel-footer"><span>Los datos de placa del transformador provienen de <b>transformers</b>.</span><button class="btn primary" data-next="windings">Continuar a bobinados <span>→</span></button></div>
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
          <div class="tap-legacy-info" id="tapLegacyInfo">Se conserva el dato original de num_taps.</div>
          <div class="callout compact"><svg><use href="#i-info"/></svg><div><b>Compatibilidad con <code>transformers.num_taps</code></b><p>Se conserva la columna original sin modificarla. El detalle de posiciones se guarda en una tabla independiente y puede tener 27, 33 o más filas. La cantidad declarada sirve como referencia; no reemplaza los valores de placa.</p></div></div>
          <div class="panel-footer"><button class="btn" data-prev="windings">← Anterior</button><span>Las posiciones pueden pegarse directamente desde Excel.</span><button class="btn primary" data-next="review">Revisar configuración <span>→</span></button></div>
        </section>

        <section class="config-panel hidden" data-panel="review">
          <div class="panel-heading"><div><span class="eyebrow">PASO 04</span><h3>Resumen de configuración</h3><p>Comprueba los datos antes de guardar la versión actual.</p></div><span class="review-badge">Previsualización</span></div>
          <div id="reviewSummary" class="review-summary"></div>
          <div class="version-history"><div class="history-heading"><div><h4>Versiones guardadas</h4><p>La configuración previa se conserva como fotografía histórica.</p></div><span id="versionBadge" class="version-badge">Versión 0</span></div><div id="versionList"><div class="empty-history">Todavía no hay versiones guardadas.</div></div></div>
          <div class="callout"><svg><use href="#i-info"/></svg><div><b>Qué se guarda</b><p>Bobinados, bornes, marca de bushing cuando aplique, conmutadores, taps y los datos eléctricos generales. No se modifica ningún campo de la tabla <code>transformers</code>.</p></div></div>
          <div class="panel-footer"><button class="btn" data-prev="taps">← Anterior</button><span>Al guardar se crea una nueva versión de configuración.</span><button class="btn primary" id="saveConfigBottom"><svg><use href="#i-check"/></svg>Guardar configuración</button></div>
        </section>
      </div>
    </div>
  </section>
</main>
<div class="modal-backdrop hidden" id="tapRowsModal" role="dialog" aria-modal="true" aria-labelledby="tapRowsTitle">
  <div class="modal-card">
    <div class="modal-card-head"><div><span class="eyebrow">CONMUTADOR</span><h3 id="tapRowsTitle">Generar posiciones de tap</h3><p>Conserva los datos existentes dentro de la cantidad seleccionada.</p></div><button class="modal-close" type="button" id="cancelTapRows" aria-label="Cerrar">×</button></div>
    <label class="modal-field">Cantidad de posiciones<input id="tapRowsCount" type="number" min="1" max="1000" step="1" value="27"></label>
    <div class="modal-hint"><svg><use href="#i-info"/></svg><span>La cantidad sugerida toma como referencia <code>transformers.num_taps</code>. Puedes cambiarla según la placa del conmutador.</span></div>
    <div class="modal-actions"><button class="btn" type="button" id="cancelTapRowsAlt">Cancelar</button><button class="btn primary" type="button" id="confirmTapRows"><svg><use href="#i-check"/></svg>Generar filas</button></div>
  </div>
</div>
<div class="toast" id="toast"></div>
<script>
window.PILOT = <?=json_encode([
  'apiUrl' => rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/api.php',
  'transformer' => ['key'=>$transformer['key'], 'code'=>$transformer['code'], 'company'=>$transformer['company'], 'tag'=>$transformer['tag'], 'voltage'=>$transformer['voltage'], 'power'=>$transformer['power'], 'year'=>$transformer['year'], 'brand'=>$transformer['brand'], 'tap_type'=>$transformer['tap_type'], 'num_taps'=>$transformer['num_taps'], 'vector_group'=>$transformer['vector_group'], 'location'=>$transformer['location'], 'phase_count'=>$transformer['phase_count'], 'frequency_hz'=>$transformer['frequency_hz'], 'insulation_type'=>$transformer['insulation_type'], 'cooling_type'=>$transformer['cooling_type'], 'notes'=>$transformer['notes']],
  'config' => $initialConfig,
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
    <div class="modal-header"><div><h2 id="editTransformerTitle">Editar transformador</h2><p>Modifica los datos principales de la ficha.</p></div><button type="button" class="modal-close" id="closeTransformerModal" aria-label="Cerrar">×</button></div>
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

<script src="./assets/app.js?v=1.5.3"></script>
</body></html>
