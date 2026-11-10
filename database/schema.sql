-- ELEC: esquema inicial independiente para el mini demo de pruebas eléctricas.
-- No contiene tablas, vistas ni dependencias de TR Health.

CREATE DATABASE IF NOT EXISTS elec_demo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE elec_demo;

CREATE TABLE IF NOT EXISTS elec_transformers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(80) NOT NULL,
  manufacturer VARCHAR(120) NULL,
  model VARCHAR(120) NULL,
  serial_number VARCHAR(120) NULL,
  rated_power_kva DECIMAL(14,3) NULL,
  rated_voltage VARCHAR(120) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_elec_transformers_code (code),
  KEY idx_elec_transformers_serial (serial_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS elec_test_types (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(60) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_elec_test_types_code (code),
  KEY idx_elec_test_types_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS elec_test_executions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  transformer_id BIGINT UNSIGNED NOT NULL,
  test_type_id BIGINT UNSIGNED NOT NULL,
  reference_code VARCHAR(100) NULL,
  executed_at DATETIME NOT NULL,
  operator_name VARCHAR(160) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  ambient_temperature_c DECIMAL(8,3) NULL,
  relative_humidity_pct DECIMAL(8,3) NULL,
  observations TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_elec_execution_transformer_date (transformer_id, executed_at),
  KEY idx_elec_execution_test_date (test_type_id, executed_at),
  CONSTRAINT fk_elec_execution_transformer
    FOREIGN KEY (transformer_id) REFERENCES elec_transformers(id),
  CONSTRAINT fk_elec_execution_test_type
    FOREIGN KEY (test_type_id) REFERENCES elec_test_types(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS elec_test_measurements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  execution_id BIGINT UNSIGNED NOT NULL,
  measurement_key VARCHAR(100) NOT NULL,
  label VARCHAR(180) NOT NULL,
  phase VARCHAR(30) NULL,
  tap_position VARCHAR(40) NULL,
  sequence_no INT UNSIGNED NOT NULL DEFAULT 1,
  value_numeric DECIMAL(20,8) NULL,
  value_text TEXT NULL,
  unit VARCHAR(40) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_elec_measurement_execution (execution_id, sequence_no),
  KEY idx_elec_measurement_key (measurement_key),
  CONSTRAINT fk_elec_measurement_execution
    FOREIGN KEY (execution_id) REFERENCES elec_test_executions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
