from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PLAN = (ROOT / "assets" / "plan.js").read_text(encoding="utf-8")
REPOSITORY = (ROOT / "app" / "ElectricalTestRepository.php").read_text(encoding="utf-8")
CONFIG_REPOSITORY = (ROOT / "app" / "ElectricalConfigRepository.php").read_text(encoding="utf-8")
APP = (ROOT / "assets" / "app.js").read_text(encoding="utf-8")


def parse_js_map(name: str) -> dict[str, set[str]]:
    match = re.search(rf"const {re.escape(name)}=\{{(.*?)\n  \}};", PLAN, re.S)
    assert match, f"No se encontró el mapa JS {name}"
    result = {}
    for code, body in re.findall(r"([A-Z_]+):\[([^\]]*)\]", match.group(1)):
        result[code] = set(re.findall(r"['\"]([^'\"]+)['\"]", body))
    return result


def parse_php_rules() -> tuple[dict[str, set[str]], dict[str, set[str]]]:
    match = re.search(r"\$rules\s*=\s*\[(.*?)\n\s*\];", REPOSITORY, re.S)
    assert match, "No se encontró el mapa de reglas PHP de ensayos"
    required, numeric = {}, {}
    pattern = re.compile(r"'([A-Z_]+)'\s*=>\s*\['[^']+',\s*\[([^\]]*)\],\s*\[([^\]]*)\]\]")
    for code, required_body, numeric_body in pattern.findall(match.group(1)):
        required[code] = set(re.findall(r"'([^']+)'", required_body))
        numeric[code] = set(re.findall(r"'([^']+)'", numeric_body))
    return required, numeric


def parse_php_optional_numeric() -> dict[str, set[str]]:
    match = re.search(r"\$optionalNumeric\s*=\s*\[(.*?)\]\[\$code\]", REPOSITORY, re.S)
    assert match, "No se encontró el mapa PHP de campos numéricos opcionales"
    return {
        code: set(re.findall(r"'([^']+)'", body))
        for code, body in re.findall(r"'([A-Z_]+)'\s*=>\s*\[([^\]]*)\]", match.group(1))
    }


js_required = parse_js_map("requiredByTest")
js_numeric = parse_js_map("numericByTest")
js_optional = parse_js_map("optionalNumericByTest")
php_required, php_numeric = parse_php_rules()
php_optional = parse_php_optional_numeric()

for code, fields in js_required.items():
    assert php_required.get(code) == fields, (
        f"Campos obligatorios desalineados en {code}: cliente={sorted(fields)}, "
        f"servidor={sorted(php_required.get(code, set()))}"
    )
for code, fields in js_numeric.items():
    assert php_numeric.get(code) == fields, (
        f"Campos numéricos desalineados en {code}: cliente={sorted(fields)}, "
        f"servidor={sorted(php_numeric.get(code, set()))}"
    )
for code, fields in js_optional.items():
    assert php_optional.get(code, set()) == fields, (
        f"Campos numéricos opcionales desalineados en {code}: cliente={sorted(fields)}, "
        f"servidor={sorted(php_optional.get(code, set()))}"
    )

# Paridad de los límites de posición y reglas de configuración.
assert "Number(p.position_no)<=150" in APP, "El cliente debe limitar TAP a 150"
assert "(int)$rawPosition > 150" in CONFIG_REPOSITORY, "El servidor debe limitar TAP a 150"
assert "count($changerPositions) < 1" in CONFIG_REPOSITORY, "El servidor debe exigir al menos una posición TAP"
assert "Agrega al menos una posición TAP" in APP, "El cliente debe mostrar la validación de posiciones vacías"
assert "decimalValue($winding['voltage_kv']" in CONFIG_REPOSITORY, "La tensión debe normalizar coma decimal"
assert "$frequency = $this->decimalValue($frequencyRaw)" in CONFIG_REPOSITORY, "La frecuencia debe normalizar coma decimal"

# El estado de una jornada iniciada no debe degradarse durante el autoguardado.
assert "editingStatus=String(payload.status||'BORRADOR').toUpperCase();" in PLAN
assert "editingId!==null?editingStatus" in PLAN

print("Validation contract OK: campos obligatorios, numéricos y opcionales alineados; configuración TAP/decimales y estado de jornada protegidos.")
