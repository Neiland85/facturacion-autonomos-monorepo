import sys, xml.etree.ElementTree as ET, json
root = ET.parse(sys.argv[1]).getroot()
out = sys.argv[2]
data = {"line_rate": float(root.attrib.get("line-rate", 0.0)),
        "branch_rate": float(root.attrib.get("branch-rate", 0.0))}
open(out, "w").write(json.dumps(data, indent=2))
print(f"Wrote {out}")
