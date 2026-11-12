from pathlib import Path

root = Path(__file__).resolve().parents[1]
config = (root / "assets/app.js").read_text(encoding="utf-8")
tests = (root / "assets/electrical-tests.js").read_text(encoding="utf-8")
index = (root / "index.php").read_text(encoding="utf-8")

# El módulo de configuración no debe volver a incorporar estado ni formularios de pruebas.
for token in (
    "testCatalog", "specificTemplates", "activeExecutionId",
    "#executionPage", "#testPage", "#testHistory", "#saveExecution",
):
    assert token not in config, f"Dependencia de pruebas encontrada en assets/app.js: {token}"

# Pruebas consume snapshots; nunca debe leer/escribir el objeto mutable de configuración.
for token in ("state.windings", "state.frequency_hz", "state.version_no", "state.windings="):
    assert token not in tests, f"Acceso directo al estado de configuración desde pruebas: {token}"
assert "const getConfig=()=>configBridge.getElectricalConfig();" in tests
assert "executionConfigContext=clone(getConfig())" in tests
assert "getElectricalConfig: function(){ return clone(state); }" in config
assert "window.ELEC_CONFIG_BRIDGE" in config
assert "window.ELEC_PLAN_BRIDGE" in tests

# Orden explícito de inicialización: configuración -> pruebas -> asistente de pruebas.
config_pos = index.find('src="./assets/app.js?')
tests_pos = index.find('src="./assets/electrical-tests.js?')
plan_pos = index.find('src="./assets/plan.js?')
assert -1 not in (config_pos, tests_pos, plan_pos), "Falta cargar uno de los módulos JavaScript."
assert config_pos < tests_pos < plan_pos, "Orden incorrecto de carga de módulos."

print("Aislamiento de módulos OK: estado de configuración encapsulado y pruebas por snapshots.")
