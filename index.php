<?php
declare(strict_types=1);

$appName = 'ELEC';
$appVersion = '0.1.0';
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Proyecto demo ELEC">
    <title><?= htmlspecialchars($appName, ENT_QUOTES, 'UTF-8') ?></title>
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
            <p class="eyebrow">ENTORNO DE DESARROLLO</p>
            <h1>Bienvenido a ELEC</h1>
            <p class="description">
                La base del proyecto está lista. Aquí construiremos el demo paso a paso.
            </p>
            <div class="status">
                <span class="status-dot" aria-hidden="true"></span>
                PHP <?= htmlspecialchars(PHP_VERSION, ENT_QUOTES, 'UTF-8') ?> · Aplicación iniciada
            </div>
        </section>

        <footer class="footer">
            <span>ELEC · Proyecto demo</span>
            <span><?= date('Y') ?></span>
        </footer>
    </main>
</body>
</html>
