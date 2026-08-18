import json
import os
import math

SOURCE_GEOJSON = r'U:\Project\RADAR REBUILD\data\BANGUNAN\bangunan.geojson'
OUTPUT_DIR = r'u:\Project\RADAR REBUILD\public\data'
CHUNKS_DIR = os.path.join(OUTPUT_DIR, 'buildings_chunks')

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(CHUNKS_DIR, exist_ok=True)

print("Starting building data processing...")

# 1. Load GeoJSON
with open(SOURCE_GEOJSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])
total_count = len(features)
print(f"Total features loaded: {total_count:,}")

# 2. Setup Spatial Grid for Chunking (e.g. 0.05 x 0.05 degree grid cells in Banjarnegara)
# Banjarnegara bounding box approximately:
# Lat: -7.58 to -7.15, Lng: 109.40 to 109.95
GRID_SIZE = 0.04 # roughly 4.4 km grid cells
grid_chunks = {}

total_area_m2 = 0
high_risk_buildings = 0
med_risk_buildings = 0
low_risk_buildings = 0

def round_coords(coords):
    if isinstance(coords[0], (int, float)):
        return [round(coords[0], 5), round(coords[1], 5)]
    return [round_coords(c) for c in coords]

def get_centroid(coords):
    # Find simple center
    pts = []
    def extract_pts(c):
        if isinstance(c[0], (int, float)):
            pts.append(c)
        else:
            for sub in c:
                extract_pts(sub)
    extract_pts(coords)
    if not pts:
        return 0, 0
    avg_lng = sum(p[0] for p in pts) / len(pts)
    avg_lat = sum(p[1] for p in pts) / len(pts)
    return avg_lng, avg_lat

# District bounding boxes for classification
DISTRICTS = [
    {"name": "Batur", "minLat": -7.28, "maxLat": -7.16, "minLng": 109.80, "maxLng": 109.95, "risk": "Tinggi"},
    {"name": "Pejawaran", "minLat": -7.32, "maxLat": -7.22, "minLng": 109.78, "maxLng": 109.88, "risk": "Tinggi"},
    {"name": "Wanayasa", "minLat": -7.32, "maxLat": -7.22, "minLng": 109.70, "maxLng": 109.80, "risk": "Tinggi"},
    {"name": "Kalibening", "minLat": -7.30, "maxLat": -7.18, "minLng": 109.58, "maxLng": 109.70, "risk": "Tinggi"},
    {"name": "Pandanarum", "minLat": -7.28, "maxLat": -7.18, "minLng": 109.48, "maxLng": 109.60, "risk": "Tinggi"},
    {"name": "Karangkobar", "minLat": -7.36, "maxLat": -7.26, "minLng": 109.68, "maxLng": 109.78, "risk": "Tinggi"},
    {"name": "Pagentan", "minLat": -7.38, "maxLat": -7.28, "minLng": 109.76, "maxLng": 109.86, "risk": "Tinggi"},
    {"name": "Banjarmangu", "minLat": -7.42, "maxLat": -7.32, "minLng": 109.64, "maxLng": 109.76, "risk": "Sedang"},
    {"name": "Punggelan", "minLat": -7.42, "maxLat": -7.28, "minLng": 109.52, "maxLng": 109.66, "risk": "Sedang"},
    {"name": "Madukara", "minLat": -7.42, "maxLat": -7.34, "minLng": 109.68, "maxLng": 109.78, "risk": "Sedang"},
    {"name": "Banjarnegara", "minLat": -7.43, "maxLat": -7.36, "minLng": 109.66, "maxLng": 109.74, "risk": "Sedang"},
    {"name": "Sigaluh", "minLat": -7.45, "maxLat": -7.36, "minLng": 109.74, "maxLng": 109.86, "risk": "Sedang"},
    {"name": "Bawang", "minLat": -7.46, "maxLat": -7.38, "minLng": 109.60, "maxLng": 109.70, "risk": "Sedang"},
    {"name": "Rakit", "minLat": -7.46, "maxLat": -7.36, "minLng": 109.48, "maxLng": 109.60, "risk": "Rendah"},
    {"name": "Purwanegara", "minLat": -7.50, "maxLat": -7.40, "minLng": 109.52, "maxLng": 109.64, "risk": "Sedang"},
    {"name": "Mandiraja", "minLat": -7.50, "maxLat": -7.42, "minLng": 109.46, "maxLng": 109.56, "risk": "Sedang"},
    {"name": "Purwareja Klampok", "minLat": -7.50, "maxLat": -7.42, "minLng": 109.40, "maxLng": 109.48, "risk": "Rendah"},
    {"name": "Susukan", "minLat": -7.56, "maxLat": -7.46, "minLng": 109.40, "maxLng": 109.50, "risk": "Rendah"},
    {"name": "Pagedongan", "minLat": -7.52, "maxLat": -7.42, "minLng": 109.64, "maxLng": 109.76, "risk": "Tinggi"}
]

district_stats = {d["name"]: {
    "district": d["name"],
    "totalBuildings": 0,
    "totalAreaM2": 0,
    "highRisk": 0,
    "medRisk": 0,
    "lowRisk": 0
} for d in DISTRICTS}

district_stats["Lainnya"] = {
    "district": "Lainnya",
    "totalBuildings": 0,
    "totalAreaM2": 0,
    "highRisk": 0,
    "medRisk": 0,
    "lowRisk": 0
}

# 3. Iterate and partition
for i, feat in enumerate(features):
    geom = feat.get('geometry', {})
    coords = geom.get('coordinates', [])
    props = feat.get('properties', {})
    
    area_m2 = props.get('area_in_me', 0)
    total_area_m2 += area_m2
    
    c_lng, c_lat = get_centroid(coords)
    
    # Assign risk based on location
    # North slope / steep terrain = High risk
    risk = "Rendah"
    if c_lat < -7.34 or (c_lat < -7.30 and c_lng > 109.70):
        risk = "Tinggi"
        high_risk_buildings += 1
    elif c_lat < -7.44 or (c_lng > 109.65 and c_lng < 109.80):
        risk = "Sedang"
        med_risk_buildings += 1
    else:
        risk = "Rendah"
        low_risk_buildings += 1
        
    # Match district
    matched_d = "Lainnya"
    for d in DISTRICTS:
        if d["minLat"] <= c_lat <= d["maxLat"] and d["minLng"] <= c_lng <= d["maxLng"]:
            matched_d = d["name"]
            break
            
    district_stats[matched_d]["totalBuildings"] += 1
    district_stats[matched_d]["totalAreaM2"] += area_m2
    if risk == "Tinggi":
        district_stats[matched_d]["highRisk"] += 1
    elif risk == "Sedang":
        district_stats[matched_d]["medRisk"] += 1
    else:
        district_stats[matched_d]["lowRisk"] += 1

    # Chunking by Grid Index
    gx = int(math.floor((c_lng - 109.30) / GRID_SIZE))
    gy = int(math.floor((c_lat - (-7.65)) / GRID_SIZE))
    cell_id = f"chunk_{gx}_{gy}"
    
    if cell_id not in grid_chunks:
        grid_chunks[cell_id] = []
        
    # Clean feature with simplified precision
    clean_feat = {
        "type": "Feature",
        "properties": {
            "id": props.get("id", f"b_{i}"),
            "area_m2": round(area_m2, 1),
            "risk": risk,
            "plus_code": props.get("full_plus_", "")
        },
        "geometry": {
            "type": geom.get("type", "Polygon"),
            "coordinates": round_coords(coords)
        }
    }
    grid_chunks[cell_id].append(clean_feat)

# 4. Save Building Summary Stats
summary_data = {
    "totalBuildings": total_count,
    "totalAreaM2": round(total_area_m2, 2),
    "totalAreaHa": round(total_area_m2 / 10000, 2),
    "overallRiskBreakdown": {
        "highRiskBuildings": high_risk_buildings,
        "highRiskPct": round((high_risk_buildings / total_count) * 100, 1),
        "mediumRiskBuildings": med_risk_buildings,
        "mediumRiskPct": round((med_risk_buildings / total_count) * 100, 1),
        "lowRiskBuildings": low_risk_buildings,
        "lowRiskPct": round((low_risk_buildings / total_count) * 100, 1),
    },
    "districtStats": district_stats
}

summary_path = os.path.join(OUTPUT_DIR, 'buildingStatsSummary.json')
with open(summary_path, 'w', encoding='utf-8') as f:
    json.dump(summary_data, f, indent=2)
print(f"Saved summary statistics to {summary_path}")

# 5. Save Grid Index Manifest & Chunk files
manifest = {
    "gridSize": GRID_SIZE,
    "originLng": 109.30,
    "originLat": -7.65,
    "totalChunks": len(grid_chunks),
    "chunks": {}
}

for cell_id, chunk_features in grid_chunks.items():
    manifest["chunks"][cell_id] = len(chunk_features)
    chunk_file = os.path.join(CHUNKS_DIR, f"{cell_id}.json")
    chunk_fc = {
        "type": "FeatureCollection",
        "features": chunk_features
    }
    with open(chunk_file, 'w', encoding='utf-8') as f:
        json.dump(chunk_fc, f)

manifest_path = os.path.join(OUTPUT_DIR, 'buildingsManifest.json')
with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

print(f"Generated {len(grid_chunks)} spatial grid chunks in {CHUNKS_DIR}")
print("Building dataset processing complete successfully!")
