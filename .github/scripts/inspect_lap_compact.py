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
            vals=[]
            for c in row:
                if c.value is not None:
                    vals.append(f"{c.coordinate}:{str(c.value).replace(chr(10),' / ')[:90]}")
            if vals: print(" | ".join(vals))
        continue
    if ws.title.lower() == "protocolos":
        for row in ws.iter_rows():
            vals=[]
            for c in row:
                v=c.value
                if isinstance(v,str) and v and not v.startswith("="):
                    s=re.sub(r"\\s+"," ",v).strip()
                    if s: vals.append(f"{c.coordinate}:{s[:95]}")
            if vals:
                print("ROW",row[0].row," | ".join(vals[:55]))
        for row in ws.iter_rows():
            for c in row:
                if isinstance(c.value,str) and c.value.startswith("="):
                    if c.row in (19,20,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120):
                        print("FORMULA",c.coordinate,c.value)
        continue
    for row in ws.iter_rows():
        vals=[]
        for c in row:
            if c.value is not None:
                text=str(c.value).replace(chr(10),' / ')[:110]
                vals.append(f"{c.coordinate}:{text}")
        if vals: print(" | ".join(vals[:40]))
