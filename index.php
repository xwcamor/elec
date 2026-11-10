<?php
declare(strict_types=1);

$appName = 'ELEC';
$appVersion = '0.2.0';
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Mini demo independiente para registro de pruebas eléctricas">
    <title><?= htmlspecialchars($appName, ENT_QUOTES, 'UTF-8') ?> · Pruebas eléctricas</title>
    <link rel="stylesheet" href="assets/css/app.css">
    <script src="assets/js/app.js" defer></script>
</head>
<body>
    <main class="app-shell">
        <header class="topbar">
            <a class="brand" href="./" aria-label="Inicio ELEC">
                <span class="brand-mark">E</span>
                <span><?= htmlspecialchars($appName, ENT_QUOTES, 'UTF-8') ?></span>
            </a>
            <span class="version">v<?= htmlspecialchars($appVersion, ENT_QUOTES, 'UTF-8') ?></span>
        </header>

        <section class="welcome">
            <p class="eyebrow">MINI DEMO · REGISTRO TÉCNICO</p>
            <h1>Pruebas eléctricas</h1>
            <p class="description">
                Entorno independiente para organizar equipos, registrar ejecuciones de pruebas
                eléctricas y conservar sus mediciones e historial.
            </p>
            <div class="status">
                <span class="status-dot" aria-hidden="true"></span>
                PHP <?= htmlspecialchars(PHP_VERSION, ENT_QUOTES, 'UTF-8') ?> · Entorno activo
            </div>
            <p class="scope-note">Base de desarrollo ELEC. No está integrada con TR Health.</p>
        </section>

        <footer class="footer">
            <span>ELEC · Mini demo de pruebas eléctricas</span>
            <span><?= date('Y') ?></span>
        </footer>
    </main>
</body>
</html>
