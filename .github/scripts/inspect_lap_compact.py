from pathlib import Path
from openpyxl import load_workbook
import re

path = Path("extras/LAP- - 740026-1- protocolos.xlsx")
wb = load_workbook(path, data_only=False, read_only=False)
print("SHEETS:", " | ".join(wb.sheetnames))
for ws in wb.worksheets:
    print(f"\\n### {ws.title} [{ws.max_row}x{ws.max_column}]")
    if ws.title.lower() == "hoja1":
        for row in ws.iter_rows():
            vals=[f"{c.coordinate}:{str(c.value).replace(chr(10),' / ')[:90]}" for c in row if c.value is not None]
            if vals: print(" | ".join(vals))
        continue
    if ws.title.lower() == "protocolos":
        for row in ws.iter_rows():
            vals=[]
            for c in row:
                v=c.value
                if isinstance(v,str) and v and not v.startswith("="):
                    s=re.sub(r"\\s+"," ",v).strip()
                    if s: vals.append(f"{c.coordinate}:{s[:100]}")
            if vals:
                print("ROW",row[0].row," | ".join(vals[:65]))
        print("FORMULAS:")
        for row in ws.iter_rows():
            for c in row:
                if isinstance(c.value,str) and c.value.startswith("="):
                    if c.row <= 70:
                        print(c.coordinate,c.value)
        continue
    print("TEXT LABELS:")
    found=0
    for row in ws.iter_rows():
        vals=[]
        for c in row:
            v=c.value
            if isinstance(v,str) and v and not v.startswith("=") and re.search(r"[A-Za-zÁÉÍÓÚÑáéíóúñ]",v):
                vals.append(f"{c.coordinate}:{re.sub(r'\\s+',' ',v).strip()[:80]}")
        if vals:
            print("ROW",row[0].row," | ".join(vals[:30]));found+=1
            if found >= 55:
                print("...");break
