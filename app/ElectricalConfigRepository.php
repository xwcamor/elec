<?php
class ElectricalConfigRepository
{
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function get(string $transformerKey): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM eh_electrical_configs WHERE transformer_key = ? LIMIT 1');
        $stmt->execute([$transformerKey]);
        $config = $stmt->fetch();
        if (!$config) return null;

        $configId = (int)$config['id'];

        // Carga todos los bobinados, bornes y bushings en una sola consulta.
        $windingStmt = $this->pdo->prepare(
            'SELECT w.*, t.id AS terminal_id, t.terminal_order, t.terminal_code,
                    t.phase_code, t.terminal_type, t.has_capacitive_bushing,
                    b.serial_number, b.manufacturer AS bushing_manufacturer,
                    b.model AS bushing_model, b.rated_voltage_kv,
                    b.capacitance_pf, b.power_factor_percent, b.notes AS bushing_notes
             FROM eh_windings w
             LEFT JOIN eh_terminals t ON t.winding_id = w.id
             LEFT JOIN eh_bushings b ON b.terminal_id = t.id
             WHERE w.config_id = ?
             ORDER BY w.winding_order, w.id, t.terminal_order, t.id'
        );
        $windingStmt->execute([$configId]);
        $windingsById = [];
        foreach ($windingStmt->fetchAll() as $row) {
            $windingId = (int)$row['id'];
            if (!isset($windingsById[$windingId])) {
                $windingsById[$windingId] = [
                    'id' => $windingId,
                    'config_id' => (int)$row['config_id'],
                    'winding_order' => (int)$row['winding_order'],
                    'winding_name' => $row['winding_name'],
                    'winding_code' => $row['winding_code'],
                    'voltage_kv' => $row['voltage_kv'],
                    'connection_type' => $row['connection_type'],
                    'has_neutral' => (int)$row['has_neutral'],
                    'conductor_material' => $row['conductor_material'],
                    'notes' => $row['notes'],
                    'terminals' => [],
                ];
            }
            if ($row['terminal_id'] !== null) {
                $terminal = [
                    'id' => (int)$row['terminal_id'],
                    'winding_id' => $windingId,
                    'terminal_order' => (int)$row['terminal_order'],
                    'terminal_code' => $row['terminal_code'],
                    'phase_code' => $row['phase_code'],
                    'terminal_type' => $row['terminal_type'],
                    'has_capacitive_bushing' => (int)$row['has_capacitive_bushing'],
                    // Mantener los campos planos esperados por normalizeConfig() del cliente.
                    'serial_number' => $row['serial_number'],
                    'bushing_manufacturer' => $row['bushing_manufacturer'],
                    'bushing_model' => $row['bushing_model'],
                    'rated_voltage_kv' => $row['rated_voltage_kv'],
                    'capacitance_pf' => $row['capacitance_pf'],
                    'power_factor_percent' => $row['power_factor_percent'],
                    'bushing_notes' => $row['bushing_notes'],
                ];
                if ((int)$row['has_capacitive_bushing'] === 1) {
                    $terminal['bushing'] = [
                        'serial_number' => $row['serial_number'],
                        'manufacturer' => $row['bushing_manufacturer'],
                        'model' => $row['bushing_model'],
                        'rated_voltage_kv' => $row['rated_voltage_kv'],
                        'capacitance_pf' => $row['capacitance_pf'],
                        'power_factor_percent' => $row['power_factor_percent'],
                        'notes' => $row['bushing_notes'],
                    ];
                }
                $windingsById[$windingId]['terminals'][] = $terminal;
            }
        }
        $windings = array_values($windingsById);

        // Carga conmutadores y posiciones de TAP en una sola consulta adicional.
        $changerStmt = $this->pdo->prepare(
            'SELECT c.*, p.id AS position_id, p.position_no, p.label AS position_label,
                    p.voltage_kv AS position_voltage_kv,
                    p.percent_change, p.is_neutral, p.notes AS position_notes
             FROM eh_tap_changers c
             LEFT JOIN eh_tap_positions p ON p.tap_changer_id = c.id
             WHERE c.config_id = ?
             ORDER BY c.id, p.position_no'
        );
        $changerStmt->execute([$configId]);
        $changersById = [];
        foreach ($changerStmt->fetchAll() as $row) {
            $changerId = (int)$row['id'];
            if (!isset($changersById[$changerId])) {
                $changersById[$changerId] = [
                    'id' => $changerId,
                    'config_id' => (int)$row['config_id'],
                    'winding_id' => (int)$row['winding_id'],
                    'changer_name' => $row['changer_name'],
                    'changer_type' => $row['changer_type'],
                    'operation_type' => $row['operation_type'],
                    'min_position' => $row['min_position'],
                    'max_position' => $row['max_position'],
                    'neutral_position' => $row['neutral_position'],
                    'current_position' => $row['current_position'],
                    'notes' => $row['notes'],
                    'positions' => [],
                ];
            }
            if ($row['position_id'] !== null) {
                $changersById[$changerId]['positions'][] = [
                    'id' => (int)$row['position_id'],
                    'tap_changer_id' => $changerId,
                    'position_no' => (int)$row['position_no'],
                    'label' => $row['position_label'],
                    'voltage_kv' => $row['position_voltage_kv'],
                    'percent_change' => $row['percent_change'],
                    'is_neutral' => (int)$row['is_neutral'],
                    'notes' => $row['position_notes'],
                ];
            }
        }

        $versionsStmt = $this->pdo->prepare(
            'SELECT version_no, created_at FROM eh_electrical_config_versions
             WHERE config_id = ? ORDER BY version_no DESC LIMIT 8'
        );
        $versionsStmt->execute([$configId]);

        return [
            'id' => $configId,
            'phase_count' => (int)$config['phase_count'],
            'vector_group' => $config['vector_group'],
            'frequency_hz' => $config['frequency_hz'],
            'notes' => $config['notes'],
            'version_no' => (int)$config['version_no'],
            'windings' => $windings,
            'tap_changers' => array_values($changersById),
            'versions' => $versionsStmt->fetchAll(),
        ];
    }

    public function save(string $transformerKey, array $payload): array
    {
        if ($transformerKey === '') throw new InvalidArgumentException('Falta identificar el transformador.');
        $windings = is_array($payload['windings'] ?? null) ? $payload['windings'] : [];
        $changers = is_array($payload['tap_changers'] ?? null) ? $payload['tap_changers'] : [];
        if (!$windings) throw new InvalidArgumentException('Agrega al menos un bobinado antes de guardar.');

        $phaseCount = (int)($payload['phase_count'] ?? 3);
        if (!in_array($phaseCount, [1, 3], true)) throw new InvalidArgumentException('La cantidad de fases debe ser 1 o 3.');
        $frequency = $payload['frequency_hz'] ?? '';
        if ($frequency !== '' && (!is_numeric($frequency) || (float)$frequency <= 0)) {
            throw new InvalidArgumentException('La frecuencia debe ser un valor numérico mayor que cero.');
        }
        $windingCodes = [];
        foreach ($windings as $wIndex => $winding) {
            if (!is_array($winding)) throw new InvalidArgumentException('Hay un bobinado con datos inválidos.');
            $name = trim((string)($winding['name'] ?? ''));
            $code = strtoupper(trim((string)($winding['code'] ?? '')));
            if ($name === '') throw new InvalidArgumentException('El bobinado '.($wIndex + 1).' necesita un nombre.');
            if ($code === '') throw new InvalidArgumentException('El bobinado '.($wIndex + 1).' necesita un código.');
            if (isset($windingCodes[$code])) throw new InvalidArgumentException('El código de bobinado '.$code.' está repetido.');
            $windingCodes[$code] = true;
            $terminalCodes = [];
            foreach (($winding['terminals'] ?? []) as $tIndex => $terminal) {
                if (!is_array($terminal)) continue;
                $terminalCode = strtoupper(trim((string)($terminal['code'] ?? '')));
                $hasData = $terminalCode !== '' || trim((string)($terminal['phase'] ?? '')) !== '' || !empty($terminal['has_capacitive_bushing']);
                if (!$hasData) continue;
                if ($terminalCode === '') throw new InvalidArgumentException('Falta el código del borne '.($tIndex + 1).' en '.$name.'.');
                if (isset($terminalCodes[$terminalCode])) throw new InvalidArgumentException('El borne '.$terminalCode.' está repetido en '.$name.'.');
                $terminalCodes[$terminalCode] = true;
            }
        }
        foreach ($changers as $cIndex => $changer) {
            if (!is_array($changer)) throw new InvalidArgumentException('Hay un conmutador con datos inválidos.');
            $windingIndex = $changer['winding_index'] ?? null;
            if (!is_numeric($windingIndex) || (int)$windingIndex < 0 || (int)$windingIndex >= count($windings)) {
                throw new InvalidArgumentException('El conmutador '.($cIndex + 1).' debe estar asociado a un bobinado válido.');
            }
            $positions = [];
            foreach (($changer['positions'] ?? []) as $position) {
                if (!is_array($position)) continue;
                $rawPosition = trim((string)($position['position_no'] ?? ''));
                if ($rawPosition === '') continue;
                if (!ctype_digit($rawPosition) || (int)$rawPosition < 1) throw new InvalidArgumentException('Las posiciones de TAP deben ser enteros positivos.');
                $positionNo = (int)$rawPosition;
                if (isset($positions[$positionNo])) throw new InvalidArgumentException('La posición '.$positionNo.' está duplicada en '.($changer['name'] ?? 'el conmutador').'.');
                $positions[$positionNo] = true;
            }
        }

        $snapshot = [
            'phase_count' => $phaseCount,
            'vector_group' => trim((string)($payload['vector_group'] ?? '')),
            'frequency_hz' => (($payload['frequency_hz'] ?? '') !== '' && is_numeric($payload['frequency_hz'] ?? null)) ? (float)$payload['frequency_hz'] : null,
            'notes' => trim((string)($payload['notes'] ?? '')),
            'windings' => $windings,
            'tap_changers' => $changers,
        ];
        $this->pdo->beginTransaction();
        try {
            $find = $this->pdo->prepare('SELECT id, version_no FROM eh_electrical_configs WHERE transformer_key=? FOR UPDATE');
            $find->execute([$transformerKey]);
            $existing = $find->fetch();
            if ($existing) {
                $configId = (int)$existing['id'];
                $version = (int)$existing['version_no'] + 1;
                $upd = $this->pdo->prepare('UPDATE eh_electrical_configs SET phase_count=?, vector_group=?, frequency_hz=?, notes=?, version_no=?, updated_at=NOW() WHERE id=?');
                $upd->execute([$snapshot['phase_count'], $snapshot['vector_group'], $snapshot['frequency_hz'], $snapshot['notes'], $version, $configId]);
                $this->pdo->prepare('DELETE FROM eh_tap_changers WHERE config_id=?')->execute([$configId]);
                $this->pdo->prepare('DELETE FROM eh_windings WHERE config_id=?')->execute([$configId]);
            } else {
                $version = 1;
                $ins = $this->pdo->prepare('INSERT INTO eh_electrical_configs (transformer_key, phase_count, vector_group, frequency_hz, notes, version_no, created_at, updated_at) VALUES (?,?,?,?,?,?,NOW(),NOW())');
                $ins->execute([$transformerKey, $snapshot['phase_count'], $snapshot['vector_group'], $snapshot['frequency_hz'], $snapshot['notes'], $version]);
                $configId = (int)$this->pdo->lastInsertId();
            }

            $windingIds = [];
            $wi = $this->pdo->prepare('INSERT INTO eh_windings (config_id, winding_order, winding_name, winding_code, voltage_kv, connection_type, has_neutral, conductor_material, notes) VALUES (?,?,?,?,?,?,?,?,?)');
            $ti = $this->pdo->prepare('INSERT INTO eh_terminals (winding_id, terminal_order, terminal_code, phase_code, terminal_type, has_capacitive_bushing) VALUES (?,?,?,?,?,?)');
            $bi = $this->pdo->prepare('INSERT INTO eh_bushings (terminal_id, serial_number, manufacturer, model, rated_voltage_kv, capacitance_pf, power_factor_percent, notes) VALUES (?,?,?,?,?,?,?,?)');
            foreach ($windings as $index => $winding) {
                $wi->execute([$configId, $index + 1, trim((string)($winding['name'] ?? 'Bobinado ' . ($index + 1))), trim((string)($winding['code'] ?? 'W' . ($index + 1))), $this->num($winding['voltage_kv'] ?? null), trim((string)($winding['connection_type'] ?? '')), !empty($winding['has_neutral']) ? 1 : 0, trim((string)($winding['conductor_material'] ?? '')), trim((string)($winding['notes'] ?? ''))]);
                $windingId = (int)$this->pdo->lastInsertId();
                $windingIds[$index] = $windingId;
                foreach (($winding['terminals'] ?? []) as $tiIndex => $terminal) {
                    $hasBushing = !empty($terminal['has_capacitive_bushing']) ? 1 : 0;
                    $ti->execute([$windingId, $tiIndex + 1, trim((string)($terminal['code'] ?? '')), trim((string)($terminal['phase'] ?? '')), trim((string)($terminal['type'] ?? 'Fase')), $hasBushing]);
                    $terminalId = (int)$this->pdo->lastInsertId();
                    if ($hasBushing) {
                        $b = $terminal['bushing'] ?? [];
                        $bi->execute([$terminalId, trim((string)($b['serial_number'] ?? '')), trim((string)($b['manufacturer'] ?? '')), trim((string)($b['model'] ?? '')), $this->num($b['rated_voltage_kv'] ?? null), $this->num($b['capacitance_pf'] ?? null), $this->num($b['power_factor_percent'] ?? null), trim((string)($b['notes'] ?? ''))]);
                    }
                }
            }

            $ci = $this->pdo->prepare('INSERT INTO eh_tap_changers (config_id, winding_id, changer_name, changer_type, operation_type, min_position, max_position, neutral_position, current_position, notes) VALUES (?,?,?,?,?,?,?,?,?,?)');
            $pi = $this->pdo->prepare('INSERT INTO eh_tap_positions (tap_changer_id, position_no, label, voltage_kv, percent_change, is_neutral, notes) VALUES (?,?,?,?,?,?,?)');
            foreach ($changers as $changer) {
                $wIndex = (int)($changer['winding_index'] ?? 0);
                $windingId = $windingIds[$wIndex] ?? ($windingIds[0] ?? null);
                if (!$windingId) continue;
                $ci->execute([$configId, $windingId, trim((string)($changer['name'] ?? 'Conmutador')), trim((string)($changer['type'] ?? 'DETC')), trim((string)($changer['operation_type'] ?? 'Manual')), $this->intOrNull($changer['min_position'] ?? null), $this->intOrNull($changer['max_position'] ?? null), $this->intOrNull($changer['neutral_position'] ?? null), $this->intOrNull($changer['current_position'] ?? null), trim((string)($changer['notes'] ?? ''))]);
                $changerId = (int)$this->pdo->lastInsertId();
                foreach (($changer['positions'] ?? []) as $position) {
                    if (($position['position_no'] ?? '') === '' || !is_numeric($position['position_no'])) continue;
                    $pi->execute([$changerId, (int)$position['position_no'], trim((string)($position['label'] ?? '')), $this->num($position['voltage_kv'] ?? null), $this->num($position['percent_change'] ?? null), !empty($position['is_neutral']) ? 1 : 0, trim((string)($position['notes'] ?? ''))]);
                }
            }

            $json = json_encode($snapshot, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $vi = $this->pdo->prepare('INSERT INTO eh_electrical_config_versions (config_id, version_no, snapshot_json, created_at) VALUES (?,?,?,NOW())');
            $vi->execute([$configId, $version, $json]);
            $this->pdo->commit();
            return ['config_id' => $configId, 'version_no' => $version];
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $e;
        }
    }

    private function num($v): ?float { return ($v === '' || $v === null || !is_numeric($v)) ? null : (float)$v; }
    private function intOrNull($v): ?int { return ($v === '' || $v === null || !is_numeric($v)) ? null : (int)$v; }
}
