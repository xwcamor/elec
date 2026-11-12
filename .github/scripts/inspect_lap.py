from pathlib import Path
from openpyxl import load_workbook

path = Path("extras/LAP- - 740026-1- protocolos.xlsx")
if not path.exists():
    raise SystemExit(f"No se encontró: {path}")

wb = load_workbook(path, data_only=False, read_only=False)
print("WORKBOOK", path.name, "SHEETS", len(wb.sheetnames))
for ws in wb.worksheets:
    print("\\n===== SHEET:", ws.title, "DIM:", ws.max_row, "x", ws.max_column, "=====")
    if ws.merged_cells.ranges:
        print("MERGED:", ", ".join(str(x) for x in list(ws.merged_cells.ranges)[:40]))
    printed = 0
    formulas = []
    for row in ws.iter_rows():
        cells = []
        for cell in row:
            value = cell.value
            if value is None or value == "":
                continue
            text = str(value).replace("\\n", " / ").replace("\\r", " ")[:160]
            cells.append(f"{cell.coordinate}={text}")
            if isinstance(value, str) and value.startswith("="):
                formulas.append(f"{cell.coordinate}:{value}")
        if cells:
            print("ROW", row[0].row, " | ".join(cells[:35]))
            printed += 1
            if printed >= 100:
                print("... TRUNCADO: se muestran primeras 100 filas con contenido")
                break
    print("FORMULA_COUNT", len(formulas))
    for formula in formulas[:50]:
        print("FORMULA", formula)
