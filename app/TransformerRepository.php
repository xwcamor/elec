<?php
require_once __DIR__ . '/Database.php';

class TransformerRepository
{
    private PDO $pdo;
    private string $table;
    private array $columns = [];
    private string $primaryKey = 'id';

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $cfg = require __DIR__ . '/../config/database.php';
        $this->table = $cfg['transformers_table'] ?? 'transformers';
        if (!preg_match('/^[A-Za-z0-9_]+$/', $this->table)) throw new RuntimeException('Nombre de tabla no válido.');
        $this->inspectTable($cfg['transformers_primary_key'] ?? '');
    }

    private function inspectTable(string $configuredKey): void
    {
        $stmt = $this->pdo->query('SHOW COLUMNS FROM `' . $this->table . '`');
        $this->columns = $stmt->fetchAll();
        if (!$this->columns) throw new RuntimeException('La tabla `' . $this->table . '` no tiene columnas o no existe.');
        $names = array_map(fn($c) => $c['Field'], $this->columns);
        if ($configuredKey !== '' && in_array($configuredKey, $names, true)) {
            $this->primaryKey = $configuredKey;
            return;
        }
        $pk = $this->pdo->query('SHOW KEYS FROM `' . $this->table . '` WHERE Key_name = "PRIMARY"')->fetch();
        if ($pk && !empty($pk['Column_name'])) $this->primaryKey = $pk['Column_name'];
        elseif (in_array('id', $names, true)) $this->primaryKey = 'id';
        else {
            foreach (['transformer_id', 'codigo', 'code', 'tag', 'serial_number', 'serie'] as $candidate) {
                if (in_array($candidate, $names, true)) { $this->primaryKey = $candidate; break; }
            }
        }
    }

    private function qid(string $name): string { return '`' . str_replace('`', '``', $name) . '`'; }

    private function value(array $row, array $candidates, $fallback = null)
    {
        $lookup = [];
        foreach ($row as $k => $v) $lookup[strtolower($k)] = $v;
        foreach ($candidates as $candidate) {
            $key = strtolower($candidate);
            if (array_key_exists($key, $lookup) && $lookup[$key] !== '' && $lookup[$key] !== null) return $lookup[$key];
        }
        return $fallback;
    }

    private function normalize(array $row): array
    {
        $key = $row[$this->primaryKey] ?? $this->value($row, ['id', 'transformer_id', 'codigo', 'code', 'tag']);
        return [
            'key' => (string)$key,
            'code' => (string)$this->value($row, ['tag', 'transformer_number', 'number', 'codigo', 'code', 'serial_number', 'serie', 'id'], $key),
            'name' => (string)$this->value($row, ['name', 'nombre', 'denomination', 'denominacion', 'description', 'descripcion', 'transformer_name'], 'Transformador'),
            'company' => (string)$this->value($row, ['company_name', 'customer_name', 'company', 'empresa', 'cliente', 'customer', 'owner'], 'Empresa no especificada'),
            'tag' => (string)$this->value($row, ['tag', 'tag_number', 'codigo_tag'], ''),
            'voltage' => $this->value($row, ['voltage_kv', 'tension_kv', 'voltage', 'tension', 'hv_voltage', 'primary_voltage']),
            'power' => $this->value($row, ['power_mva', 'potencia_mva', 'mva', 'power', 'potencia']),
            'year' => $this->value($row, ['manufacturing_year', 'year_manufacture', 'year', 'anio_fabricacion', 'ano_fabricacion']),
            'brand' => (string)$this->value($row, ['brand', 'marca', 'manufacturer', 'fabricante'], ''),
            'tap_type' => (string)$this->value($row, ['tap_changer_type', 'tap_type', 'tipo_conmutador', 'conmutador'], ''),
            'num_taps' => $this->value($row, ['num_taps', 'number_of_taps', 'cantidad_taps']),
            'vector_group' => (string)$this->value($row, ['vector_group', 'grupo_vectorial', 'connection_group', 'grupo_conexion'], ''),
            'location' => (string)$this->value($row, ['location', 'ubicacion', 'installation', 'instalacion', 'substation', 'subestacion'], ''),
            'phase_count' => $this->value($row, ['phase_count', 'phases', 'numero_fases', 'cantidad_fases', 'fases']),
            'frequency_hz' => $this->value($row, ['frequency_hz', 'frequency', 'frecuencia_hz', 'frecuencia']),
            'insulation_type' => (string)$this->value($row, ['insulation_type', 'insulation', 'tipo_aislamiento', 'aislamiento'], ''),
            'cooling_type' => (string)$this->value($row, ['cooling_type', 'cooling', 'tipo_refrigeracion', 'refrigeracion', 'cooling_method'], ''),
            'notes' => (string)$this->value($row, ['notes', 'observations', 'observaciones'], ''),
            'raw' => $row,
        ];
    }

    private function candidateColumns(): array
    {
        $names = array_map(fn($c) => $c['Field'], $this->columns);
        $priority = ['id','transformer_id','transformer_code','code','codigo','tag','tag_number','serial_number','serie','number','transformer_number'];
        $ordered = [];
        foreach ($priority as $candidate) {
            foreach ($names as $name) if (strcasecmp($name, $candidate) === 0) $ordered[] = $name;
        }
        foreach ($this->columns as $column) {
            $type = strtolower($column['Type'] ?? '');
            $name = $column['Field'];
            if (str_contains($type, 'blob') || str_contains($type, 'json')) continue;
            if (str_contains($type, 'text') && !str_contains($type, 'varchar')) continue;
            if (!in_array($name, $ordered, true)) $ordered[] = $name;
        }
        return array_values(array_unique($ordered));
    }

    public function find(string $identifier): ?array
    {
        $identifier = trim($identifier);
        if ($identifier === '') return null;

        // Primero intenta la PK detectada y luego códigos/tags comunes por igualdad exacta.
        $available = array_map(fn($c) => $c['Field'], $this->columns);
        $candidates = array_values(array_unique(array_merge(in_array($this->primaryKey, $available, true) ? [$this->primaryKey] : [], $this->candidateColumns())));
        foreach ($candidates as $column) {
            $stmt = $this->pdo->prepare('SELECT * FROM ' . $this->qid($this->table) . ' WHERE ' . $this->qid($column) . ' = :v LIMIT 1');
            $stmt->execute(['v' => $identifier]);
            $row = $stmt->fetch();
            if ($row) return $this->normalize($row);
        }
        // Último recurso: búsqueda parcial en todas las columnas textuales utilizables.
        $matches = $this->search($identifier, 1);
        return $matches[0] ?? null;
    }

    public function all(int $limit = 500): array
    {
        $limit = max(1, min(1000, $limit));
        $sql = 'SELECT * FROM ' . $this->qid($this->table) . ' ORDER BY ' . $this->qid($this->primaryKey) . ' DESC LIMIT ' . $limit;
        $stmt = $this->pdo->query($sql);
        return array_map(fn($row) => $this->normalize($row), $stmt->fetchAll());
    }

    public function search(string $term, int $limit = 12): array
    {
        $term = trim($term);
        if ($term === '') return [];
        $searchable = $this->candidateColumns();
        if (!$searchable) return [];
        $parts = [];
        $params = [];
        foreach ($searchable as $i => $col) {
            $parts[] = 'CAST(' . $this->qid($col) . ' AS CHAR) LIKE :q' . $i;
            $params['q' . $i] = '%' . $term . '%';
        }
        $sql = 'SELECT * FROM ' . $this->qid($this->table) . ' WHERE (' . implode(' OR ', $parts) . ') LIMIT ' . max(1, min(25, $limit));
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return array_map(fn($r) => $this->normalize($r), $stmt->fetchAll());
    }

    public function create(array $input): array
    {
        $code = trim((string)($input['code'] ?? ''));
        if ($code === '') throw new InvalidArgumentException('El TAG o código del transformador es obligatorio.');
        if (!in_array((string)($input['phase_count'] ?? '3'), ['1','3'], true)) {
            throw new InvalidArgumentException('La cantidad de fases debe ser 1 o 3.');
        }
        foreach (['voltage','power','frequency_hz'] as $field) {
            $value = $input[$field] ?? '';
            if ($value !== '' && $value !== null && (!is_numeric(str_replace(',','.',$value)) || (float)str_replace(',','.',$value) <= 0)) {
                throw new InvalidArgumentException('Tensión, potencia y frecuencia deben ser valores mayores que cero.');
            }
        }
        if (($input['num_taps'] ?? '') !== '' && !ctype_digit((string)$input['num_taps'])) {
            throw new InvalidArgumentException('La cantidad de taps debe ser un entero no negativo.');
        }
        if (($input['year'] ?? '') !== '' && (!ctype_digit((string)$input['year']) || (int)$input['year'] < 1800 || (int)$input['year'] > 2200)) {
            throw new InvalidArgumentException('Revisa el año de fabricación.');
        }

        $available = array_map(fn($column) => $column['Field'], $this->columns);
        $codeAliases = ['transformer_number','transformer_code','number','codigo','code','tag','tag_number','serial_number','serie'];
        foreach ($codeAliases as $alias) {
            foreach ($available as $column) {
                if (strcasecmp($alias, $column) !== 0) continue;
                $duplicate = $this->pdo->prepare('SELECT 1 FROM ' . $this->qid($this->table) . ' WHERE ' . $this->qid($column) . ' = :value LIMIT 1');
                $duplicate->execute(['value'=>$code]);
                if ($duplicate->fetchColumn()) throw new InvalidArgumentException('Ya existe un transformador con ese TAG o código.');
            }
        }

        $map = [
            'code' => $codeAliases,
            'name' => ['name','nombre','denomination','denominacion','description','descripcion','transformer_name'],
            'company' => ['company_name','customer_name','company','empresa','cliente','customer','owner'],
            'voltage' => ['voltage_kv','tension_kv','voltage','tension','hv_voltage','primary_voltage'],
            'power' => ['power_mva','potencia_mva','mva','power','potencia'],
            'year' => ['manufacturing_year','year_manufacture','year','anio_fabricacion','ano_fabricacion'],
            'brand' => ['brand','marca','manufacturer','fabricante'],
            'tap_type' => ['tap_changer_type','tap_type','tipo_conmutador','conmutador'],
            'num_taps' => ['num_taps','number_of_taps','cantidad_taps'],
            'vector_group' => ['vector_group','grupo_vectorial','connection_group','grupo_conexion'],
            'location' => ['location','ubicacion','installation','instalacion','substation','subestacion'],
            'phase_count' => ['phase_count','phases','numero_fases','cantidad_fases','fases'],
            'frequency_hz' => ['frequency_hz','frequency','frecuencia_hz','frecuencia'],
            'insulation_type' => ['insulation_type','insulation','tipo_aislamiento','aislamiento'],
            'cooling_type' => ['cooling_type','cooling','tipo_refrigeracion','refrigeracion','cooling_method'],
            'notes' => ['notes','observations','observaciones']
        ];
        $values = [];
        $codeMapped = false;
        foreach ($map as $field => $candidates) {
            if (!array_key_exists($field, $input)) continue;
            $value = trim((string)$input[$field]);
            foreach ($candidates as $candidate) {
                foreach ($available as $column) {
                    if (strcasecmp($candidate, $column) !== 0) continue;
                    if ($field === 'code') {
                        $values[$column] = $value;
                        $codeMapped = true;
                    } elseif (!array_key_exists($column, $values)) {
                        $values[$column] = $value;
                        break 2;
                    }
                }
            }
        }
        if (!$codeMapped) throw new RuntimeException('La tabla no contiene una columna compatible con TAG o código.');

        $columnMeta = [];
        foreach ($this->columns as $column) $columnMeta[$column['Field']] = $column;
        if (!array_key_exists($this->primaryKey, $values)) {
            $pk = $columnMeta[$this->primaryKey] ?? null;
            if ($pk && stripos((string)($pk['Extra'] ?? ''), 'auto_increment') === false
                && ($pk['Null'] ?? 'YES') === 'NO' && ($pk['Default'] ?? null) === null) {
                $type = strtolower((string)($pk['Type'] ?? ''));
                if (preg_match('/^(tinyint|smallint|mediumint|int|bigint)\\b/', $type)) {
                    $max = $this->pdo->query('SELECT COALESCE(MAX(' . $this->qid($this->primaryKey) . '),0) FROM ' . $this->qid($this->table))->fetchColumn();
                    $values[$this->primaryKey] = (string)((int)$max + 1);
                } else {
                    $values[$this->primaryKey] = $code;
                }
            }
        }

        foreach ($this->columns as $column) {
            $name = $column['Field'];
            $extra = strtolower((string)($column['Extra'] ?? ''));
            if (($column['Null'] ?? 'YES') === 'NO' && ($column['Default'] ?? null) === null
                && !isset($values[$name]) && stripos($extra, 'auto_increment') === false
                && !str_contains($extra, 'generated')) {
                throw new RuntimeException('Falta un valor obligatorio para la columna «' . $name . '» de la tabla configurada.');
            }
        }
        $numericFields = ['voltage_kv','tension_kv','voltage','tension','hv_voltage','primary_voltage','power_mva','potencia_mva','mva','power','potencia','frequency_hz','frequency','frecuencia_hz','frecuencia','manufacturing_year','year_manufacture','year','anio_fabricacion','ano_fabricacion','num_taps','number_of_taps','cantidad_taps','phase_count','phases','numero_fases','cantidad_fases','fases'];
        $columns = array_keys($values);
        $params = [];
        $holders = [];
        foreach ($columns as $index => $column) {
            $holders[] = ':v' . $index;
            $value = $values[$column];
            $params['v' . $index] = $value === '' ? null : (in_array(strtolower($column), $numericFields, true) ? str_replace(',','.',$value) : $value);
        }
        $sql = 'INSERT INTO ' . $this->qid($this->table) . ' (' . implode(',', array_map(fn($name) => $this->qid($name), $columns)) . ') VALUES (' . implode(',', $holders) . ')';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        $lookupKey = $values[$this->primaryKey] ?? (string)$this->pdo->lastInsertId();
        if ($lookupKey === '') $lookupKey = $code;
        $created = $this->find((string)$lookupKey) ?: $this->find($code);
        if (!$created) throw new RuntimeException('El transformador se creó, pero no fue posible volver a leer el registro.');
        return $created;
    }

    public function updateMain(string $identifier, array $input): array
    {
        $row = $this->find($identifier);
        if (!$row) throw new RuntimeException('No se encontró el transformador.');
        $raw = $row['raw'];
        $available = array_map(fn($c) => $c['Field'], $this->columns);
        $map = [
            'code' => ['tag','transformer_number','number','codigo','code','serial_number','serie'],
            'name' => ['name','nombre','denomination','denominacion','description','descripcion','transformer_name'],
            'company' => ['company_name','customer_name','company','empresa','cliente','customer','owner'],
            'voltage' => ['voltage_kv','tension_kv','voltage','tension','hv_voltage','primary_voltage'],
            'power' => ['power_mva','potencia_mva','mva','power','potencia'],
            'year' => ['manufacturing_year','year_manufacture','year','anio_fabricacion','ano_fabricacion'],
            'brand' => ['brand','marca','manufacturer','fabricante'],
            'tap_type' => ['tap_changer_type','tap_type','tipo_conmutador','conmutador'],
            'num_taps' => ['num_taps','number_of_taps','cantidad_taps'],
            'vector_group' => ['vector_group','grupo_vectorial','connection_group','grupo_conexion'],
            'location' => ['location','ubicacion','installation','instalacion','substation','subestacion'],
            'phase_count' => ['phase_count','phases','numero_fases','cantidad_fases','fases'],
            'frequency_hz' => ['frequency_hz','frequency','frecuencia_hz','frecuencia'],
            'insulation_type' => ['insulation_type','insulation','tipo_aislamiento','aislamiento'],
            'cooling_type' => ['cooling_type','cooling','tipo_refrigeracion','refrigeracion','cooling_method'],
            'notes' => ['notes','observations','observaciones']
        ];
        $updates = [];
        $supportedFields = [];
        foreach ($map as $field => $candidates) {
            if (!array_key_exists($field, $input)) continue;
            foreach ($candidates as $candidate) {
                foreach ($available as $col) {
                    if (strcasecmp($candidate, $col) === 0) { $updates[$col] = trim((string)$input[$field]); $supportedFields[] = $field; break 2; }
                }
            }
        }
        if (array_key_exists('code', $input) && trim((string)$input['code']) === '') throw new InvalidArgumentException('El TAG o código del transformador es obligatorio.');
        foreach (['voltage','power','frequency_hz'] as $f) if (isset($input[$f]) && $input[$f] !== '' && (!is_numeric(str_replace(',','.',$input[$f])) || (float)str_replace(',','.',$input[$f]) <= 0)) throw new InvalidArgumentException('Tensión, potencia y frecuencia deben ser valores numéricos mayores que cero.');
        if (array_key_exists('phase_count', $input) && !in_array((string)$input['phase_count'], ['1','3'], true)) throw new InvalidArgumentException('La cantidad de fases debe ser 1 o 3.');
        if (isset($input['num_taps']) && $input['num_taps'] !== '' && (!ctype_digit((string)$input['num_taps']) || (int)$input['num_taps'] < 0)) throw new InvalidArgumentException('La cantidad de taps debe ser un entero no negativo.');
        if (isset($input['year']) && $input['year'] !== '' && (!ctype_digit((string)$input['year']) || (int)$input['year'] < 1800 || (int)$input['year'] > 2200)) throw new InvalidArgumentException('Revisa el año de fabricación.');
        if (!$updates) throw new RuntimeException('No se encontraron columnas compatibles para actualizar.');
        $submittedFields = array_keys(array_intersect_key($map, $input));
        $updatedFields = array_values(array_unique($supportedFields));
        $unsupported = array_values(array_diff($submittedFields, $updatedFields));
        $numericColumns = ['voltage_kv','tension_kv','voltage','tension','hv_voltage','primary_voltage','power_mva','potencia_mva','mva','power','potencia','frequency_hz','frequency','frecuencia_hz','frecuencia'];
        $sets=[]; $params=[];
        foreach ($updates as $col=>$value) {
            $sets[]=$this->qid($col).'=:v'.count($params);
            $params['v'.count($params)]=$value === '' ? null : (in_array(strtolower($col), $numericColumns, true) ? str_replace(',','.',$value) : $value);
        }
        $params['pk']=$raw[$this->primaryKey];
        $st=$this->pdo->prepare('UPDATE '.$this->qid($this->table).' SET '.implode(',',$sets).' WHERE '.$this->qid($this->primaryKey).'=:pk');
        $st->execute($params);
        $fresh=$this->find((string)$raw[$this->primaryKey]);
        return ['transformer' => $fresh ?: $row, 'updated_fields' => $updatedFields, 'unsupported_fields' => $unsupported];
    }
}
