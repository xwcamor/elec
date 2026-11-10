-- TR Health | Esquema completo del piloto
-- IMPORTANTE: este esquema crea `transformers` solo si no existe.
-- Los dos registros iniciales son DATOS DE EJEMPLO basados en las capturas del prototipo.
-- Si ya tienes tu tabla transformers real en otra base de datos, cambia DB_NAME en config/database.php.
-- No se modifica ninguna tabla transformers que ya exista.

CREATE TABLE IF NOT EXISTS transformers (
  id BIGINT UNSIGNED NOT NULL,
  transformer_number VARCHAR(80) NOT NULL,
  tag VARCHAR(80) NULL,
  name VARCHAR(180) NULL,
  company_name VARCHAR(220) NULL,
  voltage_kv DECIMAL(14,5) NULL,
  power_mva DECIMAL(14,5) NULL,
  manufacturing_year SMALLINT UNSIGNED NULL,
  brand VARCHAR(100) NULL,
  tap_changer_type VARCHAR(30) NULL,
  num_taps SMALLINT UNSIGNED NULL,
  vector_group VARCHAR(40) NULL,
  phase_count TINYINT UNSIGNED NOT NULL DEFAULT 3,
  frequency_hz DECIMAL(8,3) NULL DEFAULT 60,
  location VARCHAR(220) NULL,
  insulation_type VARCHAR(80) NULL,
  cooling_type VARCHAR(80) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_transformers_number (transformer_number),
  KEY idx_transformers_tag (tag),
  KEY idx_transformers_company (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de ejemplo para que el piloto abra y permita guardar desde el primer inicio.
INSERT IGNORE INTO transformers
(id, transformer_number, tag, name, company_name, voltage_kv, power_mva, manufacturing_year, brand, tap_changer_type, num_taps, vector_group, phase_count, frequency_hz, location, insulation_type, cooling_type)
VALUES
(2001158, '2001158', '2001158', 'Transformador TP-060-01', 'EMPRESA DE GENERACION ELECTRICA DE JUNIN S.A.C', 60.00000, 25.00000, 2013, 'ABB', 'DETC', 5, 'Yd11', 3, 60, 'RONATULLO II', 'Mineral', 'ONAN'),
(59606, '59606', '59606', 'Transformador ST-24', 'TERMOBARRANQUILLA EMPRESA DE SERVICIOS PUBLICOS TEBSA S.A. E.S.P.', 220.00000, 215.00000, 1997, 'ABB', 'DETC', 27, 'Yd11', 3, 60, 'BARRANQUILLA - PLANTA TEBSA', 'Mineral', 'ONAN');

-- TR Health | Piloto de configuración y pruebas eléctricas
-- Importar en la misma base de datos que contiene la tabla `transformers`.
-- Este script SOLO crea tablas con prefijo eh_; NO modifica transformers ni num_taps.

CREATE TABLE IF NOT EXISTS eh_electrical_configs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  transformer_key VARCHAR(100) NOT NULL,
  phase_count TINYINT UNSIGNED NOT NULL DEFAULT 3,
  vector_group VARCHAR(40) NULL,
  frequency_hz DECIMAL(8,3) NULL,
  notes TEXT NULL,
  version_no INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_eh_config_transformer (transformer_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eh_windings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  config_id BIGINT UNSIGNED NOT NULL,
  winding_order SMALLINT UNSIGNED NOT NULL,
  winding_name VARCHAR(100) NOT NULL,
  winding_code VARCHAR(30) NOT NULL,
  voltage_kv DECIMAL(14,5) NULL,
  connection_type VARCHAR(40) NULL,
  has_neutral TINYINT(1) NOT NULL DEFAULT 0,
  conductor_material VARCHAR(30) NULL,
  notes TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_eh_winding_config (config_id),
  CONSTRAINT fk_eh_winding_config FOREIGN KEY (config_id) REFERENCES eh_electrical_configs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eh_terminals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  winding_id BIGINT UNSIGNED NOT NULL,
  terminal_order SMALLINT UNSIGNED NOT NULL,
  terminal_code VARCHAR(30) NOT NULL,
  phase_code VARCHAR(20) NULL,
  terminal_type VARCHAR(30) NOT NULL DEFAULT 'Fase',
  has_capacitive_bushing TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_eh_terminal_winding (winding_id),
  CONSTRAINT fk_eh_terminal_winding FOREIGN KEY (winding_id) REFERENCES eh_windings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eh_bushings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  terminal_id BIGINT UNSIGNED NOT NULL,
  serial_number VARCHAR(100) NULL,
  manufacturer VARCHAR(100) NULL,
  model VARCHAR(100) NULL,
  rated_voltage_kv DECIMAL(14,5) NULL,
  capacitance_pf DECIMAL(16,6) NULL,
  power_factor_percent DECIMAL(12,6) NULL,
  notes TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_eh_bushing_terminal (terminal_id),
  CONSTRAINT fk_eh_bushing_terminal FOREIGN KEY (terminal_id) REFERENCES eh_terminals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eh_tap_changers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  config_id BIGINT UNSIGNED NOT NULL,
  winding_id BIGINT UNSIGNED NOT NULL,
  changer_name VARCHAR(100) NOT NULL DEFAULT 'Conmutador',
  changer_type VARCHAR(20) NOT NULL DEFAULT 'DETC',
  operation_type VARCHAR(30) NOT NULL DEFAULT 'Manual',
  min_position INT NULL,
  max_position INT NULL,
  neutral_position INT NULL,
  current_position INT NULL,
  notes TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_eh_tap_config (config_id),
  KEY idx_eh_tap_winding (winding_id),
  CONSTRAINT fk_eh_tap_config FOREIGN KEY (config_id) REFERENCES eh_electrical_configs(id) ON DELETE CASCADE,
  CONSTRAINT fk_eh_tap_winding FOREIGN KEY (winding_id) REFERENCES eh_windings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eh_tap_positions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tap_changer_id BIGINT UNSIGNED NOT NULL,
  position_no INT NOT NULL,
  label VARCHAR(50) NULL,
  voltage_kv DECIMAL(14,5) NULL,
  percent_change DECIMAL(12,6) NULL,
  is_neutral TINYINT(1) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_eh_tap_position (tap_changer_id, position_no),
  CONSTRAINT fk_eh_tap_position_changer FOREIGN KEY (tap_changer_id) REFERENCES eh_tap_changers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eh_electrical_config_versions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  config_id BIGINT UNSIGNED NOT NULL,
  version_no INT UNSIGNED NOT NULL,
  snapshot_json LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_eh_config_version (config_id, version_no),
  CONSTRAINT fk_eh_config_version FOREIGN KEY (config_id) REFERENCES eh_electrical_configs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cabecera futura de las ejecuciones fechadas. Las tablas de detalle de cada prueba
-- se crearán en las siguientes fases, enlazadas mediante execution_id.
CREATE TABLE IF NOT EXISTS eh_test_types (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(120) NOT NULL,
  display_order SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_eh_test_type_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO eh_test_types (code, name, display_order) VALUES
('TTR', 'Relación de transformación', 1),
('CAPACITANCE', 'Capacitancia', 2),
('POWER_FACTOR', 'Factor de potencia', 3),
('EXCITATION', 'Corriente de excitación', 4),
('WINDING_RESISTANCE', 'Resistencia de devanados', 5),
('INSULATION_RESISTANCE', 'Resistencia de aislamiento', 6),
('SFRA', 'SFRA', 7),
('BUSHING', 'Bushings capacitivos', 8);

CREATE TABLE IF NOT EXISTS eh_test_executions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  transformer_key VARCHAR(100) NOT NULL,
  test_type_id SMALLINT UNSIGNED NOT NULL,
  executed_at DATETIME NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'BORRADOR',
  operator_name VARCHAR(150) NULL,
  supervisor_name VARCHAR(150) NULL,
  equipment_name VARCHAR(150) NULL,
  equipment_brand VARCHAR(100) NULL,
  equipment_model VARCHAR(100) NULL,
  equipment_serial VARCHAR(100) NULL,
  standard_reference VARCHAR(120) NULL,
  oil_temperature_c DECIMAL(8,3) NULL,
  ambient_temperature_c DECIMAL(8,3) NULL,
  relative_humidity_percent DECIMAL(8,3) NULL,
  observations TEXT NULL,
  config_version INT UNSIGNED NULL,
  config_snapshot LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_eh_execution_transformer_date (transformer_key, executed_at),
  KEY idx_eh_execution_type_date (test_type_id, executed_at),
  CONSTRAINT fk_eh_execution_type FOREIGN KEY (test_type_id) REFERENCES eh_test_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Datos de cada ejecución. En esta fase se conserva la captura flexible de la hoja
-- tipo Excel como JSON; las tablas específicas de cada protocolo se añadirán al
-- validar las columnas y cálculos de cada prueba. Una fila = una ejecución fechada.
CREATE TABLE IF NOT EXISTS eh_test_execution_data (
  execution_id BIGINT UNSIGNED NOT NULL,
  payload_json LONGTEXT NOT NULL,
  measurement_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (execution_id),
  CONSTRAINT fk_eh_execution_data_execution FOREIGN KEY (execution_id) REFERENCES eh_test_executions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
