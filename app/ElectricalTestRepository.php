<?php
class ElectricalTestRepository
{
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function listForTransformer(string $key): array
    {
        $sql = "SELECT e.id, e.executed_at, e.status, e.operator_name, e.equipment_name,
                       e.standard_reference,
                       COALESCE(t.code, 'PLAN') AS test_code,
                       COALESCE(t.name, 'Registro de pruebas') AS test_name,
                       COALESCE(d.measurement_count,0) AS measurement_count, d.payload_json
                FROM eh_test_executions e
                LEFT JOIN eh_test_types t ON t.id=e.test_type_id
                LEFT JOIN eh_test_execution_data d ON d.execution_id=e.id
                WHERE e.transformer_key=:k
                ORDER BY e.executed_at DESC, e.id DESC";
        $st = $this->pdo->prepare($sql); $st->execute(['k'=>$key]);
        $items = $st->fetchAll();
        foreach ($items as &$item) {
            $stored = json_decode($item['payload_json'] ?? '{}', true) ?: [];
            $tests = $stored['plan']['tests'] ?? [];
            $item['plan_tests'] = array_map(static function($test) {
                $measurements = is_array($test['measurements'] ?? null) ? $test['measurements'] : [];
                $hasData = count($measurements) > 0
                    || trim((string)($test['observations'] ?? '')) !== ''
                    || trim((string)($test['equipment_name'] ?? '')) !== ''
                    || trim((string)($test['equipment_brand'] ?? '')) !== ''
                    || trim((string)($test['equipment_model'] ?? '')) !== ''
                    || trim((string)($test['equipment_serial'] ?? '')) !== '';
                return ['code'=>$test['code'] ?? '', 'name'=>$test['name'] ?? '', 'status'=>$test['status'] ?? 'BORRADOR', 'has_data'=>$hasData];
            }, is_array($tests) ? $tests : []);
            $item['plan_count'] = count($item['plan_tests']);
            unset($item['payload_json']);
        }
        unset($item);
        return $items;
    }

    public function get(int $id, string $key): ?array
    {
        $sql = "SELECT e.*, COALESCE(t.code, 'PLAN') AS test_code, COALESCE(t.name, 'Registro de pruebas') AS test_name,
                       d.payload_json, COALESCE(d.measurement_count,0) AS measurement_count
                FROM eh_test_executions e
                LEFT JOIN eh_test_types t ON t.id=e.test_type_id
                LEFT JOIN eh_test_execution_data d ON d.execution_id=e.id
                WHERE e.id=:id AND e.transformer_key=:k LIMIT 1";
        $st=$this->pdo->prepare($sql); $st->execute(['id'=>$id,'k'=>$key]);
        $row=$st->fetch(); if(!$row) return null;
        $stored = json_decode($row['payload_json'] ?: '{"measurements":[]}', true) ?: [];
        $row['measurements'] = $stored['measurements'] ?? [];
        $row['plan'] = $stored['plan'] ?? null;
        unset($row['payload_json']);
        return $row;
    }

    public function types(): array
    {
        // Sincroniza el catálogo al abrir Pruebas eléctricas para instalaciones que ya tenían el esquema anterior.
        $defaults = [
            ['TTR', 'Relación de transformación', 1],
            ['CAPACITANCE', 'Capacitancia', 2],
            ['POWER_FACTOR', 'Factor de potencia del transformador', 3],
            ['EXCITATION', 'Corriente de excitación', 4],
            ['WINDING_RESISTANCE', 'Resistencia de devanados', 5],
            ['INSULATION_RESISTANCE', 'Resistencia de aislamiento', 6],
            ['SFRA', 'SFRA', 7],
            ['BUSHING', 'Bushings capacitivos', 8],
            ['ARRESTER', 'Pararrayos AT / MT', 9],
            ['PROTECTIONS', 'Protecciones propias', 10],
            ['PLAN', 'Registro de pruebas', 11],
        ];
        $sync = $this->pdo->prepare('INSERT INTO eh_test_types (code, name, display_order) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), display_order=VALUES(display_order)');
        foreach ($defaults as $row) $sync->execute($row);
        return $this->pdo->query('SELECT code,name,display_order FROM eh_test_types ORDER BY display_order')->fetchAll();
    }
    public function save(array $p): array
    {
        $key=trim((string)($p['transformer_key']??''));
        $code=trim((string)($p['test_code']??''));
        $date=trim((string)($p['executed_at']??''));
        if($key==='') throw new InvalidArgumentException('No se identificó el transformador.');
        if($code==='') throw new InvalidArgumentException('Selecciona el tipo de prueba.');
        $dt=DateTime::createFromFormat('Y-m-d\\TH:i',$date);
        if(!$dt) $dt=DateTime::createFromFormat('Y-m-d H:i:s',$date);
        if(!$dt) throw new InvalidArgumentException('Ingresa la fecha y hora en que se realizó la prueba.');
        $executedAt=$dt->format('Y-m-d H:i:s');
        $typeSt=$this->pdo->prepare('SELECT id FROM eh_test_types WHERE code=? LIMIT 1');
        $typeSt->execute([$code]); $type=$typeSt->fetch();
        if(!$type) throw new InvalidArgumentException('El tipo de prueba no existe en el catálogo.');
        $status=strtoupper((string)($p['status']??'BORRADOR'));
        if(!in_array($status,['BORRADOR','EN_PROCESO','COMPLETADA'],true)) $status='BORRADOR';
        $measurements=$p['measurements']??[];
        if(!is_array($measurements)) $measurements=[];
        if(count($measurements)>2000) throw new InvalidArgumentException('La grilla admite hasta 2,000 filas por ejecución.');
        $clean=[];
        foreach($measurements as $row){
            if(!is_array($row)) continue;
            $parameter=trim(substr((string)($row['parameter']??''),0,180));
            $value=trim(substr((string)($row['value']??''),0,120));
            $unit=trim(substr((string)($row['unit']??''),0,40));
            $notes=trim(substr((string)($row['notes']??''),0,500));
            if($parameter==='' && $value==='' && $unit==='' && $notes==='') continue;
            $clean[]=['parameter'=>$parameter,'value'=>$value,'unit'=>$unit,'notes'=>$notes];
        }
        $storedPayload = ['measurements'=>$clean];
        $plan = $p['plan'] ?? null;
        if (is_array($plan)) {
            $tests = $plan['tests'] ?? [];
            if (!is_array($tests) || count($tests) > 20) throw new InvalidArgumentException('Un registro admite hasta 20 ensayos.');
            $safeTests = [];
            $seenTestCodes = [];
            foreach ($tests as $test) {
                if (!is_array($test)) continue;
                $testCode = strtoupper(trim((string)($test['code'] ?? '')));
                if ($testCode === '' || $testCode === 'PLAN') continue;
                if (isset($seenTestCodes[$testCode])) {
                    throw new InvalidArgumentException('El ensayo '.$testCode.' ya está incluido en este registro. Cada tipo de ensayo solo puede agregarse una vez por jornada.');
                }
                $seenTestCodes[$testCode] = true;
                $testMeasurements = $test['measurements'] ?? [];
                if (!is_array($testMeasurements) || count($testMeasurements) > 2000) throw new InvalidArgumentException('Una prueba supera el límite de 2,000 valores.');
                $safeTests[] = [
                    'id'=>(int)($test['id'] ?? 0) ?: null,
                    'code'=>substr($testCode,0,40),
                    'name'=>substr(trim((string)($test['name'] ?? '')),0,120),
                    'status'=>in_array(strtoupper((string)($test['status'] ?? 'BORRADOR')),['BORRADOR','COMPLETADA'],true)?strtoupper((string)($test['status'] ?? 'BORRADOR')):'BORRADOR',
                    'standard_reference'=>substr(trim((string)($test['standard_reference'] ?? '')),0,120),
                    'equipment_name'=>substr(trim((string)($test['equipment_name'] ?? '')),0,150),
                    'equipment_brand'=>substr(trim((string)($test['equipment_brand'] ?? '')),0,100),
                    'equipment_model'=>substr(trim((string)($test['equipment_model'] ?? '')),0,100),
                    'equipment_serial'=>substr(trim((string)($test['equipment_serial'] ?? '')),0,100),
                    'observations'=>substr(trim((string)($test['observations'] ?? '')),0,4000),
                    'measurements'=>$testMeasurements
                ];
            }
            if ($status === 'COMPLETADA') {
                if (!$safeTests) throw new InvalidArgumentException('No se puede completar un registro sin ensayos.');
                foreach ($safeTests as $test) {
                    if (($test['status'] ?? 'BORRADOR') !== 'COMPLETADA' || empty($test['measurements'])) {
                        throw new InvalidArgumentException('Todos los ensayos deben tener sus mediciones completas antes de confirmar el registro.');
                    }
                }
                if (trim((string)($p['operator_name'] ?? '')) === '' || trim((string)($p['supervisor_name'] ?? '')) === '') throw new InvalidArgumentException('Completa el responsable y el supervisor antes de confirmar el registro.');
            }
            $storedPayload['plan'] = ['version'=>1,'session_id'=>substr(trim((string)($plan['session_id'] ?? '')),0,80) ?: null,'tests'=>$safeTests];
        }
        $payload=json_encode($storedPayload,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
        $this->pdo->beginTransaction();
        try {
            $configVersion=null; $snapshot=null;
            $cs=$this->pdo->prepare('SELECT id,version_no,phase_count,vector_group,frequency_hz,notes FROM eh_electrical_configs WHERE transformer_key=? LIMIT 1');
            $cs->execute([$key]); $config=$cs->fetch();
            if($config){
                $configVersion=(int)$config['version_no'];
                $vs=$this->pdo->prepare('SELECT snapshot_json FROM eh_electrical_config_versions WHERE config_id=? AND version_no=? LIMIT 1');
                $vs->execute([(int)$config['id'],$configVersion]);
                $versionSnapshot=$vs->fetchColumn();
                $snapshot=$versionSnapshot ?: json_encode($config,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
            }
            $values=[
              'transformer_key'=>$key,'test_type_id'=>(int)$type['id'],'executed_at'=>$executedAt,'status'=>$status,
              'operator_name'=>trim((string)($p['operator_name']??'')) ?: null,
              'supervisor_name'=>trim((string)($p['supervisor_name']??'')) ?: null,
              'equipment_name'=>trim((string)($p['equipment_name']??'')) ?: null,
              'equipment_brand'=>trim((string)($p['equipment_brand']??'')) ?: null,
              'equipment_model'=>trim((string)($p['equipment_model']??'')) ?: null,
              'equipment_serial'=>trim((string)($p['equipment_serial']??'')) ?: null,
              'standard_reference'=>trim((string)($p['standard_reference']??'')) ?: null,
              'oil_temperature_c'=>$this->num($p['oil_temperature_c']??null),
              'ambient_temperature_c'=>$this->num($p['ambient_temperature_c']??null),
              'relative_humidity_percent'=>$this->num($p['relative_humidity_percent']??null),
              'observations'=>trim((string)($p['observations']??'')) ?: null,
              'config_version'=>$configVersion,'config_snapshot'=>$snapshot
            ];
            $id=(int)($p['id']??0);
            if($id>0){
                $chk=$this->pdo->prepare('SELECT id FROM eh_test_executions WHERE id=? AND transformer_key=? FOR UPDATE');
                $chk->execute([$id,$key]); if(!$chk->fetch()) throw new RuntimeException('No se encontró el registro que intentas editar.');
                $set=[]; foreach(array_keys($values) as $col)$set[]="`$col`=:$col";
                $values['id']=$id;
                $up=$this->pdo->prepare('UPDATE eh_test_executions SET '.implode(',',$set).' WHERE id=:id');
                $up->execute($values);
            } else {
                $cols=array_keys($values); $ph=array_map(fn($c)=>':'.$c,$cols);
                $ins=$this->pdo->prepare('INSERT INTO eh_test_executions (`'.implode('`,`',$cols).'`) VALUES ('.implode(',',$ph).')');
                $ins->execute($values); $id=(int)$this->pdo->lastInsertId();
            }
            $ds=$this->pdo->prepare('INSERT INTO eh_test_execution_data (execution_id,payload_json,measurement_count) VALUES (?,?,?) ON DUPLICATE KEY UPDATE payload_json=VALUES(payload_json),measurement_count=VALUES(measurement_count)');
            $savedCount = count($clean);
            if (isset($storedPayload['plan']['tests'])) {
                $savedCount = 0;
                foreach ($storedPayload['plan']['tests'] as $test) $savedCount += count($test['measurements'] ?? []);
            }
            $ds->execute([$id,$payload,$savedCount]);
            $this->pdo->commit();
            return ['id'=>$id,'executed_at'=>$executedAt,'measurement_count'=>count($clean),'status'=>$status];
        } catch(Throwable $e){if($this->pdo->inTransaction())$this->pdo->rollBack();throw $e;}
    }

    public function delete(int $id, string $key): bool
    {
        if ($id < 1 || trim($key) === '') return false;
        $st = $this->pdo->prepare('DELETE FROM eh_test_executions WHERE id = :id AND transformer_key = :key');
        $st->execute(['id'=>$id, 'key'=>$key]);
        // eh_test_execution_data is removed by its ON DELETE CASCADE foreign key.
        return $st->rowCount() === 1;
    }

    private function num($v): ?float { if($v===null||$v==='')return null; if(is_string($v))$v=str_replace(',','.',$v); return is_numeric($v)?(float)$v:null; }
}
