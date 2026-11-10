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

        $w = $this->pdo->prepare('SELECT * FROM eh_windings WHERE config_id = ? ORDER BY winding_order, id');
        $w->execute([$config['id']]);
        $windings = $w->fetchAll();
        foreach ($windings as &$winding) {
            $t = $this->pdo->prepare('SELECT t.*, b.serial_number, b.manufacturer AS bushing_manufacturer, b.model AS bushing_model, b.rated_voltage_kv, b.capacitance_pf, b.power_factor_percent, b.notes AS bushing_notes FROM eh_terminals t LEFT JOIN eh_bushings b ON b.terminal_id=t.id WHERE t.winding_id=? ORDER BY t.terminal_order, t.id');
            $t->execute([$winding['id']]);
            $winding['terminals'] = $t->fetchAll();
        }
        unset($winding);
        $tc = $this->pdo->prepare('SELECT * FROM eh_tap_changers WHERE config_id = ? ORDER BY id');
        $tc->execute([$config['id']]);
        $changers = $tc->fetchAll();
        foreach ($changers as &$changer) {
            $p = $this->pdo->prepare('SELECT * FROM eh_tap_positions WHERE tap_changer_id = ? ORDER BY position_no');
            $p->execute([$changer['id']]);
            $changer['positions'] = $p->fetchAll();
        }
        unset($changer);
        $v = $this->pdo->prepare('SELECT version_no, created_at FROM eh_electrical_config_versions WHERE config_id=? ORDER BY version_no DESC LIMIT 8');
        $v->execute([$config['id']]);
        return [
            'id' => (int)$config['id'], 'phase_count' => (int)$config['phase_count'],
            'vector_group' => $config['vector_group'], 'frequency_hz' => $config['frequency_hz'],
            'notes' => $config['notes'], 'version_no' => (int)$config['version_no'],
            'windings' => $windings, 'tap_changers' => $changers, 'versions' => $v->fetchAll(),
        ];
    }

    public function save(string $transformerKey, array $payload): array
    {
        if ($transformerKey === '') throw new InvalidArgumentException('Falta identificar el transformador.');
        $windings = is_array($payload['windings'] ?? null) ? $payload['windings'] : [];
        $changers = is_array($payload['tap_changers'] ?? null) ? $payload['tap_changers'] : [];
        if (!$windings) throw new InvalidArgumentException('Agrega al menos un bobinado antes de guardar.');

        $snapshot = [
            'phase_count' => (int)($payload['phase_count'] ?? 3),
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
