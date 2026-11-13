#!/usr/bin/env python3
"""Compara las reglas de completitud de ensayos entre JavaScript y PHP."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PLAN = (ROOT / "assets/plan.js").read_text(encoding="utf-8")
PHP = (ROOT / "app/ElectricalTestRepository.php").read_text(encoding="utf-8")
CONFIG_JS = (ROOT / "assets/app.js").read_text(encoding="utf-8")
CONFIG_PHP = (ROOT / "app/ElectricalConfigRepository.php").read_text(encoding="utf-8")


def read_js_map(name: str) -> dict[str, list[str]]:
    match = re.search(
        rf"const\s+{re.escape(name)}\s*=\s*\{{([\s\S]*?)^\s*\}};",
        PLAN,
        re.MULTILINE,
    )
    if not match:
        raise AssertionError(f"No se encontró {name} en assets/plan.js")
    result: dict[str, list[str]] = {}
    for entry in re.finditer(
        r"^\s*([A-Z_]+)\s*:\s*\[([^\]]*)\]\s*,?\s*$",
        match.group(1),
        re.MULTILINE,
    ):
        result[entry.group(1)] = re.findall(r"'([^']+)'", entry.group(2))
    if not result:
        raise AssertionError(f"No se pudo leer {name}")
    return result


def read_php_map() -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    match = re.search(r"\$rules\s*=\s*\[([\s\S]*?)^\s*\];", PHP, re.MULTILINE)
    if not match:
        raise AssertionError("No se encontró el mapa $rules en ElectricalTestRepository.php")
    required: dict[str, list[str]] = {}
    numeric: dict[str, list[str]] = {}
    pattern = re.compile(
        r"^\s*'([A-Z_]+)'\s*=>\s*\['[^']+',\s*\[([^\]]*)\],\s*\[([^\]]*)\]\]\s*,?\s*$",
        re.MULTILINE,
    )
    for entry in pattern.finditer(match.group(1)):
        required[entry.group(1)] = re.findall(r"'([^']+)'", entry.group(2))
        numeric[entry.group(1)] = re.findall(r"'([^']+)'", entry.group(3))
    if not required:
        raise AssertionError("No se pudieron leer las reglas PHP")
    return required, numeric


js_required = read_js_map("requiredByTest")
js_numeric = read_js_map("numericByTest")
php_required, php_numeric = read_php_map()

errors: list[str] = []
for label, js_map, php_map in (
    ("campos obligatorios", js_required, php_required),
    ("campos numéricos", js_numeric, php_numeric),
):
    if set(js_map) != set(php_map):
        errors.append(f"{label}: códigos JS={sorted(js_map)}, PHP={sorted(php_map)}")
    for code in sorted(set(js_map) | set(php_map)):
        if js_map.get(code, []) != php_map.get(code, []):
            errors.append(
                f"{code} ({label}): JS={js_map.get(code, [])}, PHP={php_map.get(code, [])}"
            )

if not re.search(r"!/\^\\d\{1,3\}\$/.test\(raw\)", CONFIG_JS):
    errors.append("El cliente debe validar TAP con 1–3 dígitos ASCII.")
if "ctype_digit($rawPosition)" not in CONFIG_PHP:
    errors.append("PHP debe validar TAP con dígitos ASCII.")
if not re.search(r"count\(\$changerPositions\)\s*<\s*1", CONFIG_PHP):
    errors.append("PHP debe exigir al menos una posición TAP por conmutador.")
if "positions.length===0" not in CONFIG_JS or "positions.length>150" not in CONFIG_JS:
    errors.append("El cliente debe exigir de 1 a 150 posiciones TAP por conmutador.")
if "Array.from(terminal).length>20" not in CONFIG_JS or "mb_strlen($terminalCode) > 20" not in CONFIG_PHP:
    errors.append("El límite de 20 caracteres de borne debe coincidir en JS y PHP.")

if errors:
    print("Desfase de validaciones cliente/servidor:")
    print("\n".join(errors))
    sys.exit(1)

print("Paridad OK: ensayos, campos obligatorios, campos numéricos, TAP y bornes.")
