import sys, xml.etree.ElementTree as ET
path = sys.argv[1]
min_cov = float(sys.argv[2]) if len(sys.argv) > 2 else 85.0
rate = float(ET.parse(path).getroot().attrib.get("line-rate", 0.0)) * 100
print(f"Cobertura: {rate:.2f}% (mínimo {min_cov}%)")
sys.exit(1 if rate < min_cov else 0)
